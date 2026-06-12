-- Fix RLS order public insert untuk ZR SmartOrder AI.
-- Jalankan di Supabase SQL Editor kalau muncul:
-- "new row violates row-level security policy for table orders"

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "orders_public_create" on public.orders;
create policy "orders_public_create"
on public.orders
for insert
to anon, authenticated
with check (true);

drop policy if exists "order_items_public_create" on public.order_items;
create policy "order_items_public_create"
on public.order_items
for insert
to anon, authenticated
with check (true);

drop policy if exists "orders_admin_all" on public.orders;
create policy "orders_admin_all"
on public.orders
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "order_items_admin_all" on public.order_items;
create policy "order_items_admin_all"
on public.order_items
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());
