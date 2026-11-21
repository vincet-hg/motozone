import Link from "next/link";
import { site } from "@/lib/site";
import type { Category } from "@/lib/types";
import { ClockIcon, PhoneIcon, PinIcon } from "./icons";
import { Logo } from "./logo";
import { SocialLinks } from "./social-links";

const link = "text-muted transition-colors duration-200 hover:text-fg";

const LINKS = [
  { href: "/search", label: "ყველა პროდუქტი" },
  { href: "/sale", label: "აქციები" },
  { href: "/delivery", label: "მიწოდება და გატანა" },
  { href: "/returns", label: "დაბრუნება" },
  { href: "/faq", label: "ხშირი კითხვები" },
  { href: "/contact", label: "კონტაქტი" },
];

// Footer, kept to what a buyer needs: who we are, the main pages, how to reach us; then the legal line.
// Categories live in the header. Every detail comes from src/lib/site.ts.
export function SiteFooter({ categories: _categories }: { categories: Category[] }) {
  return (
    <footer className="mt-16 border-t border-line bg-section text-sm">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 md:grid-cols-[1.2fr_1fr_1fr] md:gap-12">
        <div>
          <Logo className="h-14 w-auto" sizes="143px" />
          <p className="mt-3 max-w-xs leading-6 text-muted">მოპედისა და სკუტერის აქსესუარები თბილისში. გადახდა მიღებისას.</p>
          <SocialLinks className="mt-3 -ml-2" />
        </div>

        <nav aria-label="საიტის გვერდები" className="grid grid-cols-2 content-start gap-x-6 gap-y-2.5">
          {LINKS.map((item) => (
            <Link key={item.href} href={item.href} prefetch={false} className={link}>
              {item.label}
            </Link>
          ))}
        </nav>

        <ul className="space-y-3 text-muted">
          <li>
            <a href={site.phoneHref} className="flex items-center gap-2.5 text-base font-bold whitespace-nowrap text-fg transition-colors hover:text-neon">
              <PhoneIcon className="size-4 shrink-0 text-neon" />
              {site.phone}
            </a>
          </li>
          <li className="flex items-center gap-2.5">
            <ClockIcon className="size-4 shrink-0 text-neon" />
            {site.hours}
          </li>
          <li>
            <a href={site.pickup.mapUrl} target="_blank" rel="noopener" className="flex items-center gap-2.5 transition-colors hover:text-fg">
              <PinIcon className="size-4 shrink-0 text-neon" />
              {site.pickup.address}
            </a>
          </li>
        </ul>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-muted sm:flex-row">
          <span>
            © {new Date().getFullYear()} {site.legalName || site.name}
            {site.taxId && <> · ს/კ {site.taxId}</>}
          </span>
          <span className="flex gap-4">
            <Link href="/privacy" prefetch={false} className="transition-colors hover:text-fg">კონფიდენციალურობა</Link>
            <Link href="/terms" prefetch={false} className="transition-colors hover:text-fg">პირობები</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
