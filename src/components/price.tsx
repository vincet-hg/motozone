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
  const current = `font-bold text-accent ${large ? "text-3xl" : "text-xl"}`;
  if (salePrice === null) return <p className={current}>{formatPrice(price)}</p>;
  return (
    <p className="flex flex-wrap items-baseline gap-x-2">
      <span className={current}>{formatPrice(salePrice)}</span>
      <s className={`text-muted ${large ? "text-lg" : "text-sm"}`}>{formatPrice(price)}</s>
    </p>
  );
}
