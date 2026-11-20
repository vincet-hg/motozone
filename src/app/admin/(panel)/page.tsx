import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { requireAdmin } from "@/lib/supabase-server";
import type { MonthReport, Order, Product, ProductCost } from "@/lib/types";
import { card, pageTitle, primaryButton, sectionTitle, tableWrap } from "../styles";
import { LineChart } from "./_ui/line-chart";
import { Icons } from "./_ui/icons";
import { OrderCards } from "./_ui/order-cards";
import { StatusBadge } from "./_ui/status-badge";
import { formatDate } from "./orders/status";

const MONTHS = ["იან", "თებ", "მარ", "აპრ", "მაი", "ივნ", "ივლ", "აგვ", "სექ", "ოქტ", "ნოე", "დეკ"];
const money = (value: number) => formatPrice(Math.round(Number(value) * 100) / 100);

// The last six calendar months in Tbilisi time, oldest first, as YYYY-MM.
function lastMonths(count: number) {
  const now = new Date(Date.now() + 4 * 3600000);
  return Array.from({ length: count }, (_, i) => {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (count - 1 - i), 1));
    return date.toISOString().slice(0, 7);
  });
}

export default async function AdminOverviewPage() {
  const supabase = await requireAdmin();
  const months = lastMonths(6);
  const today = new Date(Date.now() + 4 * 3600000).toISOString().slice(0, 10);

  const [{ data: monthRows }, { data: recent }, { count: newCount }, { data: products }, { data: costRows }] = await Promise.all([
    supabase.rpc("sales_report", { p_from: `${months[0]}-01`, p_to: today }),
    supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(6),
    supabase.from("orders").select("id", { count: "exact" }).eq("status", "new").limit(1),
    supabase.from("products").select("*").eq("active", true).limit(1000),
    supabase.from("product_costs").select("*"),
  ]);

  const byMonth = new Map(((monthRows ?? []) as MonthReport[]).map((row) => [row.month.slice(0, 7), row]));
  const series = months.map((month) => ({ month, row: byMonth.get(month) }));
  const current = series.at(-1)?.row;
  const previous = series.at(-2)?.row;
  const revenue = Number(current?.revenue ?? 0);
  const profit = Number(current?.profit ?? 0);
  const orders = Number(current?.orders ?? 0);
  const change = (now: number, before: number) => (before > 0 ? Math.round(((now - before) / before) * 100) : null);

  const costs = new Map(((costRows ?? []) as ProductCost[]).map((row) => [row.product_id, row]));
  const low = ((products ?? []) as Product[])
    .filter((product) => product.stock <= (costs.get(product.id)?.low_stock_at ?? 3))
    .sort((a, b) => a.stock - b.stock);

  const stats = [
    { label: "შემოსავალი ამ თვეში", value: money(revenue), delta: change(revenue, Number(previous?.revenue ?? 0)), icon: Icons.wallet, tone: "from-a-purple/30 text-[#ffaaa3]" },
    { label: "მოგება ამ თვეში", value: money(profit), delta: change(profit, Number(previous?.profit ?? 0)), icon: Icons.trend, tone: "from-a-green/25 text-[#5fe0a0]" },
    { label: "შეკვეთები ამ თვეში", value: String(orders), delta: change(orders, Number(previous?.orders ?? 0)), icon: Icons.orders, tone: "from-a-blue/25 text-[#7cbcff]" },
    { label: "მარაგი იწურება", value: String(low.length), delta: null, icon: Icons.alert, tone: "from-a-red/25 text-[#ff8a94]" },
  ];

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className={pageTitle}>მიმოხილვა</h1>
          <p className="mt-1 text-sm text-a-muted">მაღაზიის მდგომარეობა ერთ გვერდზე</p>
        </div>
        <Link href="/admin/products/new" prefetch={false} className={`${primaryButton} h-10 px-4 text-sm`}>
          <Icons.plus className="size-4" />
          პროდუქტის დამატება
        </Link>
      </div>

      {Number(newCount) > 0 && (
        <Link
          href="/admin/orders?status=new"
          prefetch={false}
          className="mt-5 flex items-center gap-3 rounded-2xl border border-a-violet/40 bg-gradient-to-r from-a-purple/25 to-transparent p-4 text-sm transition-colors hover:border-a-violet"
        >
          <span className="flex size-9 items-center justify-center rounded-xl bg-a-violet/25 text-[#ffaaa3]">
            <Icons.bell className="size-5" />
          </span>
          <span>
            <b className="text-white">{newCount} ახალი შეკვეთა</b> <span className="text-a-soft">ელოდება დადასტურებას</span>
          </span>
          <span className="ml-auto font-semibold whitespace-nowrap text-[#ffaaa3]">ნახვა →</span>
        </Link>
      )}

      <dl className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {stats.map(({ label, value, delta, icon: Icon, tone }) => (
          <div key={label} className={`${card} group relative overflow-hidden p-4 transition-colors duration-200 hover:bg-a-hover/40 sm:p-5`}>
            <div className="flex items-start justify-between gap-3">
              <dt className="text-xs font-medium text-a-soft sm:text-sm">{label}</dt>
              <span className={`hidden size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br to-transparent min-[400px]:flex sm:size-10 ${tone}`}>
                <Icon className="size-5" />
              </span>
            </div>
            <dd className="mt-3 text-xl font-bold tracking-tight text-a-text sm:text-2xl">{value}</dd>
            {delta !== null && (
              <p className={`mt-1 text-xs font-semibold ${delta >= 0 ? "text-[#5fe0a0]" : "text-[#ff8a94]"}`}>
                {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)}% <span className="font-normal text-a-muted">წინა თვესთან</span>
              </p>
            )}
          </div>
        ))}
      </dl>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <section className={`${card} min-w-0 p-4 sm:p-6`}>
          <div className="flex items-center justify-between gap-3">
            <h2 className={sectionTitle}>შემოსავალი, 6 თვე</h2>
            <Link href="/admin/reports" prefetch={false} className="shrink-0 text-sm font-medium whitespace-nowrap text-[#ffaaa3] hover:text-white">
              ანგარიშები →
            </Link>
          </div>
          <div className="mt-4">
            <LineChart
              points={series.map(({ month, row }) => ({ label: MONTHS[Number(month.slice(5, 7)) - 1], value: Number(row?.revenue ?? 0) }))}
              format={(value) => `${Math.round(value)} ₾`}
            />
          </div>
        </section>

        <section className={`${card} min-w-0 p-4 sm:p-6`}>
          <div className="flex items-center justify-between gap-3">
            <h2 className={sectionTitle}>მარაგი იწურება</h2>
            <Link href="/admin/products?low=1" prefetch={false} className="shrink-0 text-sm font-medium whitespace-nowrap text-[#ffaaa3] hover:text-white">
              ყველა →
            </Link>
          </div>
          {low.length === 0 ? (
            <p className="mt-6 text-sm text-a-soft">ყველა პროდუქტის მარაგი საკმარისია.</p>
          ) : (
            <ul className="mt-3 divide-y divide-a-line/60">
              {low.slice(0, 6).map((product) => (
                <li key={product.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <Link href={`/admin/products/${product.id}#stock`} prefetch={false} className="min-w-0 truncate text-a-text hover:text-[#ffaaa3]">
                    {product.name}
                  </Link>
                  <span
                    className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                      product.stock === 0 ? "border-a-red/40 bg-a-red/15 text-[#ff8a94]" : "border-amber-400/30 bg-amber-400/10 text-amber-200"
                    }`}
                  >
                    {product.stock === 0 ? "ამოიწურა" : `დარჩა ${product.stock}`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="mt-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className={sectionTitle}>ბოლო შეკვეთები</h2>
          <Link href="/admin/orders" prefetch={false} className="shrink-0 text-sm font-medium whitespace-nowrap text-[#ffaaa3] hover:text-white">
            ყველა შეკვეთა →
          </Link>
        </div>
        <div className="mt-3 sm:hidden">
          <OrderCards orders={(recent ?? []) as Order[]} empty="შეკვეთა ჯერ არ არის." />
        </div>
        <div className={`${tableWrap} mt-3 hidden sm:block`}>
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr>
                <th className="px-4 py-3 font-medium">ნომერი</th>
                <th className="px-4 py-3 font-medium">თარიღი</th>
                <th className="px-4 py-3 font-medium">მომხმარებელი</th>
                <th className="px-4 py-3 font-medium">ჯამი</th>
                <th className="px-4 py-3 font-medium">სტატუსი</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-a-line/60">
              {((recent ?? []) as Order[]).map((order) => (
                <tr key={order.id}>
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${order.id}`} prefetch={false} className="font-semibold text-[#ffaaa3] hover:text-white">
                      #{order.id}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-a-soft">{formatDate(order.created_at)}</td>
                  <td className="px-4 py-3">{order.customer_name}</td>
                  <td className="px-4 py-3 font-medium">{formatPrice(order.total)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={order.status} />
                  </td>
                </tr>
              ))}
              {(recent ?? []).length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-a-soft">
                    შეკვეთა ჯერ არ არის.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
