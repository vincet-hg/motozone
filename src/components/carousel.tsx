"use client";

import { Children, useCallback, useEffect, useRef, useState } from "react";

// A row of cards that moves on by itself every few seconds and can be moved by hand: arrows, swipe,
// trackpad or keyboard. It waits a few seconds after the visitor moves it, and while the tab is hidden,
// and does not move by itself for visitors who prefer reduced motion. At the end it goes back to the start.

const INTERVAL = 4000;
const PAUSE_AFTER_TOUCH = 5000;

function Arrow({ dir, onClick, disabled }: { dir: "prev" | "next"; onClick: () => void; disabled: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === "prev" ? "წინა" : "შემდეგი"}
      className={`absolute top-1/2 z-10 hidden size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-line bg-card/90 text-fg shadow-[0_8px_20px_-10px_rgba(0,0,0,0.9)] backdrop-blur transition-all hover:border-neon/60 hover:text-white disabled:pointer-events-none disabled:opacity-0 md:flex ${
        dir === "prev" ? "-left-3 lg:-left-5" : "-right-3 lg:-right-5"
      }`}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className="size-5" aria-hidden>
        <path d={dir === "prev" ? "M15 18l-6-6 6-6" : "M9 6l6 6-6 6"} />
      </svg>
    </button>
  );
}

const PRODUCT_WIDTHS =
  "w-[46%] sm:w-[31%] md:w-[calc((100%-2rem)/3)] lg:w-[calc((100%-3rem)/4)] xl:w-[calc((100%-4rem)/5)]";

// itemClassName sets how wide each card is per screen size (the default fits product cards).
export function Carousel({ children, label, itemClassName = PRODUCT_WIDTHS }: { children: React.ReactNode; label: string; itemClassName?: string }) {
  const track = useRef<HTMLDivElement>(null);
  const pausedUntil = useRef(0);
  const [edges, setEdges] = useState({ start: true, end: false });
  const [page, setPage] = useState({ index: 0, count: 1 });
  const items = Children.toArray(children);

  const measure = useCallback(() => {
    const strip = track.current;
    if (!strip) return;
    const max = strip.scrollWidth - strip.clientWidth;
    setEdges({ start: strip.scrollLeft <= 4, end: strip.scrollLeft >= max - 4 });
    const pages = Math.max(1, Math.ceil(strip.scrollWidth / strip.clientWidth - 0.05));
    setPage({ index: max <= 0 ? 0 : Math.round((strip.scrollLeft / max) * (pages - 1)), count: pages });
  }, []);

  // Glides to a position with an ease-in-out curve. Snapping is switched off while it moves,
  // otherwise the browser pulls the row back to a card edge mid-way.
  const animation = useRef(0);
  const glide = useCallback((target: number, duration: number) => {
    const strip = track.current;
    if (!strip) return;
    cancelAnimationFrame(animation.current);
    const from = strip.scrollLeft;
    const distance = target - from;
    if (Math.abs(distance) < 1) return;
    const started = performance.now();
    strip.style.scrollSnapType = "none";
    const easeInOut = (share: number) => (share < 0.5 ? 4 * share * share * share : 1 - Math.pow(-2 * share + 2, 3) / 2);
    const frame = (now: number) => {
      const progress = Math.min(1, (now - started) / duration);
      strip.scrollLeft = from + distance * easeInOut(progress);
      if (progress < 1) animation.current = requestAnimationFrame(frame);
      else strip.style.scrollSnapType = "";
    };
    animation.current = requestAnimationFrame(frame);
  }, []);

  // One card forward or back; past the end it glides back to the first card.
  const step = useCallback(
    (direction: 1 | -1) => {
      const strip = track.current;
      if (!strip) return;
      const card = strip.firstElementChild as HTMLElement | null;
      const gap = parseFloat(getComputedStyle(strip).columnGap) || 0;
      const width = (card?.offsetWidth ?? strip.clientWidth) + gap;
      const max = strip.scrollWidth - strip.clientWidth;
      const current = Math.round(strip.scrollLeft / width) * width;
      if (direction === 1 && strip.scrollLeft >= max - 4) glide(0, 1100);
      else if (direction === -1 && strip.scrollLeft <= 4) glide(max, 1100);
      else glide(Math.min(max, Math.max(0, current + direction * width)), 750);
    },
    [glide],
  );

  useEffect(() => () => cancelAnimationFrame(animation.current), []);

  const byHand = (direction: 1 | -1) => {
    pausedUntil.current = Date.now() + PAUSE_AFTER_TOUCH;
    step(direction);
  };

  useEffect(() => {
    measure();
    const strip = track.current;
    if (!strip) return;
    const observer = new ResizeObserver(measure);
    observer.observe(strip);
    return () => observer.disconnect();
  }, [measure]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      if (document.hidden || Date.now() < pausedUntil.current) return;
      const strip = track.current;
      if (!strip || strip.scrollWidth <= strip.clientWidth + 4) return;
      // Only move while the row is on screen.
      const box = strip.getBoundingClientRect();
      if (box.bottom < 0 || box.top > window.innerHeight) return;
      step(1);
    }, INTERVAL);
    return () => window.clearInterval(timer);
  }, [step]);

  // A finger or trackpad takes over at once: stop any glide and give snapping back.
  const pauseByTouch = () => {
    pausedUntil.current = Date.now() + PAUSE_AFTER_TOUCH;
    cancelAnimationFrame(animation.current);
    if (track.current) track.current.style.scrollSnapType = "";
  };

  return (
    <div
      role="region"
      aria-roledescription="კარუსელი"
      aria-label={label}
      className="relative"
      onFocusCapture={pauseByTouch}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") byHand(1);
        if (event.key === "ArrowLeft") byHand(-1);
      }}
    >
      <Arrow dir="prev" onClick={() => byHand(-1)} disabled={edges.start} />
      <div
        ref={track}
        onScroll={measure}
        onPointerDown={pauseByTouch}
        onWheel={(event) => {
          // Only sideways scrolling moves the row; scrolling the page up or down over it does not pause it.
          if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) pauseByTouch();
        }}
        onTouchStart={pauseByTouch}
        className="no-scrollbar -mx-3 flex snap-x snap-mandatory scroll-px-3 gap-2.5 overflow-x-auto px-3 pt-1.5 pb-2 sm:-mx-4 sm:scroll-px-4 sm:gap-4 sm:px-4 md:mx-0 md:scroll-px-0 md:px-0"
      >
        {items.map((item, index) => (
          <div
            key={index}
            role="group"
            aria-roledescription="სლაიდი"
            aria-label={`${index + 1} / ${items.length}`}
            className={`shrink-0 snap-start ${itemClassName}`}
          >
            {item}
          </div>
        ))}
      </div>
      <Arrow dir="next" onClick={() => byHand(1)} disabled={false} />

      {page.count > 1 && (
        <div className="mt-3 flex justify-center gap-1.5" aria-hidden>
          {Array.from({ length: page.count }, (_, index) => (
            <span key={index} className={`h-1.5 rounded-full transition-all duration-300 ${index === page.index ? "w-6 bg-neon" : "w-1.5 bg-line"}`} />
          ))}
        </div>
      )}
    </div>
  );
}
