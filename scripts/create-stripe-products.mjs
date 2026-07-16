/**
 * Cria produtos e preços LucroMEI na sua conta Stripe.
 *
 * Uso:
 *   export STRIPE_SECRET_KEY=sk_test_...
 *   node scripts/create-stripe-products.mjs
 *
 * Depois cole os price IDs no .env.local
 */

import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error("Defina STRIPE_SECRET_KEY no ambiente.");
  process.exit(1);
}

const stripe = new Stripe(key);

const plans = [
  {
    env: "STRIPE_PRICE_MONTHLY",
    name: "LucroMEI Mensal",
    description: "Upload ilimitado + IA + dashboard + alertas DAS",
    unit_amount: 3990, // R$ 39,90
    interval: "month",
  },
  {
    env: "STRIPE_PRICE_YEARLY",
    name: "LucroMEI Anual",
    description: "25% de desconto — cobrado anualmente (equiv. R$ 29,90/mês)",
    unit_amount: 35880, // R$ 358,80/ano = 29,90 * 12
    interval: "year",
  },
  {
    env: "STRIPE_PRICE_EARLYBIRD",
    name: "LucroMEI Early Bird",
    description: "Primeiros 100 usuários — 1º ano a R$ 19,90/mês",
    unit_amount: 1990,
    interval: "month",
  },
];

const lines = [];

for (const plan of plans) {
  const product = await stripe.products.create({
    name: plan.name,
    description: plan.description,
    metadata: { app: "lucromei" },
  });

  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: plan.unit_amount,
    currency: "brl",
    recurring: { interval: plan.interval },
    metadata: { app: "lucromei" },
  });

  console.log(`✓ ${plan.name}`);
  console.log(`  product: ${product.id}`);
  console.log(`  price:   ${price.id}`);
  lines.push(`${plan.env}=${price.id}`);
}

console.log("\n# Cole no .env.local:\n");
console.log(lines.join("\n"));
