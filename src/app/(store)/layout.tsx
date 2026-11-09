import Form from "next/form";
import Link from "next/link";
import { CartLink } from "@/components/cart-link";
import { SearchIcon } from "@/components/icons";
import { Logo } from "@/components/logo";
import { isDemo } from "@/lib/demo";
import { site } from "@/lib/site";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {isDemo && (
        <p className="bg-accent px-3 py-1 text-center text-sm font-medium">დემო რეჟიმი: სატესტო მონაცემები, ინახება მხოლოდ ამ კომპიუტერში</p>
      )}
      <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-3 sm:gap-6 sm:px-4">
          <Link href="/" prefetch={false} aria-label="MotoZone მთავარი" className="shrink-0">
            <Logo className="h-4.5 w-auto sm:h-6" />
          </Link>
          <Form action="/search" prefetch={false} role="search" className="flex h-10 min-w-0 flex-1 items-center rounded bg-neutral-100 sm:mx-auto sm:max-w-xl">
            <input
              name="q"
              type="search"
              placeholder="მოძებნე პროდუქტი"
              aria-label="პროდუქტის ძიება"
              className="h-full min-w-0 flex-1 bg-transparent px-3 text-base outline-offset-0 sm:text-sm"
            />
            <button type="submit" aria-label="ძიება" className="flex size-10 shrink-0 items-center justify-center">
              <SearchIcon />
            </button>
          </Form>
          <CartLink />
        </div>
      </header>

      <div className="flex-1">{children}</div>

      <footer className="mt-10 border-t border-neutral-200 bg-neutral-100 text-sm">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-3 py-8 sm:grid-cols-3 sm:px-4">
          <div>
            <h2 className="font-bold">კონტაქტი</h2>
            <a href={site.phoneHref} className="mt-2 block py-1 hover:underline">
              {site.phone}
            </a>
          </div>
          <div>
            <h2 className="font-bold">ინფორმაცია</h2>
            <Link href="/delivery" prefetch={false} className="mt-2 block py-1 hover:underline">
              მიწოდება
            </Link>
            <Link href="/returns" prefetch={false} className="block py-1 hover:underline">
              დაბრუნების პირობები
            </Link>
          </div>
          <div>
            <h2 className="font-bold">გამოგვყევი</h2>
            <a href={site.facebook} rel="noopener" className="mt-2 block py-1 hover:underline">
              Facebook
            </a>
            <a href={site.instagram} rel="noopener" className="block py-1 hover:underline">
              Instagram
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
