"use client";

import { toggleWishlist, useWishlist } from "@/lib/wishlist";
import { HeartIcon } from "./icons";
import { requireSignIn } from "./login-prompt";

export function WishlistButton({ id, className = "" }: { id: string; className?: string }) {
  const saved = useWishlist().some((item) => item.id === id);
  return (
    <button
      type="button"
      onClick={() => {
        // Removing is always allowed; adding needs an account.
        if (!saved && !requireSignIn({ type: "favorite", id })) return;
        toggleWishlist(id);
      }}
      aria-pressed={saved}
      aria-label={saved ? "სურვილებიდან ამოღება" : "სურვილებში დამატება"}
      className={`flex size-9 items-center justify-center rounded-full transition-all duration-200 hover:scale-110 ${saved ? "text-neon" : "text-neutral-900"} ${className}`}
    >
      <HeartIcon className="size-6" filled={saved} />
    </button>
  );
}
