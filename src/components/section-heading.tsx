import Link from "next/link";
import { HeadingIcon } from "./heading-icon";
import { ArrowIcon } from "./icons";

// Pass an icon (a filled icon from category-icons) to show it in a tile before the title; without one,
// the title keeps the two slanted bars.
export function SectionHeading({ id, title, subtitle, link, icon }: { id?: string; title: string; subtitle?: string; link?: { href: string; label: string }; icon?: React.ReactNode }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-3 sm:gap-4">
      <div className="min-w-0">
        <h2 id={id} className="flex items-center gap-3 text-xl leading-7 font-extrabold tracking-tight sm:text-[26px] sm:leading-8">
          {icon ? (
            <HeadingIcon>{icon}</HeadingIcon>
          ) : (
            <span aria-hidden="true" className="flex gap-1">
              <span className="h-6 w-1.5 skew-x-[-20deg] rounded-sm bg-accent" />
              <span className="h-6 w-1.5 skew-x-[-20deg] rounded-sm bg-neon" />
            </span>
          )}
          {title}
        </h2>
        {subtitle && <p className={`mt-1 text-sm text-muted ${icon ? "pl-12 sm:pl-[52px]" : "pl-[26px]"}`}>{subtitle}</p>}
      </div>
      {link && (
        <Link href={link.href} prefetch={false} aria-label={link.label} className="flex size-9 shrink-0 items-center justify-center gap-1.5 rounded-full border border-line sm:size-auto sm:px-3.5 sm:py-1.5 text-sm font-semibold text-fg/85 transition-all duration-200 hover:border-neon/50 hover:text-neon">
          <span className="hidden sm:inline">{link.label}</span>
          <ArrowIcon />
        </Link>
      )}
    </div>
  );
}
