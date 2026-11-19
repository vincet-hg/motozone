import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { requireAdmin } from "@/lib/supabase-server";
import { tab } from "../../styles";
import type { MonthReport, Product, ProductCost, TopProduct } from "@/lib/types";

type Search = { range?: string; from?: string; to?: string };

const RANGES = [
  { key: "month", label: "ეს თვე" },
  { key: "3m", label: "3 თვე" },
  { key: "12m", label: "12 თვე" },
] as const;

const DAY = /^\d{4}-\d{2}-\d{2}$/;
const MONTHS = ["იანვარი", "თებერვალი", "მარტი", "აპრილი", "მაისი", "ივნისი", "ივლისი", "აგვისტო", "სექტემბერი", "ოქტომბერი", "ნოემბერი", "დეკემბერი"];

// Today's date in Tbilisi (UTC+4, no daylight saving).
function today() {
  return new Date(Date.now() + 4 * 3600000).toISOString().slice(0, 10);
}

function startOfMonth(day: string, monthsBack: number) {
  const date = new Date(`${day.slice(0, 7)}-01T00:00:00Z`);
  date.setUTCMonth(date.getUTCMonth() - monthsBack);
  return date.toISOString().slice(0, 10);
}

function period(search: Search) {
  const end = today();
  if (search.from && search.to && DAY.test(search.from) && DAY.test(search.to) && search.from <= search.to) {
    return { from: search.from, to: search.to, key: "custom" };
  }
  if (search.range === "3m") return { from: startOfMonth(end, 2), to: end, key: "3m" };
  if (search.range === "12m") return { from: startOfMonth(end, 11), to: end, key: "12m" };
  return { from: startOfMonth(end, 0), to: end, key: "month" };
}

const money = (value: number) => formatPrice(Math.round(Number(value) * 100) / 100);
const percent = (profit: number, revenue: number) => (revenue > 0 ? `${Math.round((profit / revenue) * 1000) / 10}%` : "-");

export default async function ReportsPage({ searchParams }: { searchParams: Promise<Search> }) {
  const range = period(await searchParams);
  const supabase = await requireAdmin();
  const [{ data: monthRows }, { data: topRows }, { data: products }, { data: costRows }, { count: newOrders }] = await Promise.all([
    supabase.rpc("sales_report", { p_from: range.from, p_to: range.to }),
    supabase.rpc("top_products", { p_from: range.from, p_to: range.to, p_limit: 10 }),
    supabase.from("products").select("*").eq("active", true).limit(1000),
    supabase.from("product_costs").select("*"),
    supabase.from("orders").select("id", { count: "exact" }).eq("status", "new").limit(1),
  ]);

  const months = (monthRows ?? []) as MonthReport[];
  const top = (topRows ?? []) as TopProduct[];
  const totals = months.reduce(
    (sum, row) => ({
      orders: sum.orders + Number(row.orders),
      revenue: sum.revenue + Number(row.revenue),
      cost: sum.cost + Number(row.cost),
      profit: sum.profit + Number(row.profit),
    }),
    { orders: 0, revenue: 0, cost: 0, profit: 0 },
  );
  const costs = new Map(((costRows ?? []) as ProductCost[]).map((row) => [row.product_id, row]));
  const low = ((products ?? []) as Product[])
    .filter((product) => product.stock <= (costs.get(product.id)?.low_stock_at ?? 3))
    .sort((a, b) => a.stock - b.stock);
  const unknownCost = ((products ?? []) as Product[]).filter((product) => !(Number(costs.get(product.id)?.avg_cost) > 0)).length;


  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight">ანგარიშები</h1>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {RANGES.map((item) => (
          <Link key={item.key} href={`/admin/reports?range=${item.key}`} prefetch={false} className={tab(range.key === item.key)}>
            {item.label}
          </Link>
        ))}
        <form className="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-2 text-sm sm:flex sm:w-auto">
          <input type="date" name="from" defaultValue={range.from} aria-label="დან" className="h-9 min-w-0 rounded-xl border px-3" />
          <span className="text-a-muted">-</span>
          <input type="date" name="to" defaultValue={range.to} aria-label="მდე" className="h-9 min-w-0 rounded-xl border px-3" />
          <button className={`${tab(range.key === "custom")} col-span-3`}>ჩვენება</button>
        </form>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["შეკვეთები", String(totals.orders)],
          ["შემოსავალი", money(totals.revenue)],
          ["თვითღირებულება", money(totals.cost)],
          ["მოგება", `${money(totals.profit)} (${percent(totals.profit, totals.revenue)})`],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-a-line bg-a-card p-4 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.8)] sm:p-5">
            <dt className="text-sm text-a-soft">{label}</dt>
            <dd className="mt-2 text-xl font-bold tracking-tight sm:text-2xl">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-2 text-xs text-a-muted">
        გაუქმებული შეკვეთები არ ითვლება. ახალი, დადასტურებული და გაგზავნილი შეკვეთებიც ითვლება.
        {unknownCost > 0 && ` ${unknownCost} პროდუქტს თვითღირებულება არ აქვს მითითებული, ამიტომ მათზე მოგება გაზრდილად ჩანს.`}
      </p>
      {Number(newOrders) > 0 && (
        <p className="mt-3 rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-200">
          <Link href="/admin/orders?status=new" className="underline">{newOrders} ახალი შეკვეთა</Link> ელოდება დადასტურებას.
        </p>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="min-w-0">
          <h2 className="font-semibold text-a-text">თვეების მიხედვით</h2>
          <div className="mt-2 overflow-x-auto rounded-2xl border border-a-line bg-a-card shadow-[0_10px_30px_-18px_rgba(0,0,0,0.8)]">
            <table className="w-full text-left text-sm">
              <thead>
                <tr>
                  <th className="px-4 py-3 font-medium">თვე</th>
                  <th className="px-4 py-3 font-medium">შეკვ.</th>
                  <th className="px-4 py-3 font-medium">შემოსავალი</th>
                  <th className="px-4 py-3 font-medium">მოგება</th>
                  <th className="px-4 py-3 font-medium">მარჟა</th>
                </tr>
              </thead>
              <tbody>
                {months.map((row) => (
                  <tr key={row.month} className="border-b border-a-line/60">
                    <td className="px-4 py-3">{MONTHS[Number(row.month.slice(5, 7)) - 1]} {row.month.slice(0, 4)}</td>
                    <td className="px-4 py-3">{row.orders}</td>
                    <td className="px-4 py-3">{money(row.revenue)}</td>
                    <td className="px-4 py-3 font-medium">{money(row.profit)}</td>
                    <td className="px-4 py-3">{percent(Number(row.profit), Number(row.revenue))}</td>
                  </tr>
                ))}
                {months.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-a-soft">ამ პერიოდში გაყიდვა არ ყოფილა.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="min-w-0">
          <h2 className="font-semibold text-a-text">ყველაზე მომგებიანი პროდუქტები</h2>
          <div className="mt-2 overflow-x-auto rounded-2xl border border-a-line bg-a-card shadow-[0_10px_30px_-18px_rgba(0,0,0,0.8)]">
            <table className="w-full text-left text-sm">
              <thead>
                <tr>
                  <th className="px-4 py-3 font-medium">პროდუქტი</th>
                  <th className="px-4 py-3 font-medium">ცალი</th>
                  <th className="px-4 py-3 font-medium">შემოსავალი</th>
                  <th className="px-4 py-3 font-medium">მოგება</th>
                </tr>
              </thead>
              <tbody>
                {top.map((row) => (
                  <tr key={row.product_name} className="border-b border-a-line/60">
                    <td className="px-4 py-3">{row.product_name}</td>
                    <td className="px-4 py-3">{row.units}</td>
                    <td className="px-4 py-3">{money(row.revenue)}</td>
                    <td className="px-4 py-3 font-medium">{money(row.profit)}</td>
                  </tr>
                ))}
                {top.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-a-soft">ჯერ მონაცემი არ არის.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <section className="mt-6">
        <h2 className="font-semibold text-a-text">მარაგი იწურება ({low.length})</h2>
        {low.length === 0 ? (
          <p className="mt-1 text-sm text-a-soft">ყველა პროდუქტის მარაგი საკმარისია.</p>
        ) : (
          <ul className="mt-2 divide-y divide-a-line/60 rounded-2xl border border-a-line bg-a-card text-sm shadow-[0_10px_30px_-18px_rgba(0,0,0,0.8)]">
            {low.map((product) => (
              <li key={product.id} className="flex justify-between gap-4 px-4 py-3">
                <Link href={`/admin/products/${product.id}#stock`} className="underline">{product.name}</Link>
                <span className={product.stock === 0 ? "font-semibold text-[#ff6b77]" : "font-medium text-amber-200"}>
                  {product.stock === 0 ? "ამოიწურა" : `დარჩა ${product.stock}`}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
