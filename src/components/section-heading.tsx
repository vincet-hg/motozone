import Link from "next/link";
import { ArrowIcon } from "./icons";

export function SectionHeading({ id, title, subtitle, link }: { id?: string; title: string; subtitle?: string; link?: { href: string; label: string } }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <h2 id={id} className="flex items-center gap-3 text-xl leading-7 font-extrabold tracking-tight sm:text-[26px] sm:leading-8">
          <span aria-hidden="true" className="h-6 w-1.5 rounded-full bg-gradient-to-b from-accent-hover to-accent" />
          {title}
        </h2>
        {subtitle && <p className="mt-1 pl-[18px] text-sm text-muted">{subtitle}</p>}
      </div>
      {link && (
        <Link href={link.href} prefetch={false} className="flex shrink-0 items-center gap-1.5 pb-0.5 text-sm font-semibold text-muted transition-colors duration-200 hover:text-accent-hover">
          {link.label}
          <ArrowIcon />
        </Link>
      )}
    </div>
  );
}
