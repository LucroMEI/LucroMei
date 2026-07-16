import { NextResponse } from "next/server";
import {
  getStripe,
  isStripeConfigured,
  priceIdForPlan,
  type CheckoutPlan,
} from "@/lib/stripe";

export async function POST(request: Request) {
  try {
    if (!isStripeConfigured()) {
      return NextResponse.json(
        {
          error:
            "Stripe não configurado. Adicione STRIPE_SECRET_KEY e STRIPE_PRICE_* no .env.local",
        },
        { status: 503 }
      );
    }

    const body = await request.json();
    const plan = (body.plan || "monthly") as CheckoutPlan;
    const email = body.email as string | undefined;
    const customerId = body.customerId as string | undefined;

    if (!["monthly", "yearly", "earlybird"].includes(plan)) {
      return NextResponse.json({ error: "Plano inválido" }, { status: 400 });
    }

    const stripe = getStripe();
    const priceId = priceIdForPlan(plan);
    const origin =
      process.env.NEXT_PUBLIC_APP_URL ||
      request.headers.get("origin") ||
      "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/assinatura?success=1`,
      cancel_url: `${origin}/assinatura?canceled=1`,
      customer: customerId || undefined,
      customer_email: customerId ? undefined : email,
      subscription_data: {
        trial_period_days: 14,
        metadata: { plan, app: "lucromei" },
      },
      metadata: { plan, app: "lucromei" },
      allow_promotion_codes: true,
      locale: "pt-BR",
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error("[stripe/checkout]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro no checkout" },
      { status: 500 }
    );
  }
}
