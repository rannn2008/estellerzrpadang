-- ZR SmartOrder AI - Supabase schema
-- Jalankan file ini di Supabase SQL Editor.
-- Buat user admin lewat Supabase Auth, lalu set role admin di tabel profiles.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  role text not null default 'client' check (role in ('admin', 'client')),
  created_at timestamp with time zone default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  price integer not null check (price >= 0),
  description text,
  image_url text,
  is_available boolean default true,
  stock integer default 0 check (stock >= 0),
  created_at timestamp with time zone default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  phone text,
  order_type text check (order_type in ('pickup', 'delivery')),
  address text,
  notes text,
  total_price integer default 0 check (total_price >= 0),
  status text default 'new' check (status in ('new', 'process', 'done', 'cancelled')),
  created_at timestamp with time zone default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  product_id uuid references public.products(id),
  product_name text,
  qty integer not null check (qty > 0),
  price integer not null check (price >= 0),
  subtotal integer not null check (subtotal >= 0)
);

create table if not exists public.ai_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  feature text,
  prompt text,
  result text,
  created_at timestamp with time zone default now()
);

create index if not exists products_available_idx on public.products (is_available, category);
create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_status_idx on public.orders (status);
create index if not exists order_items_order_id_idx on public.order_items (order_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    'client'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.ai_logs enable row level security;

drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin"
on public.profiles for select
using (auth.uid() = id or public.is_admin());

drop policy if exists "profiles_update_own_name" on public.profiles;

drop policy if exists "profiles_admin_all" on public.profiles;
create policy "profiles_admin_all"
on public.profiles for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "products_public_read_available" on public.products;
create policy "products_public_read_available"
on public.products for select
using (is_available = true or public.is_admin());

drop policy if exists "products_admin_all" on public.products;
create policy "products_admin_all"
on public.products for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "orders_public_create" on public.orders;
create policy "orders_public_create"
on public.orders for insert
with check (true);

drop policy if exists "orders_admin_all" on public.orders;
create policy "orders_admin_all"
on public.orders for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "order_items_public_create" on public.order_items;
create policy "order_items_public_create"
on public.order_items for insert
with check (true);

drop policy if exists "order_items_admin_all" on public.order_items;
create policy "order_items_admin_all"
on public.order_items for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "ai_logs_admin_read" on public.ai_logs;
create policy "ai_logs_admin_read"
on public.ai_logs for select
using (public.is_admin());

drop policy if exists "ai_logs_authenticated_create" on public.ai_logs;
create policy "ai_logs_authenticated_create"
on public.ai_logs for insert
with check (auth.uid() = user_id or user_id is null or public.is_admin());

drop policy if exists "ai_logs_admin_all" on public.ai_logs;
create policy "ai_logs_admin_all"
on public.ai_logs for all
using (public.is_admin())
with check (public.is_admin());

-- Seed awal opsional. Hapus/ubah sesuai menu asli di kedai.
insert into public.products (name, category, price, description, image_url, is_available, stock)
values
  ('Es Teller Original', 'es teller', 10000, 'Racikan klasik Pondok Es Teller ZR dengan buah segar dan kuah creamy.', 'foto2/estelleroriginal.webp', true, 30),
  ('Es Campur Premium', 'es campur', 15000, 'Es campur segar dengan isian warna-warni dan rasa manis dingin.', 'foto2/display-esteller.jpg.webp', true, 25),
  ('Es Rumput Laut Premium', 'es rumput laut', 13000, 'Paduan rumput laut, buah, dan kuah segar untuk cuaca panas Padang.', 'foto2/alpukat-segar.jpg.webp', true, 20),
  ('Sop Buah Original', 'sop buah', 15000, 'Potongan buah segar dengan kuah susu manis yang ringan.', 'foto2/buah-segar.jpg.webp', true, 20)
on conflict do nothing;
