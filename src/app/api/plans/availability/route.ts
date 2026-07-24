import { NextResponse } from "next/server";
import { isEarlybirdAvailable, EARLYBIRD_MARKETING } from "@/lib/earlybird";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Disponibilidade pública dos planos.
 * NÃO devolve contagem nem limite — só booleans + textos de marketing.
 */
export async function GET() {
  try {
    const earlybirdAvailable = await isEarlybirdAvailable();
    return NextResponse.json({
      earlybirdAvailable,
      earlybirdBlurb: earlybirdAvailable
        ? EARLYBIRD_MARKETING.blurbAvailable
        : EARLYBIRD_MARKETING.blurbSoldOut,
      earlybirdBadge: earlybirdAvailable
        ? EARLYBIRD_MARKETING.badgeAvailable
        : EARLYBIRD_MARKETING.badgeSoldOut,
    });
  } catch (err) {
    console.error("[plans/availability]", err);
    // Em erro: mantém early bird visível (melhor que bloquear vendas por bug)
    return NextResponse.json({
      earlybirdAvailable: true,
      earlybirdBlurb: EARLYBIRD_MARKETING.blurbAvailable,
      earlybirdBadge: EARLYBIRD_MARKETING.badgeAvailable,
    });
  }
}
