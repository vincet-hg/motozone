import { notFound } from "next/navigation";
import { formatPrice } from "@/lib/format";
import { marginPercent } from "@/lib/margin";
import { requireAdmin } from "@/lib/supabase-server";
import type { Category, Product, ProductCost, Purchase, StockAdjustment } from "@/lib/types";
import { adjustStock, receiveStock, setLowStock, setProductCost } from "../../../actions";
import { formatDate } from "../../orders/status";
import { ProductForm } from "../product-form";

type Search = { saved?: string; warning?: string; error?: string };

const field = "mt-1 h-9 w-full rounded border border-neutral-300 bg-white px-2 text-sm";
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
      <h1 className="mb-4 text-xl font-bold">პროდუქტის რედაქტირება</h1>
      <ProductForm product={item} categories={(categories ?? []) as Category[]} />

      <section id="stock" className="mt-6 max-w-3xl scroll-mt-4 space-y-4 rounded border border-neutral-200 bg-white p-4">
        <h2 className="text-lg font-bold">მარაგი და თვითღირებულება</h2>
        {notice.saved && <p role="status" className="rounded bg-green-100 p-2 text-sm text-green-900">{notice.saved}</p>}
        {notice.warning && <p role="alert" className="rounded bg-amber-100 p-2 text-sm text-amber-950">{notice.warning}</p>}
        {notice.error && <p role="alert" className="rounded bg-red-100 p-2 text-sm text-red-800">{notice.error}</p>}

        <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <div className="rounded bg-neutral-100 p-2">
            <dt className="text-neutral-700">მარაგი</dt>
            <dd className={`text-lg font-bold ${item.stock <= costs.low_stock_at ? "text-red-700" : ""}`}>{item.stock}</dd>
          </div>
          <div className="rounded bg-neutral-100 p-2">
            <dt className="text-neutral-700">საშუალო თვითღირებულება</dt>
            <dd className="text-lg font-bold">{Number(costs.avg_cost) > 0 ? formatPrice(Math.round(Number(costs.avg_cost) * 100) / 100) : "უცნობია"}</dd>
          </div>
          <div className="rounded bg-neutral-100 p-2">
            <dt className="text-neutral-700">ბოლო შესყიდვა</dt>
            <dd className="text-lg font-bold">{costs.last_cost !== null ? formatPrice(costs.last_cost) : "-"}</dd>
          </div>
          <div className="rounded bg-neutral-100 p-2">
            <dt className="text-neutral-700">მარჟა ({formatPrice(item.final_price)}-ზე)</dt>
            <dd className={`text-lg font-bold ${margin !== null && margin <= 0 ? "text-red-700" : ""}`}>{margin === null ? "-" : `${margin}%`}</dd>
          </div>
        </dl>

        <form action={receiveStock} className="grid grid-cols-2 gap-3 rounded border border-neutral-200 p-3 sm:grid-cols-5">
          <input type="hidden" name="id" value={item.id} />
          <p className="col-span-2 font-medium sm:col-span-5">შესყიდვის დამატება (ახალი პარტია)</p>
          <label className="text-sm">
            რაოდენობა
            <input name="qty" type="number" min="1" step="1" required className={field} />
          </label>
          <label className="text-sm">
            ფასი ცალზე (₾)
            <input name="unit_cost" type="number" min="0" step="0.01" required className={field} />
          </label>
          <label className="text-sm">
            მომწოდებელი
            <input name="supplier" maxLength={120} className={field} />
          </label>
          <label className="text-sm">
            შენიშვნა
            <input name="note" maxLength={500} className={field} />
          </label>
          <div className="flex items-end">
            <button className="h-9 w-full rounded bg-accent px-3 text-sm font-semibold text-white">დამატება</button>
          </div>
          <p className="col-span-2 text-xs text-neutral-600 sm:col-span-5">
            თვითღირებულება საშუალო შეწონილით ითვლება: 5 ცალი 10 ₾-ად და 5 ცალი 14 ₾-ად = 10 ცალი 12 ₾-ად. გაყიდვის ფასს შენ ცვლი ზემოთ.
          </p>
        </form>

        <div className="grid gap-3 sm:grid-cols-3">
          <form action={adjustStock} className="space-y-2 rounded border border-neutral-200 p-3 sm:col-span-2">
            <input type="hidden" name="id" value={item.id} />
            <p className="font-medium">მარაგის კორექცია</p>
            <div className="grid grid-cols-3 gap-2">
              <label className="text-sm">
                +/- ცალი
                <input name="delta" type="number" step="1" required placeholder="-1" className={field} />
              </label>
              <label className="col-span-2 text-sm">
                მიზეზი
                <input name="reason" required minLength={2} maxLength={300} placeholder="დაზიანდა, აღწერისას აღმოჩნდა..." className={field} />
              </label>
            </div>
            <button className="h-9 rounded bg-black px-3 text-sm text-white">შესწორება</button>
          </form>
          <div className="space-y-3">
            <form action={setLowStock} className="rounded border border-neutral-200 p-3">
              <input type="hidden" name="id" value={item.id} />
              <label className="text-sm">
                გამაფრთხილე, როცა დარჩება
                <input name="low_stock_at" type="number" min="0" step="1" required defaultValue={costs.low_stock_at} className={field} />
              </label>
              <button className="mt-2 h-9 rounded bg-black px-3 text-sm text-white">შენახვა</button>
            </form>
            <details className="rounded border border-neutral-200 p-3 text-sm">
              <summary className="cursor-pointer">თვითღირებულების ხელით მითითება</summary>
              <p className="mt-2 text-xs text-neutral-600">მხოლოდ იმ მარაგისთვის, რომელიც შესყიდვების აღრიცხვამდე გქონდა.</p>
              <form action={setProductCost} className="mt-2">
                <input type="hidden" name="id" value={item.id} />
                <input name="avg_cost" type="number" min="0" step="0.01" required defaultValue={Number(costs.avg_cost) || ""} aria-label="თვითღირებულება" className={field} />
                <button className="mt-2 h-9 rounded bg-black px-3 text-sm text-white">შენახვა</button>
              </form>
            </details>
          </div>
        </div>

        <div>
          <p className="font-medium">ისტორია</p>
          {history.length === 0 ? (
            <p className="mt-1 text-sm text-neutral-700">ჯერ არაფერია ჩაწერილი.</p>
          ) : (
            <ul className="mt-1 divide-y divide-neutral-100 text-sm">
              {history.map((row, index) => (
                <li key={index} className="flex gap-3 py-1.5">
                  <span className="w-32 shrink-0 text-neutral-700">{formatDate(row.at)}</span>
                  <span className={`w-12 shrink-0 font-bold ${row.change.startsWith("-") ? "text-red-700" : "text-green-800"}`}>{row.change}</span>
                  <span>{row.text}</span>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-2 text-xs text-neutral-600">გაყიდვები შეკვეთებში ჩანს. გაუქმებული შეკვეთის პროდუქტები მარაგში ავტომატურად ბრუნდება.</p>
        </div>
      </section>
    </>
  );
}
