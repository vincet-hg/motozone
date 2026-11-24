"use client";

import { useSyncExternalStore } from "react";

// A list kept in this browser's localStorage and shared across tabs. Used by the cart and wishlist.
// legacyKey: the name the list was saved under before (the store used to be called motozone); it is moved over once.
export function createLocalList<T extends { id: string }>(key: string, legacyKey: string, isValid: (item: T) => boolean) {
  const EMPTY: T[] = [];
  let items: T[] = EMPTY;
  let loaded = false;
  const listeners = new Set<() => void>();

  function load() {
    try {
      const legacy = localStorage.getItem(legacyKey);
      if (legacy !== null) {
        if (localStorage.getItem(key) === null) localStorage.setItem(key, legacy);
        localStorage.removeItem(legacyKey);
      }
      const parsed = JSON.parse(localStorage.getItem(key) ?? "[]");
      items = Array.isArray(parsed) ? parsed.filter((item) => typeof item?.id === "string" && isValid(item)) : EMPTY;
    } catch {
      items = EMPTY;
    }
    loaded = true;
  }

  function onStorage(event: StorageEvent) {
    if (event.key !== key) return;
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

  function get() {
    if (!loaded) load();
    return items;
  }

  function set(next: T[]) {
    items = next;
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch {}
    listeners.forEach((listener) => listener());
  }

  function useList() {
    return useSyncExternalStore(subscribe, get, () => EMPTY);
  }

  return { get, set, useList, EMPTY };
}
