# Publicar LucroMEI (GitHub + Vercel)

## Parte A — GitHub (você)

1. Abra https://github.com/new  
2. **Repository name:** `lucromei`  
3. **Public**  
4. **Não** marque README / .gitignore / license (já temos código)  
5. Clique **Create repository**  
6. Copie o URL, tipo: `https://github.com/SEU_USUARIO/lucromei.git`  
7. Diga ao assistente o URL ou o seu utilizador GitHub  

## Parte B — Enviar código (assistente ou terminal)

```bash
cd /home/sandr/lucromei
git remote add origin https://github.com/SEU_USUARIO/lucromei.git
git push -u origin main
```

(Pode pedir login GitHub no browser.)

## Parte C — Vercel (você)

1. https://vercel.com/dashboard  
2. **Add New** → **Project**  
3. **Import** o repositório `lucromei`  
4. Framework: Next.js (automático)  
5. **Environment Variables** — cole (Production):

```
NEXT_PUBLIC_APP_URL=https://SEU-PROJETO.vercel.app
NEXT_PUBLIC_APP_NAME=LucroMEI
NEXT_PUBLIC_DEMO_MODE=true
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_PRICE_MONTHLY=price_...
STRIPE_PRICE_YEARLY=price_...
STRIPE_PRICE_EARLYBIRD=price_...
XAI_API_KEY=xai-...
```

6. **Deploy**  
7. Depois do deploy, atualize `NEXT_PUBLIC_APP_URL` com o link real e faça Redeploy  

## Não commitar

- `.env.local` (chaves secretas) — nunca no GitHub  
