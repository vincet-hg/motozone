"use client";

import { useEffect, useRef } from "react";
import { saveWishlist, syncWishlist } from "@/app/(store)/account/actions";
import { replaceWishlist, useWishlist } from "@/lib/wishlist";

// Keeps a signed-in customer's wishlist the same on every device. On page load the browser's list is
// merged with the saved one; after that, every change here is saved. Visitors keep the local list only.
export function WishlistSync() {
  const wishlist = useWishlist();
  const ids = wishlist.map((item) => item.id).join(",");
  const signedIn = useRef<boolean | null>(null);
  const last = useRef<string | null>(null);

  useEffect(() => {
    // Visitors without a session cookie never call the server.
    if (!/(-auth-token|motozone-demo-customer)=/.test(document.cookie)) return;
    let alive = true;
    syncWishlist(ids ? ids.split(",") : []).then((merged) => {
      if (!alive) return;
      signedIn.current = merged !== null;
      if (merged) {
        last.current = merged.join(",");
        replaceWishlist(merged);
      }
    });
    return () => {
      alive = false;
    };
    // Only once per page load.
  }, []);

  useEffect(() => {
    if (!signedIn.current || last.current === ids) return;
    last.current = ids;
    const timer = setTimeout(() => saveWishlist(ids ? ids.split(",") : []), 600);
    return () => clearTimeout(timer);
  }, [ids]);

  return null;
}
