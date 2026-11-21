import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCart } from "@/components/add-to-cart";
import { CategoryNav } from "@/components/category-nav";
import { Gallery } from "@/components/gallery";
import { JsonLd } from "@/components/json-ld";
import { Price } from "@/components/price";
import { ProductRow } from "@/components/product-row";
import { SectionHeading } from "@/components/section-heading";
import { WishlistButton } from "@/components/wishlist-button";
import { CashIcon, PinIcon, TruckIcon } from "@/components/icons";
import { getCategories, getProductBySlug, getProducts, getProductSlugs } from "@/lib/catalog";
import { discountPercent, formatPrice } from "@/lib/format";
import { site } from "@/lib/site";
import { absoluteImage, breadcrumbs, clip, productJsonLd } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getProductSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  const price = formatPrice(product.final_price);
  const description = clip(product.description ? `${price}. ${product.description}` : `${product.name}, ${price}. მიწოდება თბილისში, გადახდა მიღებისას.`);
  return {
    title: product.name,
    description,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      title: product.name,
      description,
      url: `/product/${product.slug}`,
      images: product.images.slice(0, 4).map((image) => ({ url: absoluteImage(image), alt: product.name })),
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const [product, categories] = await Promise.all([getProductBySlug(slug), getCategories()]);
  if (!product) notFound();

  const category = categories.find((item) => item.id === product.category_id);
  const related = category
    ? (await getProducts({ categoryId: category.id })).products.filter((item) => item.id !== product.id).slice(0, 5)
    : [];
  const discount = product.sale_price !== null ? discountPercent(product.price, product.sale_price) : 0;
  const stock =
    product.stock <= 0
      ? { text: "არ არის მარაგში", tone: "border-red-400/30 bg-red-400/10 text-red-200", dot: "bg-red-400" }
      : product.stock <= 3
        ? { text: `მარაგში დარჩა ${product.stock} ცალი`, tone: "border-amber-400/30 bg-amber-400/10 text-amber-200", dot: "bg-amber-400" }
        : { text: "მარაგშია", tone: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200", dot: "bg-emerald-400" };

  const promises = [
    { Icon: TruckIcon, title: site.deliveryShort, text: `კურიერით, ${formatPrice(site.deliveryFee)}` },
    { Icon: CashIcon, title: site.paymentShort, text: "ნაღდით ან ბარათით" },
    { Icon: PinIcon, title: site.pickupShort, text: "უფასოდ" },
  ];

  return (
    <>
      <JsonLd data={productJsonLd(product, category)} />
      <JsonLd
        data={breadcrumbs([
          ...(category ? [{ name: category.name, path: `/category/${category.slug}` }] : []),
          { name: product.name, path: `/product/${product.slug}` },
        ])}
      />
      <CategoryNav categories={categories} active={category?.slug} />

      <main className="mx-auto max-w-7xl px-4 pt-4 pb-14 sm:px-6 md:pt-6 lg:pb-20">
        <nav aria-label="ნავიგაცია" className="mb-4 text-sm text-muted md:mb-6">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/" className="transition-colors hover:text-fg">მთავარი</Link>
            </li>
            {category && (
              <>
                <li aria-hidden>/</li>
                <li>
                  <Link href={`/category/${category.slug}`} className="transition-colors hover:text-fg">{category.name}</Link>
                </li>
              </>
            )}
            <li aria-hidden>/</li>
            <li aria-current="page" className="max-w-[60vw] truncate text-fg/80">{product.name}</li>
          </ol>
        </nav>

        <div className="grid gap-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:gap-10 lg:gap-14">
          <div className="md:sticky md:top-28 md:self-start">
            <div className="relative">
              <Gallery images={product.images} alt={product.name} />
              {discount > 0 && (
                <span className="pointer-events-none absolute top-3 left-3 rounded-full bg-accent px-3 py-1 text-sm font-bold text-white">-{discount}%</span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <div>
              {category && (
                <Link href={`/category/${category.slug}`} className="text-sm font-semibold text-neon transition-colors hover:text-white">
                  {category.name}
                </Link>
              )}
              <h1 className="mt-1.5 text-2xl leading-tight font-extrabold sm:text-3xl lg:text-4xl">{product.name}</h1>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Price price={product.price} salePrice={product.sale_price} large />
              <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${stock.tone}`}>
                <span aria-hidden className={`size-1.5 rounded-full ${stock.dot}`} />
                {stock.text}
              </span>
            </div>

            <div className="flex items-stretch gap-3">
              {product.stock > 0 ? (
                <div className="flex-1 [&>button]:w-full">
                  <AddToCart id={product.id} stock={product.stock} large />
                </div>
              ) : (
                <a href={site.phoneHref} className="flex h-13 flex-1 items-center justify-center rounded-btn border border-line font-semibold hover:border-neon/50">
                  დაგვირეკე მარაგის შესახებ
                </a>
              )}
              <WishlistButton id={product.id} className="size-13 shrink-0 rounded-btn border border-line bg-card !text-fg hover:border-neon/50 [&[aria-pressed=true]]:!text-neon" />
            </div>

            <ul className="grid grid-cols-3 gap-2 rounded-card border border-line bg-card p-3 sm:gap-3 sm:p-4">
              {promises.map(({ Icon, title, text }) => (
                <li key={title} className="flex flex-col items-center gap-2 text-center">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-neon">
                    <Icon className="size-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs leading-4 font-semibold sm:text-[13px]">{title}</span>
                    <span className="mt-0.5 block text-[11px] leading-4 text-muted sm:text-xs">{text}</span>
                  </span>
                </li>
              ))}
            </ul>

            {product.description && (
              <section className="rounded-card border border-line bg-card p-5">
                <h2 className="text-base font-bold">აღწერა</h2>
                <p className="mt-2 text-sm leading-7 whitespace-pre-line text-fg/85">{product.description}</p>
              </section>
            )}

            {product.specs.length > 0 && (
              <section className="overflow-hidden rounded-card border border-line bg-card">
                <h2 className="px-5 pt-5 pb-3 text-base font-bold">მახასიათებლები</h2>
                <dl className="text-sm">
                  {product.specs.map((spec, index) => (
                    <div key={spec.label} className={`flex justify-between gap-4 px-5 py-3 ${index % 2 === 0 ? "bg-bg/40" : ""}`}>
                      <dt className="text-muted">{spec.label}</dt>
                      <dd className="text-right font-medium">{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}

            {product.compatibility && (
              <section className="rounded-card border border-line bg-card p-5">
                <h2 className="text-base font-bold">თავსებადობა</h2>
                <p className="mt-2 text-sm leading-7 whitespace-pre-line text-fg/85">{product.compatibility}</p>
              </section>
            )}
          </div>
        </div>

        {related.length > 0 && category && (
          <section aria-labelledby="related-title" className="mt-14 lg:mt-20">
            <SectionHeading id="related-title" title="მსგავსი პროდუქტები" link={{ href: `/category/${category.slug}`, label: "ყველა" }} />
            <ProductRow products={related} />
          </section>
        )}
      </main>
    </>
  );
}
