import type { MetadataRoute } from "next";
import { isLiveSite, site } from "@/lib/site";

// Only the live site is indexed: previews and test deployments block every crawler.
export default function robots(): MetadataRoute.Robots {
  if (!isLiveSite) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/cart", "/wishlist", "/account", "/login", "/forgot-password", "/auth", "/demo-images/"] },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
