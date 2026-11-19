import type { OrderStatus } from "@/lib/types";
import { STATUS_LABELS } from "../orders/status";

// New = purple, in progress = blue, delivered = green, cancelled = red.
const TONES: Record<OrderStatus, string> = {
  new: "border-a-violet/40 bg-a-violet/15 text-[#c4b0ff]",
  confirmed: "border-a-blue/40 bg-a-blue/15 text-[#7cbcff]",
  shipped: "border-a-blue/40 bg-a-blue/15 text-[#7cbcff]",
  delivered: "border-a-green/40 bg-a-green/15 text-[#5fe0a0]",
  cancelled: "border-a-red/40 bg-a-red/15 text-[#ff8a94]",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${TONES[status]}`}>
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      {STATUS_LABELS[status]}
    </span>
  );
}
