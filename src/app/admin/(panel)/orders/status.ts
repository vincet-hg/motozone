import type { OrderStatus } from "@/lib/types";

export const STATUS_LABELS: Record<OrderStatus, string> = {
  new: "ახალი",
  confirmed: "დადასტურებული",
  shipped: "გაგზავნილი",
  delivered: "მიტანილი",
  cancelled: "გაუქმებული",
};

export const STATUSES = Object.keys(STATUS_LABELS) as OrderStatus[];

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("ka-GE", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Asia/Tbilisi",
  }).format(new Date(value));
}
