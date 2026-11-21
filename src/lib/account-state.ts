"use client";

import { useSyncExternalStore } from "react";

// Who is signed in, as the header and the wishlist see it. "unknown" only until the page has loaded in
// the browser; "in" with summary null means a session cookie exists and the details are on their way.
export type AccountSummary = { id: string; name: string; label: string; initial: string; canChangePassword: boolean };
export type AccountState = { status: "unknown" } | { status: "out" } | { status: "in"; summary: AccountSummary | null };

const UNKNOWN: AccountState = { status: "unknown" };
let state: AccountState = UNKNOWN;
const listeners = new Set<() => void>();

export function setAccountState(next: AccountState) {
  state = next;
  listeners.forEach((listener) => listener());
}

// The current state outside React, for click handlers.
export function getAccountState() {
  return state;
}

export function useAccount() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => state,
    () => UNKNOWN,
  );
}

// Supabase keeps the session in sb-<project>-auth-token (split into .0, .1 when long); demo mode in its own cookie.
export function hasSessionCookie() {
  return /(?:^|;\s*)(sb-[^=]+-auth-token(?:\.\d+)?|motozone-demo-customer)=/.test(document.cookie);
}

// Asks the header to look again, for example after the customer saves a new name.
export function refreshAccount() {
  window.dispatchEvent(new Event("account-changed"));
}
