import Link from "next/link";
import { notFound } from "next/navigation";
import { formatPrice } from "@/lib/format";
import { requireAdmin } from "@/lib/supabase-server";
import type { Order, OrderItem } from "@/lib/types";
import { changeOrderStatus } from "../../../actions";
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

  return (
    <div className="max-w-2xl">
      <Link href="/admin/orders" className="text-sm underline">
        ყველა შეკვეთა
      </Link>
      <h1 className="mt-2 text-xl font-bold">შეკვეთა #{order.id}</h1>
      <p className="text-sm text-neutral-700">{formatDate(order.created_at)}</p>
      {error && <p role="alert" className="mt-3 rounded bg-red-100 p-2 text-sm text-red-800">{error}</p>}

      <section className="mt-4 rounded border border-neutral-200 bg-white p-4 text-sm leading-7">
        <p className="font-medium">{order.customer_name}</p>
        <a href={`tel:${order.phone}`} className="underline">
          {order.phone}
        </a>
        <p>
          {order.city}, {order.address}
        </p>
        {order.note && <p className="mt-2 whitespace-pre-line">შენიშვნა: {order.note}</p>}
      </section>

      <section className="mt-4 rounded border border-neutral-200 bg-white p-4 text-sm">
        <ul className="divide-y divide-neutral-100">
          {((items ?? []) as OrderItem[]).map((item) => (
            <li key={item.id} className="flex justify-between gap-4 py-2">
              <span>
                {item.product_name} × {item.qty}
              </span>
              <span className="font-medium">{formatPrice(item.price * item.qty)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-2 flex justify-between border-t border-black pt-2 font-bold">
          <span>ჯამი</span>
          <span>{formatPrice(order.total)}</span>
        </p>
      </section>

      {order.status === "cancelled" ? (
        <p className="mt-4 text-sm font-medium">შეკვეთა გაუქმებულია. პროდუქტები მარაგში დაბრუნდა.</p>
      ) : (
        <form action={changeOrderStatus} className="mt-4 flex items-center gap-2">
          <input type="hidden" name="id" value={order.id} />
          <select name="status" defaultValue={order.status} aria-label="სტატუსი" className="h-10 rounded border border-neutral-300 bg-white px-2 text-sm">
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>
          <button className="h-10 rounded bg-black px-4 text-sm text-white">სტატუსის შენახვა</button>
        </form>
      )}
    </div>
  );
}
