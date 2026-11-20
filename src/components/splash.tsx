"use client";

import { useEffect, useState } from "react";
import { Logo } from "./logo";

// Shortest time the loading screen stays up, so it reads as an intro rather than a flash.
const MIN_MS = 700;
const FADE_MS = 500;

// Full-screen loading animation on a full page load or refresh. It sits in the store layout,
// which stays mounted during in-site navigation, so it does not come back on every click.
export function Splash() {
  const [state, setState] = useState<"show" | "hide" | "gone">("show");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
    let fade: ReturnType<typeof setTimeout> | undefined;
    let remove: ReturnType<typeof setTimeout> | undefined;
    const done = () => {
      // performance.now() counts from the start of the page load.
      fade = setTimeout(() => {
        setState("hide");
        remove = setTimeout(() => setState("gone"), FADE_MS);
      }, Math.max(0, MIN_MS - performance.now()));
    };
    if (document.readyState === "complete") done();
    else window.addEventListener("load", done, { once: true });
    return () => {
      window.removeEventListener("load", done);
      clearTimeout(fade);
      clearTimeout(remove);
    };
  }, []);

  if (state === "gone") return null;

  return (
    <div
      role="status"
      aria-label="იტვირთება"
      data-state={state}
      data-ready={ready || undefined}
      className="splash fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-bg"
    >
      <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(227,18,11,0.22),transparent_55%)]" />
      <div aria-hidden="true" className="starfield absolute inset-0 opacity-60" />

      <div className="relative flex flex-col items-center">
        <div className="relative flex size-[260px] items-center justify-center sm:size-[300px]">
          <div aria-hidden="true" className="splash-spin absolute inset-0 rounded-full border border-dashed border-neon/25" />
          <div aria-hidden="true" className="splash-spin-rev absolute inset-[9%] rounded-full border-2 border-transparent border-t-neon/70 border-r-accent/40" />
          <svg aria-hidden="true" viewBox="0 0 100 100" className="absolute inset-[4%] -rotate-90">
            <defs>
              <linearGradient id="splash-g" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#e3120b" />
                <stop offset="1" stopColor="#ff5148" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="41" fill="none" stroke="url(#splash-g)" strokeWidth="1.6" strokeLinecap="round" strokeDasharray="258" className="splash-sweep" />
          </svg>
          <Logo className="splash-logo relative h-auto w-[190px] sm:w-[230px]" sizes="230px" preload />
        </div>

        <div aria-hidden="true" className="mt-4 h-1 w-44 overflow-hidden rounded-full bg-white/10">
          <div className="splash-bar h-full w-2/5 rounded-full bg-gradient-to-r from-accent via-neon to-accent shadow-[0_0_12px_#ff5148]" />
        </div>
        <p className="mt-4 text-[11px] font-semibold tracking-[0.35em] text-muted uppercase">Everything for your ride</p>
      </div>
    </div>
  );
}
