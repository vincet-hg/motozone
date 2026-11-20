"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { getAccountSummary, saveWishlist, syncWishlist } from "@/app/(store)/account/actions";
import { hasSessionCookie, setAccountState, useAccount } from "@/lib/account-state";
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

  useEffect(() => {
    if (account.status === "out") synced.current = last.current = null;
  }, [account.status]);

  return null;
}
