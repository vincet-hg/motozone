"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";
import { CartIcon } from "./icons";

export function CartLink() {
  const count = useCart().reduce((sum, item) => sum + item.qty, 0);
  return (
    <Link
      href="/cart"
      prefetch={false}
      aria-label={`კალათა, ${count} ნივთი`}
      className="relative flex h-10 shrink-0 items-center gap-2 px-1.5 sm:px-2"
    >
      <CartIcon className="size-6" />
      <span className="hidden text-sm font-medium sm:inline">კალათა</span>
      {count > 0 && (
        <span className="absolute -top-0.5 left-5 min-w-5 rounded-full bg-accent px-1 text-center text-xs leading-5 font-bold">
          {count}
        </span>
      )}
    </Link>
  );
}
