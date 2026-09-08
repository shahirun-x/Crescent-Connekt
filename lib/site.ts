const PRODUCTION_URL = "https://crescent-global-calender.vercel.app";

// Resolve the public site URL. `NEXT_PUBLIC_SITE_URL` overrides the production
// default (for a custom domain or a preview deployment), but only when it holds
// a real, non-localhost value. This is deliberately defensive:
//   * `.trim() || fallback` catches an env var that is present but empty or
//     whitespace-only (Vercel stores such a value as "" rather than undefined,
//     so a bare `process.env.X || fallback` would still yield "" — falsy, but a
//     `.replace()` chained onto `undefined` would have thrown instead).
//   * the localhost guard stops a stray `http://localhost:3000` (e.g. copied
//     from .env.example into the Vercel dashboard) from poisoning canonical and
//     OG tags on the live site.
function resolveSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return PRODUCTION_URL;
  const normalized = raw.replace(/\/+$/, "");
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(normalized)) {
    return PRODUCTION_URL;
  }
  return normalized;
}

export const SITE_URL = resolveSiteUrl();

export const site = {
  name: "Crescent Global",
  tagline: "One Crescent. One Community. One Global Network.",
  /**
   * Used as the site-wide meta description and OG description.
   *
   * Kept under 155 characters: Google truncates around there, and a sentence
   * cut mid-word reads as neglect. The longer positioning statement lives on
   * /about, where there is room for it.
   */
  description:
    "A unified portal for the Crescent ecosystem — a guide and coordination layer across its educational, healthcare and community institutions.",
  url: SITE_URL,
  contactEmail: "connect@crescentglobal.org",
};

export const nav = [
  { href: "/", label: "Home" },
  { href: "/institutions", label: "Institutions" },
  { href: "/calendar", label: "Central Calendar" },
  { href: "/news", label: "News & Events" },
  { href: "/connect", label: "Crescent Connect" },
  { href: "/about", label: "About CGOM" },
  { href: "/contact", label: "Contact" },
];

/**
 * One visual identity per institution category, reused by the map markers, the
 * institution-card header bars and the ecosystem pillar cards. `hex` is for
 * Leaflet (inline SVG/CSS); the rest are full Tailwind class strings.
 */
export const institutionCategoryStyle: Record<
  "education" | "healthcare" | "community" | "innovation",
  { hex: string; bar: string; cardGradient: string }
> = {
  education: {
    hex: "#2563eb",
    bar: "bg-blue-600",
    cardGradient: "bg-gradient-to-br from-blue-50/80 to-white",
  },
  healthcare: {
    hex: "#10b981",
    bar: "bg-emerald-500",
    cardGradient: "bg-gradient-to-br from-emerald-50/80 to-white",
  },
  community: {
    hex: "#f97316",
    bar: "bg-orange-500",
    cardGradient: "bg-gradient-to-br from-orange-50/80 to-white",
  },
  innovation: {
    hex: "#8b5cf6",
    bar: "bg-violet-500",
    cardGradient: "bg-gradient-to-br from-violet-50/80 to-white",
  },
};

/**
 * Map tiles — OpenStreetMap standard.
 *
 * HISTORY, so this is not "improved" back to CARTO a third time:
 * CARTO's free dark basemap has now started watermarking every tile with
 * "API KEY REQUIRED", diagonally across the image. It still returns HTTP 200
 * with a valid PNG, so nothing fails loudly — the watermark is baked into the
 * pixels. Both the old `cartodb-basemaps-*.fastly.net` host and the newer
 * `{s}.basemaps.cartocdn.com` host now do this.
 *
 * OSM standard tiles are genuinely free and keyless, with no watermark.
 * Verified by fetching the Chennai tile (z10/740/474) and looking at it.
 *
 * These tiles are LIGHT, where CARTO's were dark. The map surround is styled
 * for light tiles to match — see InstitutionMap.
 *
 * OSM's tile usage policy requires an identifying User-Agent or Referer.
 * A browser sends a Referer automatically, which satisfies it for this use.
 * If traffic ever grows past casual volume, move to a hosted provider rather
 * than leaning harder on the volunteer-funded servers.
 */
export const MAP_TILE_URL =
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
// OSM serves a/b/c only. CARTO also offered "d"; leaving it in would 404 on
// roughly a quarter of tile requests.
export const MAP_TILE_SUBDOMAINS = ["a", "b", "c"];
// Attribution is a licence condition, not decoration. CARTO is no longer
// credited because CARTO tiles are no longer served.
export const MAP_TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

export const categoryMeta: Record<
  string,
  { label: string; blurb: string }
> = {
  education: {
    label: "Education",
    blurb: "Schools, colleges and a deemed university spanning school-age to doctoral study.",
  },
  healthcare: {
    label: "Healthcare",
    blurb: "Hospitals and nursing education serving communities across Tamil Nadu.",
  },
  community: {
    label: "Community",
    blurb: "Children's homes, welfare programmes and outreach for underprivileged families.",
  },
  innovation: {
    label: "Research & Innovation",
    blurb:
      "Cross-institutional research capabilities, shared centres of excellence, and a common innovation pipeline from ideas to global commercialization.",
  },
};

export function formatDateRange(start: string, end?: string | null): string {
  const s = new Date(start + "T00:00:00");
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  if (!end || end === start) return fmt(s);
  const e = new Date(end + "T00:00:00");
  const sameMonth =
    s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear();
  if (sameMonth) {
    return `${s.getDate()}–${e.getDate()} ${e.toLocaleDateString("en-IN", {
      month: "short",
      year: "numeric",
    })}`;
  }
  return `${fmt(s)} – ${fmt(e)}`;
}
