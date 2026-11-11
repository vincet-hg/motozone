import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AddToCart } from "@/components/add-to-cart";
import { CategoryNav } from "@/components/category-nav";
import { Gallery } from "@/components/gallery";
import { Price } from "@/components/price";
import { getCategories, getProductBySlug, getProductSlugs } from "@/lib/catalog";
import { imageUrl } from "@/lib/format";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getProductSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.description.slice(0, 160) || undefined,
    openGraph: { title: product.name, images: product.images[0] ? [imageUrl(product.images[0])] : undefined },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const [product, categories] = await Promise.all([getProductBySlug(slug), getCategories()]);
  if (!product) notFound();

  const category = categories.find((item) => item.id === product.category_id);

  return (
    <>
      <CategoryNav categories={categories} active={category?.slug} />
      <main className="mx-auto grid max-w-5xl gap-6 px-3 py-4 sm:px-4 md:grid-cols-2 md:gap-12 md:py-10">
        <Gallery images={product.images} alt={product.name} />
        <div>
          <h1 className="text-2xl font-extrabold md:text-3xl">{product.name}</h1>
          <div className="mt-4">
            <Price price={product.price} salePrice={product.sale_price} large />
          </div>
          <div className="mt-6">
            {product.stock > 0 ? (
              <AddToCart id={product.id} stock={product.stock} large />
            ) : (
              <p className="font-medium text-muted">არ არის მარაგში</p>
            )}
          </div>

          {product.description && (
            <section className="mt-6">
              <h2 className="border-l-4 border-accent pl-2 font-bold">აღწერა</h2>
              <p className="mt-2 text-sm leading-6 whitespace-pre-line text-fg/85">{product.description}</p>
            </section>
          )}

          {product.specs.length > 0 && (
            <section className="mt-6">
              <h2 className="border-l-4 border-accent pl-2 font-bold">მახასიათებლები</h2>
              <dl className="mt-1 text-sm">
                {product.specs.map((spec) => (
                  <div key={spec.label} className="flex justify-between gap-4 border-b border-line py-2.5">
                    <dt className="text-muted">{spec.label}</dt>
                    <dd className="text-right font-medium">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {product.compatibility && (
            <section className="mt-6">
              <h2 className="border-l-4 border-accent pl-2 font-bold">თავსებადობა</h2>
              <p className="mt-2 text-sm leading-6 whitespace-pre-line text-fg/85">{product.compatibility}</p>
            </section>
          )}
        </div>
      </main>
    </>
  );
}
