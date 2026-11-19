-- Scooter Land: homepage promotions slider, newsletter sign-ups, popular products.

-- ---------------------------------------------------------------- promotions (homepage slider)

-- Each slide points at a product: its photo, name and price come from the product, so a slide can
-- never show a price that differs from the shop. ends_at drives the countdown; past slides are hidden.
create table public.promotions (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  title text not null check (char_length(title) between 2 and 80),
  description text not null default '' check (char_length(description) <= 240),
  badge text not null default '' check (char_length(badge) <= 30),
  cta_label text not null default 'ყიდვა' check (char_length(cta_label) between 2 and 30),
  ends_at timestamptz,
  active boolean not null default true,
  position int not null default 0,
  created_at timestamptz not null default now()
);

create index promotions_active_idx on public.promotions (active, position);

alter table public.promotions enable row level security;

create policy promotions_public_read on public.promotions
  for select to anon, authenticated
  using (active and (ends_at is null or ends_at > now()));
create policy promotions_admin_read on public.promotions
  for select to authenticated using ((select public.is_admin()));
create policy promotions_admin_insert on public.promotions
  for insert to authenticated with check ((select public.is_admin()));
create policy promotions_admin_update on public.promotions
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy promotions_admin_delete on public.promotions
  for delete to authenticated using ((select public.is_admin()));

revoke all on public.promotions from anon, authenticated;
grant select on public.promotions to anon, authenticated;
grant insert, update, delete on public.promotions to authenticated;

create trigger audit_promotions after insert or update or delete on public.promotions
  for each row execute function public.audit();

-- ---------------------------------------------------------------- newsletter

create table public.newsletter_subscribers (
  id bigint generated always as identity primary key,
  email text not null unique check (email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' and char_length(email) <= 254),
  created_at timestamptz not null default now()
);

alter table public.newsletter_subscribers enable row level security;

create policy newsletter_admin_read on public.newsletter_subscribers
  for select to authenticated using ((select public.is_admin()));
create policy newsletter_admin_delete on public.newsletter_subscribers
  for delete to authenticated using ((select public.is_admin()));

revoke all on public.newsletter_subscribers from anon, authenticated;
grant select, delete on public.newsletter_subscribers to authenticated;

-- Called by the store's server only. Signing up twice is not an error.
create function public.newsletter_subscribe(p_email text) returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_email text := lower(btrim(coalesce(p_email, '')));
begin
  if char_length(v_email) > 254 or v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'invalid_email';
  end if;
  insert into public.newsletter_subscribers (email) values (v_email) on conflict (email) do nothing;
end;
$$;

revoke execute on function public.newsletter_subscribe(text) from public, anon, authenticated;
grant execute on function public.newsletter_subscribe(text) to service_role;

-- ---------------------------------------------------------------- popular products

-- Product ids ordered by units sold in the last 90 days. Only ids leave the database, never order data.
create function public.popular_product_ids(p_limit int) returns setof uuid
language sql stable security definer set search_path = ''
as $$
  select i.product_id
  from public.order_items i
  join public.orders o on o.id = i.order_id
  join public.products p on p.id = i.product_id
  where o.status <> 'cancelled'
    and o.created_at > now() - interval '90 days'
    and p.active
  group by i.product_id
  order by sum(i.qty) desc, i.product_id
  limit least(greatest(coalesce(p_limit, 10), 1), 50);
$$;

revoke execute on function public.popular_product_ids(int) from public;
grant execute on function public.popular_product_ids(int) to anon, authenticated, service_role;
