import { formatPrice } from "@/lib/format";

export function Price({
  price,
  salePrice,
  large = false,
}: {
  price: number;
  salePrice: number | null;
  large?: boolean;
}) {
  const current = large ? "text-2xl font-bold" : "text-base font-bold";
  if (salePrice === null) return <p className={current}>{formatPrice(price)}</p>;
  return (
    <p className="flex flex-wrap items-baseline gap-x-1.5">
      <span className={current}>{formatPrice(salePrice)}</span>
      <s className={`text-neutral-600 ${large ? "text-base" : "text-xs"}`}>{formatPrice(price)}</s>
    </p>
  );
}
