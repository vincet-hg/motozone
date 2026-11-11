import Form from "next/form";
import Link from "next/link";
import { site } from "@/lib/site";
import type { Category } from "@/lib/types";
import { CartLink, Disclosure, NavLink, WishlistLink } from "./header-parts";
import { CashIcon, ChevronIcon, FlameIcon, MenuIcon, PhoneIcon, SearchIcon, TruckIcon } from "./icons";
import { Logo } from "./logo";
import { SocialLinks } from "./social-links";

const navItem = "flex h-11 items-center gap-1.5 rounded-btn px-4 text-[15px] font-semibold transition-colors duration-200 hover:text-accent-hover";
const navActive = "bg-accent text-white shadow-[0_0_24px_-4px_rgba(229,9,32,0.7)] hover:bg-accent-hover hover:text-white";
const dropdownLink = "block rounded-lg px-3 py-2 text-sm text-fg transition-colors duration-200 hover:bg-line hover:text-white";
const iconSummary = "flex size-10 cursor-pointer items-center justify-center rounded-btn transition-colors duration-200 hover:text-accent-hover";

function SearchForm() {
  return (
    <Form action="/search" prefetch={false} role="search" className="flex h-12 items-center rounded-btn border border-line bg-bg focus-within:border-accent">
      <input
        name="q"
        type="search"
        placeholder="მოძებნე პროდუქტი"
        aria-label="პროდუქტის ძიება"
        className="h-full min-w-0 flex-1 bg-transparent px-4 text-base text-fg placeholder:text-muted focus:outline-none"
      />
      <button type="submit" aria-label="ძიება" className="flex size-12 shrink-0 items-center justify-center text-muted hover:text-fg">
        <SearchIcon />
      </button>
    </Form>
  );
}

export function SiteHeader({ categories }: { categories: Category[] }) {
  return (
    <>
      <div className="hidden border-b border-line bg-bg text-sm text-fg md:block">
        <div className="mx-auto flex h-11 max-w-7xl items-center gap-8 px-4">
          <span className="flex items-center gap-2">
            <TruckIcon className="size-5" />
            მიწოდება მთელ საქართველოში
          </span>
          <span className="flex items-center gap-2">
            <CashIcon className="size-5" />
            გადახდა მიტანისას
          </span>
          <a href={site.phoneHref} className="flex items-center gap-2 hover:text-accent-hover">
            <PhoneIcon className="size-5" />
            {site.phone}
          </a>
          <SocialLinks className="ml-auto -mr-2" />
        </div>
      </div>

      <header className="sticky top-0 z-30 border-b border-line bg-header">
        <div className="relative mx-auto flex h-16 max-w-7xl items-center gap-1 px-2 sm:px-4 lg:h-[76px]">
          <Disclosure
            className="lg:hidden"
            summaryLabel="მენიუ"
            summaryClassName={iconSummary}
            summary={<MenuIcon />}
          >
            <nav aria-label="მენიუ" className="absolute inset-x-0 top-full max-h-[80dvh] overflow-y-auto border-b border-line bg-header px-3 pt-2 pb-4">
              <NavLink href="/" className={dropdownLink} activeClassName="text-accent">მთავარი</NavLink>
              <NavLink href="/sale" className={dropdownLink} activeClassName="text-accent">აქციები</NavLink>
              <NavLink href="/search" className={dropdownLink} activeClassName="">ყველა პროდუქტი</NavLink>
              {categories.map((category) => (
                <Link key={category.id} href={`/category/${category.slug}`} prefetch={false} className={`${dropdownLink} pl-6 text-muted`}>
                  {category.name}
                </Link>
              ))}
              <NavLink href="/about" className={dropdownLink} activeClassName="text-accent">შესახებ</NavLink>
              <NavLink href="/contact" className={dropdownLink} activeClassName="text-accent">კონტაქტი</NavLink>
            </nav>
          </Disclosure>

          <Link href="/" prefetch={false} aria-label="MotoZone მთავარი" className="mr-auto shrink-0 px-1 text-fg lg:mr-0">
            <Logo className="h-6 w-auto lg:h-8" />
          </Link>

          <nav aria-label="მთავარი მენიუ" className="mx-auto hidden items-center gap-1 lg:flex">
            <NavLink href="/" className={navItem} activeClassName={navActive}>მთავარი</NavLink>
            <div className="group relative">
              <NavLink href="/search" className={navItem} activeClassName={navActive}>
                პროდუქტები
                <ChevronIcon className="size-4 transition-transform duration-200 group-hover:rotate-180" />
              </NavLink>
              <div className="invisible absolute top-full left-0 z-40 w-64 pt-2 opacity-0 transition-opacity duration-200 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                <div className="rounded-card border border-line bg-card p-2 shadow-2xl">
                  {categories.map((category) => (
                    <Link key={category.id} href={`/category/${category.slug}`} prefetch={false} className={dropdownLink}>
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <NavLink href="/sale" className={navItem} activeClassName={navActive}>
              აქციები
              <FlameIcon className="size-4 text-accent [[aria-current=page]_&]:text-white" />
            </NavLink>
            <NavLink href="/about" className={navItem} activeClassName={navActive}>შესახებ</NavLink>
            <NavLink href="/contact" className={navItem} activeClassName={navActive}>კონტაქტი</NavLink>
          </nav>

          <Disclosure summaryLabel="ძიება" summaryClassName={iconSummary} summary={<SearchIcon className="size-6" />}>
            <div className="absolute inset-x-0 top-full border-b border-line bg-header p-3">
              <div className="mx-auto max-w-2xl">
                <SearchForm />
              </div>
            </div>
          </Disclosure>
          <WishlistLink />
          <CartLink />
        </div>
      </header>
    </>
  );
}
