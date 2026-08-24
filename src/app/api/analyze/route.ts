import { NextResponse } from "next/server";
import { analyzeReceipt, emptyAnalyzeResult } from "@/lib/ai";

export const runtime = "nodejs";
export const maxDuration = 60;

type PdfParseCtor = new (opts: { data: Buffer }) => {
  getText: () => Promise<{ pages?: { text?: string }[]; text?: string }>;
  getScreenshot: (opts?: {
    first?: number;
    scale?: number;
    desiredWidth?: number;
  }) => Promise<{
    pages?: { data?: Uint8Array; dataUrl?: string }[];
  }>;
  destroy: () => Promise<void>;
};

async function loadPdfParse(): Promise<PdfParseCtor | null> {
  try {
    const mod = await import("pdf-parse");
    return (mod as { PDFParse?: PdfParseCtor }).PDFParse || null;
  } catch (err) {
    console.error("[analyze] pdf-parse import", err);
    return null;
  }
}

async function extractFromPdf(buf: Buffer): Promise<{
  pdfText: string;
  imageBase64: string;
}> {
  const PDFParse = await loadPdfParse();
  if (!PDFParse) return { pdfText: "", imageBase64: "" };

  const parser = new PDFParse({ data: buf });
  let pdfText = "";
  let imageBase64 = "";

  try {
    try {
      const result = await parser.getText();
      if (Array.isArray(result.pages)) {
        pdfText = result.pages.map((p) => p.text || "").join("\n").trim();
      } else {
        pdfText = (result.text || "").trim();
      }
    } catch (err) {
      console.error("[analyze] getText", err);
    }

    // Sempre tentar renderizar a 1ª página → visão (funciona quando getText falha na Vercel)
    try {
      const shot = await parser.getScreenshot({
        first: 1,
        desiredWidth: 1200,
      });
      const page = shot.pages?.[0];
      if (page?.dataUrl?.startsWith("data:image/")) {
        // Opcional: recomprimir com sharp
        try {
          const sharpMod = await import("sharp");
          const sharp = sharpMod.default;
          const raw = Buffer.from(
            page.dataUrl.replace(/^data:image\/\w+;base64,/, ""),
            "base64"
          );
          const out = await sharp(raw, { failOn: "none" })
            .jpeg({ quality: 75, mozjpeg: true })
            .toBuffer();
          imageBase64 = `data:image/jpeg;base64,${out.toString("base64")}`;
        } catch {
          imageBase64 = page.dataUrl;
        }
      } else if (page?.data && page.data.length > 0) {
        const raw = Buffer.from(page.data);
        try {
          const sharpMod = await import("sharp");
          const sharp = sharpMod.default;
          const out = await sharp(raw, { failOn: "none" })
            .jpeg({ quality: 75, mozjpeg: true })
            .toBuffer();
          imageBase64 = `data:image/jpeg;base64,${out.toString("base64")}`;
        } catch {
          imageBase64 = `data:image/png;base64,${raw.toString("base64")}`;
        }
      }
    } catch (err) {
      console.error("[analyze] getScreenshot", err);
    }
  } finally {
    await parser.destroy().catch(() => undefined);
  }

  return { pdfText: pdfText.slice(0, 12000), imageBase64 };
}

async function prepareImageForAi(
  file: File
): Promise<{ base64: string; mimeType: string; pdfText?: string }> {
  const buf = Buffer.from(await file.arrayBuffer());
  if (buf.byteLength > 12_000_000) {
    throw new Error(
      "Arquivo muito grande (máx. ~12 MB). Tire a foto de novo só do comprovante."
    );
  }

  const isPdf =
    file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

  if (isPdf) {
    const { pdfText, imageBase64 } = await extractFromPdf(buf);
    // Preferir imagem da página para visão; texto como apoio
    if (imageBase64) {
      return {
        base64: imageBase64,
        mimeType: imageBase64.includes("image/png") ? "image/png" : "image/jpeg",
        pdfText: pdfText.length >= 20 ? pdfText : undefined,
      };
    }
    if (pdfText.length >= 20) {
      return { base64: "", mimeType: "application/pdf", pdfText };
    }
    throw new Error(
      "Não consegui ler este PDF. Exporte como imagem/PNG ou tire foto do ecrã."
    );
  }

  try {
    const sharpMod = await import("sharp");
    const sharp = sharpMod.default;
    const out = await sharp(buf, { failOn: "none" })
      .rotate()
      .resize({
        width: 1280,
        height: 1280,
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: 70, mozjpeg: true })
      .toBuffer();
    return {
      base64: `data:image/jpeg;base64,${out.toString("base64")}`,
      mimeType: "image/jpeg",
    };
  } catch (err) {
    console.error("[analyze] sharp", err);
    if (buf.byteLength > 4_000_000) {
      throw new Error(
        "Não foi possível otimizar esta foto. Tire outra com menos resolução."
      );
    }
    const mimeType = file.type.startsWith("image/") ? file.type : "image/jpeg";
    return {
      base64: `data:${mimeType};base64,${buf.toString("base64")}`,
      mimeType,
    };
  }
}

export async function POST(request: Request) {
  let fileName = "comprovante";
  try {
    const contentType = request.headers.get("content-type") || "";

    let imageBase64 = "";
    let mimeType = "image/jpeg";
    let pdfText: string | undefined;

    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const file = form.get("file");
      if (!(file instanceof File)) {
        return NextResponse.json(
          { error: "Campo file é obrigatório" },
          { status: 400 }
        );
      }
      fileName = file.name || fileName;
      const converted = await prepareImageForAi(file);
      imageBase64 = converted.base64;
      mimeType = converted.mimeType;
      pdfText = converted.pdfText;
    } else {
      const body = await request.json();
      imageBase64 = (body.imageBase64 as string) || "";
      mimeType = (body.mimeType as string) || "image/jpeg";
      fileName = (body.fileName as string) || fileName;
      pdfText = body.pdfText as string | undefined;

      if (!imageBase64 && !pdfText) {
        return NextResponse.json(
          { error: "Envie uma imagem ou PDF" },
          { status: 400 }
        );
      }
    }

    // PDF sem texto e sem imagem renderizada
    if (
      mimeType === "application/pdf" &&
      (!pdfText || pdfText.length < 20) &&
      !imageBase64
    ) {
      return NextResponse.json(emptyAnalyzeResult(fileName));
    }

    // Se temos imagem (foto ou página PDF) + texto, a IA tenta texto primeiro depois visão
    const result = await analyzeReceipt({
      imageBase64,
      mimeType,
      fileName,
      pdfText,
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("[api/analyze]", err);
    const message =
      err instanceof Error ? err.message : "Erro na análise do comprovante";
    return NextResponse.json(
      {
        ...emptyAnalyzeResult(fileName),
        message: `${message} Preencha valor e data e salve.`,
      },
      { status: 200 }
    );
  }
}
