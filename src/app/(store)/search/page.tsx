import type { Metadata } from "next";
import Link from "next/link";
import { CategoryNav } from "@/components/category-nav";
import { ListingHeader } from "@/components/listing-header";
import { ProductGrid } from "@/components/product-grid";
import { getCategories, getProducts, PAGE_SIZE, type Sort } from "@/lib/catalog";

type Params = Record<string, string | string[] | undefined>;

export const metadata: Metadata = { title: "ძიება", robots: { index: false } };

function text(value: string | string[] | undefined) {
  return typeof value === "string" ? value.trim().slice(0, 100) : "";
}

function price(value: string | string[] | undefined) {
  const parsed = Number(text(value) || NaN);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams;
  const q = text(params.q);
  const slug = text(params.category);
  const min = price(params.min);
  const max = price(params.max);
  const rawSort = text(params.sort);
  const sort: Sort = rawSort === "price_asc" || rawSort === "price_desc" ? rawSort : "newest";
  const page = Math.max(1, Math.floor(Number(text(params.page))) || 1);

  const categories = await getCategories();
  const category = categories.find((item) => item.slug === slug);
  const { products, total } = await getProducts({ categoryId: category?.id, q: q || undefined, min, max, sort, page });

  const link = (target: number) => {
    const query = new URLSearchParams();
    if (q) query.set("q", q);
    if (category) query.set("category", category.slug);
    if (min !== undefined) query.set("min", String(min));
    if (max !== undefined) query.set("max", String(max));
    if (sort !== "newest") query.set("sort", sort);
    query.set("page", String(target));
    return `/search?${query}`;
  };

  const title = q ? `ძიება: ${q}` : (category?.name ?? "ყველა პროდუქტი");
  const pageLink = "rounded border border-black px-4 py-2 text-sm font-medium";

  return (
    <>
      <CategoryNav categories={categories} active={category?.slug} />
      <main className="mx-auto max-w-7xl px-3 py-4 sm:px-4">
        <ListingHeader title={title} filters={{ q, category: category?.slug, min, max, sort }} />
        <ProductGrid products={products} />
        {total > PAGE_SIZE && (
          <div className="mt-8 flex items-center justify-center gap-4">
            {page > 1 && (
              <Link href={link(page - 1)} prefetch={false} className={pageLink}>
                წინა
              </Link>
            )}
            <span className="text-sm">
              {page} / {Math.ceil(total / PAGE_SIZE)}
            </span>
            {page * PAGE_SIZE < total && (
              <Link href={link(page + 1)} prefetch={false} className={pageLink}>
                შემდეგი
              </Link>
            )}
          </div>
        )}
      </main>
    </>
  );
}
