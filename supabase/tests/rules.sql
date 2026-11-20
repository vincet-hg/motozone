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

-- ---------------------------------------------------------------- customer accounts
-- user@test places an order through the store's server and sees only their own orders.
set role service_role;
select pg_temp.check(pg_temp.fails($$select public.place_customer_order(null, 'Nika', '555123456', 'Tbilisi', 'Street 1', '', '[]')$$), 'orders need a signed-in customer');
select (public.place_customer_order('22222222-2222-2222-2222-222222222222', 'Nika', '555123457', 'Tbilisi', 'Street 2', '',
  jsonb_build_array(jsonb_build_object('id', :'product_id', 'qty', 1))) ->> 'order_id') as own_order \gset
reset role;

set role authenticated;
set request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';
set request.jwt.claims = '{"aal":"aal1"}';
select pg_temp.check((select count(*) from public.orders) = 1, 'a customer sees only their own order');
select pg_temp.check((select id from public.orders) = :'own_order'::bigint, 'it is the order they placed');
select pg_temp.check((select count(*) from public.order_items) = 1, 'and only its lines');
select pg_temp.check(pg_temp.fails($$update public.orders set status = 'delivered'$$) or (select status from public.orders) = 'new', 'customers cannot change their order');
select pg_temp.check(pg_temp.fails($$select public.place_customer_order('22222222-2222-2222-2222-222222222222', 'N', '555123456', 'T', 'S', '', '[]')$$), 'browsers cannot place orders directly');

insert into public.profiles (user_id, name, phone, address) values ('22222222-2222-2222-2222-222222222222', 'Nika', '555123457', 'Street 2');
update public.profiles set address = 'Street 3';
select pg_temp.check((select address from public.profiles) = 'Street 3', 'customers update their own details');
select pg_temp.check(pg_temp.fails($$insert into public.profiles (user_id) values ('11111111-1111-1111-1111-111111111111')$$), 'customers cannot create details for someone else');

insert into public.wishlist_items (user_id, product_id) values ('22222222-2222-2222-2222-222222222222', :'product_id');
select pg_temp.check((select count(*) from public.wishlist_items) = 1, 'wishlist is saved');
select pg_temp.check(pg_temp.fails($$insert into public.wishlist_items (user_id, product_id) values ('11111111-1111-1111-1111-111111111111', (select id from public.products limit 1))$$), 'customers cannot fill someone else''s wishlist');
select pg_temp.check((select count(*) from public.admins) <= 1 and not public.is_admin(), 'a customer is not an admin');
reset role;

set role anon;
select pg_temp.check(pg_temp.fails($$select * from public.profiles$$), 'visitors cannot read details');
select pg_temp.check(pg_temp.fails($$select * from public.wishlist_items$$), 'visitors cannot read wishlists');
reset role;

-- ---------------------------------------------------------------- users page and the super admin
insert into auth.users (id, email) values ('33333333-3333-3333-3333-333333333333', 'owner@test');
insert into public.admins (user_id, super) values ('33333333-3333-3333-3333-333333333333', true);

-- An ordinary admin sees the accounts but cannot change who is an admin.
set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
set request.jwt.claims = '{"aal":"aal2"}';
set role authenticated;
select pg_temp.check(public.admin_access() = 'admin', 'an admin row gives admin access');
select pg_temp.check((select count(*) from public.admin_users()) = 3, 'admins see every account');
select pg_temp.check((select role from public.admin_users() where id = '33333333-3333-3333-3333-333333333333') = 'super', 'the list marks the super admin');
select pg_temp.check(pg_temp.fails($$select public.set_admin('22222222-2222-2222-2222-222222222222', true)$$), 'an ordinary admin cannot add admins');
select pg_temp.check(pg_temp.fails($$select public.set_admin('33333333-3333-3333-3333-333333333333', false)$$), 'an ordinary admin cannot remove the super admin');
select pg_temp.check(pg_temp.fails($$delete from public.admins$$), 'admins cannot be removed directly');
reset role;

-- The super admin adds and removes admins, and cannot be removed, even by themselves.
set request.jwt.claim.sub = '33333333-3333-3333-3333-333333333333';
set role authenticated;
select pg_temp.check(public.is_super_admin(), 'the owner is the super admin');
select public.set_admin('22222222-2222-2222-2222-222222222222', true);
select pg_temp.check((select role from public.admin_users() where id = '22222222-2222-2222-2222-222222222222') = 'admin', 'the super admin adds an admin');
select public.set_admin('22222222-2222-2222-2222-222222222222', false);
select pg_temp.check((select role from public.admin_users() where id = '22222222-2222-2222-2222-222222222222') is null, 'the super admin removes an admin');
select pg_temp.check(pg_temp.fails($$select public.set_admin('33333333-3333-3333-3333-333333333333', false)$$), 'the super admin cannot be removed');
reset role;

set request.jwt.claims = '{"aal":"aal1"}';
set role authenticated;
select pg_temp.check(pg_temp.fails($$select public.set_admin('22222222-2222-2222-2222-222222222222', true)$$), 'the super admin needs the second step too');
reset role;

select pg_temp.check(pg_temp.fails($$delete from public.admins where user_id = '33333333-3333-3333-3333-333333333333'$$), 'the super admin row cannot be deleted');
select pg_temp.check(pg_temp.fails($$update public.admins set super = false$$), 'the super admin cannot be demoted');

-- A customer sees no accounts and is not an admin while the test switch is off.
set request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';
set request.jwt.claims = '{"aal":"aal2"}';
set role authenticated;
select pg_temp.check(public.admin_access() is null, 'a customer has no admin access');
select pg_temp.check((select count(*) from public.admin_users()) = 0, 'customers see no accounts');
select pg_temp.check(pg_temp.fails($$select * from public.settings$$), 'customers cannot read the settings');
select pg_temp.check(pg_temp.fails($$update public.settings set every_account_is_admin = true$$), 'customers cannot change the settings');
reset role;

set role anon;
select pg_temp.check(pg_temp.fails($$select public.admin_users()$$), 'visitors cannot list accounts');
reset role;

-- A test project: every signed-in account is an admin, still only with the second step, and none is super.
update public.settings set every_account_is_admin = true;
set role authenticated;
select pg_temp.check(public.admin_access() = 'admin', 'test switch: a customer reaches the admin');
select pg_temp.check(public.is_admin() and not public.is_super_admin(), 'test switch: admin but not super');
select pg_temp.check(pg_temp.fails($$select public.set_admin('11111111-1111-1111-1111-111111111111', false)$$), 'test switch: cannot remove admins');
reset role;
set request.jwt.claims = '{"aal":"aal1"}';
set role authenticated;
select pg_temp.check(not public.is_admin(), 'test switch: still needs the second step');
reset role;
set request.jwt.claim.sub = '';
set request.jwt.claims = '';
set role anon;
select pg_temp.check(not public.is_admin(), 'test switch: visitors are not admins');
reset role;
update public.settings set every_account_is_admin = false;
