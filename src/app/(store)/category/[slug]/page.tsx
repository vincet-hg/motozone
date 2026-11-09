import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CategoryNav } from "@/components/category-nav";
import { ListingHeader } from "@/components/listing-header";
import { ProductGrid } from "@/components/product-grid";
import { getCategories, getProducts, PAGE_SIZE } from "@/lib/catalog";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = (await getCategories()).find((item) => item.slug === slug);
  return { title: category?.name };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const categories = await getCategories();
  const category = categories.find((item) => item.slug === slug);
  if (!category) notFound();

  const { products, total } = await getProducts({ categoryId: category.id });

  return (
    <>
      <CategoryNav categories={categories} active={slug} />
      <main className="mx-auto max-w-7xl px-3 py-4 sm:px-4">
        <ListingHeader title={category.name} filters={{ category: slug }} />
        <ProductGrid products={products} />
        {total > PAGE_SIZE && (
          <Link
            href={`/search?category=${slug}&page=2`}
            prefetch={false}
            className="mx-auto mt-8 block w-fit rounded border border-black px-5 py-2.5 text-sm font-medium"
          >
            მეტი პროდუქტი
          </Link>
        )}
      </main>
    </>
  );
}
