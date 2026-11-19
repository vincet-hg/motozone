import Form from "next/form";
import Image from "next/image";
import Link from "next/link";
import { discountPercent, formatPrice, imageUrl } from "@/lib/format";
import type { Category, ProductCard, PromotionSlide } from "@/lib/types";
import { CategoryIcon } from "./category-icons";
import { ArrowIcon, SearchIcon } from "./icons";

// Browsers do not capitalize Georgian, so the headline is switched to capital Mtavruli letters here.
const mtavruli = (text: string) => text.replace(/[ა-ჺჽ-ჿ]/g, (c) => String.fromCharCode(c.charCodeAt(0) + 0xbc0));

// Fan of five product cards: the middle one is the promotion (or the best seller), the outer ones tilt away.
const FAN = [
  "hidden sm:block lg:translate-y-6 lg:-rotate-[5deg]",
  "lg:translate-y-2 lg:-rotate-2",
  "z-10 scale-105 border-neon/50 shadow-[0_20px_50px_-20px_rgba(0,110,255,0.95)] lg:scale-110",
  "lg:translate-y-2 lg:rotate-2",
  "hidden sm:block lg:translate-y-6 lg:rotate-[5deg]",
];

// Search-first home hero. The pill and the middle card come from the first active promotion
// (Admin › Slider); without one they point to the sale page and the best seller.
export function SearchHero({ promotion, products, categories }: { promotion?: PromotionSlide; products: ProductCard[]; categories: Category[] }) {
  const featured = promotion?.product ?? products[0];
  const others = products.filter((product) => product.id !== featured?.id).slice(0, 4);
  const fan = featured ? [others[0], others[1], featured, others[2], others[3]] : [];
  const promoDiscount = promotion ? discountPercent(promotion.product.price, promotion.product.sale_price) : 0;

  return (
    <section aria-label="ძიება და შეთავაზებები" className="relative isolate overflow-hidden border-b border-line">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_112%,rgba(0,110,255,0.5),transparent_55%),radial-gradient(ellipse_at_50%_0%,rgba(56,189,248,0.12),transparent_45%),#050b18]" />
        <div className="starfield absolute inset-0 opacity-60" />
        <div className="absolute -bottom-[460px] left-1/2 h-[640px] w-[1100px] -translate-x-1/2 rounded-[50%] border border-dashed border-neon/25" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-neon/60 to-transparent" />
      </div>

      <div className="mx-auto flex max-w-7xl flex-col items-center px-4 pt-6 pb-12 text-center sm:pt-8 lg:pt-9 lg:pb-16">
        <p aria-hidden="true" className="animate-enter-up max-w-4xl text-[26px] leading-[1.08] font-extrabold tracking-[-0.01em] italic [animation-delay:80ms] min-[400px]:text-[29px] sm:text-[38px] lg:text-[46px]">
          {mtavruli("მოპედის აქსესუარები")}{" "}
          <span className="block bg-gradient-to-r from-neon via-accent-hover to-neon bg-clip-text pr-2 text-transparent [filter:drop-shadow(0_0_24px_rgba(0,110,255,0.45))]">
            {mtavruli("ერთ სივრცეში")}
          </span>
        </p>

        <p className="animate-enter-up mt-3 max-w-md text-sm leading-6 text-muted [animation-delay:160ms] sm:text-[15px]">
          იპოვე საჭირო ნივთი წამებში. მიწოდება თბილისის მასშტაბით, გადახდა მიღებისას.
        </p>

        <Form
          action="/search"
          prefetch={false}
          role="search"
          className="animate-enter-up group/search mt-6 flex h-12 w-full max-w-[520px] items-center gap-2 rounded-full border border-neon/35 bg-card/90 pr-1 pl-4 shadow-[0_0_0_4px_rgba(0,110,255,0.08),0_14px_36px_-18px_rgba(0,110,255,0.9)] transition-all [animation-delay:240ms] focus-within:border-neon focus-within:shadow-[0_0_0_4px_rgba(56,189,248,0.2),0_14px_36px_-18px_rgba(0,110,255,0.9)] sm:h-[52px]"
        >
          <SearchIcon className="size-[18px] shrink-0 text-neon" />
          <input
            name="q"
            type="search"
            autoComplete="off"
            placeholder="რას ეძებ?"
            aria-label="პროდუქტის ძიება"
            className="h-full min-w-0 flex-1 bg-transparent text-left text-[15px] text-fg placeholder:text-muted focus:outline-none focus-visible:outline-none"
          />
          <button
            type="submit"
            className="h-10 shrink-0 cursor-pointer rounded-full bg-gradient-to-r from-accent to-accent-hover px-5 text-sm font-semibold text-white transition-transform duration-200 hover:scale-[1.03] sm:h-11 sm:px-6"
          >
            ძებნა
          </button>
        </Form>

        {categories.length > 0 && (
          <div className="animate-enter-up mt-3.5 flex max-w-full flex-wrap items-center justify-center gap-1.5 text-[13px] text-muted [animation-delay:300ms]">
            {categories.slice(0, 4).map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                prefetch={false}
                className="group/pill flex items-center gap-1.5 rounded-full border border-line bg-card/40 py-1 pr-3 pl-2.5 text-fg/85 transition-colors hover:border-neon/50 hover:text-white"
              >
                <CategoryIcon slug={category.slug} className="size-4 shrink-0 text-neon/80 transition-colors group-hover/pill:text-neon" />
                {category.name}
              </Link>
            ))}
          </div>
        )}

        {fan.length > 0 && (
          <ul className="animate-enter-up mt-9 grid w-full max-w-[320px] grid-cols-3 items-end gap-2 [animation-delay:380ms] min-[400px]:max-w-[360px] sm:max-w-[680px] sm:grid-cols-5 sm:gap-3 lg:mt-10 lg:max-w-[840px] lg:gap-4">
            {fan.map((product, index) =>
              product ? (
                <li key={product.id} className={`rounded-2xl border border-line bg-card p-1.5 transition-transform duration-300 hover:z-20 hover:-translate-y-1.5 sm:p-2 ${FAN[index]}`}>
                  <Link href={`/product/${product.slug}`} prefetch={false} className="block text-left">
                    <span className="relative block aspect-square overflow-hidden rounded-xl bg-photo">
                      <Image
                        src={imageUrl(product.images[0])}
                        alt={product.name}
                        fill
                        sizes="(min-width: 1024px) 160px, (min-width: 640px) 120px, 110px"
                        quality={75}
                        preload={index === 2}
                        loading={index === 2 ? "eager" : "lazy"}
                        className="object-contain p-1.5"
                      />
                      {product.sale_price !== null && (
                        <span className="absolute top-1 left-1 rounded-md bg-accent px-1.5 py-0.5 text-[10px] font-bold text-white sm:text-[11px]">
                          -{discountPercent(product.price, product.sale_price)}%
                        </span>
                      )}
                    </span>
                    <span className="mt-1.5 block truncate px-0.5 text-[11px] text-fg/75 sm:text-xs">{product.name}</span>
                    <span className="block px-0.5 pb-0.5 text-[13px] font-extrabold text-neon sm:text-sm">
                      {formatPrice(product.final_price)}
                      {product.sale_price !== null && <span className="ml-1 text-[11px] font-medium text-muted line-through">{formatPrice(product.price)}</span>}
                    </span>
                  </Link>
                </li>
              ) : null,
            )}
          </ul>
        )}
      </div>
    </section>
  );
}
