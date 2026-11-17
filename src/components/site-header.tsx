import Form from "next/form";
import Link from "next/link";
import { site } from "@/lib/site";
import type { Category } from "@/lib/types";
import { CartLink, Disclosure, NavLink, WishlistLink } from "./header-parts";
import { CashIcon, ChevronIcon, MenuIcon, PhoneIcon, SearchIcon, TruckIcon } from "./icons";
import { Logo } from "./logo";
import { SocialLinks } from "./social-links";

// The current page gets a blue pill.
const navItem =
  "flex h-9 items-center gap-1 rounded-full px-3 whitespace-nowrap text-[14px] font-semibold text-fg/80 transition-all duration-200 hover:bg-card hover:text-fg xl:px-4";
const navActive = "bg-gradient-to-r from-accent to-accent-hover text-white shadow-[0_0_20px_-4px_rgba(0,110,255,0.9)] hover:bg-transparent hover:text-white";
const dropdownLink = "block rounded-lg px-3 py-2 text-sm text-fg/90 transition-colors duration-200 hover:bg-card-hover hover:text-white";
const mobileLink = "block rounded-lg px-3 py-2.5 text-[15px] font-medium transition-colors duration-200 hover:bg-card";
const iconSummary = "flex size-10 cursor-pointer items-center justify-center rounded-full transition-colors duration-200 hover:bg-card hover:text-neon";

const LINKS = [
  { href: "/search", label: "პროდუქტები" },
  { href: "/sale", label: "აქციები" },
  { href: "/about", label: "შესახებ" },
  { href: "/contact", label: "კონტაქტი" },
];

// The phone menu also lists the FAQ, which the desktop menu keeps in the footer.
const MOBILE_LINKS = [...LINKS, { href: "/faq", label: "ხშირი კითხვები" }];

function SearchForm({ className = "" }: { className?: string }) {
  return (
    <Form
      action="/search"
      prefetch={false}
      role="search"
      className={`flex h-10 items-center rounded-full border border-line bg-section transition-all duration-200 focus-within:border-neon/60 focus-within:shadow-[0_0_0_3px_rgba(0,110,255,0.15)] ${className}`}
    >
      <SearchIcon className="ml-3.5 size-5 shrink-0 text-muted" />
      <input
        name="q"
        type="search"
        placeholder="მოძებნე პროდუქტი"
        aria-label="პროდუქტის ძიება"
        className="h-full min-w-0 flex-1 bg-transparent px-3 text-[15px] text-fg placeholder:text-muted focus:outline-none"
      />
    </Form>
  );
}

export function SiteHeader({ categories }: { categories: Category[] }) {
  return (
    <>
      {/* Service bar. Keep these promises true for your shop (see src/lib/site.ts). */}
      <div className="border-b border-line bg-section text-[13px] text-fg/85">
        <div className="mx-auto flex h-9 max-w-7xl items-center justify-center gap-6 px-4 whitespace-nowrap sm:justify-start lg:gap-8">
          <span className="flex items-center gap-2">
            <TruckIcon className="size-4 text-neon" />
            {site.deliveryShort}
          </span>
          <span className="hidden items-center gap-2 sm:flex">
            <CashIcon className="size-4 text-neon" />
            {site.paymentShort}
          </span>
          <a href={site.phoneHref} className="hidden items-center gap-2 transition-colors hover:text-neon md:flex">
            <PhoneIcon className="size-4 text-neon" />
            {site.phone}
          </a>
          <SocialLinks className="-mr-2 ml-auto hidden md:flex" />
        </div>
      </div>

      <header className="sticky top-0 z-30 border-b border-line bg-header/85 shadow-[0_1px_0_rgba(56,189,248,0.08),0_10px_30px_-20px_rgba(0,110,255,0.6)] backdrop-blur-md">
        <div className="relative mx-auto flex h-16 max-w-7xl items-center gap-1 px-2 sm:px-4 lg:h-[72px] lg:gap-4">
          <Disclosure className="lg:hidden" summaryLabel="მენიუ" summaryClassName={iconSummary} summary={<MenuIcon />}>
            <nav aria-label="მენიუ" className="absolute inset-x-0 top-full max-h-[80dvh] overflow-y-auto border-b border-line bg-header px-3 pt-3 pb-5">
              <SearchForm className="mb-3" />
              <NavLink href="/" className={mobileLink} activeClassName="text-neon">მთავარი</NavLink>
              <p className="px-3 pt-3 pb-1 text-xs font-semibold tracking-wide text-muted uppercase">კატეგორიები</p>
              {categories.map((category) => (
                <Link key={category.id} href={`/category/${category.slug}`} prefetch={false} className={`${mobileLink} pl-6 text-fg/85`}>
                  {category.name}
                </Link>
              ))}
              <div className="mt-2 border-t border-line pt-2">
                {MOBILE_LINKS.map((link) => (
                  <NavLink key={link.href} href={link.href} className={mobileLink} activeClassName="text-neon">
                    {link.label}
                  </NavLink>
                ))}
              </div>
            </nav>
          </Disclosure>

          <Link href="/" prefetch={false} aria-label="Scooter Land მთავარი" className="mr-auto shrink-0 px-1 lg:mr-0">
            <Logo className="h-11 w-auto lg:h-[52px]" sizes="(min-width: 1024px) 133px, 112px" />
          </Link>

          <nav aria-label="მთავარი მენიუ" className="hidden items-center gap-0.5 lg:flex xl:gap-1">
            <NavLink href="/" className={navItem} activeClassName={navActive}>მთავარი</NavLink>
            <div className="group relative">
              <button type="button" aria-haspopup="true" className={navItem}>
                კატეგორიები
                <ChevronIcon className="size-4 transition-transform duration-200 group-hover:rotate-180" />
              </button>
              <div className="invisible absolute top-full left-0 z-40 w-64 pt-4 opacity-0 transition-all duration-200 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                <div className="rounded-card border border-line bg-card p-2 shadow-[0_24px_48px_-16px_rgba(0,0,0,0.8)]">
                  {categories.map((category) => (
                    <Link key={category.id} href={`/category/${category.slug}`} prefetch={false} className={dropdownLink}>
                      {category.name}
                    </Link>
                  ))}
                  <Link href="/search" prefetch={false} className={`${dropdownLink} mt-1 border-t border-line pt-2.5 font-semibold text-neon`}>
                    ყველა პროდუქტი
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

          <SearchForm className="ml-auto hidden w-full max-w-[220px] lg:flex xl:max-w-[280px]" />

          <Disclosure className="lg:hidden" summaryLabel="ძიება" summaryClassName={iconSummary} summary={<SearchIcon className="size-6" />}>
            <div className="absolute inset-x-0 top-full border-b border-line bg-header p-3">
              <SearchForm />
            </div>
          </Disclosure>
          <WishlistLink />
          <CartLink />
        </div>
      </header>
    </>
  );
}
