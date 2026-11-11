import Image from "next/image";
import Link from "next/link";
import hero from "../../public/hero.webp";
import { ArrowIcon } from "./icons";

// Browsers do not capitalize Georgian, so headline letters are switched to capital Mtavruli here.
const mtavruli = (text: string) => text.replace(/[\u10D0-\u10FA\u10FD-\u10FF]/g, (c) => String.fromCharCode(c.charCodeAt(0) + 0xbc0));

// To change the photo, replace public/hero.webp (a wide picture, about 1600 x 900).
export function HomeHero() {
  return (
    <section className="relative isolate overflow-hidden border-b border-line bg-bg">
      <Image
        src={hero}
        alt=""
        preload
        quality={75}
        sizes="(min-width: 1024px) 72vw, 100vw"
        className="absolute inset-y-0 right-0 -z-10 h-full w-full object-cover object-[70%_center] lg:w-[66%] lg:object-center lg:[mask-image:linear-gradient(to_right,transparent,black_35%)]"
      />
      {/* Darkens the left side so the headline stays readable. */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-bg via-bg/85 to-bg/10 lg:via-bg/60 lg:to-transparent" />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 -z-10 h-16 bg-gradient-to-t from-bg to-transparent" />

      {/* Red diagonal strokes. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <span className="absolute -top-10 left-[-40px] h-72 w-1.5 rotate-[35deg] bg-accent opacity-80 shadow-[0_0_24px_rgba(229,9,32,0.8)]" />
        <span className="absolute -bottom-16 left-[2%] h-64 w-1 rotate-[35deg] bg-accent/70" />
        <span className="absolute -top-8 right-[6%] hidden h-[130%] w-3 rotate-[35deg] bg-accent/80 shadow-[0_0_30px_rgba(229,9,32,0.6)] lg:block" />
        <span className="absolute -top-8 right-[3%] hidden h-[130%] w-1 rotate-[35deg] bg-accent/60 lg:block" />
      </div>

      <div className="mx-auto flex min-h-[260px] max-w-7xl flex-col justify-center px-4 py-8 sm:min-h-[320px] lg:min-h-[390px] lg:px-16">
        <h1 className="max-w-[14ch] text-[26px] leading-[1.2] font-extrabold italic sm:max-w-none sm:text-4xl lg:text-[50px]">
          <span className="block text-fg">{mtavruli("მოპედის აქსესუარები")}</span>
          <span className="block text-accent [text-shadow:0_0_28px_rgba(229,9,32,0.45)]">{mtavruli("ერთ სივრცეში!")}</span>
        </h1>
        <p className="mt-3 text-base text-fg/90 sm:text-xl">ხარისხი, სტილი, კომფორტი</p>
        <Link
          href="#products"
          className="mt-6 flex h-12 w-fit items-center gap-2 rounded-btn bg-accent px-6 font-bold text-white shadow-[0_8px_30px_-6px_rgba(229,9,32,0.7)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent-hover"
        >
          პროდუქტების ნახვა
          <ArrowIcon />
        </Link>
      </div>
    </section>
  );
}
