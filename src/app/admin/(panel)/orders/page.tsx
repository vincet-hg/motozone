import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { requireAdmin } from "@/lib/supabase-server";
import type { Order, OrderStatus } from "@/lib/types";
import { formatDate, STATUS_LABELS, STATUSES } from "./status";

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const active = STATUSES.includes(status as OrderStatus) ? (status as OrderStatus) : undefined;
  const supabase = await requireAdmin();

  let query = supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(200);
  if (active) query = query.eq("status", active);
  const { data } = await query;
  const orders = (data ?? []) as Order[];

  const tab = (selected: boolean) =>
    `rounded-full border px-3 py-1 text-sm ${selected ? "border-black bg-black text-white" : "border-neutral-300 bg-white"}`;

  return (
    <>
      <h1 className="text-xl font-bold">შეკვეთები</h1>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link href="/admin/orders" prefetch={false} className={tab(!active)}>
          ყველა
        </Link>
        {STATUSES.map((item) => (
          <Link key={item} href={`/admin/orders?status=${item}`} prefetch={false} className={tab(active === item)}>
            {STATUS_LABELS[item]}
          </Link>
        ))}
      </div>

      <div className="mt-4 overflow-x-auto rounded border border-neutral-200 bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-neutral-200 text-neutral-700">
            <tr>
              <th className="p-3 font-medium">ნომერი</th>
              <th className="p-3 font-medium">თარიღი</th>
              <th className="p-3 font-medium">მომხმარებელი</th>
              <th className="p-3 font-medium">ტელეფონი</th>
              <th className="p-3 font-medium">ჯამი</th>
              <th className="p-3 font-medium">სტატუსი</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-neutral-100">
                <td className="p-3">
                  <Link href={`/admin/orders/${order.id}`} className="font-medium underline">
                    #{order.id}
                  </Link>
                </td>
                <td className="p-3">{formatDate(order.created_at)}</td>
                <td className="p-3">{order.customer_name}</td>
                <td className="p-3">{order.phone}</td>
                <td className="p-3">{formatPrice(order.total)}</td>
                <td className="p-3">{STATUS_LABELS[order.status]}</td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-neutral-700">
                  ამ სტატუსით შეკვეთა არ არის.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
