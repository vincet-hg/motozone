"use client";

import { useSyncExternalStore } from "react";

export type CartItem = { id: string; qty: number };

const KEY = "motozone-cart";
const EMPTY: CartItem[] = [];

let items: CartItem[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    items = Array.isArray(parsed) ? parsed.filter((i) => typeof i?.id === "string" && i.qty > 0) : EMPTY;
  } catch {
    items = EMPTY;
  }
  loaded = true;
}

function commit(next: CartItem[]) {
  items = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
  listeners.forEach((listener) => listener());
}

function onStorage(event: StorageEvent) {
  if (event.key !== KEY) return;
  load();
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  if (listeners.size === 0) window.addEventListener("storage", onStorage);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot() {
  if (!loaded) load();
  return items;
}

export function useCart() {
  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
}

export function addToCart(id: string, stock: number) {
  getSnapshot();
  const existing = items.find((item) => item.id === id);
  if (existing) setCartQty(id, Math.min(existing.qty + 1, stock));
  else if (stock > 0) commit([...items, { id, qty: 1 }]);
}

export function setCartQty(id: string, qty: number) {
  getSnapshot();
  commit(qty > 0 ? items.map((item) => (item.id === id ? { ...item, qty } : item)) : items.filter((item) => item.id !== id));
}

export function clearCart() {
  commit(EMPTY);
}
