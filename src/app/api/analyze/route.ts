import { NextResponse } from "next/server";
import sharp from "sharp";
import { analyzeReceipt } from "@/lib/ai";

export const runtime = "nodejs";
export const maxDuration = 60;

/** Reduz foto no servidor (Samsung A15 etc. não aguentam fazer isso no browser). */
async function prepareImageForAi(
  file: File
): Promise<{ base64: string; mimeType: string }> {
  const buf = Buffer.from(await file.arrayBuffer());
  if (buf.byteLength > 12_000_000) {
    throw new Error(
      "Arquivo muito grande (máx. ~12 MB). Tire a foto de novo só do comprovante."
    );
  }

  const isPdf =
    file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (isPdf) {
    const b64 = buf.toString("base64");
    return {
      base64: `data:application/pdf;base64,${b64}`,
      mimeType: "application/pdf",
    };
  }

  try {
    const out = await sharp(buf, { failOn: "none" })
      .rotate() // respeita EXIF
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
    // Se sharp não ler (ex. HEIC raro), envia original se for pequeno
    if (buf.byteLength > 3_000_000) {
      throw new Error(
        "Não foi possível otimizar esta foto. Tire de novo pela câmera do app (modo leve)."
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

    let imageBase64: string | undefined;
    let mimeType: string | undefined;
    let fileName: string | undefined;

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
    } else {
      const body = await request.json();
      imageBase64 = body.imageBase64 as string | undefined;
      mimeType = body.mimeType as string | undefined;
      fileName = body.fileName as string | undefined;

      if (!imageBase64 || !mimeType) {
        return NextResponse.json(
          { error: "imageBase64 e mimeType são obrigatórios" },
          { status: 400 }
        );
      }

      // Limite simples ~8MB base64
      if (imageBase64.length > 11_000_000) {
        return NextResponse.json({ error: "Arquivo muito grande" }, { status: 413 });
      }
    }

    const result = await analyzeReceipt({
      imageBase64: imageBase64!,
      mimeType: mimeType!,
      fileName,
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
