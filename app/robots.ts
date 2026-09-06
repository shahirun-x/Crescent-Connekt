import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * robots.txt is a request, not an instruction — a crawler is free to ignore it,
 * and a disallowed URL can still be indexed if something links to it. The real
 * control is the `robots` metadata on each route (and the X-Robots-Tag header
 * on /api/* in next.config.ts, since JSON responses carry no meta tag).
 * This list is the first layer, not the only one.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/api/",
        // Members-only Connect surfaces.
        "/connect/directory",
        "/connect/profile",
        "/connect/setup",
        "/connect/pending",
        "/connect/status",
        // Auth entry points. /connect/callback especially — Supabase returns
        // the session in the URL fragment, so that URL must never be indexed.
        "/connect/login",
        "/connect/signup",
        "/connect/callback",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
