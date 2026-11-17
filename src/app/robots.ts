import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

// Only the live site is indexed. Vercel previews are blocked automatically,
// and any other test deployment can set NEXT_PUBLIC_ALLOW_INDEXING=false.
export default function robots(): MetadataRoute.Robots {
  const isVercelPreview = Boolean(process.env.VERCEL_ENV) && process.env.VERCEL_ENV !== "production";
  if (isVercelPreview || process.env.NEXT_PUBLIC_ALLOW_INDEXING === "false") {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/cart", "/wishlist", "/demo-images/"] },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
