import Link from "next/link";
import { notFound } from "next/navigation";
import { formatPrice, orderDelivery } from "@/lib/format";
import { requireAdmin } from "@/lib/supabase-server";
import type { Order, OrderItem } from "@/lib/types";
import { changeOrderStatus } from "../../../actions";
import { AdminOrderStatusBadge } from "../../_ui/order-status-badge";
import { formatDate, STATUS_LABELS, STATUSES } from "../status";

export default async function AdminOrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const [{ id }, { error }] = await Promise.all([params, searchParams]);
  if (!/^\d+$/.test(id)) notFound();

  const supabase = await requireAdmin();
  const [{ data: order }, { data: items }] = await Promise.all([
    supabase.from("orders").select("*").eq("id", id).maybeSingle<Order>(),
    supabase.from("order_items").select("*").eq("order_id", id).order("id"),
  ]);
  if (!order) notFound();
  const delivery = orderDelivery(order);

  return (
    <div className="max-w-2xl">
      <Link href="/admin/orders" className="text-sm text-a-soft transition-colors hover:text-[#ffaaa3]">
        ← ყველა შეკვეთა
      </Link>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight">შეკვეთა #{order.id}</h1>
        <AdminOrderStatusBadge status={order.status} />
      </div>
      <p className="text-sm text-a-soft">{formatDate(order.created_at)}</p>
      {error && <p role="alert" className="mt-3 rounded-xl border border-a-red/30 bg-a-red/10 p-3 text-sm text-[#ff8a94]">{error}</p>}

      <section className="mt-4 rounded-2xl border border-a-line bg-a-card p-4 text-sm leading-7 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.8)]">
        <p className="text-xs font-semibold tracking-wider text-a-muted uppercase">მომხმარებელი</p>
        <p className="mt-1 text-base font-semibold">{order.customer_name}</p>
        <a href={`tel:${order.phone}`} className="underline">
          {order.phone}
        </a>
        <p>
          {order.city}, {order.address}
        </p>
        {delivery.note && <p className="mt-2 whitespace-pre-line">შენიშვნა: {delivery.note}</p>}
      </section>

      <section className="mt-4 rounded-2xl border border-a-line bg-a-card p-4 text-sm shadow-[0_10px_30px_-18px_rgba(0,0,0,0.8)]">
        <p className="text-xs font-semibold tracking-wider text-a-muted uppercase">პროდუქტები</p>
        <ul className="mt-1 divide-y divide-a-line/60">
          {((items ?? []) as OrderItem[]).map((item) => (
            <li key={item.id} className="flex justify-between gap-4 py-2">
              <span>
                {item.product_name} × {item.qty}
              </span>
              <span className="font-medium">{formatPrice(item.price * item.qty)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-2 flex justify-between border-t border-a-line pt-3">
          <span>პროდუქტები</span>
          <span className="font-medium">{formatPrice(order.total)}</span>
        </p>
        <p className="mt-1 flex justify-between">
          <span>მიტანა</span>
          <span className="font-medium">{delivery.fee ? formatPrice(delivery.fee) : order.address.startsWith("გატანა:") ? "გატანა, უფასო" : formatPrice(0)}</span>
        </p>
        <p className="mt-2 flex justify-between border-t border-a-line pt-3 text-base font-bold">
          <span>მყიდველი იხდის</span>
          <span className="text-[#ffaaa3]">{formatPrice(delivery.toPay)}</span>
        </p>
        {(() => {
          const lines = (items ?? []) as OrderItem[];
          const cost = lines.reduce((sum, item) => sum + Number(item.unit_cost) * item.qty, 0);
          const known = lines.every((item) => Number(item.unit_cost) > 0);
          return (
            <p className="mt-1 flex justify-between text-a-soft">
              <span>თვითღირებულება / მოგება (მიტანის ჩათვლით)</span>
              <span>
                {known ? `${formatPrice(Math.round(cost * 100) / 100)} / ${formatPrice(Math.round((delivery.toPay - cost) * 100) / 100)}` : "თვითღირებულება უცნობია"}
              </span>
            </p>
          );
        })()}
      </section>

      {order.status === "cancelled" ? (
        <p className="mt-4 text-sm font-medium">შეკვეთა გაუქმებულია. პროდუქტები მარაგში დაბრუნდა.</p>
      ) : (
        <form action={changeOrderStatus} className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl border border-a-line bg-a-card p-4">
          <input type="hidden" name="id" value={order.id} />
          <select name="status" defaultValue={order.status} aria-label="სტატუსი" className="h-10 rounded-xl border px-3 text-sm">
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>
          <button className="h-10 rounded-xl bg-gradient-to-r from-a-purple to-a-violet shadow-[0_8px_24px_-10px_rgba(227,18,11,0.9)] transition-all duration-200 hover:-translate-y-px hover:shadow-[0_0_24px_-4px_rgba(255,81,72,0.55)] px-4 text-sm font-semibold text-white">სტატუსის შენახვა</button>
        </form>
      )}
    </div>
  );
}
