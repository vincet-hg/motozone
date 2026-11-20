import { CheckIcon } from "@/components/icons";
import type { CustomerOrder } from "@/lib/account";
import { site } from "@/lib/site";
import type { OrderStatus } from "@/lib/types";

// How an order moves, in the customer's words. Pickup orders end at the pickup point instead of the door.
const FLOW: Exclude<OrderStatus, "cancelled">[] = ["new", "confirmed", "shipped", "delivered"];
const LABELS = {
  delivery: { new: "მიღებულია", confirmed: "დადასტურდა", shipped: "გზაშია", delivered: "მიტანილია" },
  pickup: { new: "მიღებულია", confirmed: "დადასტურდა", shipped: "მზადაა გასატანად", delivered: "გატანილია" },
} as const;

export function statusLabel(order: CustomerOrder) {
  return order.status === "cancelled" ? "გაუქმებულია" : LABELS[order.pickup ? "pickup" : "delivery"][order.status];
}

export function statusHint(order: CustomerOrder) {
  switch (order.status) {
    case "new":
      return `შეკვეთა მივიღეთ. დასადასტურებლად დაგირეკავთ ${order.phone}-ზე (${site.hours}).`;
    case "confirmed":
      return order.pickup ? "შეკვეთა მზადდება. როცა მზად იქნება, აქ გამოჩნდება." : "შეკვეთა მზადდება და მალე გადაეცემა კურიერს.";
    case "shipped":
      return order.pickup
        ? `შეგიძლია გაიტანო: ${site.pickup.address} (${site.pickup.landmark}), ${site.pickup.hours}.`
        : "კურიერი გზაშია და მისვლამდე დაგირეკავს. გადახდა მიღებისას.";
    case "delivered":
      return "შეკვეთა დასრულებულია. მადლობა, რომ ჩვენგან იყიდე!";
    case "cancelled":
      return "შეკვეთა გაუქმებულია. თუ შეცდომაა, დაგვირეკე.";
  }
}

const TONES: Record<OrderStatus, string> = {
  new: "border-amber-400/40 bg-amber-400/10 text-amber-200",
  confirmed: "border-sky-400/40 bg-sky-400/10 text-sky-200",
  shipped: "border-neon/50 bg-accent/15 text-white",
  delivered: "border-emerald-400/40 bg-emerald-400/10 text-emerald-200",
  cancelled: "border-line bg-bg text-muted",
};

export function StatusBadge({ order }: { order: CustomerOrder }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${TONES[order.status]}`}>
      {statusLabel(order)}
    </span>
  );
}

// The four steps with the current one lit. Compact: a thin bar for the orders list.
export function OrderProgress({ order, compact = false }: { order: CustomerOrder; compact?: boolean }) {
  if (order.status === "cancelled") return null;
  const current = FLOW.indexOf(order.status);
  const labels = LABELS[order.pickup ? "pickup" : "delivery"];

  if (compact) {
    return (
      <div aria-hidden className="grid grid-cols-4 gap-1">
        {FLOW.map((step, index) => (
          <span key={step} className={`h-1.5 rounded-full ${index <= current ? "bg-gradient-to-r from-accent to-neon" : "bg-line"}`} />
        ))}
      </div>
    );
  }

  return (
    <ol className="grid grid-cols-4">
      {FLOW.map((step, index) => {
        const done = index < current;
        const now = index === current;
        return (
          <li key={step} aria-current={now ? "step" : undefined} className="relative flex flex-col items-center text-center">
            {index > 0 && (
              <span aria-hidden className={`absolute top-4 right-1/2 left-[-50%] h-0.5 ${index <= current ? "bg-neon" : "bg-line"}`} />
            )}
            <span
              className={`relative z-10 flex size-8 items-center justify-center rounded-full border-2 text-sm font-bold ${
                done
                  ? "border-neon bg-accent text-white"
                  : now
                    ? "border-neon bg-bg text-neon shadow-[0_0_18px_-2px_rgba(255,81,72,0.9)]"
                    : "border-line bg-bg text-muted"
              }`}
            >
              {done ? <CheckIcon className="size-4" /> : index + 1}
            </span>
            <span className={`mt-2 text-[11px] leading-4 sm:text-sm ${now ? "font-bold text-white" : done ? "text-fg/90" : "text-muted"}`}>{labels[step]}</span>
          </li>
        );
      })}
    </ol>
  );
}
