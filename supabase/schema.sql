-- ============================================================
-- GIDIGBA STUDIOS — orders schema
-- Run this once in the Supabase SQL editor (or via the connector).
-- ============================================================

-- 1. the orders themselves -----------------------------------
create table if not exists public.orders (
  id            uuid primary key default gen_random_uuid(),
  order_no      text not null unique,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  status        text not null default 'new',
  customer_name text,
  phone         text,                 -- WhatsApp number, digits only where possible
  package       text,
  price         numeric,
  gender        text,
  about         text,
  notes         text,
  edits         text[] default '{}',
  hurry         boolean default false,
  photo_count   int default 0,
  source        text default 'website',
  admin_note    text
);

create index if not exists orders_created_idx on public.orders (created_at desc);
create index if not exists orders_status_idx  on public.orders (status);
create index if not exists orders_phone_idx   on public.orders (phone);

-- 2. who is an admin -----------------------------------------
create table if not exists public.admins (
  email text primary key,
  added_at timestamptz not null default now()
);

-- security-definer so the policy check itself is not blocked by RLS
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.admins a
    where lower(a.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

-- 3. row level security --------------------------------------
alter table public.orders enable row level security;
alter table public.admins enable row level security;

-- anyone (the website, signed out) may CREATE an order
drop policy if exists "anon can create orders" on public.orders;
create policy "anon can create orders"
  on public.orders for insert to anon, authenticated
  with check (true);

-- only admins may read them
drop policy if exists "admins can read orders" on public.orders;
create policy "admins can read orders"
  on public.orders for select to authenticated
  using (public.is_admin());

-- only admins may change progress
drop policy if exists "admins can update orders" on public.orders;
create policy "admins can update orders"
  on public.orders for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- only admins may delete
drop policy if exists "admins can delete orders" on public.orders;
create policy "admins can delete orders"
  on public.orders for delete to authenticated
  using (public.is_admin());

-- the admins list is never readable from the website
drop policy if exists "admins can read admin list" on public.admins;
create policy "admins can read admin list"
  on public.admins for select to authenticated
  using (public.is_admin());

-- 4. keep updated_at honest ----------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists orders_touch on public.orders;
create trigger orders_touch
  before update on public.orders
  for each row execute function public.touch_updated_at();

-- 5. make yourself an admin ----------------------------------
-- replace with the email you will sign in to the admin page with
-- insert into public.admins (email) values ('you@example.com')
--   on conflict do nothing;
