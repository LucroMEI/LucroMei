import { NextResponse } from "next/server";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

export async function POST(request: Request) {
  try {
    if (!isStripeConfigured()) {
      return NextResponse.json(
        { error: "Stripe não configurado" },
        { status: 503 }
      );
    }

    const body = await request.json();
    const customerId = body.customerId as string | undefined;
    if (!customerId) {
      return NextResponse.json(
        { error: "customerId obrigatório (assinatura ainda não criada)" },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    const origin =
      process.env.NEXT_PUBLIC_APP_URL ||
      request.headers.get("origin") ||
      "http://localhost:3000";

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/assinatura`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[stripe/portal]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro no portal" },
      { status: 500 }
    );
  }
}
