import Link from "next/link";
import { site } from "@/lib/site";
import { PhoneIcon } from "./icons";
import { Logo } from "./logo";
import { SocialLinks } from "./social-links";

const link = "block py-1 text-muted transition-colors duration-200 hover:text-fg";

export function SiteFooter() {
  return (
    <footer className="mt-12 border-t border-line bg-section text-sm">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-10 lg:grid-cols-4">
        <div className="col-span-2 lg:col-span-1">
          <Logo className="h-20 w-auto" sizes="204px" />
          <p className="mt-3 max-w-xs leading-6 text-muted">{site.description}</p>
        </div>
        <div>
          <h2 className="font-bold">მაღაზია</h2>
          <nav className="mt-2">
            <Link href="/search" prefetch={false} className={link}>ყველა პროდუქტი</Link>
            <Link href="/sale" prefetch={false} className={link}>აქციები</Link>
            <Link href="/about" prefetch={false} className={link}>შესახებ</Link>
          </nav>
        </div>
        <div>
          <h2 className="font-bold">ინფორმაცია</h2>
          <nav className="mt-2">
            <Link href="/delivery" prefetch={false} className={link}>მიწოდება</Link>
            <Link href="/returns" prefetch={false} className={link}>დაბრუნების პირობები</Link>
            <Link href="/contact" prefetch={false} className={link}>კონტაქტი</Link>
          </nav>
        </div>
        <div className="col-span-2 lg:col-span-1">
          <h2 className="font-bold">დაგვიკავშირდი</h2>
          <a href={site.phoneHref} className="mt-3 flex items-center gap-2 font-semibold hover:text-accent-hover">
            <PhoneIcon className="size-5 text-accent" />
            {site.phone}
          </a>
          <SocialLinks className="mt-3 -ml-2" />
        </div>
      </div>
      <p className="border-t border-line py-4 text-center text-xs text-muted">© {new Date().getFullYear()} {site.name}</p>
    </footer>
  );
}
