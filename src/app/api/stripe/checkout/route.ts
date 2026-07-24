import { NextResponse } from "next/server";
import {
  getStripe,
  isStripeConfigured,
  priceIdForPlan,
  type CheckoutPlan,
} from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { EARLYBIRD_MARKETING, isEarlybirdAvailable } from "@/lib/earlybird";

export async function POST(request: Request) {
  try {
    if (!isStripeConfigured()) {
      return NextResponse.json(
        {
          error:
            "Stripe não configurado. Adicione STRIPE_SECRET_KEY e STRIPE_PRICE_* no ambiente.",
        },
        { status: 503 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const plan = (body.plan || "monthly") as CheckoutPlan;

    if (!["monthly", "yearly", "earlybird"].includes(plan)) {
      return NextResponse.json({ error: "Plano inválido" }, { status: 400 });
    }

    // Utilizador autenticado (obrigatório)
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return NextResponse.json(
        { error: "Faça login para assinar um plano." },
        { status: 401 }
      );
    }

    // Limite real Early Bird (sem expor números ao cliente)
    if (plan === "earlybird") {
      const open = await isEarlybirdAvailable();
      if (!open) {
        return NextResponse.json(
          { error: EARLYBIRD_MARKETING.checkoutBlocked },
          { status: 409 }
        );
      }
    }

    const { data: settings } = await supabase
      .from("user_settings")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    const stripe = getStripe();
    const priceId = priceIdForPlan(plan);
    const origin =
      process.env.NEXT_PUBLIC_APP_URL ||
      request.headers.get("origin") ||
      "http://localhost:3000";

    let customerId = settings?.stripe_customer_id as string | null | undefined;

    // Garante customer Stripe ligado ao user
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name:
          (user.user_metadata?.full_name as string | undefined) ||
          user.email.split("@")[0],
        metadata: {
          supabase_user_id: user.id,
          app: "lucromei",
        },
      });
      customerId = customer.id;
      await supabase
        .from("user_settings")
        .update({ stripe_customer_id: customerId })
        .eq("user_id", user.id);
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/assinatura?success=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/assinatura?canceled=1`,
      customer: customerId,
      client_reference_id: user.id,
      // Trial já é no app (14 dias). No Stripe cobramos o plano escolhido.
      subscription_data: {
        metadata: {
          plan,
          app: "lucromei",
          supabase_user_id: user.id,
        },
      },
      metadata: {
        plan,
        app: "lucromei",
        supabase_user_id: user.id,
      },
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
