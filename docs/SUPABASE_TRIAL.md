# Supabase + trial 14 dias (LucroMEI)

## O que o código faz

1. **Cadastro** (`/cadastro`) cria utilizador no Supabase Auth  
2. Cria/atualiza `user_settings` com `trial_ends_at = agora + 14 dias`  
3. **Login** obrigatório para dashboard, upload, transações, etc.  
4. Se o trial acabou e **não** há plano pago → redireciona para `/trial-acabou`  
5. Faixa no topo com dias restantes do teste  

Stripe ligado à conta = **fase seguinte** (ainda não).

## Configurar Supabase

1. Crie projeto em https://supabase.com  
2. **SQL Editor** → cole e execute:
   - `supabase/schema.sql`
   - `supabase/seed.sql`
3. **Authentication → Providers → Email** ativo  
4. (Opcional) desative “Confirm email” em Auth → Providers → Email para testar mais rápido  
5. **Authentication → URL Configuration**
   - Site URL: `https://lucro-mei.vercel.app` (e `http://localhost:3000` em dev)
   - Redirect: `https://lucro-mei.vercel.app/callback` e `http://localhost:3000/callback`
6. **Project Settings → API** → copie:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Variáveis

### Local `.env.local`
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### Vercel → Environment Variables
As mesmas duas chaves + as que já tem (Stripe, xAI).

Depois: **Redeploy**.

## Testar

1. Abrir site → **Criar conta**  
2. Entrar no dashboard → faixa “Teste grátis: X dias”  
3. Para simular fim do trial (SQL):
```sql
update public.user_settings
set trial_ends_at = now() - interval '1 day'
where user_id = 'UUID-DO-USER';
```
4. Recarregar → deve ir para `/trial-acabou`
