import Image from "next/image";
import Link from "next/link";
import { discountPercent, imageUrl } from "@/lib/format";
import type { ProductCard as Card } from "@/lib/types";
import { AddToCart } from "./add-to-cart";
import { Price } from "./price";
import { WishlistButton } from "./wishlist-button";

const SIZES = "(min-width: 1280px) 240px, (min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw";

export function ProductCard({ product, eager, lcp }: { product: Card; eager: boolean; lcp: boolean }) {
  const href = `/product/${product.slug}`;
  const discount = discountPercent(product.price, product.sale_price);
  const available = product.stock > 0;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-card border border-line bg-card transition-all duration-300 hover:-translate-y-1 hover:border-accent/60 hover:shadow-[0_10px_32px_-12px_rgba(229,9,32,0.55)]">
      <div className="relative bg-photo">
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
        {discount > 0 && (
          <span className="absolute top-2.5 left-2.5 rounded-lg bg-accent px-2 py-0.5 text-sm font-bold text-white">-{discount}%</span>
        )}
        <WishlistButton id={product.id} className="absolute top-1.5 right-1.5" />
      </div>
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <h2 className="line-clamp-2 min-h-10 text-sm leading-5 font-semibold sm:text-[15px]">
          <Link href={href} prefetch={false} className="transition-colors duration-200 hover:text-accent-hover">
            {product.name}
          </Link>
        </h2>
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
