import Link from "next/link";
import { site } from "@/lib/site";
import type { Category } from "@/lib/types";
import { CashIcon, ClockIcon, MailIcon, PhoneIcon, PinIcon, TruckIcon } from "./icons";
import { Logo } from "./logo";
import { SocialLinks } from "./social-links";

const heading = "text-sm font-bold tracking-wide text-fg";
const link = "block py-1.5 text-muted transition-colors duration-200 hover:text-fg";
const contactRow = "flex items-start gap-2.5";
const contactIcon = "mt-0.5 size-4 shrink-0 text-neon";

// Footer: brand, shop links, categories, buyer help, contacts; then the legal line.
// Every detail comes from src/lib/site.ts.
export function SiteFooter({ categories }: { categories: Category[] }) {
  return (
    <footer className="mt-16 border-t border-line bg-section text-sm">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-10 px-4 py-12 md:grid-cols-3 lg:grid-cols-[1.3fr_0.9fr_1fr_0.9fr_1.4fr]">
        <div className="col-span-2 md:col-span-3 lg:col-span-1">
          <Logo className="h-16 w-auto" sizes="164px" />
          <p className="mt-4 max-w-xs leading-6 text-muted">
            მოპედისა და სკუტერის აქსესუარები თბილისში. შეუკვეთე ონლაინ, გადაიხადე მიღებისას.
          </p>
          <SocialLinks className="mt-4 -ml-2" />
        </div>

        <nav aria-labelledby="footer-shop">
          <h2 id="footer-shop" className={heading}>მაღაზია</h2>
          <div className="mt-3">
            <Link href="/search" prefetch={false} className={link}>ყველა პროდუქტი</Link>
            <Link href="/sale" prefetch={false} className={link}>აქციები</Link>
            <Link href="/wishlist" prefetch={false} className={link}>ფავორიტები</Link>
            <Link href="/about" prefetch={false} className={link}>ჩვენ შესახებ</Link>
            <Link href="/contact" prefetch={false} className={link}>კონტაქტი</Link>
          </div>
        </nav>

        <nav aria-labelledby="footer-categories">
          <h2 id="footer-categories" className={heading}>კატეგორიები</h2>
          <div className="mt-3">
            {categories.map((category) => (
              <Link key={category.id} href={`/category/${category.slug}`} prefetch={false} className={link}>
                {category.name}
              </Link>
            ))}
          </div>
        </nav>

        <nav aria-labelledby="footer-help">
          <h2 id="footer-help" className={heading}>მყიდველისთვის</h2>
          <div className="mt-3">
            <Link href="/delivery" prefetch={false} className={link}>მიწოდება და გატანა</Link>
            <Link href="/returns" prefetch={false} className={link}>დაბრუნება</Link>
            <Link href="/faq" prefetch={false} className={link}>ხშირი კითხვები</Link>
          </div>
        </nav>

        <div className="col-span-2 md:col-span-1">
          <h2 className={heading}>კონტაქტი</h2>
          <ul className="mt-3 space-y-3 text-muted">
            <li>
              <a href={site.phoneHref} className="flex items-center gap-2.5 text-base font-bold whitespace-nowrap text-fg transition-colors hover:text-neon">
                <PhoneIcon className="size-4 shrink-0 text-neon" />
                {site.phone}
              </a>
            </li>
            <li className={contactRow}>
              <ClockIcon className={contactIcon} />
              <span>
                შეკვეთები და კონსულტაცია: <span className="text-fg/90">{site.hours}</span>
              </span>
            </li>
            <li>
              <a href={site.pickup.mapUrl} target="_blank" rel="noopener" className={`${contactRow} transition-colors hover:text-fg`}>
                <PinIcon className={contactIcon} />
                <span>
                  გატანა: {site.pickup.address}
                  <span className="block text-xs">ყოველდღე {site.pickup.hours} · რუკაზე ნახვა ↗</span>
                </span>
              </a>
            </li>
            <li>
              <a href={`mailto:${site.email}`} className="flex items-center gap-2.5 [overflow-wrap:anywhere] transition-colors hover:text-fg">
                <MailIcon className="size-4 shrink-0 text-neon" />
                {site.email}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-center text-xs text-muted lg:flex-row lg:text-left">
          <p className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <span>
              © {new Date().getFullYear()} {site.legalName || site.name}
              {site.taxId && <> · ს/კ {site.taxId}</>}
            </span>
            <Link href="/privacy" prefetch={false} className="transition-colors hover:text-fg">კონფიდენციალურობა</Link>
            <Link href="/terms" prefetch={false} className="transition-colors hover:text-fg">მომსახურების პირობები</Link>
          </p>
          <p className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <span className="flex items-center gap-1.5">
              <TruckIcon className="size-4 text-neon" />
              {site.deliveryShort}
            </span>
            <span className="flex items-center gap-1.5">
              <CashIcon className="size-4 text-neon" />
              {site.paymentShort}
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
