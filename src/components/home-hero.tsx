import Image from "next/image";
import Link from "next/link";
import hero from "../../public/hero-blue.webp";
import { ArrowIcon } from "./icons";

// Browsers do not capitalize Georgian, so headline letters are switched to capital Mtavruli here.
const mtavruli = (text: string) => text.replace(/[ა-ჺჽ-ჿ]/g, (c) => String.fromCharCode(c.charCodeAt(0) + 0xbc0));

// Shown when no promotion is active. It shares the slider's space background so the two feel like one piece.
// To change the photo, replace public/hero-blue.webp (a wide picture, about 900 x 580 or larger).
export function HomeHero() {
  return (
    <section className="relative isolate overflow-hidden border-b border-line bg-bg">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_72%_45%,rgba(0,110,255,0.3),transparent_55%),radial-gradient(ellipse_at_0%_100%,rgba(56,189,248,0.12),transparent_45%),linear-gradient(180deg,#050b18,#071430_60%,#050b18)]" />
        <div className="starfield absolute inset-0 opacity-70" />
        <div className="animate-spin-slow absolute top-1/2 right-[4%] hidden size-[620px] -translate-y-1/2 rounded-full border border-dashed border-neon/20 lg:block" />
        <div className="absolute top-1/2 right-[10%] hidden size-[480px] -translate-y-1/2 rounded-full border border-accent/20 lg:block" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-neon/60 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-bg to-transparent" />
      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 pt-8 pb-12 sm:px-6 lg:min-h-[500px] lg:grid-cols-[1.25fr_1fr] lg:gap-10 lg:px-8 lg:pt-12 lg:pb-20">
        <div className="min-w-0">
          <span className="animate-enter-up inline-flex items-center gap-2 rounded-full border border-neon/30 bg-accent/10 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-neon">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-neon shadow-[0_0_8px_#38bdf8]" />
            ყველაფერი შენი მოპედისთვის
          </span>

          <h1 className="animate-enter-left mt-5 text-[32px] leading-[1.1] font-black tracking-tight italic sm:text-5xl lg:text-[40px] xl:text-[48px]">
            <span className="block text-fg lg:whitespace-nowrap">{mtavruli("მოპედის აქსესუარები")}</span>
            <span className="block bg-gradient-to-r from-neon via-accent-hover to-neon bg-clip-text pr-2 text-transparent [filter:drop-shadow(0_0_24px_rgba(0,110,255,0.45))]">
              {mtavruli("ერთ სივრცეში!")}
            </span>
          </h1>

          <p className="animate-enter-up mt-5 max-w-md text-base leading-7 text-muted [animation-delay:150ms] sm:text-lg">
            ხარისხი, სტილი და კომფორტი ყოველ მგზავრობაში. აირჩიე შენი მოპედისთვის საჭირო ყველაფერი ერთ ადგილას.
          </p>

          <div className="animate-enter-up mt-8 flex flex-wrap gap-2.5 sm:gap-3 [animation-delay:250ms]">
            <Link
              href="#products"
              className="flex h-11 items-center gap-2 rounded-full bg-gradient-to-r from-accent to-accent-hover px-5 text-[15px] font-bold sm:h-12 sm:text-base text-white sm:px-7 shadow-[0_10px_30px_-8px_rgba(0,110,255,0.9)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_36px_rgba(56,189,248,0.55)]"
            >
              პროდუქტების ნახვა
              <ArrowIcon />
            </Link>
            <Link
              href="/sale"
              prefetch={false}
              className="flex h-11 items-center rounded-full border border-line bg-card/60 px-5 text-[15px] font-semibold sm:h-12 sm:text-base sm:px-6 backdrop-blur transition-colors duration-200 hover:border-neon/60 hover:text-neon"
            >
              აქციები
            </Link>
          </div>
        </div>

        <div className="animate-enter-right relative mx-auto w-full max-w-[620px] [animation-delay:100ms]">
          <div aria-hidden="true" className="absolute inset-[8%] rounded-full bg-gradient-to-br from-neon/35 via-accent/30 to-transparent blur-3xl" />
          <div className="animate-float relative">
            <div className="relative overflow-hidden rounded-[28px] border border-neon/25 shadow-[0_40px_90px_-30px_rgba(0,110,255,0.8)]">
              <Image
                src={hero}
                alt="მოპედი და ჩაფხუტი"
                preload
                loading="eager"
                quality={75}
                sizes="(min-width: 1024px) 620px, 100vw"
                className="aspect-[880/573] h-auto w-full object-cover"
              />
              {/* Blends the photo's edges into the dark page. */}
              <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(5,11,24,0.55))]" />
              <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-bg/80 to-transparent" />
            </div>
            <div className="absolute bottom-4 left-4 rounded-2xl border border-neon/25 bg-bg/70 px-4 py-2.5 backdrop-blur-md sm:bottom-5 sm:left-5">
              <p className="text-[11px] font-semibold tracking-[0.2em] text-neon uppercase">Scooter Land</p>
              <p className="text-sm font-semibold text-fg">Everything for your ride</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
