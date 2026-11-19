import type { Metadata } from "next";
import { ProductGrid } from "@/components/product-grid";
import { SaleIcon } from "@/components/category-icons";
import { SectionHeading } from "@/components/section-heading";
import { getProducts } from "@/lib/catalog";

export const metadata: Metadata = { title: "აქციები", alternates: { canonical: "/sale" } };

export default async function SalePage() {
  const { products } = await getProducts({ sale: true });

  return (
    <main className="mx-auto max-w-7xl px-3 py-6 sm:px-4">
      <h1 className="sr-only">აქციები</h1>
      <SectionHeading icon={<SaleIcon className="size-5" />} title="ფასდაკლებული პროდუქტები" />
      {products.length > 0 ? (
        <ProductGrid products={products} />
      ) : (
        <p className="py-16 text-center text-muted">ახლა აქციები არ არის. ახალი ფასდაკლებები მალე დაემატება.</p>
      )}
    </main>
  );
}
