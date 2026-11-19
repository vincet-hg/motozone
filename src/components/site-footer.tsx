import Link from "next/link";
import { site } from "@/lib/site";
import type { Category } from "@/lib/types";
import { MailIcon, PhoneIcon, PinIcon } from "./icons";
import { Logo } from "./logo";
import { SocialLinks } from "./social-links";

const heading = "text-sm font-bold tracking-wide text-fg";
const link = "block py-1.5 text-muted transition-colors duration-200 hover:text-fg";

export function SiteFooter({ categories }: { categories: Category[] }) {
  return (
    <footer className="mt-16 border-t border-line bg-section text-sm">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-10 px-4 py-12 md:grid-cols-4 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1.2fr]">
        <div className="col-span-2 md:col-span-4 lg:col-span-1">
          <Logo className="h-16 w-auto" sizes="164px" />
          <p className="mt-4 max-w-xs leading-6 text-muted">{site.description}</p>
          <SocialLinks className="mt-4 -ml-2" />
        </div>

        <nav aria-labelledby="footer-shop">
          <h2 id="footer-shop" className={heading}>მაღაზია</h2>
          <div className="mt-3">
            <Link href="/" prefetch={false} className={link}>მთავარი</Link>
            <Link href="/search" prefetch={false} className={link}>ყველა პროდუქტი</Link>
            <Link href="/sale" prefetch={false} className={link}>აქციები</Link>
            <Link href="/wishlist" prefetch={false} className={link}>სურვილები</Link>
            <Link href="/about" prefetch={false} className={link}>ჩვენ შესახებ</Link>
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
          <h2 id="footer-help" className={heading}>დახმარება</h2>
          <div className="mt-3">
            <Link href="/faq" prefetch={false} className={link}>ხშირი კითხვები</Link>
            <Link href="/delivery" prefetch={false} className={link}>მიწოდება</Link>
            <Link href="/returns" prefetch={false} className={link}>დაბრუნება</Link>
            <Link href="/privacy" prefetch={false} className={link}>კონფიდენციალურობა</Link>
            <Link href="/terms" prefetch={false} className={link}>მომსახურების პირობები</Link>
          </div>
        </nav>

        <div className="max-[419px]:col-span-2">
          <h2 className={heading}>კონტაქტი</h2>
          <ul className="mt-3 space-y-3 text-muted">
            <li>
              <a href={site.phoneHref} className="flex items-center gap-2.5 font-semibold whitespace-nowrap text-fg transition-colors hover:text-neon">
                <PhoneIcon className="size-4 shrink-0 text-neon" />
                {site.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${site.email}`} className="flex items-center gap-2.5 [overflow-wrap:anywhere] transition-colors hover:text-fg">
                <MailIcon className="size-4 shrink-0 text-neon" />
                {site.email}
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <PinIcon className="size-4 shrink-0 text-neon" />
              {site.address}
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-center text-xs text-muted sm:flex-row sm:text-left">
          <p>© {new Date().getFullYear()} {site.name}. ყველა უფლება დაცულია.</p>
          <p>გადახდა პროდუქტის მიღებისას</p>
        </div>
      </div>
    </footer>
  );
}
