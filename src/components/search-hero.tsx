import Form from "next/form";
import Image from "next/image";
import Link from "next/link";
import { discountPercent, formatPrice, imageUrl } from "@/lib/format";
import type { Category, ProductCard, PromotionSlide } from "@/lib/types";
import { ArrowIcon, SearchIcon } from "./icons";

// Browsers do not capitalize Georgian, so the headline is switched to capital Mtavruli letters here.
const mtavruli = (text: string) => text.replace(/[ა-ჺჽ-ჿ]/g, (c) => String.fromCharCode(c.charCodeAt(0) + 0xbc0));

// Fan of five product cards: the middle one is the promotion (or the best seller), the outer ones tilt away.
const FAN = [
  "hidden sm:block lg:translate-y-8 lg:-rotate-[5deg]",
  "lg:translate-y-2.5 lg:-rotate-2",
  "z-10 scale-105 border-neon/50 shadow-[0_24px_60px_-20px_rgba(0,110,255,0.95)] lg:scale-110",
  "lg:translate-y-2.5 lg:rotate-2",
  "hidden sm:block lg:translate-y-8 lg:rotate-[5deg]",
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

      <div className="mx-auto flex max-w-7xl flex-col items-center px-4 pt-10 pb-14 text-center sm:pt-14 lg:pt-16 lg:pb-20">
        <Link
          href={promotion ? `/product/${promotion.product.slug}` : "/sale"}
          prefetch={false}
          className="animate-enter-up group inline-flex max-w-full items-center gap-2 rounded-full border border-neon/35 bg-accent/10 px-3.5 py-1.5 text-xs font-semibold text-neon transition-colors hover:border-neon/70 sm:text-[13px]"
        >
          <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-neon shadow-[0_0_8px_#38bdf8]" />
          <span className="truncate">
            {promotion ? `${promotion.badge || promotion.title}${promoDiscount > 0 ? ` · ფასდაკლება ${promoDiscount}%` : ""}` : "ყველაფერი შენი მოპედისთვის · აქციები"}
          </span>
          <ArrowIcon className="size-3.5 shrink-0 transition-transform group-hover:translate-x-0.5" />
        </Link>

        <p aria-hidden="true" className="animate-enter-up mt-5 max-w-4xl text-[30px] leading-[1.08] font-black tracking-tight italic [animation-delay:80ms] min-[400px]:text-4xl sm:text-5xl lg:text-[62px]">
          {mtavruli("მოპედის აქსესუარები")}{" "}
          <span className="bg-gradient-to-r from-neon via-accent-hover to-neon bg-clip-text pr-2 text-transparent [filter:drop-shadow(0_0_24px_rgba(0,110,255,0.45))]">
            {mtavruli("ერთ სივრცეში")}
          </span>
        </p>

        <p className="animate-enter-up mt-4 max-w-xl text-base leading-7 text-muted [animation-delay:160ms] sm:text-lg">
          იპოვე საჭირო ნივთი წამებში. მიწოდება მთელ საქართველოში, გადახდა მიღებისას.
        </p>

        <Form
          action="/search"
          prefetch={false}
          role="search"
          className="animate-enter-up group/search mt-7 flex h-14 w-full max-w-[640px] items-center gap-2 rounded-full border border-neon/40 bg-card/90 pr-1.5 pl-5 shadow-[0_0_0_6px_rgba(0,110,255,0.1),0_20px_50px_-20px_rgba(0,110,255,0.9)] transition-all [animation-delay:240ms] focus-within:border-neon focus-within:shadow-[0_0_0_6px_rgba(56,189,248,0.2),0_20px_50px_-20px_rgba(0,110,255,0.9)] sm:h-16"
        >
          <SearchIcon className="size-5 shrink-0 text-neon" />
          <input
            name="q"
            type="search"
            placeholder="რას ეძებ?"
            aria-label="პროდუქტის ძიება"
            className="h-full min-w-0 flex-1 bg-transparent text-left text-base text-fg placeholder:text-muted focus:outline-none sm:text-[17px]"
          />
          <button
            type="submit"
            className="h-11 shrink-0 cursor-pointer rounded-full bg-gradient-to-r from-accent to-accent-hover px-5 font-bold text-white transition-transform duration-200 hover:scale-[1.03] sm:h-[50px] sm:px-7"
          >
            ძებნა
          </button>
        </Form>

        {categories.length > 0 && (
          <div className="animate-enter-up mt-4 flex max-w-full flex-wrap items-center justify-center gap-2 text-sm text-muted [animation-delay:300ms]">
            <span className="hidden sm:inline">კატეგორიები:</span>
            {categories.slice(0, 4).map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                prefetch={false}
                className="rounded-full border border-line bg-card/40 px-3 py-1.5 text-fg/90 transition-colors hover:border-neon/50 hover:text-white"
              >
                {category.name}
              </Link>
            ))}
          </div>
        )}

        {fan.length > 0 && (
          <ul className="animate-enter-up mt-9 grid w-full max-w-[960px] grid-cols-3 items-end gap-3 [animation-delay:380ms] sm:grid-cols-5 sm:gap-4 lg:mt-10 lg:gap-5">
            {fan.map((product, index) =>
              product ? (
                <li key={product.id} className={`rounded-[20px] border border-line bg-card p-2 transition-transform duration-300 hover:z-20 hover:-translate-y-2 sm:p-2.5 ${FAN[index]}`}>
                  <Link href={`/product/${product.slug}`} prefetch={false} className="block text-left">
                    <span className="relative block aspect-square overflow-hidden rounded-[14px] bg-photo">
                      <Image
                        src={imageUrl(product.images[0])}
                        alt={product.name}
                        fill
                        sizes="(min-width: 1024px) 200px, (min-width: 640px) 18vw, 30vw"
                        quality={75}
                        preload={index === 2}
                        loading={index === 2 ? "eager" : "lazy"}
                        className="object-contain p-2"
                      />
                      {product.sale_price !== null && (
                        <span className="absolute top-1.5 left-1.5 rounded-md bg-accent px-1.5 py-0.5 text-[11px] font-bold text-white sm:text-xs">
                          -{discountPercent(product.price, product.sale_price)}%
                        </span>
                      )}
                    </span>
                    <span className="mt-2 block truncate px-0.5 text-xs text-fg/80 sm:text-[13px]">{product.name}</span>
                    <span className="block px-0.5 pb-0.5 text-sm font-extrabold text-neon sm:text-base">
                      {formatPrice(product.final_price)}
                      {product.sale_price !== null && <span className="ml-1.5 text-xs font-medium text-muted line-through">{formatPrice(product.price)}</span>}
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
