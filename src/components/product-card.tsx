import Image from "next/image";
import Link from "next/link";
import { discountPercent, imageUrl } from "@/lib/format";
import type { ProductCard as Card } from "@/lib/types";
import { AddToCart } from "./add-to-cart";
import { Price } from "./price";
import { WishlistButton } from "./wishlist-button";

const SIZES = "(min-width: 1280px) 240px, (min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw";

export type CardBadge = "new" | "popular";

const BADGES: Record<CardBadge, { label: string; className: string }> = {
  new: { label: "ახალი", className: "bg-fg text-bg" },
  popular: { label: "პოპულარული", className: "border border-accent/50 bg-bg/80 text-accent-hover backdrop-blur" },
};

export function ProductCard({ product, eager, lcp, badge }: { product: Card; eager: boolean; lcp: boolean; badge?: CardBadge }) {
  const href = `/product/${product.slug}`;
  const discount = discountPercent(product.price, product.sale_price);
  const available = product.stock > 0;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-card border border-line bg-card transition-all duration-300 hover:-translate-y-1 hover:border-accent/60 hover:bg-card-hover hover:shadow-[0_14px_36px_-16px_rgba(225,29,72,0.6)]">
      <div className="relative m-2 mb-0 overflow-hidden rounded-xl bg-photo">
        <Link href={href} prefetch={false} className="relative block aspect-square">
          {product.images[0] ? (
            <Image
              src={imageUrl(product.images[0])}
              alt={product.name}
              fill
              sizes={SIZES}
              quality={75}
              loading={eager ? "eager" : "lazy"}
              fetchPriority={lcp ? "high" : undefined}
              className={`object-contain p-3 transition-transform duration-300 group-hover:scale-105 ${available ? "" : "opacity-40"}`}
            />
          ) : (
            <span className="flex h-full items-center justify-center text-sm text-neutral-600">ფოტო არ არის</span>
          )}
        </Link>
        <div className="absolute top-2 left-2 flex flex-col items-start gap-1">
          {discount > 0 && <span className="rounded-lg bg-accent px-2 py-0.5 text-sm font-bold text-white shadow-md">-{discount}%</span>}
          {badge && <span className={`rounded-lg px-2 py-0.5 text-xs font-semibold ${BADGES[badge].className}`}>{BADGES[badge].label}</span>}
        </div>
        <WishlistButton id={product.id} className="absolute top-1.5 right-1.5" />
      </div>
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <h3 className="line-clamp-2 min-h-10 text-sm leading-5 font-semibold sm:text-[15px]">
          <Link href={href} prefetch={false} className="transition-colors duration-200 hover:text-accent-hover">
            {product.name}
          </Link>
        </h3>
        <div className="mt-auto flex min-h-11 items-center justify-between gap-2 pt-2">
          <Price price={product.price} salePrice={product.sale_price} />
          {available ? (
            <AddToCart id={product.id} stock={product.stock} />
          ) : (
            <span className="text-right text-xs text-muted">არ არის მარაგში</span>
          )}
        </div>
      </div>
    </article>
  );
}
