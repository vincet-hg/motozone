"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { getAccountSummary, saveWishlist, syncWishlist } from "@/app/(store)/account/actions";
import { hasSessionCookie, setAccountState, useAccount } from "@/lib/account-state";
import { clearCart, useCart } from "@/lib/cart";
import { replaceWishlist, useWishlist } from "@/lib/wishlist";

// Finds out who is signed in, on every page change (signing in or out moves to another page), and keeps
// a signed-in customer's wishlist the same on every device. Visitors never call the server.
export function AccountWatcher() {
  const pathname = usePathname();
  const account = useAccount();
  const userId = account.status === "in" ? account.summary?.id ?? null : null;

  useEffect(() => {
    let alive = true;
    const check = () => {
      if (!hasSessionCookie()) return setAccountState({ status: "out" });
      setAccountState({ status: "in", summary: null });
      getAccountSummary().then((summary) => {
        if (alive) setAccountState(summary ? { status: "in", summary } : { status: "out" });
      });
    };
    check();
    window.addEventListener("account-changed", check);
    return () => {
      alive = false;
      window.removeEventListener("account-changed", check);
    };
  }, [pathname]);

  // Wishlist: merge once per signed-in customer, then save every change.
  const wishlist = useWishlist();
  const ids = wishlist.map((item) => item.id).join(",");
  const synced = useRef<string | null>(null);
  const last = useRef<string | null>(null);

  useEffect(() => {
    if (!userId || synced.current === userId) return;
    synced.current = userId;
    syncWishlist(ids ? ids.split(",") : []).then((merged) => {
      if (!merged) return;
      last.current = merged.join(",");
      replaceWishlist(merged);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once per customer, with the list at that moment
  }, [userId]);

  useEffect(() => {
    if (!userId || synced.current !== userId || last.current === null || last.current === ids) return;
    last.current = ids;
    const timer = setTimeout(() => saveWishlist(ids ? ids.split(",") : []), 600);
    return () => clearTimeout(timer);
  }, [ids, userId]);

  // Adding to the cart or favourites needs an account, so a signed-out visitor keeps neither: this also
  // removes what was added before sign-in was required, and what stays on a shared device after signing out.
  // A customer's favourites are saved in their account and come back when they sign in again.
  const cart = useCart();
  useEffect(() => {
    if (account.status !== "out") return;
    synced.current = last.current = null;
    if (cart.length > 0) clearCart();
    if (wishlist.length > 0) replaceWishlist([]);
  }, [account.status, cart.length, wishlist.length]);

  return null;
}
