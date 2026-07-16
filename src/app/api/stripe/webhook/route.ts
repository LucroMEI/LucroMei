import { NextResponse } from "next/server";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import type Stripe from "stripe";

export const runtime = "nodejs";

/**
 * Webhook Stripe — atualiza status de assinatura.
 * Configure em: Dashboard → Developers → Webhooks
 * URL: https://SEU_DOMINIO/api/stripe/webhook
 * Eventos: checkout.session.completed, customer.subscription.*
 *
 * Com Supabase: descomente o bloco de update com service role.
 */
export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Stripe não configurado" }, { status: 503 });
  }

  const stripe = getStripe();
  const sig = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  try {
    const raw = await request.text();
    if (secret && sig) {
      event = stripe.webhooks.constructEvent(raw, sig, secret);
    } else {
      // Dev sem assinatura (não use em produção)
      event = JSON.parse(raw) as Stripe.Event;
    }
  } catch (err) {
    console.error("[webhook] signature", err);
    return NextResponse.json({ error: "Assinatura inválida" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("[webhook] checkout completed", {
          customer: session.customer,
          subscription: session.subscription,
          plan: session.metadata?.plan,
        });
        // TODO: update user_settings via Supabase service role
        // await updateSubscription({ customerId, subscriptionId, status: 'active', plan })
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        console.log("[webhook] subscription", event.type, {
          id: sub.id,
          status: sub.status,
          customer: sub.customer,
        });
        break;
      }
      default:
        console.log("[webhook] ignored", event.type);
    }
  } catch (err) {
    console.error("[webhook] handler", err);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
