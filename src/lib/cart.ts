"use client";

import { createLocalList } from "./local-list";

export type CartItem = { id: string; qty: number };

const cart = createLocalList<CartItem>("motozone-cart", (item) => item.qty > 0);

export const useCart = cart.useList;

export function addToCart(id: string, stock: number) {
  const existing = cart.get().find((item) => item.id === id);
  if (existing) setCartQty(id, Math.min(existing.qty + 1, stock));
  else if (stock > 0) cart.set([...cart.get(), { id, qty: 1 }]);
}

export function setCartQty(id: string, qty: number) {
  const items = cart.get();
  cart.set(qty > 0 ? items.map((item) => (item.id === id ? { ...item, qty } : item)) : items.filter((item) => item.id !== id));
}

export function clearCart() {
  cart.set(cart.EMPTY);
}
