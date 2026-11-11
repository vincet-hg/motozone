"use client";

import { toggleWishlist, useWishlist } from "@/lib/wishlist";
import { HeartIcon } from "./icons";

export function WishlistButton({ id, className = "" }: { id: string; className?: string }) {
  const saved = useWishlist().some((item) => item.id === id);
  return (
    <button
      type="button"
      onClick={() => toggleWishlist(id)}
      aria-pressed={saved}
      aria-label={saved ? "სურვილებიდან ამოღება" : "სურვილებში დამატება"}
      className={`flex size-9 items-center justify-center rounded-full transition-all duration-200 hover:scale-110 ${saved ? "text-accent" : "text-neutral-900"} ${className}`}
    >
      <HeartIcon className="size-6" filled={saved} />
    </button>
  );
}
