-- The store's server (service role) reads and writes a customer's own data: saved details, wishlist,
-- their orders. In this project new tables get no automatic grants, not even for the service role,
-- so without these the account pages fail with "permission denied" on a real database.
-- The server always filters by the customer id from the verified session (see src/lib/account.ts).

grant select on public.orders, public.order_items, public.products to service_role;
grant select, insert, update on public.profiles to service_role;
grant select, insert, delete on public.wishlist_items to service_role;
