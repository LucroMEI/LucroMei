# LucroMEI

**Tira foto do comprovante. Eu cuido do resto.**

App para MEIs e freelancers brasileiros: upload de comprovante → IA categoriza → dashboard com receitas, despesas, lucro e estimativa de impostos (DAS + IR aproximado).

> **Estimativas apenas. Não substitui um contador.**

---

## Stack

| Camada | Tecnologia |
|--------|------------|
| Frontend | Next.js 15/16 (App Router) + Tailwind CSS 4 |
| Auth / DB / Storage | Supabase |
| IA (visão de comprovantes) | xAI Grok (`XAI_API_KEY` → `https://api.x.ai/v1`) |
| Pagamentos | Stripe (assinatura + trial 14 dias) |
| Deploy | Vercel recomendado |

---

## Início rápido (modo demo)

Sem Supabase/Stripe, o app já roda com **dados locais** (localStorage):

```bash
cd lucromei
cp .env.example .env.local
# opcional: NEXT_PUBLIC_DEMO_MODE=true
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) → **Testar grátis** / **Abrir o app** → `/dashboard`.

---

## Configuração completa

### 1. Supabase

1. Crie um projeto em [supabase.com](https://supabase.com).
2. **SQL Editor** → rode `supabase/schema.sql` e depois `supabase/seed.sql`.
3. Em Authentication → Providers, habilite Email e (opcional) Google.
4. Cole no `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # só servidor / webhooks
```

### 2. Stripe (sua conta `acct_1PCKl8PxfxckETDg`)

1. Dashboard: [Stripe](https://dashboard.stripe.com/acct_1PCKl8PxfxckETDg/dashboard)
2. **Developers → API keys** → copie `sk_test_...` e `pk_test_...`
3. Crie os produtos/preços:

```bash
export STRIPE_SECRET_KEY=sk_test_...
node scripts/create-stripe-products.mjs
```

4. Cole os `price_...` no `.env.local`.
5. Webhook (produção): endpoint `https://seu-dominio.com/api/stripe/webhook`  
   Eventos: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`  
   Secret → `STRIPE_WEBHOOK_SECRET`

**Preços do MVP**

| Plano | Preço |
|-------|-------|
| Teste | 14 dias grátis |
| Mensal | R$ 39,90 |
| Anual | R$ 29,90/mês (R$ 358,80/ano) |
| Early Bird | R$ 19,90/mês |

### 3. xAI (IA de comprovantes)

1. Chave em [console.x.ai](https://console.x.ai)
2. `.env.local`:

```env
XAI_API_KEY=xai-...
```

Sem chave, a análise usa **heurística demo** (ainda permite validar o fluxo).

### 4. App URL

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Em produção, use o domínio real (necessário para redirect do Stripe).

---

## Estrutura

```
src/
  app/
    page.tsx                 # Landing
    (auth)/login|cadastro    # Auth
    (app)/dashboard          # Início
    (app)/upload             # Coração: foto + IA
    (app)/transacoes
    (app)/relatorios
    (app)/configuracoes
    (app)/assinatura         # Stripe Checkout
    api/analyze              # Grok Vision
    api/stripe/*             # checkout, portal, webhook
  lib/
    ai.ts taxes.ts demo-store.ts stripe.ts ...
  components/
supabase/
  schema.sql seed.sql
scripts/
  create-stripe-products.mjs
```

---

## Fluxo do produto

1. Usuário envia foto/PDF em **Upload**
2. `POST /api/analyze` → Grok extrai valor, data, categoria, dedutível
3. Usuário revisa e salva
4. **Dashboard** mostra totais + DAS estimado + alerta de vencimento
5. **Assinatura** → Stripe Checkout com trial de 14 dias

---

## Deploy (Vercel)

```bash
npm i -g vercel
vercel
# Configure as env vars no painel Vercel
```

Conecte o repositório e faça o deploy. Após o deploy:

- Atualize `NEXT_PUBLIC_APP_URL`
- Atualize o webhook Stripe com a URL de produção
- No Supabase Auth, adicione a URL de redirect: `https://seu-dominio/callback`

---

## Checklist dos primeiros 20 MEIs (validação)

- [ ] Rodar demo e gravar um vídeo de 60s do fluxo “foto → dashboard”
- [ ] Mensagem de WhatsApp: “Teste grátis 14 dias — me fala se evita a confusão do DAS”
- [ ] Entrevista: quanto pagaria? o que mais dói? planilha atual?
- [ ] Stripe em **modo test** com cartão `4242…`
- [ ] Depois: modo live + Meta Ads / grupos de MEI

---

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Desenvolvimento |
| `npm run build` | Build produção |
| `npm start` | Servir build |
| `node scripts/create-stripe-products.mjs` | Criar preços no Stripe |

---

## Aviso legal

O LucroMEI **não** emite NF-e, **não** é contabilidade completa e **não** substitui o Portal do Empreendedor / contador. Valores de DAS e IR são referências aproximadas (2026) e podem mudar.
