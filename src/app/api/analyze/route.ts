import { NextResponse } from "next/server";
import sharp from "sharp";
import { PDFParse } from "pdf-parse";
import { analyzeReceipt } from "@/lib/ai";

export const runtime = "nodejs";
export const maxDuration = 60;

async function extractPdfText(buf: Buffer): Promise<string> {
  const parser = new PDFParse({ data: buf });
  try {
    const result = await parser.getText();
    const pages = (result as { pages?: { text?: string }[] }).pages;
    if (Array.isArray(pages)) {
      return pages.map((p) => p.text || "").join("\n").trim();
    }
    const text = (result as { text?: string }).text;
    return (text || "").trim();
  } finally {
    await parser.destroy().catch(() => undefined);
  }
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
    // Vision não lê PDF — extraímos texto e a IA analisa o texto.
    let text = "";
    try {
      text = await extractPdfText(buf);
    } catch (err) {
      console.error("[analyze] pdf-parse", err);
    }
    if (!text || text.length < 20) {
      throw new Error(
        "Não consegui ler o texto deste PDF. No computador, abra o PDF e use «Tirar foto» (webcam) da página, ou lance o valor manualmente."
      );
    }
    return {
      base64: "",
      mimeType: "application/pdf",
      pdfText: text.slice(0, 12000),
    };
  }

  try {
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
  } catch {
    if (buf.byteLength > 3_000_000) {
      throw new Error(
        "Não foi possível otimizar esta foto. Use «Tirar foto» (câmera leve do app)."
      );
    }
    const mimeType = file.type || "image/jpeg";
    return {
      base64: `data:${mimeType};base64,${buf.toString("base64")}`,
      mimeType,
    };
  }
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";

    let imageBase64 = "";
    let mimeType = "image/jpeg";
    let fileName: string | undefined;
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
      fileName = file.name;
      const converted = await prepareImageForAi(file);
      imageBase64 = converted.base64;
      mimeType = converted.mimeType;
      pdfText = converted.pdfText;
    } else {
      const body = await request.json();
      imageBase64 = (body.imageBase64 as string) || "";
      mimeType = (body.mimeType as string) || "image/jpeg";
      fileName = body.fileName as string | undefined;
      pdfText = body.pdfText as string | undefined;

      if (!imageBase64 && !pdfText) {
        return NextResponse.json(
          { error: "Envie uma imagem ou PDF" },
          { status: 400 }
        );
      }

      if (imageBase64.length > 11_000_000) {
        return NextResponse.json({ error: "Arquivo muito grande" }, { status: 413 });
      }
    }

    const result = await analyzeReceipt({
      imageBase64,
      mimeType,
      fileName,
      pdfText,
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("[api/analyze]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro na análise" },
      { status: 500 }
    );
  }
}
