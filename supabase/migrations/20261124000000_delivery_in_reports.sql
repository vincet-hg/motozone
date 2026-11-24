-- The courier fee stays with the shop, so reports count it as revenue and profit.
-- It is not part of orders.total: checkout writes it at the start of the note, as "[მიტანა +7 ₾] ...".
-- Each order's lines are summed first, so the fee is counted once per order, not once per product.
create or replace function public.sales_report(p_from date, p_to date)
returns table (month date, orders bigint, units bigint, revenue numeric, cost numeric, profit numeric)
language plpgsql stable security definer set search_path = ''
as $$
#variable_conflict use_column
begin
  if not public.is_admin() then
    raise exception 'not_admin';
  end if;
  return query
  with sold as (
    select
      date_trunc('month', o.created_at at time zone 'Asia/Tbilisi')::date as month,
      sum(i.qty) as units,
      sum(i.price * i.qty) as goods,
      sum(i.unit_cost * i.qty) as cost,
      coalesce(substring(o.note from '^\[მიტანა \+([0-9]+(?:\.[0-9]+)?) ₾\]')::numeric, 0) as delivery
    from public.orders o
    join public.order_items i on i.order_id = o.id
    where o.status <> 'cancelled'
      and o.created_at >= (p_from::timestamp at time zone 'Asia/Tbilisi')
      and o.created_at < ((p_to + 1)::timestamp at time zone 'Asia/Tbilisi')
    group by o.id
  )
  select
    s.month,
    count(*),
    sum(s.units)::bigint,
    round(sum(s.goods + s.delivery), 2),
    round(sum(s.cost), 2),
    round(sum(s.goods + s.delivery - s.cost), 2)
  from sold s
  group by 1
  order by 1 desc;
end;
$$;
