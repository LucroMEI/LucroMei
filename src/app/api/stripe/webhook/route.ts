import { NextResponse } from "next/server";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { applyCheckoutSession, applySubscriptionObject } from "@/lib/stripe-sync";
import type Stripe from "stripe";

export const runtime = "nodejs";

/**
 * Webhook Stripe
 * URL produção: https://lucro-mei.vercel.app/api/stripe/webhook
 * Eventos: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted
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
    } else if (process.env.NODE_ENV !== "production") {
      event = JSON.parse(raw) as Stripe.Event;
    } else {
      return NextResponse.json(
        { error: "STRIPE_WEBHOOK_SECRET em falta" },
        { status: 400 }
      );
    }
  } catch (err) {
    console.error("[webhook] signature", err);
    return NextResponse.json({ error: "Assinatura inválida" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === "subscription") {
          await applyCheckoutSession(session, stripe);
        }
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
      case "customer.subscription.created": {
        const sub = event.data.object as Stripe.Subscription;
        await applySubscriptionObject(sub);
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.error("[webhook] handler", err);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
