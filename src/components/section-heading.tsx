import Link from "next/link";
import { ArrowIcon } from "./icons";

export function SectionHeading({ title, link }: { title: string; link?: { href: string; label: string } }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-4">
      <h2 className="border-l-4 border-accent pl-3 text-xl leading-7 font-extrabold sm:text-2xl">{title}</h2>
      {link && (
        <Link href={link.href} prefetch={false} className="flex shrink-0 items-center gap-1.5 text-sm font-semibold transition-colors duration-200 hover:text-accent-hover">
          {link.label}
          <ArrowIcon />
        </Link>
      )}
    </div>
  );
}
