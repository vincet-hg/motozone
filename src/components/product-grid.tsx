import type { ProductCard as Card } from "@/lib/types";
import { ProductCard } from "./product-card";

// Set `heroAbove` where a banner photo is the page's main image, so cards do not compete with it.
export function ProductGrid({ products, heroAbove = false }: { products: Card[]; heroAbove?: boolean }) {
  if (products.length === 0) {
    return <p className="py-16 text-center text-muted">პროდუქტი ვერ მოიძებნა. შეცვალე ძიება ან ფილტრი.</p>;
  }
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} eager={index < 5} lcp={!heroAbove && index < 2} />
      ))}
    </div>
  );
}
