"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { formatPrice } from "@/lib/format";
import { ArrowIcon, ChevronIcon } from "./icons";

// Browsers do not capitalize Georgian, so headline letters are switched to capital Mtavruli here.
const mtavruli = (text: string) => text.replace(/[\u10D0-\u10FA\u10FD-\u10FF]/g, (c) => String.fromCharCode(c.charCodeAt(0) + 0xbc0));

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
  "flex size-9 items-center justify-center rounded-full border border-line bg-card/70 backdrop-blur transition-colors duration-200 hover:border-neon/60 hover:text-neon";
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
        <div key={part.label} className="flex min-w-[52px] flex-col items-center rounded-xl border border-neon/20 bg-card/80 px-2 py-1.5 shadow-[inset_0_1px_0_rgba(56,189,248,0.15)] backdrop-blur sm:min-w-16 sm:py-2">
          <span key={part.value} className="animate-enter-up text-xl leading-none font-extrabold tabular-nums [animation-duration:0.35s] sm:text-2xl">{String(part.value).padStart(2, "0")}</span>
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
      {/* Background: deep space, slow particles, a planet-like glow and a faint orbit behind the product. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_40%,rgba(0,110,255,0.28),transparent_55%),radial-gradient(ellipse_at_0%_100%,rgba(56,189,248,0.12),transparent_45%),linear-gradient(180deg,#050b18,#071430_60%,#050b18)]" />
        <div className="starfield absolute inset-0 opacity-70" />
        <div className="absolute -top-40 -right-40 hidden size-[640px] rounded-full bg-[radial-gradient(circle_at_30%_70%,rgba(22,139,255,0.35),rgba(8,20,38,0.9)_55%,transparent_72%)] shadow-[inset_-30px_30px_80px_rgba(56,189,248,0.25)] lg:block" />
        <div className="animate-spin-slow absolute top-1/2 right-[7%] hidden size-[560px] -translate-y-1/2 rounded-full border border-dashed border-neon/20 lg:block" />
        <div className="absolute top-1/2 right-[12%] hidden size-[440px] -translate-y-1/2 rounded-full border border-accent/20 lg:block" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-neon/60 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-bg to-transparent" />
      </div>

      <div
        key={`${active.id}-${index}`}
        role="group"
        aria-roledescription="slide"
        aria-label={`${(index % count) + 1} / ${count}`}
        className="mx-auto grid max-w-7xl items-center gap-5 px-4 pt-6 pb-20 sm:px-6 lg:min-h-[520px] lg:grid-cols-[1.05fr_1fr] lg:gap-10 lg:px-8 lg:pt-14 lg:pb-20"
      >
        <div className="order-2 min-w-0 lg:order-1">
          <div className="flex flex-wrap items-center gap-3">
            {active.discount > 0 && (
              <span className="animate-pop bg-gradient-to-r from-neon to-accent-hover bg-clip-text pr-1 text-4xl leading-none font-black text-transparent italic [animation-delay:250ms] sm:text-5xl">
                -{active.discount}%
              </span>
            )}
            {active.badge && (
              <span className="animate-enter-up flex items-center gap-1.5 rounded-full border border-neon/30 bg-accent/10 px-3 py-1 text-xs font-semibold tracking-wide text-neon [animation-delay:150ms]">
                <span aria-hidden="true" className="size-1.5 rounded-full bg-neon shadow-[0_0_8px_#38bdf8]" />
                {active.badge}
              </span>
            )}
          </div>

          <h2 className="animate-enter-left mt-4 text-[30px] leading-[1.1] font-black tracking-tight text-balance italic sm:text-5xl lg:text-[56px]">
            {mtavruli(active.title)}
          </h2>
          {active.productName && (
            <p className="animate-enter-up mt-3 text-lg font-semibold text-fg/90 [animation-delay:200ms] sm:text-xl">{active.productName}</p>
          )}
          {active.description && (
            <p className="animate-enter-up mt-2 max-w-xl text-base leading-7 text-muted [animation-delay:300ms]">{active.description}</p>
          )}

          <p className="animate-enter-up mt-5 flex items-baseline gap-3 [animation-delay:380ms]">
            <span className="text-3xl font-extrabold text-neon sm:text-4xl">{formatPrice(active.salePrice ?? active.price)}</span>
            {active.salePrice !== null && <s className="text-lg text-muted">{formatPrice(active.price)}</s>}
          </p>

          {active.endsAt && now !== null && (
            <div className="animate-enter-up mt-5 [animation-delay:460ms]">
              <p className="mb-2 text-xs font-semibold tracking-wider text-neon/90">აქცია მთავრდება</p>
              <Countdown endsAt={active.endsAt} now={now} />
            </div>
          )}

          <div className="animate-enter-up mt-7 flex flex-wrap gap-2.5 [animation-delay:540ms] sm:gap-3">
            <Link
              href={active.href}
              prefetch={false}
              className="flex h-11 items-center gap-2 rounded-full bg-gradient-to-r from-accent to-accent-hover px-5 text-[15px] font-bold text-white sm:h-12 sm:px-7 sm:text-base shadow-[0_10px_30px_-8px_rgba(0,110,255,0.9)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_36px_rgba(56,189,248,0.55)]"
            >
              {active.ctaLabel}
              <ArrowIcon />
            </Link>
            <Link
              href="/sale"
              prefetch={false}
              className="flex h-11 items-center rounded-full border border-line bg-card/60 px-5 text-[15px] font-semibold backdrop-blur sm:h-12 sm:px-6 sm:text-base transition-colors duration-200 hover:border-neon/60 hover:text-neon"
            >
              ყველა აქცია
            </Link>
          </div>
        </div>

        <Link href={active.href} prefetch={false} tabIndex={-1} aria-hidden="true" className="animate-enter-right order-1 mx-auto block w-full max-w-[220px] [animation-delay:100ms] sm:max-w-[340px] lg:order-2 lg:max-w-[480px]">
          <div className="relative aspect-square">
            <div className="absolute inset-[4%] rounded-full bg-gradient-to-br from-neon/40 via-accent/25 to-transparent blur-3xl" />
            <div className="animate-float relative h-full overflow-hidden rounded-[32px] border border-neon/25 bg-photo shadow-[0_40px_90px_-30px_rgba(0,110,255,0.75)]">
              <Image src={active.image} alt={active.productName} fill preload={index === 0} loading={index === 0 ? "eager" : undefined} sizes="(min-width: 1024px) 480px, (min-width: 640px) 340px, 220px" quality={75} className="object-contain p-6" />
            </div>
          </div>
        </Link>
      </div>

      {count > 1 && (
        <div className="absolute inset-x-0 bottom-5 flex items-center justify-center gap-3 lg:bottom-7">
          <button type="button" onClick={() => go(-1)} aria-label="წინა აქცია" className={arrow}>
            <ChevronIcon className="size-4 rotate-90" />
          </button>
          <div className="flex items-center gap-1">
            {live.map((slide, dot) => {
              const current = dot === index % count;
              return (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => setIndex(dot)}
                  aria-label={`აქცია ${dot + 1}`}
                  aria-current={current ? "true" : undefined}
                  className="group flex h-8 items-center px-0.5"
                >
                  <span className={`relative block h-1.5 overflow-hidden rounded-full bg-white/20 transition-all duration-300 ${current ? "w-10" : "w-4 group-hover:bg-white/40"}`}>
                    {current && (
                      <span
                        className="absolute inset-0 origin-left bg-gradient-to-r from-accent to-neon"
                        style={{
                          animation: autoplaying ? `progress ${AUTOPLAY_MS}ms linear both` : undefined,
                          transform: autoplaying ? undefined : "none",
                        }}
                      />
                    )}
                  </span>
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
