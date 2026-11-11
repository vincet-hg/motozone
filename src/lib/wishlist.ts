"use client";

import { createLocalList } from "./local-list";

const wishlist = createLocalList<{ id: string }>("motozone-wishlist", () => true);

export const useWishlist = wishlist.useList;

export function toggleWishlist(id: string) {
  const items = wishlist.get();
  wishlist.set(items.some((item) => item.id === id) ? items.filter((item) => item.id !== id) : [...items, { id }]);
}

export function removeFromWishlist(id: string) {
  wishlist.set(wishlist.get().filter((item) => item.id !== id));
}
