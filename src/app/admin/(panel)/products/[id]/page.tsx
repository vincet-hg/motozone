import { notFound } from "next/navigation";
import { formatPrice } from "@/lib/format";
import { marginPercent } from "@/lib/margin";
import { requireAdmin } from "@/lib/supabase-server";
import type { Category, Product, ProductCost, Purchase, StockAdjustment } from "@/lib/types";
import { adjustStock, receiveStock, setLowStock, setProductCost } from "../../../actions";
import { formatDate } from "../../orders/status";
import { ProductForm } from "../product-form";

type Search = { saved?: string; warning?: string; error?: string };

const field = "mt-1 h-9 w-full rounded-lg border border-a-line bg-a-card px-2 text-sm";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function EditProductPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Search> }) {
  const [{ id }, notice] = await Promise.all([params, searchParams]);
  if (!UUID.test(id)) notFound();
  const supabase = await requireAdmin();
  const [{ data: product }, { data: categories }, { data: cost }, { data: purchases }, { data: adjustments }] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).maybeSingle(),
    supabase.from("categories").select("*").order("position"),
    supabase.from("product_costs").select("*").eq("product_id", id).maybeSingle(),
    supabase.from("purchases").select("*").eq("product_id", id).order("created_at", { ascending: false }).limit(50),
    supabase.from("stock_adjustments").select("*").eq("product_id", id).order("created_at", { ascending: false }).limit(50),
  ]);
  if (!product) notFound();

  const item = product as Product;
  const costs = (cost ?? { avg_cost: 0, last_cost: null, low_stock_at: 3 }) as ProductCost;
  const margin = marginPercent(item.final_price, Number(costs.avg_cost));
  const history = [
    ...((purchases ?? []) as Purchase[]).map((row) => ({
      at: row.created_at,
      change: `+${row.qty}`,
      text: `შესყიდვა ${formatPrice(row.unit_cost)}/ცალი${row.supplier ? `, ${row.supplier}` : ""}${row.note ? `. ${row.note}` : ""}`,
    })),
    ...((adjustments ?? []) as StockAdjustment[]).map((row) => ({
      at: row.created_at,
      change: row.delta > 0 ? `+${row.delta}` : String(row.delta),
      text: `კორექცია: ${row.reason}`,
    })),
  ].sort((a, b) => b.at.localeCompare(a.at));

  return (
    <>
      <h1 className="mb-5 text-2xl font-bold tracking-tight">პროდუქტის რედაქტირება</h1>
      <ProductForm product={item} categories={(categories ?? []) as Category[]} />

      <section id="stock" className="mt-6 max-w-3xl scroll-mt-4 space-y-4 rounded-2xl border border-a-line bg-a-card p-4 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.8)]">
        <h2 className="text-lg font-bold">მარაგი და თვითღირებულება</h2>
        {notice.saved && <p role="status" className="rounded-xl border border-a-green/30 bg-a-green/10 p-3 text-sm text-[#5fe0a0]">{notice.saved}</p>}
        {notice.warning && <p role="alert" className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-200">{notice.warning}</p>}
        {notice.error && <p role="alert" className="rounded-xl border border-a-red/30 bg-a-red/10 p-3 text-sm text-[#ff8a94]">{notice.error}</p>}

        <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <div className="rounded-lg bg-a-panel p-2">
            <dt className="text-a-soft">მარაგი</dt>
            <dd className={`text-lg font-bold ${item.stock <= costs.low_stock_at ? "text-[#ff6b77]" : ""}`}>{item.stock}</dd>
          </div>
          <div className="rounded-lg bg-a-panel p-2">
            <dt className="text-a-soft">საშუალო თვითღირებულება</dt>
            <dd className="text-lg font-bold">{Number(costs.avg_cost) > 0 ? formatPrice(Math.round(Number(costs.avg_cost) * 100) / 100) : "უცნობია"}</dd>
          </div>
          <div className="rounded-lg bg-a-panel p-2">
            <dt className="text-a-soft">ბოლო შესყიდვა</dt>
            <dd className="text-lg font-bold">{costs.last_cost !== null ? formatPrice(costs.last_cost) : "-"}</dd>
          </div>
          <div className="rounded-lg bg-a-panel p-2">
            <dt className="text-a-soft">მარჟა ({formatPrice(item.final_price)}-ზე)</dt>
            <dd className={`text-lg font-bold ${margin !== null && margin <= 0 ? "text-[#ff6b77]" : ""}`}>{margin === null ? "-" : `${margin}%`}</dd>
          </div>
        </dl>

        <form action={receiveStock} className="grid grid-cols-2 gap-3 rounded-xl border border-a-line bg-a-panel/60 p-3 sm:grid-cols-5">
          <input type="hidden" name="id" value={item.id} />
          <p className="col-span-2 font-medium sm:col-span-5">შესყიდვის დამატება (ახალი პარტია)</p>
          <label className="text-sm font-medium text-a-soft">
            რაოდენობა
            <input name="qty" type="number" min="1" step="1" required className={field} />
          </label>
          <label className="text-sm font-medium text-a-soft">
            ფასი ცალზე (₾)
            <input name="unit_cost" type="number" min="0" step="0.01" required className={field} />
          </label>
          <label className="text-sm font-medium text-a-soft">
            მომწოდებელი
            <input name="supplier" maxLength={120} className={field} />
          </label>
          <label className="text-sm font-medium text-a-soft">
            შენიშვნა
            <input name="note" maxLength={500} className={field} />
          </label>
          <div className="flex items-end">
            <button className="h-9 w-full rounded-xl bg-gradient-to-r from-a-purple to-a-violet shadow-[0_8px_24px_-10px_rgba(0,110,255,0.9)] transition-all duration-200 hover:-translate-y-px hover:shadow-[0_0_24px_-4px_rgba(56,189,248,0.55)] px-3 text-sm font-semibold text-white">დამატება</button>
          </div>
          <p className="col-span-2 text-xs text-a-muted sm:col-span-5">
            თვითღირებულება საშუალო შეწონილით ითვლება: 5 ცალი 10 ₾-ად და 5 ცალი 14 ₾-ად = 10 ცალი 12 ₾-ად. გაყიდვის ფასს შენ ცვლი ზემოთ.
          </p>
        </form>

        <div className="grid gap-3 sm:grid-cols-3">
          <form action={adjustStock} className="space-y-2 rounded-xl border border-a-line bg-a-panel/60 p-3 sm:col-span-2">
            <input type="hidden" name="id" value={item.id} />
            <p className="font-medium">მარაგის კორექცია</p>
            <div className="grid grid-cols-3 gap-2">
              <label className="text-sm font-medium text-a-soft">
                +/- ცალი
                <input name="delta" type="number" step="1" required placeholder="-1" className={field} />
              </label>
              <label className="col-span-2 text-sm">
                მიზეზი
                <input name="reason" required minLength={2} maxLength={300} placeholder="დაზიანდა, აღწერისას აღმოჩნდა..." className={field} />
              </label>
            </div>
            <button className="h-9 rounded-xl border border-a-line bg-a-hover/70 transition-colors duration-200 hover:border-a-violet/60 hover:bg-a-hover px-3 text-sm text-white">შესწორება</button>
          </form>
          <div className="space-y-3">
            <form action={setLowStock} className="rounded-xl border border-a-line bg-a-panel/60 p-3">
              <input type="hidden" name="id" value={item.id} />
              <label className="text-sm font-medium text-a-soft">
                გამაფრთხილე, როცა დარჩება
                <input name="low_stock_at" type="number" min="0" step="1" required defaultValue={costs.low_stock_at} className={field} />
              </label>
              <button className="mt-2 h-9 rounded-xl border border-a-line bg-a-hover/70 transition-colors duration-200 hover:border-a-violet/60 hover:bg-a-hover px-3 text-sm text-white">შენახვა</button>
            </form>
            <details className="rounded-xl border border-a-line bg-a-panel/60 p-3 text-sm">
              <summary className="cursor-pointer">თვითღირებულების ხელით მითითება</summary>
              <p className="mt-2 text-xs text-a-muted">მხოლოდ იმ მარაგისთვის, რომელიც შესყიდვების აღრიცხვამდე გქონდა.</p>
              <form action={setProductCost} className="mt-2">
                <input type="hidden" name="id" value={item.id} />
                <input name="avg_cost" type="number" min="0" step="0.01" required defaultValue={Number(costs.avg_cost) || ""} aria-label="თვითღირებულება" className={field} />
                <button className="mt-2 h-9 rounded-xl border border-a-line bg-a-hover/70 transition-colors duration-200 hover:border-a-violet/60 hover:bg-a-hover px-3 text-sm text-white">შენახვა</button>
              </form>
            </details>
          </div>
        </div>

        <div>
          <p className="font-medium">ისტორია</p>
          {history.length === 0 ? (
            <p className="mt-1 text-sm text-a-soft">ჯერ არაფერია ჩაწერილი.</p>
          ) : (
            <ul className="mt-1 divide-y divide-a-line/60 text-sm">
              {history.map((row, index) => (
                <li key={index} className="flex gap-3 py-1.5">
                  <span className="w-32 shrink-0 text-a-soft">{formatDate(row.at)}</span>
                  <span className={`w-12 shrink-0 font-bold ${row.change.startsWith("-") ? "text-[#ff6b77]" : "text-a-green"}`}>{row.change}</span>
                  <span>{row.text}</span>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-2 text-xs text-a-muted">გაყიდვები შეკვეთებში ჩანს. გაუქმებული შეკვეთის პროდუქტები მარაგში ავტომატურად ბრუნდება.</p>
        </div>
      </section>
    </>
  );
}
