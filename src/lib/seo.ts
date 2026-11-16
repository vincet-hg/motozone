import { imageUrl } from "./format";
import { site } from "./site";
import type { Category, Product } from "./types";

// Absolute address on the live site. Search engines and link previews need full URLs.
export const absolute = (path: string) => new URL(path, `${site.url}/`).toString();

export const absoluteImage = (path: string) => absolute(imageUrl(path));

export function clip(text: string, max = 160) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), max - 20))}…`;
}

export const organization = {
  "@type": "OnlineStore",
  "@id": absolute("/#store"),
  name: site.name,
  url: site.url,
  logo: absolute("/icon.png"),
  description: site.description,
  telephone: site.phone,
  email: site.email,
  address: { "@type": "PostalAddress", addressCountry: "GE", addressLocality: "თბილისი" },
  sameAs: [site.facebook, site.instagram, site.tiktok, site.youtube].filter((link) => link && !/\.com\/?$/.test(link)),
};

export function breadcrumbs(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "მთავარი", path: "/" }, ...items].map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absolute(item.path),
    })),
  };
}

export function productJsonLd(product: Product, category?: Category) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": absolute(`/product/${product.slug}#product`),
    name: product.name,
    description: clip(product.description || product.name, 5000),
    sku: product.slug,
    image: product.images.map(absoluteImage),
    category: category?.name,
    additionalProperty: product.specs.map((spec) => ({ "@type": "PropertyValue", name: spec.label, value: spec.value })),
    offers: {
      "@type": "Offer",
      url: absolute(`/product/${product.slug}`),
      priceCurrency: "GEL",
      price: Number(product.final_price).toFixed(2),
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@id": absolute("/#store") },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingDestination: { "@type": "DefinedRegion", addressCountry: "GE" },
      },
    },
  };
}
