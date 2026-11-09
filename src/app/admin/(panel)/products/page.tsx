import Image from "next/image";
import Link from "next/link";
import { imageUrl } from "@/lib/format";
import { requireAdmin } from "@/lib/supabase-server";
import type { Category, Product } from "@/lib/types";
import { deleteProduct, quickUpdateProduct } from "../../actions";
import { ConfirmButton } from "../../ui";

type Search = { q?: string; error?: string; saved?: string };

const number = "h-9 w-20 rounded border border-neutral-300 bg-white px-2";

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<Search> }) {
  const { q = "", error, saved } = await searchParams;
  const supabase = await requireAdmin();

  let query = supabase.from("products").select("*").order("created_at", { ascending: false }).limit(500);
  if (q) query = query.ilike("name", `%${q.replace(/[\\%_]/g, "\\$&")}%`);

  const [{ data: products }, { data: categories }] = await Promise.all([
    query,
    supabase.from("categories").select("*").order("position"),
  ]);
  const categoryName = (id: string | null) => (categories as Category[] | null)?.find((c) => c.id === id)?.name ?? "-";

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-bold">პროდუქტები</h1>
        <form className="flex gap-2">
          <input name="q" defaultValue={q} placeholder="ძიება სახელით" className="h-9 rounded border border-neutral-300 bg-white px-3 text-sm" />
          <button className="h-9 rounded border border-black px-3 text-sm">ძებნა</button>
        </form>
        <Link href="/admin/products/new" className="ml-auto flex h-9 items-center rounded bg-accent px-4 text-sm font-semibold">
          პროდუქტის დამატება
        </Link>
      </div>

      {error && <p role="alert" className="mt-3 rounded bg-red-100 p-2 text-sm text-red-800">{error}</p>}
      {saved && <p role="status" className="mt-3 rounded bg-green-100 p-2 text-sm text-green-900">შენახულია. მაღაზია განახლდა.</p>}

      <div className="mt-4 overflow-x-auto rounded border border-neutral-200 bg-white">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="border-b border-neutral-200 text-neutral-700">
            <tr>
              <th className="p-2 font-medium">პროდუქტი</th>
              <th className="p-2 font-medium">კატეგორია</th>
              <th className="p-2 font-medium">ფასი</th>
              <th className="p-2 font-medium">ფასდაკლებით</th>
              <th className="p-2 font-medium">მარაგი</th>
              <th className="p-2" />
            </tr>
          </thead>
          <tbody>
            {((products ?? []) as Product[]).map((product) => {
              const formId = `row-${product.id}`;
              return (
                <tr key={product.id} className="border-b border-neutral-100">
                  <td className="p-2">
                    <div className="flex items-center gap-2">
                      <div className="relative size-12 shrink-0 overflow-hidden rounded border border-neutral-200">
                        {product.images[0] && (
                          <Image src={imageUrl(product.images[0])} alt="" fill sizes="96px" quality={75} className="object-contain" />
                        )}
                      </div>
                      <div>
                        <Link href={`/admin/products/${product.id}`} className="font-medium hover:underline">
                          {product.name}
                        </Link>
                        {!product.active && <p className="text-xs text-neutral-600">დამალულია</p>}
                      </div>
                    </div>
                  </td>
                  <td className="p-2">{categoryName(product.category_id)}</td>
                  <td className="p-2">
                    <input form={formId} name="price" type="number" min="0" step="0.01" required defaultValue={product.price} aria-label="ფასი" className={number} />
                  </td>
                  <td className="p-2">
                    <input form={formId} name="sale_price" type="number" min="0" step="0.01" defaultValue={product.sale_price ?? ""} aria-label="ფასდაკლებული ფასი" className={number} />
                  </td>
                  <td className="p-2">
                    <input form={formId} name="stock" type="number" min="0" step="1" required defaultValue={product.stock} aria-label="მარაგი" className={number} />
                  </td>
                  <td className="p-2">
                    <div className="flex items-center gap-3">
                      <form id={formId} action={quickUpdateProduct}>
                        <input type="hidden" name="id" value={product.id} />
                        <button className="h-9 rounded bg-black px-3 text-white">შენახვა</button>
                      </form>
                      <Link href={`/admin/products/${product.id}`} className="underline">
                        რედაქტირება
                      </Link>
                      <form action={deleteProduct}>
                        <input type="hidden" name="id" value={product.id} />
                        <ConfirmButton message={`წავშალო „${product.name}“?`} className="text-red-700 underline">
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
                <td colSpan={6} className="p-8 text-center text-neutral-700">
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
