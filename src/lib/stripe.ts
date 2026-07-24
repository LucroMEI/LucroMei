import Stripe from "stripe";

let stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY não configurada. Veja .env.example");
    }
    stripe = new Stripe(key);
  }
  return stripe;
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export type CheckoutPlan = "monthly" | "yearly" | "earlybird";

export function priceIdForPlan(plan: CheckoutPlan): string {
  const map: Record<CheckoutPlan, string | undefined> = {
    monthly: process.env.STRIPE_PRICE_MONTHLY,
    yearly: process.env.STRIPE_PRICE_YEARLY,
    earlybird: process.env.STRIPE_PRICE_EARLYBIRD,
  };
  const id = map[plan];
  if (!id) {
    throw new Error(`Price ID do plano "${plan}" não configurado no .env`);
  }
  return id;
}

export const PLAN_LABELS: Record<CheckoutPlan, { name: string; price: string; blurb: string }> = {
  monthly: {
    name: "Mensal",
    price: "R$ 39,90/mês",
    blurb: "Upload ilimitado + todas as features",
  },
  yearly: {
    name: "Anual",
    price: "R$ 29,90/mês",
    blurb: "Cobrado anualmente — 25% de desconto",
  },
  earlybird: {
    name: "Early Bird",
    price: "R$ 19,90/mês",
    /** Fallback de marketing — a UI prefere o texto de /api/plans/availability */
    blurb: "Preço de lançamento · faltam poucas vagas",
  },
};
