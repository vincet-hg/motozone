"use client";

import { createLocalList } from "./local-list";

export type CartItem = { id: string; qty: number };

const cart = createLocalList<CartItem>("scooterland-cart", "motozone-cart", (item) => item.qty > 0);

export const useCart = cart.useList;

// "added" when the cart grew, "limit" when it already holds all the stock, "none" when out of stock.
export function addToCart(id: string, stock: number): "added" | "limit" | "none" {
  const existing = cart.get().find((item) => item.id === id);
  if (existing) {
    if (existing.qty >= stock) return "limit";
    setCartQty(id, existing.qty + 1);
    return "added";
  }
  if (stock <= 0) return "none";
  cart.set([...cart.get(), { id, qty: 1 }]);
  return "added";
}

export function setCartQty(id: string, qty: number) {
  const items = cart.get();
  cart.set(qty > 0 ? items.map((item) => (item.id === id ? { ...item, qty } : item)) : items.filter((item) => item.id !== id));
}

export function clearCart() {
  cart.set(cart.EMPTY);
}
