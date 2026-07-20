import { NextResponse } from "next/server";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { applyCheckoutSession } from "@/lib/stripe-sync";
import { createClient } from "@/lib/supabase/server";

/**
 * Após voltar do Checkout (?session_id=...), o browser chama isto
 * para sincronizar a assinatura mesmo se o webhook atrasar.
 */
export async function POST(request: Request) {
  try {
    if (!isStripeConfigured()) {
      return NextResponse.json({ error: "Stripe não configurado" }, { status: 503 });
    }

    const body = await request.json();
    const sessionId = body.sessionId as string | undefined;
    if (!sessionId) {
      return NextResponse.json({ error: "sessionId obrigatório" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    const sessionUser =
      session.client_reference_id || session.metadata?.supabase_user_id;
    if (sessionUser !== user.id) {
      return NextResponse.json({ error: "Sessão não pertence a este utilizador" }, { status: 403 });
    }

    if (session.payment_status !== "paid" && session.status !== "complete") {
      return NextResponse.json({
        ok: false,
        status: session.status,
        payment_status: session.payment_status,
      });
    }

    const result = await applyCheckoutSession(session, stripe);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[stripe/sync-session]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao sincronizar" },
      { status: 500 }
    );
  }
}
