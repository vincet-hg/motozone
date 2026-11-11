"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ProductCard } from "@/components/product-card";
import type { ProductCard as Card } from "@/lib/types";
import { useWishlist } from "@/lib/wishlist";
import { getCartProducts } from "../cart/actions";

export function WishlistView() {
  const wishlist = useWishlist();
  const [products, setProducts] = useState<Card[] | null>(null);
  const idKey = useMemo(() => wishlist.map((item) => item.id).sort().join(","), [wishlist]);

  useEffect(() => {
    let current = true;
    getCartProducts(idKey ? idKey.split(",") : []).then((result) => {
      if (current) setProducts(result);
    });
    return () => {
      current = false;
    };
  }, [idKey]);

  if (wishlist.length === 0) {
    return (
      <p className="py-12 text-center text-muted">
        სურვილების სია ცარიელია. პროდუქტზე გულის ნიშანს დააჭირე და აქ შეინახება.{" "}
        <Link href="/" className="text-accent underline">
          პროდუქტების ნახვა
        </Link>
      </p>
    );
  }
  if (!products) return <p className="text-muted">იტვირთება...</p>;

  // Keep the order in which products were saved; removed products simply drop out.
  const ordered = wishlist.map((item) => products.find((p) => p.id === item.id)).filter((p): p is Card => !!p);

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {ordered.map((product) => (
        <ProductCard key={product.id} product={product} eager={false} lcp={false} />
      ))}
    </div>
  );
}
