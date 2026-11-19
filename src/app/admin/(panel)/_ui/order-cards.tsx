import Link from "next/link";
import { formatPrice } from "@/lib/format";
import type { Order } from "@/lib/types";
import { formatDate } from "../orders/status";
import { StatusBadge } from "./status-badge";

// Phone layout for an order list: one tappable card per order instead of a wide table.
export function OrderCards({ orders, empty }: { orders: Order[]; empty: string }) {
  if (orders.length === 0) return <p className="rounded-2xl border border-a-line bg-a-card p-6 text-center text-sm text-a-soft">{empty}</p>;
  return (
    <ul className="space-y-2.5">
      {orders.map((order) => (
        <li key={order.id}>
          <Link
            href={`/admin/orders/${order.id}`}
            prefetch={false}
            className="block rounded-2xl border border-a-line bg-a-card p-4 transition-colors active:bg-a-hover hover:border-a-violet/50"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="font-semibold text-[#7dd3fc]">#{order.id}</span>
              <StatusBadge status={order.status} />
            </div>
            <div className="mt-2 flex items-end justify-between gap-3">
              <div className="min-w-0 text-sm">
                <p className="truncate font-medium text-a-text">{order.customer_name}</p>
                <p className="mt-0.5 text-xs text-a-muted">{formatDate(order.created_at)}</p>
              </div>
              <span className="shrink-0 text-base font-bold">{formatPrice(order.total)}</span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
