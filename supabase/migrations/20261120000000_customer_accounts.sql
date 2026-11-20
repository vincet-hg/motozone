-- Customer accounts: orders belong to a signed-in customer, who can see their own orders,
-- keep their delivery details and keep a wishlist across devices.
--
-- Customers and admins share Supabase Auth. Being signed in gives no admin rights: those still
-- need a row in public.admins and two-factor sign-in (see is_admin).

-- ---------------------------------------------------------------- orders
alter table public.orders add column user_id uuid references auth.users (id) on delete set null;
create index orders_user_idx on public.orders (user_id, created_at desc);

create policy orders_own_read on public.orders
  for select to authenticated using (user_id = (select auth.uid()));
create policy order_items_own_read on public.order_items
  for select to authenticated using (
    exists (select 1 from public.orders o where o.id = order_id and o.user_id = (select auth.uid()))
  );

-- The store's server calls this with the id from the customer's verified session. It runs the same
-- checks as place_order (prices and stock from the database, locked rows) and records the customer.
create function public.place_customer_order(
  p_user_id uuid,
  p_name text,
  p_phone text,
  p_city text,
  p_address text,
  p_note text,
  p_items jsonb
) returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_result jsonb;
begin
  if p_user_id is null or not exists (select 1 from auth.users u where u.id = p_user_id) then
    raise exception 'not_signed_in';
  end if;
  v_result := public.place_order(p_name, p_phone, p_city, p_address, p_note, p_items);
  update public.orders set user_id = p_user_id where id = (v_result ->> 'order_id')::bigint;
  return v_result;
end;
$$;

revoke execute on function public.place_customer_order(uuid, text, text, text, text, text, jsonb) from public, anon, authenticated;
grant execute on function public.place_customer_order(uuid, text, text, text, text, text, jsonb) to service_role;

-- ---------------------------------------------------------------- saved details
create table public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '' check (char_length(name) <= 100),
  phone text not null default '' check (char_length(phone) <= 20),
  address text not null default '' check (char_length(address) <= 300),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
create policy profiles_own_read on public.profiles
  for select to authenticated using (user_id = (select auth.uid()));
create policy profiles_own_insert on public.profiles
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy profiles_own_update on public.profiles
  for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy profiles_admin_read on public.profiles
  for select to authenticated using ((select public.is_admin()));

create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------- wishlist
create table public.wishlist_items (
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

alter table public.wishlist_items enable row level security;
create policy wishlist_own_read on public.wishlist_items
  for select to authenticated using (user_id = (select auth.uid()));
create policy wishlist_own_insert on public.wishlist_items
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy wishlist_own_delete on public.wishlist_items
  for delete to authenticated using (user_id = (select auth.uid()));

-- ---------------------------------------------------------------- privileges
-- New tables get no automatic grants in this project, so every privilege is listed.
revoke all on public.profiles, public.wishlist_items from anon, authenticated;
grant select, insert on public.profiles to authenticated;
grant update (name, phone, address) on public.profiles to authenticated;
grant select, insert, delete on public.wishlist_items to authenticated;
