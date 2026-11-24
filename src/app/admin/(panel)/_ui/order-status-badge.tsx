import type { OrderStatus } from "@/lib/types";
import { STATUS_LABELS } from "../orders/status";

// New = amber (needs attention), in progress = blue, delivered = green, cancelled = red.
const TONES: Record<OrderStatus, string> = {
  new: "border-amber-400/40 bg-amber-400/15 text-amber-200",
  confirmed: "border-a-blue/40 bg-a-blue/15 text-[#93c5fd]",
  shipped: "border-a-blue/40 bg-a-blue/15 text-[#93c5fd]",
  delivered: "border-a-green/40 bg-a-green/15 text-[#5fe0a0]",
  cancelled: "border-a-red/40 bg-a-red/15 text-[#ff8a94]",
};

export function AdminOrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${TONES[status]}`}>
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      {STATUS_LABELS[status]}
    </span>
  );
}
