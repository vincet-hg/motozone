-- Scooter Land: production hardening, purchase costs, reports and audit log.
--
-- What changes:
-- * Stock now changes only through purchases, stock corrections and orders, so every unit is accounted for.
-- * Each product has a weighted average purchase cost. Orders store the cost at the moment of sale,
--   so profit stays correct after prices or costs change.
-- * Admin access requires two-factor sign-in (aal2).
-- * Orders can be placed only by the store's server (service role), which rate-limits by IP first.
-- * Every admin change is written to audit_log.

-- ---------------------------------------------------------------- admin access needs two-factor sign-in

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = ''
as $$
  select coalesce((select auth.jwt() ->> 'aal'), '') = 'aal2'
     and exists (select 1 from public.admins where user_id = (select auth.uid()))
$$;

-- ---------------------------------------------------------------- columns for SEO and sitemaps

alter table public.categories
  add column description text not null default '' check (char_length(description) <= 2000);

alter table public.products add column updated_at timestamptz not null default now();

create function public.touch_updated_at() returns trigger
language plpgsql set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger products_touch_updated_at
  before update on public.products
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------- purchase costs and stock

-- Kept apart from products because customers can read every products column.
create table public.product_costs (
  product_id uuid primary key references public.products (id) on delete cascade,
  avg_cost numeric(12, 4) not null default 0 check (avg_cost >= 0),
  last_cost numeric(10, 2) check (last_cost >= 0),
  low_stock_at int not null default 3 check (low_stock_at between 0 and 100000)
);

insert into public.product_costs (product_id) select id from public.products;

create function public.create_product_costs() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.product_costs (product_id) values (new.id) on conflict do nothing;
  return new;
end;
$$;

create trigger products_create_costs
  after insert on public.products
  for each row execute function public.create_product_costs();

create table public.purchases (
  id bigint generated always as identity primary key,
  product_id uuid not null references public.products (id) on delete cascade,
  qty int not null check (qty between 1 and 100000),
  unit_cost numeric(10, 2) not null check (unit_cost >= 0),
  supplier text not null default '' check (char_length(supplier) <= 120),
  note text not null default '' check (char_length(note) <= 500),
  created_at timestamptz not null default now(),
  created_by uuid default auth.uid() references auth.users (id) on delete set null
);

create index purchases_product_idx on public.purchases (product_id, created_at desc);

create table public.stock_adjustments (
  id bigint generated always as identity primary key,
  product_id uuid not null references public.products (id) on delete cascade,
  delta int not null check (delta <> 0 and delta between -100000 and 100000),
  reason text not null check (char_length(reason) between 2 and 300),
  created_at timestamptz not null default now(),
  created_by uuid default auth.uid() references auth.users (id) on delete set null
);

create index stock_adjustments_product_idx on public.stock_adjustments (product_id, created_at desc);

-- Cost of one unit at the moment of sale. Orders placed before this migration have 0.
alter table public.order_items add column unit_cost numeric(12, 4) not null default 0;

-- New stock arrives. The average cost is weighted by quantity:
-- 5 units at 10 + 5 units at 14 = 10 units at 12.
-- When no cost was recorded yet (average 0), the new cost is used for the whole stock.
create function public.receive_stock(
  p_product_id uuid,
  p_qty int,
  p_unit_cost numeric,
  p_supplier text,
  p_note text
) returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_stock int;
  v_price numeric(10, 2);
  v_old numeric(12, 4);
  v_new numeric(12, 4);
begin
  if not public.is_admin() then
    raise exception 'not_admin';
  end if;
  if p_qty is null or p_qty not between 1 and 100000 then
    raise exception 'invalid_qty';
  end if;
  if p_unit_cost is null or p_unit_cost < 0 or p_unit_cost >= 100000000 then
    raise exception 'invalid_cost';
  end if;

  select p.stock, p.final_price into v_stock, v_price
  from public.products p where p.id = p_product_id for update;
  if not found then
    raise exception 'product_not_found';
  end if;

  select c.avg_cost into v_old from public.product_costs c where c.product_id = p_product_id for update;
  v_old := coalesce(v_old, 0);
  v_new := case
    when v_stock <= 0 or v_old = 0 then p_unit_cost
    else (v_stock * v_old + p_qty * p_unit_cost) / (v_stock + p_qty)
  end;

  insert into public.purchases (product_id, qty, unit_cost, supplier, note)
  values (p_product_id, p_qty, round(p_unit_cost, 2), btrim(coalesce(p_supplier, '')), btrim(coalesce(p_note, '')));

  update public.products set stock = stock + p_qty where id = p_product_id;

  insert into public.product_costs (product_id, avg_cost, last_cost)
  values (p_product_id, v_new, round(p_unit_cost, 2))
  on conflict (product_id) do update set avg_cost = excluded.avg_cost, last_cost = excluded.last_cost;

  return jsonb_build_object('stock', v_stock + p_qty, 'old_avg', round(v_old, 2), 'avg_cost', round(v_new, 2), 'price', v_price);
end;
$$;

-- Counting errors, damage, gifts. Does not change the average cost.
create function public.adjust_stock(p_product_id uuid, p_delta int, p_reason text) returns int
language plpgsql security definer set search_path = ''
as $$
declare
  v_stock int;
  v_reason text := btrim(coalesce(p_reason, ''));
begin
  if not public.is_admin() then
    raise exception 'not_admin';
  end if;
  if p_delta is null or p_delta = 0 or p_delta not between -100000 and 100000 then
    raise exception 'invalid_qty';
  end if;
  if char_length(v_reason) not between 2 and 300 then
    raise exception 'invalid_reason';
  end if;

  select stock into v_stock from public.products where id = p_product_id for update;
  if not found then
    raise exception 'product_not_found';
  end if;
  if v_stock + p_delta < 0 then
    raise exception 'out_of_stock';
  end if;

  update public.products set stock = stock + p_delta where id = p_product_id;
  insert into public.stock_adjustments (product_id, delta, reason) values (p_product_id, p_delta, v_reason);
  return v_stock + p_delta;
end;
$$;

-- For stock that was already in the shop before purchases were recorded.
create function public.set_product_cost(p_product_id uuid, p_avg_cost numeric) returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'not_admin';
  end if;
  if p_avg_cost is null or p_avg_cost < 0 or p_avg_cost >= 100000000 then
    raise exception 'invalid_cost';
  end if;
  if not exists (select 1 from public.products where id = p_product_id) then
    raise exception 'product_not_found';
  end if;

  insert into public.product_costs (product_id, avg_cost) values (p_product_id, p_avg_cost)
  on conflict (product_id) do update set avg_cost = excluded.avg_cost;
end;
$$;

-- ---------------------------------------------------------------- orders

-- Same rules as before, plus: the unit cost is copied into each line, and the result lists the
-- ordered items and any product that fell to its low-stock level, for the shop's notification.
create or replace function public.place_order(
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
  v_name text := btrim(coalesce(p_name, ''));
  v_phone text := regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g');
  v_city text := btrim(coalesce(p_city, ''));
  v_address text := btrim(coalesce(p_address, ''));
  v_note text := btrim(coalesce(p_note, ''));
  v_order_id bigint;
  v_total numeric(10, 2) := 0;
  v_expected int;
  v_seen int := 0;
  v_lines jsonb := '[]'::jsonb;
  v_low jsonb := '[]'::jsonb;
  r record;
begin
  if v_phone ~ '^995[0-9]{9}$' then
    v_phone := substr(v_phone, 4);
  end if;
  if v_phone !~ '^[0-9]{9}$' then
    raise exception 'invalid_phone';
  end if;
  if char_length(v_name) not between 2 and 100
    or char_length(v_city) not between 2 and 60
    or char_length(v_address) not between 3 and 300
    or char_length(v_note) > 500 then
    raise exception 'invalid_customer';
  end if;
  if jsonb_typeof(p_items) is distinct from 'array'
    or jsonb_array_length(p_items) not between 1 and 50 then
    raise exception 'invalid_items';
  end if;

  if (select count(*) from public.orders o
      where o.phone = v_phone and o.status = 'new'
        and o.created_at > now() - interval '1 hour') >= 5 then
    raise exception 'too_many_orders';
  end if;

  select count(distinct (e ->> 'id')::uuid) into v_expected
  from jsonb_array_elements(p_items) e;

  insert into public.orders (customer_name, phone, city, address, note)
  values (v_name, v_phone, v_city, v_address, v_note)
  returning id into v_order_id;

  for r in
    select p.id, p.name, p.final_price, p.stock, p.active, q.qty,
      coalesce(c.avg_cost, 0) as avg_cost, coalesce(c.low_stock_at, 3) as low_stock_at
    from (
      select (e ->> 'id')::uuid as id, sum((e ->> 'qty')::int)::int as qty
      from jsonb_array_elements(p_items) e
      group by 1
    ) q
    join public.products p on p.id = q.id
    left join public.product_costs c on c.product_id = p.id
    order by p.id
    for update of p
  loop
    v_seen := v_seen + 1;
    if r.qty not between 1 and 99 then
      raise exception 'invalid_items';
    end if;
    if not r.active then
      raise exception 'product_unavailable' using detail = r.name;
    end if;
    if r.stock < r.qty then
      raise exception 'out_of_stock' using detail = r.name;
    end if;

    insert into public.order_items (order_id, product_id, product_name, price, qty, unit_cost)
    values (v_order_id, r.id, r.name, r.final_price, r.qty, r.avg_cost);

    update public.products set stock = stock - r.qty where id = r.id;
    v_total := v_total + r.final_price * r.qty;
    v_lines := v_lines || jsonb_build_object('name', r.name, 'qty', r.qty, 'price', r.final_price);
    if r.stock - r.qty <= r.low_stock_at then
      v_low := v_low || jsonb_build_object('name', r.name, 'stock', r.stock - r.qty);
    end if;
  end loop;

  if v_seen <> v_expected then
    raise exception 'product_unavailable';
  end if;

  update public.orders set total = v_total where id = v_order_id;
  return jsonb_build_object('order_id', v_order_id, 'total', v_total, 'items', v_lines, 'low_stock', v_low);
end;
$$;

-- ---------------------------------------------------------------- reports

-- Cancelled orders are left out. Months follow Tbilisi time.
create function public.sales_report(p_from date, p_to date)
returns table (month date, orders bigint, units bigint, revenue numeric, cost numeric, profit numeric)
language plpgsql stable security definer set search_path = ''
as $$
#variable_conflict use_column
begin
  if not public.is_admin() then
    raise exception 'not_admin';
  end if;
  return query
  select
    date_trunc('month', o.created_at at time zone 'Asia/Tbilisi')::date,
    count(distinct o.id),
    sum(i.qty)::bigint,
    round(sum(i.price * i.qty), 2),
    round(sum(i.unit_cost * i.qty), 2),
    round(sum((i.price - i.unit_cost) * i.qty), 2)
  from public.orders o
  join public.order_items i on i.order_id = o.id
  where o.status <> 'cancelled'
    and o.created_at >= (p_from::timestamp at time zone 'Asia/Tbilisi')
    and o.created_at < ((p_to + 1)::timestamp at time zone 'Asia/Tbilisi')
  group by 1
  order by 1 desc;
end;
$$;

create function public.top_products(p_from date, p_to date, p_limit int)
returns table (product_name text, units bigint, revenue numeric, profit numeric)
language plpgsql stable security definer set search_path = ''
as $$
#variable_conflict use_column
begin
  if not public.is_admin() then
    raise exception 'not_admin';
  end if;
  return query
  select
    i.product_name,
    sum(i.qty)::bigint,
    round(sum(i.price * i.qty), 2),
    round(sum((i.price - i.unit_cost) * i.qty), 2)
  from public.orders o
  join public.order_items i on i.order_id = o.id
  where o.status <> 'cancelled'
    and o.created_at >= (p_from::timestamp at time zone 'Asia/Tbilisi')
    and o.created_at < ((p_to + 1)::timestamp at time zone 'Asia/Tbilisi')
  group by 1
  order by 4 desc, 2 desc
  limit least(greatest(coalesce(p_limit, 10), 1), 100);
end;
$$;

-- ---------------------------------------------------------------- rate limits

-- Used by the store's server before checkout and sign-in. Keys hold hashed IP addresses.
create table public.rate_limits (
  key text not null,
  hit_at timestamptz not null default now()
);

create index rate_limits_key_idx on public.rate_limits (key, hit_at desc);

create function public.rate_limit_hit(p_key text, p_max int, p_window_seconds int) returns boolean
language plpgsql security definer set search_path = ''
as $$
declare
  v_count int;
begin
  if random() < 0.01 then
    delete from public.rate_limits where hit_at < now() - interval '1 day';
  end if;
  perform pg_advisory_xact_lock(hashtext(p_key));
  select count(*) into v_count from public.rate_limits
  where key = p_key and hit_at > now() - make_interval(secs => p_window_seconds);
  if v_count >= p_max then
    return false;
  end if;
  insert into public.rate_limits (key) values (p_key);
  return true;
end;
$$;

-- ---------------------------------------------------------------- audit log

create table public.audit_log (
  id bigint generated always as identity primary key,
  at timestamptz not null default now(),
  actor uuid,
  action text not null,
  entity text not null,
  entity_id text,
  details jsonb not null default '{}'::jsonb
);

create index audit_log_at_idx on public.audit_log (at desc);

-- Stock changes are left out of updates: purchases, corrections and orders record them already.
create function public.audit() returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  v_old jsonb;
  v_new jsonb;
  v_diff jsonb := '{}'::jsonb;
  k text;
begin
  if tg_op = 'INSERT' then
    v_new := to_jsonb(new);
    insert into public.audit_log (actor, action, entity, entity_id, details)
    values (auth.uid(), 'insert', tg_table_name, coalesce(v_new ->> 'id', v_new ->> 'product_id'), v_new);
    return new;
  end if;
  if tg_op = 'DELETE' then
    v_old := to_jsonb(old);
    insert into public.audit_log (actor, action, entity, entity_id, details)
    values (auth.uid(), 'delete', tg_table_name, coalesce(v_old ->> 'id', v_old ->> 'product_id'), v_old);
    return old;
  end if;

  v_old := to_jsonb(old);
  v_new := to_jsonb(new);
  for k in select jsonb_object_keys(v_new) loop
    if k not in ('stock', 'updated_at', 'final_price', 'total') and v_new -> k is distinct from v_old -> k then
      v_diff := v_diff || jsonb_build_object(k, jsonb_build_object('from', v_old -> k, 'to', v_new -> k));
    end if;
  end loop;
  if v_diff <> '{}'::jsonb then
    insert into public.audit_log (actor, action, entity, entity_id, details)
    values (auth.uid(), 'update', tg_table_name, coalesce(v_new ->> 'id', v_new ->> 'product_id'), v_diff);
  end if;
  return new;
end;
$$;

create trigger audit_products after insert or update or delete on public.products
  for each row execute function public.audit();
create trigger audit_categories after insert or update or delete on public.categories
  for each row execute function public.audit();
create trigger audit_product_costs after update on public.product_costs
  for each row execute function public.audit();
create trigger audit_orders after update on public.orders
  for each row execute function public.audit();
create trigger audit_purchases after insert on public.purchases
  for each row execute function public.audit();
create trigger audit_stock_adjustments after insert on public.stock_adjustments
  for each row execute function public.audit();
create trigger audit_admins after insert or delete on public.admins
  for each row execute function public.audit();

-- ---------------------------------------------------------------- access rules

alter table public.product_costs enable row level security;
alter table public.purchases enable row level security;
alter table public.stock_adjustments enable row level security;
alter table public.rate_limits enable row level security;
alter table public.audit_log enable row level security;

create policy product_costs_admin_read on public.product_costs
  for select to authenticated using ((select public.is_admin()));
create policy product_costs_admin_update on public.product_costs
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy purchases_admin_read on public.purchases
  for select to authenticated using ((select public.is_admin()));
create policy stock_adjustments_admin_read on public.stock_adjustments
  for select to authenticated using ((select public.is_admin()));
create policy audit_log_admin_read on public.audit_log
  for select to authenticated using ((select public.is_admin()));

-- Supabase grants every privilege on new tables to anon and authenticated by default.
-- Take them all back and grant only what the store uses. Row rules still apply on top.
revoke all on public.admins, public.categories, public.products, public.orders, public.order_items,
  public.product_costs, public.purchases, public.stock_adjustments, public.rate_limits, public.audit_log
  from anon, authenticated;

grant select on public.categories, public.products to anon, authenticated;
grant select on public.admins, public.orders, public.order_items, public.product_costs,
  public.purchases, public.stock_adjustments, public.audit_log to authenticated;
grant insert, update, delete on public.categories to authenticated;
-- Stock is changed only by the functions above, never directly.
grant insert (category_id, name, slug, description, specs, compatibility, price, sale_price, images, active)
  on public.products to authenticated;
grant update (category_id, name, description, specs, compatibility, price, sale_price, images, active)
  on public.products to authenticated;
grant delete on public.products to authenticated;
grant update (low_stock_at) on public.product_costs to authenticated;

-- Functions: same idea. Supabase grants execute to anon and authenticated by default.
revoke execute on function public.touch_updated_at(), public.create_product_costs(), public.audit()
  from public, anon, authenticated;
revoke execute on function public.place_order(text, text, text, text, text, jsonb) from public, anon, authenticated;
revoke execute on function public.rate_limit_hit(text, int, int) from public, anon, authenticated;
revoke execute on function public.receive_stock(uuid, int, numeric, text, text) from public, anon;
revoke execute on function public.adjust_stock(uuid, int, text) from public, anon;
revoke execute on function public.set_product_cost(uuid, numeric) from public, anon;
revoke execute on function public.sales_report(date, date) from public, anon;
revoke execute on function public.top_products(date, date, int) from public, anon;
revoke execute on function public.set_order_status(bigint, text) from anon;

grant execute on function public.place_order(text, text, text, text, text, jsonb) to service_role;
grant execute on function public.rate_limit_hit(text, int, int) to service_role;
grant execute on function public.receive_stock(uuid, int, numeric, text, text) to authenticated;
grant execute on function public.adjust_stock(uuid, int, text) to authenticated;
grant execute on function public.set_product_cost(uuid, numeric) to authenticated;
grant execute on function public.sales_report(date, date) to authenticated;
grant execute on function public.top_products(date, date, int) to authenticated;
