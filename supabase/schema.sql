-- Spunchy — Supabase schema. Run once in the Supabase SQL editor.
-- Public visitors can READ the menu. Only signed-in staff (listed in
-- public.staff) can CHANGE it. Nobody can insert/delete products from the
-- browser: add new items here in SQL or the Supabase table editor.

create table if not exists public.categories (
  id text primary key,
  name_en text not null,
  name_si text,
  sort int not null default 0
);

create table if not exists public.products (
  id text primary key,                         -- slug, e.g. 'nuga-gateau-slice'
  category text not null references public.categories(id),
  name_en text not null,
  name_si text,                                -- needs native review before launch
  description_en text,
  description_si text,
  price int check (price is null or price >= 0), -- LKR, whole rupees; null = "Ask in store"
  stock int check (stock is null or stock >= 0),
  is_available boolean not null default true,
  image text,                                  -- key in src/content/images.json
  sort int not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.staff (
  user_id uuid primary key references auth.users(id) on delete cascade,
  added_at timestamptz not null default now()
);

-- Keep updated_at honest (drives the "Fresh right now" ordering).
create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
drop trigger if exists products_touch on public.products;
create trigger products_touch before update on public.products
  for each row execute function public.touch_updated_at();

-- Staff may only change price / stock / availability. Names, categories and
-- images stay as set by the developer. Enforced in the database, not the UI.
create or replace function public.guard_product_update() returns trigger language plpgsql as $$
begin
  if new.id <> old.id or new.category <> old.category or new.name_en <> old.name_en
     or new.name_si is distinct from old.name_si or new.image is distinct from old.image then
    raise exception 'Only price, stock and availability can be changed from the staff page';
  end if;
  return new;
end $$;
drop trigger if exists products_guard on public.products;
create trigger products_guard before update on public.products
  for each row when (current_user = 'authenticated') execute function public.guard_product_update();

-- Row Level Security
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.staff enable row level security;

create or replace function public.is_staff() returns boolean
  language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.staff where user_id = auth.uid());
$$;

drop policy if exists "menu is public" on public.categories;
create policy "menu is public" on public.categories for select using (true);
drop policy if exists "menu is public" on public.products;
create policy "menu is public" on public.products for select using (true);
drop policy if exists "staff update products" on public.products;
create policy "staff update products" on public.products for update
  to authenticated using (public.is_staff()) with check (public.is_staff());
drop policy if exists "staff see themselves" on public.staff;
create policy "staff see themselves" on public.staff for select to authenticated using (user_id = auth.uid());
-- No insert/delete policies -> denied for anon and authenticated users.

-- Realtime: broadcast product changes to every open page.
alter publication supabase_realtime add table public.products;

-- Seed categories (products: see supabase/seed.sql)
insert into public.categories (id, name_en, name_si, sort) values
  ('pastries', 'Pastries', 'පේස්ට්‍රි', 1),
  ('bakery', 'Bakery items', 'බේකරි නිෂ්පාදන', 2),
  ('cakes', 'Cakes', 'කේක්', 3),
  ('coffee', 'Coffee', 'කෝපි', 4),
  ('tea', 'Tea', 'තේ', 5)
on conflict (id) do nothing;

-- To add a staff member:
--   1. Supabase dashboard -> Authentication -> Users -> "Add user" (their email).
--   2. Run:  insert into public.staff (user_id) select id from auth.users where email = 'staff@example.com';
-- Also: Authentication -> Providers -> Email: turn OFF "Allow new users to sign up".
