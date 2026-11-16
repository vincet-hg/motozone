import type { MetadataRoute } from "next";
import { getCategories, getSitemapProducts } from "@/lib/catalog";
import { absolute, absoluteImage } from "@/lib/seo";

// Rebuilt with the catalog: saving in the admin refreshes it (see CATALOG_TAG), at least hourly otherwise.
export const revalidate = 3600;

const PAGES = ["/sale", "/about", "/contact", "/delivery", "/returns", "/privacy", "/terms"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products] = await Promise.all([getCategories(), getSitemapProducts()]);
  const newest = products[0]?.updated_at ? new Date(products[0].updated_at) : new Date();
  const categoryUpdated = (id: string) => products.find((product) => product.category_id === id)?.updated_at;

  return [
    { url: absolute("/"), lastModified: newest, changeFrequency: "daily", priority: 1 },
    ...categories.map((category) => ({
      url: absolute(`/category/${category.slug}`),
      lastModified: new Date(categoryUpdated(category.id) ?? newest),
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    ...products.map((product) => ({
      url: absolute(`/product/${product.slug}`),
      lastModified: new Date(product.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.7,
      images: product.images.slice(0, 3).map(absoluteImage),
    })),
    ...PAGES.map((path) => ({ url: absolute(path), changeFrequency: "monthly" as const, priority: 0.3 })),
  ];
}
