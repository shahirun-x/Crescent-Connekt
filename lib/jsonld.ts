import { SITE_URL, site } from "./site";
import type { CrescentEvent, Institution, NewsItem } from "./types";

/**
 * schema.org structured data builders.
 *
 * Rules followed throughout:
 *  - Never emit a property we do not have a real value for. An empty string or
 *    a guessed address is worse than an absent field — Google treats fabricated
 *    structured data as spam, and it can earn a manual action.
 *  - Everything is server-rendered. Google does execute JS, but structured data
 *    injected on the client is discovered late and unreliably.
 *  - Types are hand-written rather than pulled from a schema-dts dependency,
 *    keeping the stack small per the project's standing rule.
 */

type JsonLdValue = string | number | boolean | JsonLdObject | JsonLdValue[];
export interface JsonLdObject {
  "@context"?: string;
  "@type": string;
  [key: string]: JsonLdValue | undefined;
}

/** Strip undefined/empty so we never emit a hollow property. */
function compact(obj: Record<string, JsonLdValue | undefined>): JsonLdObject {
  const out: Record<string, JsonLdValue> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    if (typeof v === "string" && v.trim() === "") continue;
    if (Array.isArray(v) && v.length === 0) continue;
    out[k] = v;
  }
  return out as JsonLdObject;
}

const absolute = (path: string) =>
  path.startsWith("http") ? path : `${SITE_URL}${path}`;

// ---------------------------------------------------------------------------
// Organization — the publisher of the site itself
// ---------------------------------------------------------------------------

/**
 * CGOM, the body behind the portal.
 *
 * `sameAs` is deliberately omitted: it takes verified social profile URLs, and
 * we have none on file. Guessing them would be fabricated data.
 */
export function organizationJsonLd(): JsonLdObject {
  return compact({
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: "Crescent Global Outreach Mission",
    alternateName: "CGOM",
    url: SITE_URL,
    logo: compact({
      "@type": "ImageObject",
      url: absolute("/icon.svg"),
    }),
    description: site.description,
    email: site.contactEmail,
  });
}

export function websiteJsonLd(): JsonLdObject {
  return compact({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: site.name,
    url: SITE_URL,
    inLanguage: "en-IN",
    publisher: { "@type": "Organization", "@id": `${SITE_URL}/#organization` },
  });
}

// ---------------------------------------------------------------------------
// Institutions
// ---------------------------------------------------------------------------

/**
 * schema.org type per pillar. Healthcare institutions are MedicalOrganization;
 * everything else in this network is educational or a community/innovation body
 * run by an educational trust, so EducationalOrganization is the honest fit.
 */
function institutionType(category: Institution["category"]): string {
  return category === "healthcare"
    ? "MedicalOrganization"
    : "EducationalOrganization";
}

export function institutionJsonLd(inst: Institution): JsonLdObject {
  // Addresses come from the official directory card via lib/seed.ts. We only
  // ever emit what is actually recorded — no invented street or postal code.
  const address = compact({
    "@type": "PostalAddress",
    streetAddress: inst.location || undefined,
    addressLocality: inst.city || undefined,
    addressRegion: "Tamil Nadu",
    addressCountry: "IN",
  });

  const geo =
    inst.latitude != null && inst.longitude != null
      ? compact({
          "@type": "GeoCoordinates",
          latitude: inst.latitude,
          longitude: inst.longitude,
        })
      : undefined;

  return compact({
    "@type": institutionType(inst.category),
    "@id": `${SITE_URL}/institutions#${inst.id}`,
    name: inst.name,
    description: inst.description || undefined,
    url: inst.external_url || undefined,
    logo: inst.logo_url ?? undefined,
    address,
    geo,
    foundingDate: inst.established_year
      ? String(inst.established_year)
      : undefined,
    parentOrganization: inst.parent_org
      ? compact({ "@type": "Organization", name: inst.parent_org })
      : undefined,
  });
}

/** The /institutions page as an ItemList of the network. */
export function institutionListJsonLd(institutions: Institution[]): JsonLdObject {
  return compact({
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Crescent institutions",
    numberOfItems: institutions.length,
    itemListElement: institutions.map((inst, i) =>
      compact({
        "@type": "ListItem",
        position: i + 1,
        item: institutionJsonLd(inst),
      })
    ),
  });
}

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

/**
 * A calendar event.
 *
 * `startDate` is a plain date (no time component) because that is genuinely all
 * we store — schema.org accepts ISO 8601 dates, and inventing a time would be
 * false precision. `endDate` is only emitted when date_end is set.
 */
export function eventJsonLd(event: CrescentEvent): JsonLdObject {
  return compact({
    "@type": "Event",
    "@id": `${SITE_URL}/calendar#${event.id}`,
    name: event.title,
    startDate: event.date_start,
    endDate: event.date_end ?? undefined,
    description: event.description || undefined,
    image: event.image_url ?? undefined,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: event.location
      ? compact({
          "@type": "Place",
          name: event.location,
          address: compact({
            "@type": "PostalAddress",
            addressLocality: event.location,
            addressCountry: "IN",
          }),
        })
      : undefined,
    organizer: compact({
      "@type": "Organization",
      name: event.institution_name || "Crescent Global Outreach Mission",
      url: SITE_URL,
    }),
  });
}

export function eventListJsonLd(events: CrescentEvent[]): JsonLdObject {
  return compact({
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Crescent Central Calendar",
    numberOfItems: events.length,
    itemListElement: events.map((e, i) =>
      compact({ "@type": "ListItem", position: i + 1, item: eventJsonLd(e) })
    ),
  });
}

// ---------------------------------------------------------------------------
// News
// ---------------------------------------------------------------------------

/**
 * NewsArticle rather than Article: these are dated announcements from named
 * institutions, which is what NewsArticle describes.
 *
 * `author` is set to the institution, not a person — we do not store bylines,
 * and inventing one would be fabricated data.
 */
export function newsArticleJsonLd(item: NewsItem): JsonLdObject {
  return compact({
    "@type": "NewsArticle",
    "@id": `${SITE_URL}/news#${item.id}`,
    headline: item.title.slice(0, 110), // schema.org recommends <= 110 chars
    description: item.summary || undefined,
    articleBody: item.content || undefined,
    datePublished: item.published_at,
    image: item.image_url ?? undefined,
    author: compact({
      "@type": "Organization",
      name: item.institution_name || "Crescent Global Outreach Mission",
    }),
    publisher: { "@type": "Organization", "@id": `${SITE_URL}/#organization` },
    isPartOf: { "@type": "WebSite", "@id": `${SITE_URL}/#website` },
  });
}

export function newsListJsonLd(items: NewsItem[]): JsonLdObject {
  return compact({
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "News from the Crescent network",
    numberOfItems: items.length,
    itemListElement: items.map((n, i) =>
      compact({
        "@type": "ListItem",
        position: i + 1,
        item: newsArticleJsonLd(n),
      })
    ),
  });
}

// ---------------------------------------------------------------------------
// Breadcrumbs
// ---------------------------------------------------------------------------

export function breadcrumbJsonLd(
  trail: { name: string; path: string }[]
): JsonLdObject {
  return compact({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((c, i) =>
      compact({
        "@type": "ListItem",
        position: i + 1,
        name: c.name,
        item: absolute(c.path),
      })
    ),
  });
}
