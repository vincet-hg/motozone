import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CategoryNav } from "@/components/category-nav";
import { JsonLd } from "@/components/json-ld";
import { CategoryIcon } from "@/components/category-icons";
import { ListingHeader } from "@/components/listing-header";
import { ProductGrid } from "@/components/product-grid";
import { moreButton } from "@/components/styles";
import { getCategories, getProducts, PAGE_SIZE } from "@/lib/catalog";
import { absolute, breadcrumbs, clip } from "@/lib/seo";
import { site } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = (await getCategories()).find((item) => item.slug === slug);
  if (!category) return {};
  const description = clip(category.description || `${category.name}: ფასები, მარაგი და მიწოდება თბილისში, გადახდა მიღებისას. ${site.name}.`);
  return {
    title: category.name,
    description,
    alternates: { canonical: `/category/${category.slug}` },
    openGraph: { title: category.name, description, url: `/category/${category.slug}` },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const categories = await getCategories();
  const category = categories.find((item) => item.slug === slug);
  if (!category) notFound();

  const { products, total } = await getProducts({ categoryId: category.id });

  return (
    <>
      <JsonLd data={breadcrumbs([{ name: category.name, path: `/category/${category.slug}` }])} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: category.name,
          itemListElement: products.map((product, index) => ({
            "@type": "ListItem",
            position: index + 1,
            url: absolute(`/product/${product.slug}`),
            name: product.name,
          })),
        }}
      />
      <CategoryNav categories={categories} active={slug} />
      <main className="mx-auto max-w-7xl px-3 py-6 sm:px-4">
        <ListingHeader title={category.name} icon={<CategoryIcon slug={category.slug} className="size-5" />} filters={{ category: slug }} />
        {category.description && <p className="-mt-1 mb-4 max-w-3xl text-sm leading-6 text-muted">{category.description}</p>}
        <ProductGrid products={products} />
        {total > PAGE_SIZE && (
          <Link
            href={`/search?category=${slug}&page=2`}
            prefetch={false}
            className={moreButton}
          >
            მეტი პროდუქტი
          </Link>
        )}
      </main>
    </>
  );
}
