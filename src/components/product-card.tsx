import Image from "next/image";
import Link from "next/link";
import { discountPercent, imageUrl } from "@/lib/format";
import type { ProductCard as Card } from "@/lib/types";
import { AddToCart } from "./add-to-cart";
import { Price } from "./price";

const SIZES = "(min-width: 1280px) 240px, (min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw";

export function ProductCard({ product, eager, lcp }: { product: Card; eager: boolean; lcp: boolean }) {
  const href = `/product/${product.slug}`;
  const discount = discountPercent(product.price, product.sale_price);
  const available = product.stock > 0;

  return (
    <article className="flex flex-col rounded-lg border border-neutral-200 bg-white p-2 hover:border-neutral-500 sm:p-3">
      <Link
        href={href}
        prefetch={false}
        className="relative block aspect-square overflow-hidden"
      >
        {product.images[0] ? (
          <Image
            src={imageUrl(product.images[0])}
            alt={product.name}
            fill
            sizes={SIZES}
            quality={75}
            loading={eager ? "eager" : "lazy"}
            fetchPriority={lcp ? "high" : undefined}
            className={`object-contain ${available ? "" : "opacity-40"}`}
          />
        ) : (
          <span className="flex h-full items-center justify-center text-sm text-neutral-600">ფოტო არ არის</span>
        )}
        {discount > 0 && (
          <span className="absolute top-0 left-0 rounded-full bg-accent px-2 py-0.5 text-xs font-bold">-{discount}%</span>
        )}
      </Link>
      <h2 className="mt-2 line-clamp-2 min-h-10 text-sm leading-5">
        <Link href={href} prefetch={false} className="hover:underline">
          {product.name}
        </Link>
      </h2>
      <div className="mt-auto flex min-h-10 items-center justify-between gap-2 pt-1">
        <Price price={product.price} salePrice={product.sale_price} />
        {available ? (
          <AddToCart id={product.id} stock={product.stock} />
        ) : (
          <span className="text-right text-xs text-neutral-600">არ არის მარაგში</span>
        )}
      </div>
    </article>
  );
}
