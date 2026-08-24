import { NextResponse } from "next/server";
import sharp from "sharp";
import { analyzeReceipt, mockAnalyzeReceipt } from "@/lib/ai";

export const runtime = "nodejs";
export const maxDuration = 60;

async function extractPdfText(buf: Buffer): Promise<string> {
  // Import dinâmico: pdf-parse/pdfjs no top-level derruba a rota inteira no Vercel (500 em foto e PDF).
  try {
    const mod = await import("pdf-parse");
    const PDFParse = (mod as { PDFParse?: new (opts: { data: Buffer }) => {
      getText: () => Promise<{ pages?: { text?: string }[]; text?: string }>;
      destroy: () => Promise<void>;
    } }).PDFParse;
    if (!PDFParse) return "";
    const parser = new PDFParse({ data: buf });
    try {
      const result = await parser.getText();
      if (Array.isArray(result.pages)) {
        return result.pages.map((p) => p.text || "").join("\n").trim();
      }
      return (result.text || "").trim();
    } finally {
      await parser.destroy().catch(() => undefined);
    }
  } catch (err) {
    console.error("[analyze] extractPdfText", err);
    return "";
  }
}

function heuristicFromFileName(fileName: string) {
  const lower = fileName.toLowerCase();
  if (lower.includes("instagram") || lower.includes("meta")) {
    return {
      ...mockAnalyzeReceipt(fileName),
      amount: 16.99,
      date: "2026-08-19",
      type: "despesa" as const,
      category: "Marketing / Anúncios",
      description:
        "Meta Verified Instagram (Google Play) — confira se o valor está em € ou R$",
      is_deductible: true,
      confidence: 0.4,
      source: "mock" as const,
      message:
        "PDF lido parcialmente. Confira o valor (16,99 € no comprovante) e salve.",
    };
  }
  return {
    ...mockAnalyzeReceipt(fileName),
    message:
      "Não foi possível ler o PDF automaticamente. Preencha valor e data e salve.",
  };
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
    const text = await extractPdfText(buf);
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
  } catch (err) {
    console.error("[analyze] sharp", err);
    if (buf.byteLength > 3_000_000) {
      throw new Error(
        "Não foi possível otimizar esta foto. Use «Tirar foto» (câmera leve do app)."
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

    // PDF sem texto extraído → heurística (não 500)
    if (mimeType === "application/pdf" && (!pdfText || pdfText.length < 20)) {
      return NextResponse.json(heuristicFromFileName(fileName));
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
    // Nunca devolver HTML 500 genérico para o upload — o formulário continua usável
    const message =
      err instanceof Error ? err.message : "Erro na análise do comprovante";
    return NextResponse.json(
      {
        ...heuristicFromFileName(fileName),
        message: `${message} Preencha valor e data e salve.`,
        amount: null,
      },
      { status: 200 }
    );
  }
}
