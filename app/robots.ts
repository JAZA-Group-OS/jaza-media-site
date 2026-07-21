import type { MetadataRoute } from "next";
import { getSiteBaseUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteBaseUrl();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Admin lives on a separate subdomain, but disallow the paths here too
      // in case they're ever reachable on the main host.
      disallow: ["/admin", "/api/"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
