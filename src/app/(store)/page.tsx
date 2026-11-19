import type { Metadata } from "next";
import Link from "next/link";
import { CategoryShowcase } from "@/components/category-showcase";
import { HeroSlider, type Slide } from "@/components/hero-slider";
import { HomeHero } from "@/components/home-hero";
import { JsonLd } from "@/components/json-ld";
import { Newsletter } from "@/components/newsletter";
import type { CardBadge } from "@/components/product-card";
import { ProductGrid } from "@/components/product-grid";
import { ProductRow } from "@/components/product-row";
import { PromoBanners } from "@/components/promo-banners";
import { SectionHeading } from "@/components/section-heading";
import { TrustBar } from "@/components/trust-bar";
import { moreButton } from "@/components/styles";
import { getCategories, getCategoryCovers, getNewProductIds, getPopularProducts, getProducts, getPromotionSlides } from "@/lib/catalog";
import { discountPercent, imageUrl } from "@/lib/format";
import { absolute, organization } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = { alternates: { canonical: "/" }, openGraph: { url: "/" } };

const POPULAR_COUNT = 10;

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

  const slides: Slide[] = promotions.map((promotion) => ({
    id: promotion.id,
    title: promotion.title,
    description: promotion.description,
    badge: promotion.badge,
    ctaLabel: promotion.cta_label,
    endsAt: promotion.ends_at,
    href: `/product/${promotion.product.slug}`,
    image: imageUrl(promotion.product.images[0]),
    productName: promotion.product.name,
    price: promotion.product.price,
    salePrice: promotion.product.sale_price,
    discount: discountPercent(promotion.product.price, promotion.product.sale_price),
  }));

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
      <HeroSlider slides={slides} fallback={<HomeHero />} />

      <main className="mx-auto max-w-7xl px-3 sm:px-4">
        <div className="mt-4 lg:mt-0">
          <TrustBar />
        </div>
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
