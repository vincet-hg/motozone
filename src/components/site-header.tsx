import Form from "next/form";
import Link from "next/link";
import { site } from "@/lib/site";
import type { Category } from "@/lib/types";
import { ActiveButton, CartLink, Disclosure, NavLink, WishlistLink } from "./header-parts";
import { ArrowIcon, CashIcon, ChevronIcon, MenuIcon, PhoneIcon, SearchIcon, TruckIcon } from "./icons";
import { Logo } from "./logo";
import { SocialLinks } from "./social-links";
import { iconButton } from "./styles";

// Desktop links sit on the header's bottom edge; the current page gets a glowing neon underline there.
const navItem =
  "relative flex h-full items-center gap-1 px-3 whitespace-nowrap text-[14px] font-semibold text-fg/75 transition-colors duration-200 hover:text-white xl:px-4 " +
  "after:absolute after:inset-x-3 after:bottom-0 after:h-[3px] after:origin-center after:scale-x-0 after:rounded-t-full after:bg-gradient-to-r after:from-accent after:to-neon after:transition-transform after:duration-300 hover:after:scale-x-100 xl:after:inset-x-4";
const navActive = "text-white after:scale-x-100 after:shadow-[0_0_14px_2px_rgba(56,189,248,0.7)]";
// Category in the desktop dropdown: lit on hover, and kept lit (border, tint, dot, arrow) on its own page.
const dropdownItem =
  "group/item flex items-center justify-between gap-2 rounded-xl border border-transparent px-3.5 py-3 text-sm text-fg/80 transition-all duration-200 hover:border-line hover:bg-card-hover hover:text-white aria-[current=page]:border-neon/35 aria-[current=page]:bg-accent/15 aria-[current=page]:font-semibold aria-[current=page]:text-white";
const mobileLink = "flex items-center justify-between rounded-xl px-3 py-2.5 text-[15px] font-medium text-fg/90 transition-colors duration-200 hover:bg-card hover:text-white";

const LINKS = [
  { href: "/search", label: "პროდუქტები" },
  { href: "/sale", label: "აქციები" },
  { href: "/about", label: "შესახებ" },
  { href: "/contact", label: "კონტაქტი" },
];

// The phone menu also lists the FAQ, which the desktop menu keeps in the service bar and footer.
const MOBILE_LINKS = [...LINKS, { href: "/faq", label: "ხშირი კითხვები" }];

function SearchForm({ className = "", autoFocus = false }: { className?: string; autoFocus?: boolean }) {
  return (
    <Form
      action="/search"
      prefetch={false}
      role="search"
      className={`group/search flex h-11 items-center rounded-xl border border-line bg-card/50 pr-1 transition-all duration-200 focus-within:border-neon/60 focus-within:bg-card focus-within:shadow-[0_0_0_3px_rgba(0,110,255,0.18)] ${className}`}
    >
      <SearchIcon className="ml-3.5 size-[18px] shrink-0 text-muted transition-colors group-focus-within/search:text-neon" />
      <input
        name="q"
        type="search"
        autoComplete="off"
        placeholder="რას ეძებ?"
        aria-label="პროდუქტის ძიება"
        autoFocus={autoFocus}
        className="h-full min-w-0 flex-1 bg-transparent px-3 text-[15px] text-fg placeholder:text-muted focus:outline-none focus-visible:outline-none"
      />
      <button
        type="submit"
        aria-label="ძებნა"
        className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent-hover text-white shadow-[0_0_14px_-4px_rgba(0,110,255,0.9)] transition-transform duration-200 hover:scale-105"
      >
        <ArrowIcon className="size-4" />
      </button>
    </Form>
  );
}

function Dot() {
  return <span aria-hidden className="size-1 rounded-full bg-neon/50" />;
}

export function SiteHeader({ categories }: { categories: Category[] }) {
  return (
    <>
      {/* Service bar. Keep these promises true for your shop (see src/lib/site.ts). */}
      <div className="relative border-b border-line bg-[linear-gradient(90deg,#050b18_0%,#0a1d3a_50%,#050b18_100%)] text-[13px] text-fg/80">
        <div className="mx-auto flex h-9 max-w-7xl items-center justify-center gap-4 px-4 whitespace-nowrap sm:justify-start lg:gap-5">
          <span className="flex items-center gap-2">
            <TruckIcon className="size-4 text-neon" />
            {site.deliveryShort}
          </span>
          <span className="hidden items-center gap-4 sm:flex lg:gap-5">
            <Dot />
            <span className="flex items-center gap-2">
              <CashIcon className="size-4 text-neon" />
              {site.paymentShort}
            </span>
          </span>
          <div className="ml-auto hidden items-center gap-4 md:flex lg:gap-5">
            <Link href="/faq" prefetch={false} className="hidden transition-colors hover:text-neon xl:block">ხშირი კითხვები</Link>
            <span className="hidden xl:contents"><Dot /></span>
            <a href={site.phoneHref} className="flex items-center gap-2 font-semibold text-fg transition-colors hover:text-neon">
              <PhoneIcon className="size-4 text-neon" />
              {site.phone}
            </a>
            <div className="hidden lg:block"><SocialLinks className="-mr-2" /></div>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-30 bg-bg/80 shadow-[0_18px_40px_-28px_rgba(0,110,255,0.75)] backdrop-blur-xl">
        {/* Neon hairline along the bottom edge. */}
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-neon/45 to-transparent" />

        <div className="relative mx-auto flex h-16 max-w-7xl items-center gap-1.5 px-2.5 min-[360px]:gap-2 sm:px-4 lg:h-[76px] lg:gap-3">
          <Disclosure className="lg:hidden" summaryLabel="მენიუ" summaryClassName={`${iconButton}`} summary={<MenuIcon className="size-5" />}>
            <nav aria-label="მენიუ" className="absolute inset-x-0 top-full max-h-[80dvh] overflow-y-auto border-y border-line bg-bg px-3 pt-3 pb-5 shadow-[0_24px_48px_-16px_rgba(0,0,0,0.9)] backdrop-blur-xl">
              <NavLink href="/" className={mobileLink} activeClassName="bg-card text-neon">მთავარი</NavLink>
              <p className="px-3 pt-4 pb-1.5 text-xs font-semibold tracking-wide text-muted uppercase">კატეგორიები</p>
              <div className="grid grid-cols-2 gap-1.5">
                {categories.map((category) => (
                  <NavLink
                    key={category.id}
                    href={`/category/${category.slug}`}
                    activeClassName=""
                    className="rounded-xl border border-line bg-card/50 px-3 py-2.5 text-sm text-fg/90 transition-colors hover:border-neon/40 hover:text-white aria-[current=page]:border-neon/50 aria-[current=page]:bg-accent/15 aria-[current=page]:font-semibold aria-[current=page]:text-white"
                  >
                    {category.name}
                  </NavLink>
                ))}
              </div>
              <div className="mt-3 border-t border-line pt-2">
                {MOBILE_LINKS.map((link) => (
                  <NavLink key={link.href} href={link.href} className={mobileLink} activeClassName="bg-card text-neon">
                    {link.label}
                    <ChevronIcon className="size-4 -rotate-90 text-muted" />
                  </NavLink>
                ))}
              </div>
              <a href={site.phoneHref} className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent to-accent-hover py-3 font-semibold text-white">
                <PhoneIcon className="size-5" />
                {site.phone}
              </a>
            </nav>
          </Disclosure>

          <Link href="/" prefetch={false} aria-label="Scooter Land მთავარი" className="mx-auto shrink-0 lg:mx-0 lg:mr-2">
            <Logo className="h-10 w-auto min-[360px]:h-12 drop-shadow-[0_0_14px_rgba(0,110,255,0.35)] lg:h-14" sizes="(min-width: 1024px) 143px, 123px" />
          </Link>

          <nav aria-label="მთავარი მენიუ" className="hidden h-full items-stretch lg:flex">
            <NavLink href="/" className={navItem} activeClassName={navActive}>მთავარი</NavLink>
            <div className="group relative flex">
              <ActiveButton prefix="/category/" className={`${navItem} cursor-pointer`} activeClassName={navActive}>
                კატეგორიები
                <ChevronIcon className="size-4 text-neon transition-transform duration-200 group-focus-within:rotate-180 group-hover:rotate-180" />
              </ActiveButton>
              <div className="invisible absolute top-full left-0 z-40 w-[520px] translate-y-2 pt-3 opacity-0 transition-all duration-200 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                <div className="overflow-hidden rounded-2xl border border-neon/20 bg-card shadow-[0_30px_60px_-20px_rgba(0,0,0,0.9),0_0_40px_-20px_rgba(0,110,255,0.6)]">
                  <div className="h-0.5 bg-gradient-to-r from-accent via-neon to-accent" />
                  <div className="grid grid-cols-2 gap-1.5 p-3">
                    {categories.map((category) => (
                      <NavLink
                        key={category.id}
                        href={`/category/${category.slug}`}
                        activeClassName=""
                        className={dropdownItem}
                      >
                        <span className="flex items-center gap-2.5">
                          <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-muted/50 transition-colors duration-200 group-hover/item:bg-neon group-aria-[current=page]/item:bg-neon group-aria-[current=page]/item:shadow-[0_0_8px_#38bdf8]" />
                          {category.name}
                        </span>
                        <ArrowIcon className="size-3.5 shrink-0 -translate-x-1 text-neon opacity-0 transition-all duration-200 group-hover/item:translate-x-0 group-hover/item:opacity-100 group-aria-[current=page]/item:translate-x-0 group-aria-[current=page]/item:opacity-100" />
                      </NavLink>
                    ))}
                  </div>
                  <Link
                    href="/search"
                    prefetch={false}
                    className="group/all flex items-center justify-between border-t border-line bg-section px-6 py-3.5 text-sm font-semibold text-neon transition-colors hover:bg-card-hover hover:text-white"
                  >
                    ყველა პროდუქტი
                    <ArrowIcon className="size-4 transition-transform duration-200 group-hover/all:translate-x-1" />
                  </Link>
                </div>
              </div>
            </div>
            {LINKS.map((link) => (
              <NavLink key={link.href} href={link.href} className={navItem} activeClassName={navActive}>
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-1.5 min-[360px]:gap-2 lg:ml-auto">
            <SearchForm className="hidden w-[250px] xl:flex" />
            <Disclosure className="xl:hidden" summaryLabel="ძიება" summaryClassName={`${iconButton}`} summary={<SearchIcon className="size-5" />}>
              <div className="absolute inset-x-0 top-full border-y border-line bg-bg p-3">
                <SearchForm className="mx-auto max-w-2xl" autoFocus />
              </div>
            </Disclosure>
            <WishlistLink />
            <CartLink />
          </div>
        </div>
      </header>
    </>
  );
}
