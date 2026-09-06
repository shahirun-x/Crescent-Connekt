/**
 * ============================================================================
 * SINGLE SOURCE OF TRUTH FOR EVERY PHOTOGRAPH ON THE SITE
 * ============================================================================
 *
 * HOW TO SWAP IN REAL CLIENT PHOTOGRAPHY
 *
 * Change the `src` on the entry below. That is the whole job — one line per
 * image, no hunting through components. Nothing else needs to change: every
 * component reads from here, and the `alt`, aspect ratio and priority travel
 * with the entry.
 *
 * When a real photo replaces a placeholder, also flip `placeholder: true` to
 * `false` so the audit list at the bottom of this file stays honest.
 *
 * WHAT TO SHOOT
 *
 * Each entry carries a `brief` describing the photograph it is standing in
 * for. Hand those briefs to whoever is shooting — they are written to be
 * useful to a photographer, not to a developer.
 *
 * RULES FOR NEW IMAGES
 *
 *  - `alt` is empty ("") only when the image is decorative AND the naming
 *    text sits directly beside it. Otherwise write a real description.
 *  - `priority: true` ONLY for images above the fold on first paint. Every
 *    priority image costs against LCP; there should be at most one per route.
 *  - Remote hosts must be listed in next.config.ts images.remotePatterns.
 *
 * STATUS: every image below is currently an Unsplash PLACEHOLDER.
 * See PLACEHOLDER_AUDIT at the foot of this file.
 */

export interface SiteImage {
  /** Swap this to the real asset. */
  src: string;
  /** Empty string only for decorative images with adjacent naming text. */
  alt: string;
  /** What this should eventually be. Written for a photographer. */
  brief: string;
  /** True while this is a stand-in. Flip to false when the real photo lands. */
  placeholder: boolean;
  /** Above-the-fold on first paint. At most one per route. */
  priority?: boolean;
}

const unsplash = (id: string, w = 1600) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`;

// ---------------------------------------------------------------------------
// Hero and page banners
// ---------------------------------------------------------------------------

export const HERO_CAMPUS: SiteImage = {
  src: unsplash("1541339907198-e08756dedf3f", 1920),
  alt: "",
  brief:
    "Wide establishing shot of the Vandalur campus in warm late-afternoon " +
    "light, students visible walking between buildings. Landscape, room at " +
    "the left third for the headline to sit over it. Avoid empty architecture " +
    "— the point is that the place is alive.",
  placeholder: true,
  priority: true,
};

export const BANNER_INSTITUTIONS: SiteImage = {
  src: unsplash("1562774053-701939374585", 1920),
  alt: "",
  brief:
    "Banner band for the Institutions page. A campus frontage or gateway that " +
    "reads instantly as a place of learning. Shallow crop — this sits behind " +
    "a heading, so keep the busy detail to one side.",
  placeholder: true,
};

export const BANNER_ABOUT_MISSION: SiteImage = {
  src: unsplash("1523240795612-9a054b0db644", 1600),
  alt: "",
  brief:
    "Breathing space between the Mission and Strategic Streams sections. " +
    "Students in discussion — a seminar table, a lab bench, a corridor " +
    "conversation. Candid, not posed to camera.",
  placeholder: true,
};

export const CONNECT_COMMUNITY: SiteImage = {
  src: unsplash("1529156069898-49953e39b3ac", 1600),
  alt: "",
  brief:
    "Warm image supporting the Crescent Connect message: alumni and students " +
    "together, a gathering or a mentoring moment. Should feel like belonging " +
    "rather than networking.",
  placeholder: true,
};

export const CONTACT_VISUAL: SiteImage = {
  src: unsplash("1497366216548-37526070297c", 1200),
  alt: "",
  brief:
    "Sits beside the contact form. The CGOM office, a reception desk, or a " +
    "quiet working space. Calm and approachable; nothing corporate-stock.",
  placeholder: true,
};

// ---------------------------------------------------------------------------
// Ecosystem pillars — one per category, used on the homepage pillar cards
// ---------------------------------------------------------------------------

export const PILLAR_EDUCATION: SiteImage = {
  src: unsplash("1523050854058-8df90110c9f1", 800),
  alt: "",
  brief:
    "Education pillar. A classroom or lecture theatre mid-session, students " +
    "engaged. Crescent uniforms or campus signage visible if possible.",
  placeholder: true,
};

export const PILLAR_HEALTHCARE: SiteImage = {
  src: unsplash("1519494026892-80bbd2d6fd0d", 800),
  alt: "",
  brief:
    "Healthcare pillar. The Kilakarai medical centre — a consulting room, " +
    "reception, or staff at work. Must read as care, not as clinical stock.",
  placeholder: true,
};

export const PILLAR_COMMUNITY: SiteImage = {
  src: unsplash("1593113630400-ea4288922497", 800),
  alt: "",
  brief:
    "Community pillar. An outreach activity — a camp, a distribution, a " +
    "volunteer group. People doing something specific, not posing.",
  placeholder: true,
};

export const PILLAR_INNOVATION: SiteImage = {
  src: unsplash("1518770660439-4636190af475", 800),
  alt: "",
  brief:
    "Innovation pillar. The CIIC incubation centre — a workspace, a prototype " +
    "on a bench, a team mid-discussion. Energy over equipment.",
  placeholder: true,
};

// ---------------------------------------------------------------------------
// Lookups
// ---------------------------------------------------------------------------

import type { Category } from "./types";

export const PILLAR_IMAGES: Record<Category, SiteImage> = {
  education: PILLAR_EDUCATION,
  healthcare: PILLAR_HEALTHCARE,
  community: PILLAR_COMMUNITY,
  innovation: PILLAR_INNOVATION,
};

/**
 * Everything in one place, so the audit below cannot silently go stale.
 */
export const ALL_IMAGES: Record<string, SiteImage> = {
  HERO_CAMPUS,
  BANNER_INSTITUTIONS,
  BANNER_ABOUT_MISSION,
  CONNECT_COMMUNITY,
  CONTACT_VISUAL,
  PILLAR_EDUCATION,
  PILLAR_HEALTHCARE,
  PILLAR_COMMUNITY,
  PILLAR_INNOVATION,
};

/**
 * PLACEHOLDER AUDIT
 *
 * Names still using an Unsplash stand-in. Computed rather than hand-listed so
 * it cannot drift from reality — `node -e` it, or read it in a dev tool.
 */
export const PLACEHOLDER_AUDIT = Object.entries(ALL_IMAGES)
  .filter(([, img]) => img.placeholder)
  .map(([name]) => name);
