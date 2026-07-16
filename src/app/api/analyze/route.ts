import { NextResponse } from "next/server";
import { analyzeReceipt } from "@/lib/ai";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { imageBase64, mimeType, fileName } = body as {
      imageBase64?: string;
      mimeType?: string;
      fileName?: string;
    };

    if (!imageBase64 || !mimeType) {
      return NextResponse.json(
        { error: "imageBase64 e mimeType são obrigatórios" },
        { status: 400 }
      );
    }

    // Limite simples ~12MB base64
    if (imageBase64.length > 16_000_000) {
      return NextResponse.json({ error: "Arquivo muito grande" }, { status: 413 });
    }

    const result = await analyzeReceipt({
      imageBase64,
      mimeType,
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
