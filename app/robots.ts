import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // The admin dashboard and the members-only Connect area are behind auth;
      // these rules keep them out of crawl queues too. /connect itself stays
      // public — it is the Crescent Connect landing page.
      disallow: [
        "/admin",
        "/api/",
        "/connect/directory",
        "/connect/profile",
        "/connect/setup",
        "/connect/pending",
        "/connect/status",
        "/connect/callback",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
