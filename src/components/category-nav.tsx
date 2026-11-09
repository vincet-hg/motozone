import Link from "next/link";
import type { Category } from "@/lib/types";

function Pill({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      prefetch={false}
      aria-current={active ? "page" : undefined}
      className={`shrink-0 rounded-full border px-3 py-1.5 text-sm whitespace-nowrap ${
        active ? "border-black bg-black text-white" : "border-neutral-300 hover:border-black"
      }`}
    >
      {children}
    </Link>
  );
}

export function CategoryNav({ categories, active }: { categories: Category[]; active?: string }) {
  return (
    <nav aria-label="კატეგორიები" className="border-b border-neutral-200 bg-white">
      <div className="no-scrollbar mx-auto flex max-w-7xl gap-2 overflow-x-auto px-3 py-2 sm:px-4">
        <Pill href="/" active={!active}>
          ყველა
        </Pill>
        {categories.map((category) => (
          <Pill key={category.id} href={`/category/${category.slug}`} active={active === category.slug}>
            {category.name}
          </Pill>
        ))}
      </div>
    </nav>
  );
}
