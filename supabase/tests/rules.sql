-- Test only: checks the access rules and stock and cost logic. Run after the migrations, on an empty
-- database with supabase-stub.sql. Any failed check stops with an error.

create function pg_temp.fails(sql text) returns boolean language plpgsql as $$
begin
  execute sql;
  return false;
exception when others then
  return true;
end $$;

create function pg_temp.check(ok boolean, what text) returns void language plpgsql as $$
begin
  if not ok then raise exception 'CHECK FAILED: %', what; end if;
end $$;

grant execute on all functions in schema pg_temp to anon, authenticated, service_role;

insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'admin@test'),
  ('22222222-2222-2222-2222-222222222222', 'user@test');
insert into public.admins values ('11111111-1111-1111-1111-111111111111');

-- ---------------------------------------------------------------- admin with two-factor sign-in
set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
set request.jwt.claims = '{"aal":"aal2"}';
set role authenticated;

insert into public.products (name, slug, price) values ('Grips', 'grips', 20);
select pg_temp.check(pg_temp.fails($$insert into public.products (name, slug, price, stock) values ('X', 'x', 1, 5)$$), 'stock cannot be inserted directly');
select pg_temp.check(pg_temp.fails($$update public.products set stock = 99$$), 'stock cannot be updated directly');
select pg_temp.check(pg_temp.fails($$update public.product_costs set avg_cost = 1$$), 'average cost cannot be updated directly');

select public.receive_stock((select id from public.products where slug = 'grips'), 5, 10, 'A', '');
select public.receive_stock((select id from public.products where slug = 'grips'), 5, 14, 'B', '');
select pg_temp.check((select avg_cost from public.product_costs) = 12, 'weighted average 5x10 + 5x14 = 12');
select pg_temp.check((select stock from public.products) = 10, 'stock after two purchases');
select public.adjust_stock((select id from public.products where slug = 'grips'), -1, 'damaged');
select pg_temp.check(pg_temp.fails($$select public.adjust_stock((select id from public.products), -100, 'too many')$$), 'stock cannot go below zero');
reset role;

-- ---------------------------------------------------------------- customers
set role anon;
select pg_temp.check(pg_temp.fails($$select public.place_order('Nika', '555123456', 'Tbilisi', 'Street 1', '', '[]')$$), 'browsers cannot place orders directly');
select pg_temp.check(pg_temp.fails($$select * from public.product_costs$$), 'customers cannot read costs');
select pg_temp.check(pg_temp.fails($$select * from public.orders$$), 'customers cannot read orders');
select pg_temp.check(pg_temp.fails($$select public.rate_limit_hit('k', 1, 60)$$), 'customers cannot use rate limits');
select pg_temp.check(pg_temp.fails($$update public.products set price = 1$$), 'customers cannot change products');
reset role;

-- ---------------------------------------------------------------- the store's server
-- It only calls functions, so the test must not depend on table privileges for service_role.
select id as product_id from public.products \gset
set role service_role;
select pg_temp.check(
  (public.place_order('Nika', '555123456', 'Tbilisi', 'Street 1', '',
    jsonb_build_array(jsonb_build_object('id', :'product_id', 'qty', 7))) -> 'low_stock' -> 0 ->> 'stock') = '2',
  'order lists low stock');
select pg_temp.check(public.rate_limit_hit('k', 2, 60) and public.rate_limit_hit('k', 2, 60) and not public.rate_limit_hit('k', 2, 60), 'rate limit stops the third hit');
reset role;

select pg_temp.check((select unit_cost from public.order_items) = 12, 'order line keeps the cost at sale time');

-- ---------------------------------------------------------------- admin without the second step, and a non-admin
set role authenticated;
set request.jwt.claims = '{"aal":"aal1"}';
select pg_temp.check((select count(*) from public.orders) = 0, 'password-only session sees no orders');
select pg_temp.check(pg_temp.fails($$select * from public.sales_report('2020-01-01', '2100-01-01')$$), 'password-only session gets no reports');

set request.jwt.claims = '{"aal":"aal2"}';
select pg_temp.check((select profit from public.sales_report('2020-01-01', '2100-01-01')) = 56, 'profit 7 x (20 - 12)');
reset role;

-- ---------------------------------------------------------------- homepage
set role authenticated;
set request.jwt.claims = '{"aal":"aal2"}';
insert into public.promotions (product_id, title, ends_at) values ((select id from public.products limit 1), 'Live', now() + interval '1 day');
insert into public.promotions (product_id, title, ends_at) values ((select id from public.products limit 1), 'Ended', now() - interval '1 day');
reset role;

set role anon;
select pg_temp.check((select count(*) from public.promotions) = 1, 'customers see only running promotions');
select pg_temp.check(pg_temp.fails($$insert into public.promotions (product_id, title) values ((select id from public.products limit 1), 'X')$$), 'customers cannot add promotions');
select pg_temp.check(pg_temp.fails($$select public.newsletter_subscribe('a@b.ge')$$), 'browsers cannot sign up directly');
select pg_temp.check(pg_temp.fails($$select * from public.newsletter_subscribers$$), 'customers cannot read subscribers');
select pg_temp.check((select count(*) from public.popular_product_ids(5)) = 1, 'popular products come from sales');
reset role;

set role service_role;
select public.newsletter_subscribe(' A@B.ge ');
select public.newsletter_subscribe('a@b.ge');
select pg_temp.check(pg_temp.fails($$select public.newsletter_subscribe('not-an-email')$$), 'invalid email refused');
reset role;
select pg_temp.check((select count(*) from public.newsletter_subscribers) = 1, 'one subscriber, stored lowercase');
