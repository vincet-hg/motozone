import { imageUrl } from "./format";
import { site } from "./site";
import type { Category, Product } from "./types";

// Absolute address on the live site. Search engines and link previews need full URLs.
export const absoluteUrl = (path: string) => new URL(path, `${site.url}/`).toString();

export const absoluteImageUrl = (path: string) => absoluteUrl(imageUrl(path));

export function clipText(text: string, max = 160) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), max - 20))}…`;
}

export const organizationJsonLd = {
  "@type": "OnlineStore",
  "@id": absoluteUrl("/#store"),
  name: site.name,
  url: site.url,
  logo: absoluteUrl("/icon.png"),
  description: site.description,
  telephone: site.phone,
  email: site.email,
  address: { "@type": "PostalAddress", addressCountry: "GE", addressLocality: "თბილისი" },
  sameAs: [site.facebook, site.instagram, site.tiktok, site.youtube].filter((link) => link && !/\.com\/?$/.test(link)),
};

export function breadcrumbsJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "მთავარი", path: "/" }, ...items].map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function productJsonLd(product: Product, category?: Category) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": absoluteUrl(`/product/${product.slug}#product`),
    name: product.name,
    description: clipText(product.description || product.name, 5000),
    sku: product.slug,
    image: product.images.map(absoluteImageUrl),
    category: category?.name,
    additionalProperty: product.specs.map((spec) => ({ "@type": "PropertyValue", name: spec.label, value: spec.value })),
    offers: {
      "@type": "Offer",
      url: absoluteUrl(`/product/${product.slug}`),
      priceCurrency: "GEL",
      price: Number(product.final_price).toFixed(2),
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@id": absoluteUrl("/#store") },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingDestination: { "@type": "DefinedRegion", addressCountry: "GE" },
      },
    },
  };
}
