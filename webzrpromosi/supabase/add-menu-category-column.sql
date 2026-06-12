-- Opsional: tambahkan kolom category ke tabel menus.
-- Admin tetap bisa simpan tanpa file ini, tapi kolom ini membuat data kategori lebih rapi.

alter table public.menus
add column if not exists category text;

update public.menus
set category = case
  when lower(name) like '%rumput laut%' then 'es rumput laut'
  when lower(name) like '%sop buah%' then 'sop buah'
  when lower(name) like '%campur%' then 'es campur'
  when lower(name) like '%teller%' or lower(name) like '%teler%' then 'es teller'
  when lower(name) like '%paket%' then 'paket'
  else coalesce(category, 'lainnya')
end
where category is null or category = '';
