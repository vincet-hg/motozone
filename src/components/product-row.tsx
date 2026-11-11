import type { ProductCard as Card } from "@/lib/types";
import { ProductCard } from "./product-card";

// One row of products: swipeable on phones, a single full row on wider screens (no half-empty second row).
export function ProductRow({ products }: { products: Card[] }) {
  return (
    <div className="no-scrollbar -mx-3 flex snap-x snap-mandatory scroll-px-3 sm:scroll-px-4 gap-2.5 overflow-x-auto px-3 pb-2 sm:-mx-4 sm:gap-4 sm:px-4 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 md:pb-0 lg:grid-cols-4 xl:grid-cols-5">
      {products.slice(0, 5).map((product, index) => (
        <div
          key={product.id}
          className={`w-[46%] shrink-0 snap-start md:w-auto ${index === 3 ? "md:max-lg:hidden" : ""} ${index === 4 ? "md:max-xl:hidden" : ""}`}
        >
          <ProductCard product={product} eager={index < 2} lcp={false} />
        </div>
      ))}
    </div>
  );
}
