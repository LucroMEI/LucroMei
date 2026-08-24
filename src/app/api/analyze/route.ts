import { NextResponse } from "next/server";
import { analyzeReceipt } from "@/lib/ai";

export const runtime = "nodejs";
export const maxDuration = 60;

async function fileToBase64DataUrl(file: File): Promise<{ base64: string; mimeType: string }> {
  const mimeType = file.type || "application/octet-stream";
  const buf = Buffer.from(await file.arrayBuffer());
  // Limite ~8MB binário (~11MB base64)
  if (buf.byteLength > 8_000_000) {
    throw new Error("Arquivo muito grande (máx. ~8 MB). Tire uma foto com qualidade média.");
  }
  const b64 = buf.toString("base64");
  return { base64: `data:${mimeType};base64,${b64}`, mimeType };
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
      const converted = await fileToBase64DataUrl(file);
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
