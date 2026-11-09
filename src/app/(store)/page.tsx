import Link from "next/link";
import { CategoryNav } from "@/components/category-nav";
import { ListingHeader } from "@/components/listing-header";
import { ProductGrid } from "@/components/product-grid";
import { getCategories, getProducts, PAGE_SIZE } from "@/lib/catalog";

export default async function HomePage() {
  const [categories, { products, total }] = await Promise.all([getCategories(), getProducts()]);

  return (
    <>
      <CategoryNav categories={categories} />
      <main className="mx-auto max-w-7xl px-3 py-4 sm:px-4">
        <ListingHeader title="ყველა პროდუქტი" />
        <ProductGrid products={products} />
        {total > PAGE_SIZE && (
          <Link href="/search?page=2" prefetch={false} className="mx-auto mt-8 block w-fit rounded border border-black px-5 py-2.5 text-sm font-medium">
            მეტი პროდუქტი
          </Link>
        )}
      </main>
    </>
  );
}
