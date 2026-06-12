-- Fix RLS order publik v2 untuk ZR SmartOrder AI.
-- Jalankan semua di Supabase SQL Editor pada project:
-- https://wbuipxgzsjajmpcyagdz.supabase.co

grant usage on schema public to anon, authenticated;
grant insert on public.orders to anon, authenticated;
grant insert on public.order_items to anon, authenticated;

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "orders_public_create" on public.orders;
drop policy if exists "orders_public_insert_v2" on public.orders;
create policy "orders_public_insert_v2"
on public.orders
as permissive
for insert
to public
with check (true);

drop policy if exists "order_items_public_create" on public.order_items;
drop policy if exists "order_items_public_insert_v2" on public.order_items;
create policy "order_items_public_insert_v2"
on public.order_items
as permissive
for insert
to public
with check (true);

drop policy if exists "orders_admin_all" on public.orders;
create policy "orders_admin_all"
on public.orders
as permissive
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "order_items_admin_all" on public.order_items;
create policy "order_items_admin_all"
on public.order_items
as permissive
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Cek hasil policy. Harus muncul orders_public_insert_v2 dan order_items_public_insert_v2.
select schemaname, tablename, policyname, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename in ('orders', 'order_items')
order by tablename, policyname;
