import { NextResponse } from "next/server";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, isAdminConfigured } from "@/lib/supabase/admin";
import Stripe from "stripe";

export async function POST(request: Request) {
  try {
    if (!isStripeConfigured()) {
      return NextResponse.json({ error: "Stripe não configurado" }, { status: 503 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { data: settings } = await supabase
      .from("user_settings")
      .select("stripe_customer_id, subscription_status, plan")
      .eq("user_id", user.id)
      .maybeSingle();

    const customerId = settings?.stripe_customer_id as string | null | undefined;
    if (!customerId) {
      return NextResponse.json(
        {
          error:
            "Não há cliente Stripe nesta conta. Escolha um plano abaixo para assinar de novo.",
          cleared: false,
        },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    const origin =
      process.env.NEXT_PUBLIC_APP_URL ||
      request.headers.get("origin") ||
      "http://localhost:3000";

    // Valida se o customer ainda existe no Stripe (modo Live atual)
    try {
      await stripe.customers.retrieve(customerId);
    } catch (err) {
      const missing =
        err instanceof Stripe.errors.StripeInvalidRequestError &&
        (err.code === "resource_missing" ||
          /no such customer/i.test(err.message || ""));

      if (missing) {
        // App ficou com Active órfão (cliente apagado no Dashboard)
        if (isAdminConfigured()) {
          const admin = createAdminClient();
          await admin
            .from("user_settings")
            .update({
              stripe_customer_id: null,
              stripe_subscription_id: null,
              subscription_status: "none",
              plan: "none",
            })
            .eq("user_id", user.id);
        } else {
          await supabase
            .from("user_settings")
            .update({
              stripe_customer_id: null,
              stripe_subscription_id: null,
              subscription_status: "none",
              plan: "none",
            })
            .eq("user_id", user.id);
        }

        return NextResponse.json(
          {
            cleared: true,
            error:
              "A assinatura no Stripe já não existe (foi cancelada ou apagada). Atualizámos o estado da conta — pode assinar de novo.",
          },
          { status: 409 }
        );
      }
      throw err;
    }

    try {
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${origin}/assinatura`,
      });
      return NextResponse.json({ url: session.url });
    } catch (err) {
      // Portal não configurado no Stripe, etc.
      const msg = err instanceof Error ? err.message : "Erro no portal";
      if (/No configuration provided|billing portal/i.test(msg)) {
        return NextResponse.json(
          {
            error:
              "Portal do cliente Stripe ainda não está ativado. No Dashboard Stripe: Settings → Billing → Customer portal → ativar.",
          },
          { status: 503 }
        );
      }
      throw err;
    }
  } catch (err) {
    console.error("[stripe/portal]", err);
    const msg = err instanceof Error ? err.message : "Erro no portal";
    // Mensagem mais clara se ainda vier "No such customer"
    if (/no such customer/i.test(msg)) {
      return NextResponse.json(
        {
          error:
            "Cliente Stripe não encontrado. A assinatura foi removida no Stripe — atualize a página e assine de novo se quiser.",
          cleared: false,
        },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
