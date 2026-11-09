const IMAGE_BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/`;

export function imageUrl(path: string) {
  return IMAGE_BASE + path;
}

export function formatPrice(value: number) {
  return `${Number.isInteger(Number(value)) ? Number(value) : Number(value).toFixed(2)} ₾`;
}

export function discountPercent(price: number, salePrice: number | null) {
  if (salePrice === null) return 0;
  return Math.round((1 - salePrice / price) * 100);
}

const LETTERS: Record<string, string> = {
  ა: "a", ბ: "b", გ: "g", დ: "d", ე: "e", ვ: "v", ზ: "z", თ: "t", ი: "i", კ: "k", ლ: "l",
  მ: "m", ნ: "n", ო: "o", პ: "p", ჟ: "zh", რ: "r", ს: "s", ტ: "t", უ: "u", ფ: "p", ქ: "k",
  ღ: "gh", ყ: "q", შ: "sh", ჩ: "ch", ც: "ts", ძ: "dz", წ: "ts", ჭ: "ch", ხ: "kh", ჯ: "j", ჰ: "h",
};

export function slugify(text: string) {
  return (
    [...text.toLowerCase()]
      .map((char) => LETTERS[char] ?? char)
      .join("")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "item"
  );
}
