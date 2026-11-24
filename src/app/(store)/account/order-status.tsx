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

// One colour per step, warm to green as the order gets closer: red, orange, yellow, green.
const STEP_COLORS: Record<Exclude<OrderStatus, "cancelled">, string> = {
  new: "#ef4444",
  confirmed: "#f97316",
  shipped: "#eab308",
  delivered: "#22c55e",
};

const TONES: Record<OrderStatus, string> = {
  new: "border-red-400/40 bg-red-400/10 text-red-200",
  confirmed: "border-orange-400/40 bg-orange-400/10 text-orange-200",
  shipped: "border-yellow-400/40 bg-yellow-400/10 text-yellow-200",
  delivered: "border-emerald-400/40 bg-emerald-400/10 text-emerald-200",
  cancelled: "border-line bg-bg text-muted",
};

// The note under the steps, tinted like its step so a normal order never looks like an error.
export const HINT_TONES: Record<OrderStatus, string> = {
  new: "border-red-400/25 bg-red-400/5 text-fg",
  confirmed: "border-orange-400/25 bg-orange-400/5 text-fg",
  shipped: "border-yellow-400/25 bg-yellow-400/5 text-fg",
  delivered: "border-emerald-400/30 bg-emerald-400/10 text-fg",
  cancelled: "border-line bg-bg text-muted",
};

export function OrderStatusBadge({ order }: { order: CustomerOrder }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${TONES[order.status]}`}>
      {statusLabel(order)}
    </span>
  );
}

// The four steps, each reached step in its own colour, joined by lines that blend from one colour to the next.
// Compact: a thin bar for the orders list.
export function OrderProgress({ order, compact = false }: { order: CustomerOrder; compact?: boolean }) {
  if (order.status === "cancelled") return null;
  const current = FLOW.indexOf(order.status);
  // A delivered order is finished: every step, the last one too, shows as done.
  const finished = order.status === "delivered";
  const labels = LABELS[order.pickup ? "pickup" : "delivery"];

  if (compact) {
    return (
      <div aria-hidden className="grid grid-cols-4 gap-1">
        {FLOW.map((step, index) => (
          <span
            key={step}
            className={`h-1.5 rounded-full ${index <= current ? "" : "bg-line"}`}
            style={index <= current ? { background: `linear-gradient(to right, ${STEP_COLORS[FLOW[Math.max(index - 1, 0)]]}, ${STEP_COLORS[step]})` } : undefined}
          />
        ))}
      </div>
    );
  }

  return (
    <ol className="grid grid-cols-4">
      {FLOW.map((step, index) => {
        const done = index < current || (finished && index === current);
        const now = index === current && !finished;
        const reached = index <= current;
        const color = STEP_COLORS[step];
        return (
          <li key={step} aria-current={index === current ? "step" : undefined} className="relative flex flex-col items-center text-center">
            {index > 0 && (
              <span
                aria-hidden
                className={`absolute top-4 right-1/2 left-[-50%] h-0.5 ${reached ? "" : "bg-line"}`}
                style={reached ? { background: `linear-gradient(to right, ${STEP_COLORS[FLOW[index - 1]]}, ${color})` } : undefined}
              />
            )}
            <span
              className={`relative z-10 flex size-8 items-center justify-center rounded-full border-2 text-sm font-bold ${reached ? "" : "border-line bg-bg text-muted"}`}
              style={
                done
                  ? { borderColor: color, backgroundColor: color, color: "#fff" }
                  : now
                    ? { borderColor: color, backgroundColor: "var(--color-bg)", color, boxShadow: `0 0 18px -2px ${color}` }
                    : undefined
              }
            >
              {done ? <CheckIcon className="size-4" /> : index + 1}
            </span>
            <span
              className={`mt-2 text-[11px] leading-4 sm:text-sm ${index === current ? "font-bold" : reached ? "text-fg/90" : "text-muted"}`}
              style={index === current ? { color } : undefined}
            >
              {labels[step]}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
