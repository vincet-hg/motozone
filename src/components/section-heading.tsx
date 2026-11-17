import Link from "next/link";
import { ArrowIcon } from "./icons";

export function SectionHeading({ id, title, subtitle, link }: { id?: string; title: string; subtitle?: string; link?: { href: string; label: string } }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <h2 id={id} className="flex items-center gap-3 text-xl leading-7 font-extrabold tracking-tight sm:text-[26px] sm:leading-8">
          <span aria-hidden="true" className="flex gap-1">
            <span className="h-6 w-1.5 skew-x-[-20deg] rounded-sm bg-accent" />
            <span className="h-6 w-1.5 skew-x-[-20deg] rounded-sm bg-neon" />
          </span>
          {title}
        </h2>
        {subtitle && <p className="mt-1 pl-[26px] text-sm text-muted">{subtitle}</p>}
      </div>
      {link && (
        <Link href={link.href} prefetch={false} className="flex shrink-0 items-center gap-1.5 rounded-full border border-line px-3.5 py-1.5 text-sm font-semibold text-fg/85 transition-all duration-200 hover:border-neon/50 hover:text-neon">
          {link.label}
          <ArrowIcon />
        </Link>
      )}
    </div>
  );
}
