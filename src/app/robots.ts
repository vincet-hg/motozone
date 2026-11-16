import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

// Preview and staging deployments set NEXT_PUBLIC_ALLOW_INDEXING=false, so only the live site is indexed.
export default function robots(): MetadataRoute.Robots {
  if (process.env.NEXT_PUBLIC_ALLOW_INDEXING === "false") {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/cart", "/wishlist", "/demo-images/"] },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
