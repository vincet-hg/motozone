import Link from "next/link";
import type { Category } from "@/lib/types";

function Pill({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      prefetch={false}
      aria-current={active ? "page" : undefined}
      className={`shrink-0 rounded-btn border px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
        active ? "border-accent bg-accent text-white" : "border-line bg-card text-fg hover:border-accent/70"
      }`}
    >
      {children}
    </Link>
  );
}

export function CategoryNav({ categories, active }: { categories: Category[]; active?: string }) {
  return (
    <nav aria-label="კატეგორიები">
      <div className="no-scrollbar mx-auto flex max-w-7xl gap-2 overflow-x-auto px-3 py-3 sm:px-4">
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
