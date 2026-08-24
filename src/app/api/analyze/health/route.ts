import { NextResponse } from "next/server";

/** Diagnóstico sem expor a chave: a leitura de comprovantes precisa de XAI_API_KEY na Vercel. */
export async function GET() {
  const key = process.env.XAI_API_KEY?.trim() || "";
  return NextResponse.json({
    xaiConfigured: key.length > 0,
    hint: key.length
      ? "Chave presente no servidor."
      : "Falta XAI_API_KEY nas Environment Variables da Vercel (Production). Sem ela o app não lê valor/data/empresa.",
  });
}
