import Link from "next/link";
import { BenefitsBar } from "@/components/benefits-bar";
import { CategoryNav } from "@/components/category-nav";
import { FilterBar } from "@/components/filter-bar";
import { HomeHero } from "@/components/home-hero";
import { ProductGrid } from "@/components/product-grid";
import { SectionHeading } from "@/components/section-heading";
import { moreButton } from "@/components/styles";
import { getCategories, getProducts, PAGE_SIZE } from "@/lib/catalog";

export default async function HomePage() {
  const [categories, { products, total }, sale] = await Promise.all([
    getCategories(),
    getProducts(),
    getProducts({ sale: true }),
  ]);

  return (
    <>
      <HomeHero />
      <BenefitsBar />

      <main className="mx-auto max-w-7xl px-3 sm:px-4">
        {sale.products.length > 0 && (
          <section className="mt-10">
            <SectionHeading title="აქციები" link={sale.total > 5 ? { href: "/sale", label: "ყველა აქცია" } : undefined} />
            <ProductGrid products={sale.products.slice(0, 5)} heroAbove />
          </section>
        )}

        <section id="products" className="mt-10 scroll-mt-24">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <SectionHeading title="ყველა პროდუქტი" />
            <div className="mb-1 lg:mb-4">
              <FilterBar />
            </div>
          </div>
          <div className="-mx-3 sm:-mx-4">
            <CategoryNav categories={categories} />
          </div>
          <div className="mt-1">
            <ProductGrid products={products} heroAbove />
          </div>
          {total > PAGE_SIZE && (
            <Link href="/search?page=2" prefetch={false} className={moreButton}>
              მეტი პროდუქტი
            </Link>
          )}
        </section>
      </main>
    </>
  );
}
