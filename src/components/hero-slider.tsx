"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { formatPrice } from "@/lib/format";
import { ArrowIcon, ChevronIcon } from "./icons";

export type Slide = {
  id: string;
  title: string;
  description: string;
  badge: string;
  ctaLabel: string;
  endsAt: string | null;
  href: string;
  image: string;
  productName: string;
  price: number;
  salePrice: number | null;
  discount: number;
};

const AUTOPLAY_MS = 7000;
const arrow =
  "flex size-9 items-center justify-center rounded-full border border-line bg-card/70 backdrop-blur transition-colors duration-200 hover:border-accent hover:text-accent-hover";
const SWIPE_PX = 50;

// Remaining time until `endsAt`, from the real clock: a refresh never restarts it.
function remaining(endsAt: string, now: number) {
  const total = Math.max(0, Date.parse(endsAt) - now);
  return {
    total,
    days: Math.floor(total / 86400000),
    hours: Math.floor(total / 3600000) % 24,
    minutes: Math.floor(total / 60000) % 60,
    seconds: Math.floor(total / 1000) % 60,
  };
}

function Countdown({ endsAt, now }: { endsAt: string; now: number }) {
  const left = remaining(endsAt, now);
  const parts = [
    { value: left.days, label: "დღე" },
    { value: left.hours, label: "საათი" },
    { value: left.minutes, label: "წუთი" },
    { value: left.seconds, label: "წამი" },
  ];
  return (
    <div className="flex items-center gap-2 sm:gap-3" role="timer" aria-label={`აქცია მთავრდება ${left.days} დღეში, ${left.hours} საათში`}>
      {parts.map((part) => (
        <div key={part.label} className="flex min-w-[52px] flex-col items-center rounded-xl border border-line bg-card/80 px-2 py-1.5 backdrop-blur sm:min-w-16 sm:py-2">
          <span className="text-xl leading-none font-extrabold tabular-nums sm:text-2xl">{String(part.value).padStart(2, "0")}</span>
          <span className="mt-1 text-[11px] text-muted">{part.label}</span>
        </div>
      ))}
    </div>
  );
}

export function HeroSlider({ slides, fallback }: { slides: Slide[]; fallback: React.ReactNode }) {
  // The clock starts after the page loads, so the server and the browser render the same HTML.
  const [now, setNow] = useState<number | null>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const pointerX = useRef<number | null>(null);

  const live = now === null ? slides : slides.filter((slide) => !slide.endsAt || Date.parse(slide.endsAt) > now);
  const count = live.length;
  const active = count > 0 ? live[index % count] : null;
  const ticking = slides.some((slide) => slide.endsAt);

  useEffect(() => {
    setNow(Date.now());
    if (!ticking) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [ticking]);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const go = useCallback((step: number) => setIndex((current) => (count ? (current + step + count) % count : 0)), [count]);

  useEffect(() => {
    if (paused || reducedMotion || count < 2) return;
    const timer = setTimeout(() => go(1), AUTOPLAY_MS);
    return () => clearTimeout(timer);
  }, [index, paused, reducedMotion, count, go]);

  if (!active) return <>{fallback}</>;

  const autoplaying = !paused && !reducedMotion && count > 1;

  return (
    <section
      aria-roledescription="carousel"
      aria-label="აქციები"
      className="relative isolate overflow-hidden border-b border-line bg-bg"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") go(-1);
        if (event.key === "ArrowRight") go(1);
      }}
      onPointerDown={(event) => {
        pointerX.current = event.clientX;
      }}
      onPointerUp={(event) => {
        if (pointerX.current === null) return;
        const moved = event.clientX - pointerX.current;
        pointerX.current = null;
        if (Math.abs(moved) > SWIPE_PX) go(moved < 0 ? 1 : -1);
      }}
      style={{ touchAction: "pan-y" }}
    >
      {/* Background: red light and slow diagonal strokes. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_75%_45%,rgba(225,29,72,0.22),transparent_55%),radial-gradient(ellipse_at_10%_100%,rgba(225,29,72,0.12),transparent_50%)]" />
        <div className="animate-glow absolute top-1/2 right-[8%] size-[420px] -translate-y-1/2 rounded-full bg-accent/25 blur-[120px] lg:size-[560px]" />
        <span className="animate-drift absolute -top-24 left-[42%] h-[140%] w-px bg-gradient-to-b from-transparent via-accent/50 to-transparent" />
        <span className="animate-drift absolute -top-24 left-[46%] h-[140%] w-[3px] bg-gradient-to-b from-transparent via-accent/30 to-transparent [animation-delay:-5s]" />
        <span className="animate-drift absolute -top-24 right-[4%] hidden h-[140%] w-[2px] bg-gradient-to-b from-transparent via-accent-hover/40 to-transparent [animation-delay:-9s] lg:block" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-bg to-transparent" />
      </div>

      <div
        key={`${active.id}-${index}`}
        role="group"
        aria-roledescription="slide"
        aria-label={`${(index % count) + 1} / ${count}`}
        className="mx-auto grid max-w-7xl items-center gap-5 px-4 pt-6 pb-20 sm:px-6 lg:min-h-[520px] lg:grid-cols-[1.05fr_1fr] lg:gap-10 lg:px-8 lg:py-14"
      >
        <div className="order-2 min-w-0 lg:order-1">
          <div className="flex flex-wrap items-center gap-3">
            {active.discount > 0 && (
              <span className="animate-pop rounded-xl bg-accent px-3 py-1.5 text-2xl leading-none font-black text-white shadow-[0_10px_30px_-8px_rgba(225,29,72,0.9)] [animation-delay:250ms] sm:text-3xl">
                -{active.discount}%
              </span>
            )}
            {active.badge && (
              <span className="animate-enter-up rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-semibold tracking-wide text-accent-hover uppercase [animation-delay:150ms]">
                {active.badge}
              </span>
            )}
          </div>

          <h2 className="animate-enter-left mt-4 text-[32px] leading-[1.1] font-black tracking-tight text-balance sm:text-5xl lg:text-[58px]">
            {active.title}
          </h2>
          <p className="animate-enter-up mt-3 text-lg font-semibold text-fg/90 [animation-delay:200ms] sm:text-xl">{active.productName}</p>
          {active.description && (
            <p className="animate-enter-up mt-2 max-w-xl text-base leading-7 text-muted [animation-delay:300ms]">{active.description}</p>
          )}

          <p className="animate-enter-up mt-5 flex items-baseline gap-3 [animation-delay:380ms]">
            <span className="text-3xl font-extrabold text-accent-hover sm:text-4xl">{formatPrice(active.salePrice ?? active.price)}</span>
            {active.salePrice !== null && <s className="text-lg text-muted">{formatPrice(active.price)}</s>}
          </p>

          {active.endsAt && now !== null && (
            <div className="animate-enter-up mt-5 [animation-delay:460ms]">
              <p className="mb-2 text-sm font-medium text-muted">აქცია მთავრდება:</p>
              <Countdown endsAt={active.endsAt} now={now} />
            </div>
          )}

          <div className="animate-enter-up mt-7 flex flex-wrap gap-3 [animation-delay:540ms]">
            <Link
              href={active.href}
              prefetch={false}
              className="flex h-12 items-center gap-2 rounded-btn bg-accent px-6 font-bold text-white shadow-[0_10px_30px_-8px_rgba(225,29,72,0.8)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent-hover"
            >
              {active.ctaLabel}
              <ArrowIcon />
            </Link>
            <Link
              href="/sale"
              prefetch={false}
              className="flex h-12 items-center rounded-btn border border-line bg-card/60 px-6 font-semibold backdrop-blur transition-colors duration-200 hover:border-accent/60"
            >
              ყველა აქცია
            </Link>
          </div>
        </div>

        <Link href={active.href} prefetch={false} tabIndex={-1} aria-hidden="true" className="animate-enter-right order-1 mx-auto block w-full max-w-[220px] [animation-delay:100ms] sm:max-w-[340px] lg:order-2 lg:max-w-[480px]">
          <div className="relative aspect-square">
            <div className="absolute inset-[6%] rounded-full bg-gradient-to-br from-accent/40 via-accent/10 to-transparent blur-2xl" />
            <div className="relative h-full overflow-hidden rounded-[32px] border border-white/10 bg-photo shadow-[0_40px_80px_-30px_rgba(0,0,0,0.9)]">
              <Image src={active.image} alt={active.productName} fill preload={index === 0} loading={index === 0 ? "eager" : undefined} sizes="(min-width: 1024px) 480px, (min-width: 640px) 340px, 220px" quality={75} className="object-contain p-6" />
            </div>
          </div>
        </Link>
      </div>

      {count > 1 && (
        <div className="absolute inset-x-0 bottom-5 flex items-center justify-center gap-3">
          <button type="button" onClick={() => go(-1)} aria-label="წინა აქცია" className={arrow}>
            <ChevronIcon className="size-4 rotate-90" />
          </button>
          <div className="flex items-center gap-2">
            {live.map((slide, dot) => {
              const current = dot === index % count;
              return (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => setIndex(dot)}
                  aria-label={`აქცია ${dot + 1}`}
                  aria-current={current ? "true" : undefined}
                  className={`relative h-1.5 overflow-hidden rounded-full bg-white/20 transition-all duration-300 ${current ? "w-10" : "w-4 hover:bg-white/40"}`}
                >
                  {current && (
                    <span
                      className="absolute inset-0 origin-left bg-accent"
                      style={{
                        animation: autoplaying ? `progress ${AUTOPLAY_MS}ms linear both` : undefined,
                        transform: autoplaying ? undefined : "none",
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
          <button type="button" onClick={() => go(1)} aria-label="შემდეგი აქცია" className={arrow}>
            <ChevronIcon className="size-4 -rotate-90" />
          </button>
        </div>
      )}
    </section>
  );
}
