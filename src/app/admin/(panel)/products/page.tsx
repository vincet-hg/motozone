import Image from "next/image";
import Link from "next/link";
import { formatPrice, imageUrl } from "@/lib/format";
import { marginPercent } from "@/lib/margin";
import { requireAdmin } from "@/lib/supabase-server";
import type { Category, Product, ProductCost } from "@/lib/types";
import { deleteProduct, quickUpdateProduct } from "../../actions";
import { ConfirmButton } from "../../ui";

type Search = { q?: string; error?: string; saved?: string; low?: string };

const number = "h-9 w-20 rounded-lg border px-2";

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<Search> }) {
  const { q = "", error, saved, low } = await searchParams;
  const supabase = await requireAdmin();

  let query = supabase.from("products").select("*").order("created_at", { ascending: false }).limit(500);
  if (q) query = query.ilike("name", `%${q.replace(/[\\%_]/g, "\\$&")}%`);

  const [{ data: rows }, { data: categories }, { data: costRows }] = await Promise.all([
    query,
    supabase.from("categories").select("*").order("position"),
    supabase.from("product_costs").select("*"),
  ]);
  const categoryName = (id: string | null) => (categories as Category[] | null)?.find((c) => c.id === id)?.name ?? "-";
  const costs = new Map(((costRows ?? []) as ProductCost[]).map((row) => [row.product_id, row]));
  const isLow = (product: Product) => product.stock <= (costs.get(product.id)?.low_stock_at ?? 3);
  const all = (rows ?? []) as Product[];
  const products = low ? all.filter(isLow) : all;
  const lowCount = all.filter((product) => product.active && isLow(product)).length;

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight">პროდუქტები</h1>
        <form className="flex w-full gap-2 sm:w-auto">
          <input name="q" defaultValue={q} placeholder="ძიება სახელით" className="h-9 min-w-0 flex-1 rounded-xl border px-3 text-sm sm:w-56 sm:flex-none" />
          <button className="h-9 rounded-xl border border-a-line bg-a-panel transition-colors hover:border-a-violet/60 px-3 text-sm">ძებნა</button>
        </form>
        <Link
          href={low ? "/admin/products" : "/admin/products?low=1"}
          className={`flex h-9 items-center rounded-lg border px-3 text-sm ${low ? "border-a-violet/60 bg-a-purple/25 text-white" : lowCount > 0 ? "border-a-red/50 bg-a-red/10 text-[#ff8a94]" : "border-a-line bg-a-panel"}`}
        >
          იწურება ({lowCount})
        </Link>
        <Link href="/admin/products/new" className="ml-auto flex h-9 items-center rounded-xl bg-gradient-to-r from-a-purple to-a-violet shadow-[0_8px_24px_-10px_rgba(225,29,72,0.9)] transition-all duration-200 hover:-translate-y-px hover:shadow-[0_0_24px_-4px_rgba(251,113,133,0.55)] px-4 text-sm font-semibold text-white">
          პროდუქტის დამატება
        </Link>
      </div>

      {error && <p role="alert" className="mt-3 rounded-xl border border-a-red/30 bg-a-red/10 p-3 text-sm text-[#ff8a94]">{error}</p>}
      {saved && <p role="status" className="mt-3 rounded-xl border border-a-green/30 bg-a-green/10 p-3 text-sm text-[#5fe0a0]">შენახულია. მაღაზია განახლდა.</p>}

      <div className="mt-4 overflow-x-auto rounded-2xl border border-a-line bg-a-card shadow-[0_10px_30px_-18px_rgba(0,0,0,0.8)]">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead>
            <tr>
              <th className="z-10 bg-a-panel px-4 py-3 font-medium max-sm:sticky max-sm:left-0">პროდუქტი</th>
              <th className="px-4 py-3 font-medium">კატეგორია</th>
              <th className="px-4 py-3 font-medium">ფასი</th>
              <th className="px-4 py-3 font-medium">ფასდაკლებით</th>
              <th className="px-4 py-3 font-medium">მარაგი</th>
              <th className="px-4 py-3 font-medium">თვითღირ.</th>
              <th className="px-4 py-3 font-medium">მარჟა</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const formId = `row-${product.id}`;
              const avg = Number(costs.get(product.id)?.avg_cost ?? 0);
              const margin = marginPercent(product.final_price, avg);
              return (
                <tr key={product.id} className="border-b border-a-line/60">
                  <td className="z-10 bg-a-card px-4 py-3 max-sm:sticky max-sm:left-0 max-sm:max-w-[200px] max-sm:shadow-[8px_0_12px_-8px_rgba(0,0,0,0.8)]">
                    <div className="flex items-center gap-2">
                      <div className="relative size-12 shrink-0 overflow-hidden rounded-xl border border-a-line bg-white">
                        {product.images[0] && (
                          <Image src={imageUrl(product.images[0])} alt="" fill sizes="96px" quality={75} className="object-contain" />
                        )}
                      </div>
                      <div>
                        <Link href={`/admin/products/${product.id}`} className="font-medium hover:underline">
                          {product.name}
                        </Link>
                        {!product.active && <p className="text-xs text-a-muted">დამალულია</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{categoryName(product.category_id)}</td>
                  <td className="px-4 py-3">
                    <input form={formId} name="price" type="number" min="0" step="0.01" required defaultValue={product.price} aria-label="ფასი" className={number} />
                  </td>
                  <td className="px-4 py-3">
                    <input form={formId} name="sale_price" type="number" min="0" step="0.01" defaultValue={product.sale_price ?? ""} aria-label="ფასდაკლებული ფასი" className={number} />
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/products/${product.id}#stock`} className={`inline-flex min-w-9 items-center justify-center rounded-lg border px-2 py-1 font-bold transition-colors ${isLow(product) ? "border-a-red/40 bg-a-red/10 text-[#ff6b77]" : "border-a-line bg-a-panel hover:border-a-violet/60"}`}>
                      {product.stock}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{avg > 0 ? formatPrice(Math.round(avg * 100) / 100) : "-"}</td>
                  <td className={`px-4 py-3 ${margin !== null && margin <= 10 ? "font-bold text-[#ff6b77]" : ""}`}>{margin === null ? "-" : `${margin}%`}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <form id={formId} action={quickUpdateProduct}>
                        <input type="hidden" name="id" value={product.id} />
                        <button className="h-9 rounded-xl border border-a-line bg-a-hover/70 transition-colors duration-200 hover:border-a-violet/60 hover:bg-a-hover px-3 text-white">შენახვა</button>
                      </form>
                      <Link href={`/admin/products/${product.id}`} className="underline">
                        რედაქტირება
                      </Link>
                      <form action={deleteProduct}>
                        <input type="hidden" name="id" value={product.id} />
                        <ConfirmButton message={`წავშალო „${product.name}“?`} className="text-[#ff6b77] underline">
                          წაშლა
                        </ConfirmButton>
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}
            {products?.length === 0 && (
              <tr>
                <td colSpan={8} className="p-8 text-center text-a-soft">
                  პროდუქტი არ არის. დაამატე პირველი პროდუქტი.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
