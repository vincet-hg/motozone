"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

// If a click never leads anywhere (an error, a cancelled navigation), the bar finishes on its own.
const GIVE_UP_MS = 15000;
// How long the full bar stays before it fades away.
const DONE_MS = 450;

// A thin bar along the top of the window while the next page loads. The current page stays up
// until the new one is ready. It starts on a click on an in-site link or a search form, and
// fills up when the address changes. Styles: .navigation-progress in globals.css.
export function NavigationProgress() {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const here = useRef({ pathname, search });
  here.current = { pathname, search };

  // The address the user was on when they clicked: the navigation is pending until it changes.
  const [from, setFrom] = useState<{ pathname: string; search: string } | null>(null);
  const navigating = from !== null && from.pathname === pathname && from.search === search;

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
      const button = element?.closest("button");
      if (button && link.contains(button)) return;
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

  // idle → start (empty, one frame) → loading (creeps towards 85%) → done (full, then fades) → idle.
  const [phase, setPhase] = useState<"idle" | "start" | "loading" | "done">("idle");
  useEffect(() => {
    if (navigating) {
      setPhase("start");
      // Two frames, so the empty bar is painted before it starts to grow.
      let frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => setPhase("loading"));
      });
      const giveUp = setTimeout(() => setFrom(null), GIVE_UP_MS);
      return () => {
        cancelAnimationFrame(frame);
        clearTimeout(giveUp);
      };
    }
    setPhase((current) => (current === "idle" ? "idle" : "done"));
    const timer = setTimeout(() => setPhase("idle"), DONE_MS);
    return () => clearTimeout(timer);
  }, [navigating]);

  if (phase === "idle") return null;
  return (
    <div role="progressbar" aria-label="გვერდი იტვირთება" className="navigation-progress" data-state={phase}>
      <div className="navigation-progress-bar" />
    </div>
  );
}
