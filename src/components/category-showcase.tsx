import Image from "next/image";
import Link from "next/link";
import type { CategoryCover } from "@/lib/catalog";
import { imageUrl } from "@/lib/format";
import type { Category } from "@/lib/types";
import { ArrowIcon } from "./icons";
import { AccessoriesIcon } from "./category-icons";
import { SectionHeading } from "./section-heading";

// Category cards with the newest product photo of each category. Swipeable on phones.
export function CategoryShowcase({ categories, covers }: { categories: Category[]; covers: Map<string, CategoryCover> }) {
  if (categories.length === 0) return null;
  return (
    <section aria-labelledby="categories-title" className="reveal mt-12">
      <SectionHeading id="categories-title" icon={<AccessoriesIcon className="size-5" />} title="კატეგორიები" link={{ href: "/search", label: "ყველა პროდუქტი" }} />
      <ul className="no-scrollbar -mx-3 flex snap-x snap-mandatory scroll-px-3 gap-3 overflow-x-auto px-3 pb-2 sm:-mx-4 sm:scroll-px-4 sm:px-4 lg:mx-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-0 xl:grid-cols-7">
        {categories.map((category) => {
          const cover = covers.get(category.id)?.image;
          const count = covers.get(category.id)?.count ?? 0;
          return (
            <li key={category.id} className="w-[46%] shrink-0 snap-start min-[480px]:w-[36%] sm:w-[30%] lg:w-auto">
              <Link
                href={`/category/${category.slug}`}
                prefetch={false}
                className="group flex h-full flex-col overflow-hidden rounded-card border border-line bg-gradient-to-b from-card-hover to-card transition-all duration-300 hover:-translate-y-1 hover:border-neon/50 hover:shadow-[0_0_0_1px_rgba(251,113,133,0.25),0_18px_40px_-18px_rgba(225,29,72,0.9)]"
              >
                <div className="relative m-2 mb-0 aspect-square overflow-hidden rounded-xl bg-photo">
                  {cover ? (
                    <Image
                      src={imageUrl(cover)}
                      alt=""
                      fill
                      sizes="(min-width: 1280px) 160px, (min-width: 1024px) 25vw, (min-width: 640px) 30vw, 42vw"
                      quality={75}
                      className="object-contain p-3 transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <span className="absolute inset-0 bg-gradient-to-br from-card-hover to-section" />
                  )}
                </div>
                <span className="flex flex-1 items-center justify-between gap-2 px-3 py-3 max-[399px]:px-2.5">
                  <span className="min-w-0">
                    <span className="block text-[13px] leading-5 font-semibold [overflow-wrap:normal] min-[400px]:text-sm">{category.name}</span>
                    {count > 0 && <span className="text-xs text-muted">{count} პროდუქტი</span>}
                  </span>
                  <ArrowIcon className="hidden size-4 shrink-0 text-muted min-[400px]:block transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-neon" />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
