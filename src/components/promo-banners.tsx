import Link from "next/link";
import { site } from "@/lib/site";
import { ArrowIcon, HeadsetIcon, TruckIcon } from "./icons";

const card =
  "group relative isolate flex min-h-44 flex-col items-start gap-4 overflow-hidden rounded-card border border-line bg-card p-5 min-[420px]:flex-row min-[420px]:items-center min-[420px]:gap-5 min-[420px]:p-6 transition-all duration-300 hover:border-neon/45 sm:p-8";
const glow = "absolute -right-16 -bottom-24 -z-10 size-72 rounded-full bg-accent/30 blur-3xl transition-opacity duration-300 group-hover:opacity-100 opacity-70";
const iconBox =
  "flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-neon to-accent text-white shadow-[0_12px_30px_-10px_rgba(225,29,72,0.9)] min-[420px]:size-16 sm:size-20";

// Two service banners. Their text lives in src/lib/site.ts, so every promise stays editable in one place.
export function PromoBanners() {
  return (
    <section aria-label="მომსახურება" className="reveal mt-12 grid gap-4 md:grid-cols-2">
      <Link href="/delivery" prefetch={false} className={card}>
        <span aria-hidden="true" className={glow} />
        <span aria-hidden="true" className={iconBox}>
          <TruckIcon className="size-8 sm:size-10" />
        </span>
        <span className="min-w-0">
          <span className="block text-lg font-extrabold sm:text-xl">{site.deliveryBanner.title}</span>
          <span className="mt-1.5 block text-sm leading-6 text-muted">{site.deliveryBanner.text}</span>
          <span className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-neon">
            მიწოდების პირობები
            <ArrowIcon className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </span>
      </Link>
      <a href={site.phoneHref} className={card}>
        <span aria-hidden="true" className={glow} />
        <span aria-hidden="true" className={iconBox}>
          <HeadsetIcon className="size-8 sm:size-10" />
        </span>
        <span className="min-w-0">
          <span className="block text-lg font-extrabold sm:text-xl">{site.supportBanner.title}</span>
          <span className="mt-1.5 block text-sm leading-6 text-muted">{site.supportBanner.text}</span>
          <span className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-neon">
            {site.phone}
            <ArrowIcon className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </span>
      </a>
    </section>
  );
}
