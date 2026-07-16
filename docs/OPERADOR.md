# LucroMEI — Manual do Operador Digital

Você (ou o assistente de IA) opera o negócio LucroMEI com este checklist.

## 1. Contas necessárias

| Serviço | Link | Status |
|---------|------|--------|
| Stripe | https://dashboard.stripe.com/acct_1PCKl8PxfxckETDg/dashboard | Conta do fundador |
| Supabase | https://supabase.com/dashboard | Criar projeto |
| xAI | https://console.x.ai | Chave para IA |
| Vercel | https://vercel.com | Deploy |

## 2. Ativar Stripe (15 min)

1. Abra **Developers → API keys** (modo Test primeiro).
2. Copie `Secret key` e `Publishable key` para `.env.local`.
3. Rode:

```bash
export STRIPE_SECRET_KEY=sk_test_...
node scripts/create-stripe-products.mjs
```

4. Cole os 3 `price_...` no `.env.local`.
5. Em **Settings → Customer portal**, ative o portal de gerenciamento.
6. Teste com cartão `4242 4242 4242 4242`.

## 3. Ativar Supabase (20 min)

1. New project → anote URL e keys.
2. SQL Editor → `schema.sql` → `seed.sql`.
3. Storage: bucket `receipts` já é criado no schema.
4. Auth → Site URL = `http://localhost:3000` (depois o domínio).
5. Redirect URLs: `http://localhost:3000/callback`

## 4. Ativar IA

1. console.x.ai → Create API key → `XAI_API_KEY` no `.env.local`
2. Teste: Upload de uma foto de cupom no app.

## 5. Validação com 20 MEIs

Mensagem pronta:

> Oi! Estou validando o LucroMEI: app que você tira foto do comprovante e a IA organiza finanças + estima DAS/lucro.  
> 14 dias grátis. Pode testar e me falar o que achou em 5 min? Link: [seu-link]

Perguntas de entrevista:

1. Como você organiza finanças hoje?
2. Já atrasou DAS ou pagou multa?
3. Pagaria R$ 39,90/mês se economizasse 4h e evitasse multas?
4. O que mais te irrita no fluxo atual?

## 6. Go-live

1. Stripe → modo Live + novos price IDs
2. Webhook produção
3. Vercel env vars
4. Landing + Meta Ads / grupos Facebook MEI
