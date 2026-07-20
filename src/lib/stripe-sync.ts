import type Stripe from "stripe";
import { createAdminClient, isAdminConfigured } from "@/lib/supabase/admin";
import type { CheckoutPlan } from "@/lib/stripe";

export type PlanFromStripe = CheckoutPlan | "trial" | "none";

function planFromMetadata(meta: Stripe.Metadata | null | undefined): PlanFromStripe {
  const p = meta?.plan;
  if (p === "monthly" || p === "yearly" || p === "earlybird") return p;
  return "monthly";
}

function statusFromStripe(
  status: Stripe.Subscription.Status
): "active" | "trialing" | "past_due" | "canceled" | "incomplete" | "none" {
  if (status === "active") return "active";
  if (status === "trialing") return "trialing";
  if (status === "past_due") return "past_due";
  if (status === "canceled" || status === "unpaid") return "canceled";
  if (status === "incomplete" || status === "incomplete_expired") return "incomplete";
  return "none";
}

export async function applySubscriptionToUser(params: {
  userId: string;
  customerId: string;
  subscriptionId: string;
  status: Stripe.Subscription.Status;
  plan?: PlanFromStripe;
}) {
  if (!isAdminConfigured()) {
    console.error("[stripe-sync] service role não configurada");
    return { ok: false as const, error: "service_role_missing" };
  }

  const admin = createAdminClient();
  const paid = params.status === "active" || params.status === "trialing";
  const plan = params.plan || "monthly";

  const { error } = await admin
    .from("user_settings")
    .update({
      stripe_customer_id: params.customerId,
      stripe_subscription_id: params.subscriptionId,
      subscription_status: statusFromStripe(params.status),
      plan: paid ? plan : "none",
    })
    .eq("user_id", params.userId);

  if (error) {
    console.error("[stripe-sync]", error.message);
    return { ok: false as const, error: error.message };
  }
  return { ok: true as const };
}

export async function applyCheckoutSession(session: Stripe.Checkout.Session, stripe: Stripe) {
  const userId =
    session.client_reference_id ||
    session.metadata?.supabase_user_id ||
    null;
  if (!userId) {
    console.error("[stripe-sync] checkout sem user id");
    return { ok: false as const, error: "missing_user" };
  }

  const customerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer?.id || "";
  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id || "";

  if (!customerId || !subscriptionId) {
    return { ok: false as const, error: "missing_customer_or_sub" };
  }

  const sub = await stripe.subscriptions.retrieve(subscriptionId);
  const plan = planFromMetadata(session.metadata || sub.metadata);

  return applySubscriptionToUser({
    userId,
    customerId,
    subscriptionId,
    status: sub.status,
    plan,
  });
}

export async function applySubscriptionObject(sub: Stripe.Subscription) {
  const userId = sub.metadata?.supabase_user_id || null;
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;

  // Prefer metadata; fallback: find by stripe_customer_id
  if (userId) {
    const plan = planFromMetadata(sub.metadata);
    return applySubscriptionToUser({
      userId,
      customerId,
      subscriptionId: sub.id,
      status: sub.status,
      plan,
    });
  }

  if (!isAdminConfigured()) {
    return { ok: false as const, error: "service_role_missing" };
  }

  const admin = createAdminClient();
  const { data } = await admin
    .from("user_settings")
    .select("user_id, plan")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();

  if (!data?.user_id) {
    console.error("[stripe-sync] subscription sem user mapeado", sub.id);
    return { ok: false as const, error: "user_not_found" };
  }

  return applySubscriptionToUser({
    userId: data.user_id,
    customerId,
    subscriptionId: sub.id,
    status: sub.status,
    plan: planFromMetadata(sub.metadata) || (data.plan as PlanFromStripe) || "monthly",
  });
}
