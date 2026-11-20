import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { requireAdmin } from "@/lib/supabase-server";
import { tab } from "../../styles";
import type { Order, OrderStatus } from "@/lib/types";
import { OrderCards } from "../_ui/order-cards";
import { OrderTime } from "../_ui/order-time";
import { StatusBadge } from "../_ui/status-badge";
import { STATUS_LABELS, STATUSES } from "./status";

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const active = STATUSES.includes(status as OrderStatus) ? (status as OrderStatus) : undefined;
  const supabase = await requireAdmin();

  let query = supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(200);
  if (active) query = query.eq("status", active);
  const { data } = await query;
  const orders = (data ?? []) as Order[];


  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight">შეკვეთები</h1>
      <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
        <Link href="/admin/orders" prefetch={false} className={tab(!active)}>
          ყველა
        </Link>
        {STATUSES.map((item) => (
          <Link key={item} href={`/admin/orders?status=${item}`} prefetch={false} className={tab(active === item)}>
            {STATUS_LABELS[item]}
          </Link>
        ))}
      </div>

      <div className="mt-4 sm:hidden">
        <OrderCards orders={orders} empty="ამ სტატუსით შეკვეთა არ არის." />
      </div>

      <div className="mt-4 hidden overflow-x-auto rounded-2xl sm:block border border-a-line bg-a-card shadow-[0_10px_30px_-18px_rgba(0,0,0,0.8)]">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr>
              <th className="px-4 py-3 font-medium">ნომერი</th>
              <th className="px-4 py-3 font-medium">შემოვიდა</th>
              <th className="px-4 py-3 font-medium">მომხმარებელი</th>
              <th className="px-4 py-3 font-medium">ტელეფონი</th>
              <th className="px-4 py-3 font-medium">ჯამი</th>
              <th className="px-4 py-3 font-medium">სტატუსი</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-a-line/60 last:border-0">
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${order.id}`} className="font-semibold text-[#ffaaa3] transition-colors hover:text-white">
                    #{order.id}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <OrderTime value={order.created_at} />
                </td>
                <td className="px-4 py-3">{order.customer_name}</td>
                <td className="px-4 py-3">{order.phone}</td>
                <td className="px-4 py-3 font-medium">{formatPrice(order.total)}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={order.status} />
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-a-soft">
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
