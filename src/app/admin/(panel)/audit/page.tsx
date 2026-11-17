import Link from "next/link";
import { requireAdmin } from "@/lib/supabase-server";
import type { AuditEntry } from "@/lib/types";
import { formatDate } from "../orders/status";

const ENTITIES: Record<string, string> = {
  products: "პროდუქტი",
  categories: "კატეგორია",
  product_costs: "თვითღირებულება",
  purchases: "შესყიდვა",
  stock_adjustments: "მარაგის კორექცია",
  orders: "შეკვეთა",
  admins: "ადმინისტრატორი",
  promotions: "სლაიდი",
};

const ACTIONS: Record<AuditEntry["action"], string> = { insert: "დაემატა", update: "შეიცვალა", delete: "წაიშალა" };

const FIELDS: Record<string, string> = {
  name: "სახელი",
  price: "ფასი",
  sale_price: "ფასდაკლება",
  active: "ჩანს",
  status: "სტატუსი",
  avg_cost: "თვითღირებულება",
  last_cost: "ბოლო შესყიდვა",
  low_stock_at: "გაფრთხილების ზღვარი",
  category_id: "კატეგორია",
  description: "აღწერა",
  images: "ფოტოები",
  specs: "მახასიათებლები",
  compatibility: "თავსებადობა",
  position: "რიგი",
  title: "სათაური",
  badge: "ნიშანი",
  ends_at: "მთავრდება",
  cta_label: "ღილაკი",
};

function show(value: unknown) {
  if (value === null || value === undefined) return "-";
  if (typeof value === "string") return value.length > 60 ? `${value.slice(0, 60)}…` : value;
  if (Array.isArray(value)) return `${value.length} ც.`;
  return String(value);
}

function summary(entry: AuditEntry) {
  const details = entry.details as Record<string, unknown>;
  if (entry.action === "update") {
    return Object.entries(details)
      .map(([key, change]) => {
        const { from, to } = (change ?? {}) as { from?: unknown; to?: unknown };
        return `${FIELDS[key] ?? key}: ${show(from)} → ${show(to)}`;
      })
      .join("; ");
  }
  if (entry.entity === "purchases") return `${show(details.qty)} ცალი, ${show(details.unit_cost)} ₾/ცალი`;
  if (entry.entity === "stock_adjustments") return `${show(details.delta)} ცალი: ${show(details.reason)}`;
  return show(details.name ?? details.title ?? details.product_name ?? "");
}

function link(entry: AuditEntry) {
  const details = entry.details as Record<string, unknown>;
  const productId = ["products", "product_costs"].includes(entry.entity) ? entry.entity_id : (details.product_id as string | undefined);
  if (productId && entry.action !== "delete") return `/admin/products/${productId}`;
  if (entry.entity === "orders" && entry.entity_id) return `/admin/orders/${entry.entity_id}`;
  if (entry.entity === "promotions") return "/admin/promotions";
  return null;
}

export default async function AuditPage() {
  const supabase = await requireAdmin();
  const { data } = await supabase.from("audit_log").select("*").order("at", { ascending: false }).limit(300);
  const entries = (data ?? []) as AuditEntry[];

  return (
    <>
      <h1 className="text-xl font-bold">ცვლილებების ისტორია</h1>
      <p className="mt-1 text-sm text-neutral-700">ბოლო 300 ცვლილება: ვინ, როდის და რა შეცვალა. ჩანაწერის წაშლა ადმინიდან შეუძლებელია.</p>
      <div className="mt-4 overflow-x-auto rounded border border-neutral-200 bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-neutral-200 text-neutral-700">
            <tr>
              <th className="p-2 font-medium">დრო</th>
              <th className="p-2 font-medium">ვინ</th>
              <th className="p-2 font-medium">რა</th>
              <th className="p-2 font-medium">დეტალები</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => {
              const href = link(entry);
              return (
                <tr key={entry.id} className="border-b border-neutral-100 align-top">
                  <td className="p-2 whitespace-nowrap text-neutral-700">{formatDate(entry.at)}</td>
                  <td className="p-2">{entry.actor ? "ადმინი" : "სისტემა"}</td>
                  <td className="p-2 whitespace-nowrap">
                    {href ? (
                      <Link href={href} className="underline">
                        {ENTITIES[entry.entity] ?? entry.entity}
                      </Link>
                    ) : (
                      ENTITIES[entry.entity] ?? entry.entity
                    )}{" "}
                    {ACTIONS[entry.action]}
                  </td>
                  <td className="p-2">{summary(entry)}</td>
                </tr>
              );
            })}
            {entries.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-neutral-700">ჯერ ცვლილება არ ყოფილა.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
