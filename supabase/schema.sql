-- ============================================================
-- LucroMEI — Schema completo Supabase
-- Rode no SQL Editor do Supabase (Dashboard → SQL → New query)
-- ============================================================

-- Extensões
create extension if not exists "pgcrypto";

-- ---------------------------
-- Categorias padrão
-- ---------------------------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  type text not null check (type in ('receita', 'despesa', 'ambos')),
  icon text default 'tag',
  is_system boolean default false,
  is_deductible_default boolean default false,
  created_at timestamptz default now()
);

create index if not exists categories_user_idx on public.categories(user_id);

-- ---------------------------
-- Configurações do usuário
-- ---------------------------
create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  cnpj text,
  cidade text,
  uf text default 'SP',
  regime_tributario text default 'MEI'
    check (regime_tributario in ('MEI', 'Simples', 'Autonomo', 'Outro')),
  atividade_mei text default 'servicos'
    check (atividade_mei in ('comercio', 'servicos', 'comercio_servicos')),
  meta_mensal_lucro numeric(12,2) default 3000,
  das_dia_vencimento int default 20 check (das_dia_vencimento between 1 and 28),
  onboarding_done boolean default false,
  trial_ends_at timestamptz,
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_status text default 'trialing'
    check (subscription_status in ('trialing', 'active', 'past_due', 'canceled', 'incomplete', 'none')),
  plan text default 'trial'
    check (plan in ('trial', 'monthly', 'yearly', 'earlybird', 'none')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------------------------
-- Transações
-- ---------------------------
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null default current_date,
  amount numeric(12,2) not null,
  type text not null check (type in ('receita', 'despesa')),
  category text not null,
  description text,
  receipt_url text,
  receipt_path text,
  ai_confidence numeric(4,3),
  is_deductible boolean default false,
  notes text,
  source text default 'manual' check (source in ('manual', 'upload', 'import')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists transactions_user_date_idx on public.transactions(user_id, date desc);
create index if not exists transactions_user_type_idx on public.transactions(user_id, type);

-- ---------------------------
-- Alertas (DAS, metas, etc.)
-- ---------------------------
create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('das', 'meta', 'limite_mei', 'sistema')),
  title text not null,
  message text not null,
  due_date date,
  is_read boolean default false,
  is_dismissed boolean default false,
  created_at timestamptz default now()
);

create index if not exists alerts_user_idx on public.alerts(user_id, is_dismissed, due_date);

-- ---------------------------
-- Storage bucket para comprovantes
-- ---------------------------
insert into storage.buckets (id, name, public)
values ('receipts', 'receipts', false)
on conflict (id) do nothing;

-- ---------------------------
-- RLS
-- ---------------------------
alter table public.categories enable row level security;
alter table public.user_settings enable row level security;
alter table public.transactions enable row level security;
alter table public.alerts enable row level security;

-- Categories: sistema (user_id null) legível por todos autenticados; custom só do dono
drop policy if exists "categories_select" on public.categories;
create policy "categories_select" on public.categories
  for select to authenticated
  using (user_id is null or user_id = auth.uid());

drop policy if exists "categories_insert" on public.categories;
create policy "categories_insert" on public.categories
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "categories_update" on public.categories;
create policy "categories_update" on public.categories
  for update to authenticated
  using (user_id = auth.uid());

drop policy if exists "categories_delete" on public.categories;
create policy "categories_delete" on public.categories
  for delete to authenticated
  using (user_id = auth.uid() and is_system = false);

-- user_settings
drop policy if exists "settings_select" on public.user_settings;
create policy "settings_select" on public.user_settings
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "settings_insert" on public.user_settings;
create policy "settings_insert" on public.user_settings
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "settings_update" on public.user_settings;
create policy "settings_update" on public.user_settings
  for update to authenticated using (user_id = auth.uid());

-- transactions
drop policy if exists "tx_select" on public.transactions;
create policy "tx_select" on public.transactions
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "tx_insert" on public.transactions;
create policy "tx_insert" on public.transactions
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "tx_update" on public.transactions;
create policy "tx_update" on public.transactions
  for update to authenticated using (user_id = auth.uid());

drop policy if exists "tx_delete" on public.transactions;
create policy "tx_delete" on public.transactions
  for delete to authenticated using (user_id = auth.uid());

-- alerts
drop policy if exists "alerts_select" on public.alerts;
create policy "alerts_select" on public.alerts
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "alerts_insert" on public.alerts;
create policy "alerts_insert" on public.alerts
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "alerts_update" on public.alerts;
create policy "alerts_update" on public.alerts
  for update to authenticated using (user_id = auth.uid());

drop policy if exists "alerts_delete" on public.alerts;
create policy "alerts_delete" on public.alerts
  for delete to authenticated using (user_id = auth.uid());

-- Storage policies (receipts/<user_id>/...)
drop policy if exists "receipts_select" on storage.objects;
create policy "receipts_select" on storage.objects
  for select to authenticated
  using (bucket_id = 'receipts' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "receipts_insert" on storage.objects;
create policy "receipts_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'receipts' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "receipts_delete" on storage.objects;
create policy "receipts_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'receipts' and (storage.foldername(name))[1] = auth.uid()::text);

-- ---------------------------
-- Trigger: criar settings + trial 14 dias no signup
-- ---------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.user_settings (user_id, full_name, trial_ends_at, subscription_status, plan)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    now() + interval '14 days',
    'trialing',
    'trial'
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- updated_at helper
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists tx_updated on public.transactions;
create trigger tx_updated before update on public.transactions
  for each row execute function public.set_updated_at();

drop trigger if exists settings_updated on public.user_settings;
create trigger settings_updated before update on public.user_settings
  for each row execute function public.set_updated_at();
