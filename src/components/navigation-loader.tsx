"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { LoaderArt } from "./splash";

// Fast pages never show the loader: it waits this long before fading in.
const DELAY_MS = 300;
const FADE_MS = 200;
// If a click never leads anywhere (an error, a cancelled navigation), the loader leaves on its own.
const GIVE_UP_MS = 15000;

// How many loading.tsx screens are on the page right now (each <PageLoading> counts while mounted).
let loadingScreens = 0;
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
const changeLoadingScreens = (by: number) => {
  loadingScreens += by;
  listeners.forEach((listener) => listener());
};

// Put in a loading.tsx: keeps the loader up while that page's data is still on the way.
export function PageLoading() {
  useEffect(() => {
    changeLoadingScreens(1);
    return () => changeLoadingScreens(-1);
  }, []);
  return null;
}

// The site's loading screen, shown when moving to another page takes longer than DELAY_MS.
// It starts on a click on an in-site link or a search form, and leaves when the new page is there.
export function NavigationLoader() {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const here = useRef({ pathname, search });
  here.current = { pathname, search };

  // The address the user was on when they clicked: the navigation is pending until it changes.
  const [from, setFrom] = useState<{ pathname: string; search: string } | null>(null);
  const navigating = from !== null && from.pathname === pathname && from.search === search;
  const screens = useSyncExternalStore(subscribe, () => loadingScreens > 0, () => false);
  const busy = navigating || screens;

  useEffect(() => {
    const start = (target: URL) => {
      if (target.origin !== location.origin) return;
      if (target.pathname === location.pathname && target.search === location.search) return;
      setFrom(here.current);
    };
    const onClick = (event: MouseEvent) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const element = event.target instanceof Element ? event.target : null;
      const link = element?.closest<HTMLAnchorElement>("a[href]");
      if (!link || (link.target && link.target !== "_self") || link.hasAttribute("download")) return;
      // A button inside a link card (wishlist, add to cart) does its own thing.
      if (element?.closest("button") && link.contains(element.closest("button"))) return;
      start(new URL(link.href, location.href));
    };
    const onSubmit = (event: SubmitEvent) => {
      const form = event.target;
      if (!(form instanceof HTMLFormElement) || form.method.toLowerCase() !== "get") return;
      const target = new URL(form.action, location.href);
      target.search = new URLSearchParams(new FormData(form) as unknown as Record<string, string>).toString();
      start(target);
    };
    document.addEventListener("click", onClick, true);
    document.addEventListener("submit", onSubmit, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("submit", onSubmit, true);
    };
  }, []);

  useEffect(() => {
    if (!navigating) return;
    const timer = setTimeout(() => setFrom(null), GIVE_UP_MS);
    return () => clearTimeout(timer);
  }, [navigating]);

  // off → show (after DELAY_MS) → hide (fading for FADE_MS) → off.
  const [phase, setPhase] = useState<"off" | "show" | "hide">("off");
  useEffect(() => {
    if (busy) {
      const timer = setTimeout(() => setPhase("show"), DELAY_MS);
      return () => clearTimeout(timer);
    }
    const fade = setTimeout(() => setPhase((current) => (current === "off" ? "off" : "hide")), 0);
    const remove = setTimeout(() => setPhase("off"), FADE_MS);
    return () => {
      clearTimeout(fade);
      clearTimeout(remove);
    };
  }, [busy]);

  if (phase === "off") return null;

  return (
    <div
      role="status"
      aria-label="იტვირთება"
      data-state={busy ? "show" : phase}
      className="route-loader fixed inset-0 z-[95] flex items-center justify-center overflow-hidden bg-bg/85 backdrop-blur-md"
    >
      <LoaderArt />
    </div>
  );
}
