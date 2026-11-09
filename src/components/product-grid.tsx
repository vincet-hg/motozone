import type { ProductCard as Card } from "@/lib/types";
import { ProductCard } from "./product-card";

export function ProductGrid({ products }: { products: Card[] }) {
  if (products.length === 0) {
    return <p className="py-16 text-center text-neutral-700">პროდუქტი ვერ მოიძებნა. შეცვალე ძიება ან ფილტრი.</p>;
  }
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} eager={index < 5} lcp={index < 2} />
      ))}
    </div>
  );
}
