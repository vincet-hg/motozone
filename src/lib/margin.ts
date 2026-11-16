import { formatPrice } from "./format";

// Share of the selling price that is profit. Null when the cost is not known yet.
export function marginPercent(price: number, cost: number) {
  if (!(cost > 0) || !(price > 0)) return null;
  return Math.round(((price - cost) / price) * 1000) / 10;
}

// The price that keeps `margin` percent at `cost`, rounded up to a whole lari.
export function priceForMargin(cost: number, margin: number) {
  if (margin >= 100) return null;
  return Math.ceil(cost / (1 - margin / 100));
}

// Message shown after new stock arrives at a different cost.
export function costChangeNotice(price: number, oldCost: number, newCost: number) {
  const before = marginPercent(price, oldCost);
  const after = marginPercent(price, newCost);
  const parts = [`საშუალო თვითღირებულება: ${formatPrice(newCost)}.`];

  if (newCost >= price) {
    parts.push(`⚠️ გაყიდვის ფასი (${formatPrice(price)}) თვითღირებულებაზე დაბალია ან ტოლია: ამ ფასად ზარალში ყიდი.`);
    if (before !== null && before > 0) parts.push(`ძველი მარჟის (${before}%) შესანარჩუნებლად ფასი უნდა იყოს ${formatPrice(priceForMargin(newCost, before)!)}.`);
    return { text: parts.join(" "), warning: true };
  }
  if (before !== null && after !== null && after < before - 2) {
    const suggested = priceForMargin(newCost, before);
    parts.push(`⚠️ მარჟა ${before}%-დან ${after}%-მდე დაეცა.`);
    if (suggested) parts.push(`იგივე მარჟისთვის ფასი უნდა იყოს ${formatPrice(suggested)}.`);
    return { text: parts.join(" "), warning: true };
  }
  if (after !== null) parts.push(`მარჟა: ${after}%.`);
  return { text: parts.join(" "), warning: false };
}
