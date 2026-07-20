# Stripe ligado às contas LucroMEI

## Fluxo

1. Utilizador logado → `/assinatura` → escolhe plano  
2. Checkout Stripe (customer + metadata `supabase_user_id`)  
3. Webhook **ou** `/api/stripe/sync-session` atualiza `user_settings`  
4. `subscription_status = active` → acesso liberado (mesmo após trial)

## Variáveis (local + Vercel)

Já existentes:
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_PRICE_MONTHLY` / `YEARLY` / `EARLYBIRD`
- `NEXT_PUBLIC_APP_URL=https://lucro-mei.vercel.app`

**Novas obrigatórias:**
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase → Settings → API → `service_role` (secreta!)
- `STRIPE_WEBHOOK_SECRET` — após criar o webhook

## Webhook Stripe

1. https://dashboard.stripe.com/test/webhooks (modo **Test**)  
2. **Add endpoint**  
3. URL: `https://lucro-mei.vercel.app/api/stripe/webhook`  
4. Eventos:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copiar **Signing secret** (`whsec_...`) → `STRIPE_WEBHOOK_SECRET` na Vercel  
6. Redeploy  

## Portal do cliente

Stripe → Settings → Billing → Customer portal → ativar cancelamento/atualização de cartão.

## Teste

1. Login no app  
2. `/assinatura` → Assinar Mensal  
3. Cartão `4242 4242 4242 4242`  
4. Volta a `/assinatura?success=1` → status **active**  
5. Dashboard liberado  

## Local (opcional)

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```
