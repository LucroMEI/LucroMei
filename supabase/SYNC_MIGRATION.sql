-- ============================================================
-- LucroMEI — Rodar no Supabase SQL Editor (uma vez)
-- Sincronização celular ↔ computador (transactions + recurring)
-- ============================================================

-- Colunas novas em transactions (se a tabela já existia)
alter table public.transactions
  add column if not exists recurring_id uuid;

alter table public.transactions
  add column if not exists notes text;

-- Atualizar check de source (PostgreSQL: dropar e recriar)
do $$
begin
  alter table public.transactions drop constraint if exists transactions_source_check;
exception when undefined_object then null;
end $$;

alter table public.transactions
  drop constraint if exists transactions_source_check;

-- Nome do constraint pode variar; força via check novo
do $$
declare
  cname text;
begin
  select conname into cname
  from pg_constraint
  where conrelid = 'public.transactions'::regclass
    and contype = 'c'
    and pg_get_constraintdef(oid) ilike '%source%';
  if cname is not null then
    execute format('alter table public.transactions drop constraint %I', cname);
  end if;
end $$;

alter table public.transactions
  add constraint transactions_source_check
  check (source in ('manual', 'upload', 'import', 'recorrente'));

create index if not exists transactions_recurring_idx
  on public.transactions(user_id, recurring_id);

-- Tabela despesas fixas
create table if not exists public.recurring_expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  description text not null,
  amount numeric(12,2) not null,
  day_of_month int not null check (day_of_month between 1 and 28),
  category text not null,
  is_deductible boolean default true,
  active boolean default true,
  last_generated_ym text,
  frequency text default 'monthly' check (frequency in ('monthly', 'yearly')),
  month_of_year int check (month_of_year is null or month_of_year between 1 and 12),
  installments_total int,
  installments_generated int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.recurring_expenses
  add column if not exists frequency text default 'monthly';
alter table public.recurring_expenses
  add column if not exists month_of_year int;
alter table public.recurring_expenses
  add column if not exists installments_total int;
alter table public.recurring_expenses
  add column if not exists installments_generated int default 0;

create index if not exists recurring_expenses_user_idx
  on public.recurring_expenses(user_id, active);

alter table public.recurring_expenses enable row level security;

drop policy if exists "recurring_select" on public.recurring_expenses;
create policy "recurring_select" on public.recurring_expenses
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "recurring_insert" on public.recurring_expenses;
create policy "recurring_insert" on public.recurring_expenses
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "recurring_update" on public.recurring_expenses;
create policy "recurring_update" on public.recurring_expenses
  for update to authenticated using (user_id = auth.uid());

drop policy if exists "recurring_delete" on public.recurring_expenses;
create policy "recurring_delete" on public.recurring_expenses
  for delete to authenticated using (user_id = auth.uid());
