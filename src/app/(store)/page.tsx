import type { Metadata } from "next";
import Link from "next/link";
import { CategoryShowcase } from "@/components/category-showcase";
import { JsonLd } from "@/components/json-ld";
import { Newsletter } from "@/components/newsletter";
import type { CardBadge } from "@/components/product-card";
import { ProductGrid } from "@/components/product-grid";
import { ProductRow } from "@/components/product-row";
import { PromoBanners } from "@/components/promo-banners";
import { SearchHero } from "@/components/search-hero";
import { SectionHeading } from "@/components/section-heading";
import { moreButton } from "@/components/styles";
import { getCategories, getCategoryCovers, getNewProductIds, getPopularProducts, getProducts, getPromotionSlides } from "@/lib/catalog";
import { discountPercent } from "@/lib/format";
import { absolute, organization } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = { alternates: { canonical: "/" }, openGraph: { url: "/" } };

const POPULAR_COUNT = 10;
const HERO_CARDS = 5;

export default async function HomePage() {
  const [promotions, categories, covers, popular, newIds, newest, sale] = await Promise.all([
    getPromotionSlides(),
    getCategories(),
    getCategoryCovers(),
    getPopularProducts(POPULAR_COUNT),
    getNewProductIds(),
    getProducts(),
    getProducts({ sale: true }),
  ]);

  // The cached page can outlive a promotion's end, so expired ones are skipped here too.
  const promotion = promotions.find((item) => !item.ends_at || new Date(item.ends_at).getTime() > Date.now());

  // Hero cards: discounted products in stock first (biggest discount first), topped up to five with best sellers.
  const discounted = sale.products
    .filter((product) => product.stock > 0)
    .sort((a, b) => discountPercent(b.price, b.sale_price) - discountPercent(a.price, a.sale_price));
  const heroProducts = [...discounted, ...popular.products.filter((product) => product.sale_price === null)]
    .filter((product, i, list) => product.images.length > 0 && list.findIndex((other) => other.id === product.id) === i)
    .slice(0, HERO_CARDS);

  const badgeFor = (id: string): CardBadge | undefined => (popular.popularIds.has(id) ? "popular" : newIds.has(id) ? "new" : undefined);
  const shown = new Set(popular.products.map((product) => product.id));
  const arrivals = newest.products.filter((product) => !shown.has(product.id));

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            organization,
            {
              "@type": "WebSite",
              "@id": absolute("/#website"),
              name: site.name,
              url: site.url,
              inLanguage: "ka",
              publisher: { "@id": absolute("/#store") },
              potentialAction: {
                "@type": "SearchAction",
                target: { "@type": "EntryPoint", urlTemplate: `${absolute("/search")}?q={search_term_string}` },
                "query-input": "required name=search_term_string",
              },
            },
          ],
        }}
      />
      <h1 className="sr-only">{site.name}: მოტოციკლისა და მოპედის აქსესუარები</h1>
      <SearchHero promotion={promotion} products={heroProducts} categories={categories} />

      <main className="mx-auto max-w-7xl px-3 sm:px-4">
        <CategoryShowcase categories={categories} covers={covers} />

        <section aria-labelledby="popular-title" className="reveal mt-14">
          <SectionHeading id="popular-title" title="ყველაზე გაყიდვადი" subtitle="ჩვენი ყველაზე პოპულარული აქსესუარები" link={{ href: "/search", label: "ყველა" }} />
          <ProductGrid products={popular.products} heroAbove badgeFor={badgeFor} />
        </section>

        <PromoBanners />

        <section aria-labelledby="sale-title" className="reveal mt-14">
          <SectionHeading id="sale-title" title="სპეციალური შეთავაზებები" link={sale.products.length > 0 ? { href: "/sale", label: "ყველა აქცია" } : undefined} />
          {sale.products.length > 0 ? (
            <ProductRow products={sale.products} badgeFor={badgeFor} />
          ) : (
            <p className="rounded-card border border-dashed border-line bg-card/50 px-6 py-10 text-center text-muted">
              ახლა აქციები არ მიმდინარეობს. გამოიწერე სიახლეები ქვემოთ და პირველმა გაიგე ახალი ფასდაკლებების შესახებ.
            </p>
          )}
        </section>

        {arrivals.length > 0 && (
          <section aria-labelledby="new-title" className="reveal mt-14">
            <SectionHeading id="new-title" title="ახალი პროდუქტები" link={{ href: "/search", label: "ყველა" }} />
            <ProductRow products={arrivals} badgeFor={badgeFor} />
          </section>
        )}

        <Link href="/search" prefetch={false} className={moreButton}>
          ყველა პროდუქტის ნახვა
        </Link>

        <Newsletter />
      </main>
    </>
  );
}
