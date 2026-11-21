import Link from "next/link";
import type { Category } from "@/lib/types";
import { AccessoriesIcon, CategoryIcon } from "./category-icons";

function Pill({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      prefetch={false}
      aria-current={active ? "page" : undefined}
      className={`flex shrink-0 items-center gap-2 rounded-btn border px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
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
      <div className="no-scrollbar mx-auto flex max-w-7xl gap-2.5 overflow-x-auto px-3 pt-6 pb-4 sm:gap-3 sm:px-4 md:pt-8 md:pb-5">
        <Pill href="/" active={!active}>
          <AccessoriesIcon className="optical-center size-4 shrink-0" />
          ყველა
        </Pill>
        {categories.map((category) => (
          <Pill key={category.id} href={`/category/${category.slug}`} active={active === category.slug}>
            <CategoryIcon slug={category.slug} className="optical-center size-4 shrink-0" />
            {category.name}
          </Pill>
        ))}
      </div>
    </nav>
  );
}
