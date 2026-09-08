/**
 * ============================================================================
 * SINGLE SOURCE OF TRUTH FOR EVERY PHOTOGRAPH ON THE SITE
 * ============================================================================
 *
 * HOW TO SWAP IN REAL CLIENT PHOTOGRAPHY
 *
 * Change the `src` on the entry below. That is the whole job — one line per
 * image, no hunting through components. When a real photo replaces a
 * placeholder, flip `placeholder: true` to `false`.
 *
 * For a slot currently rendering a gradient, set `src` and delete `gradient`.
 *
 * SELECTION RULE — the one that matters
 *
 * A wrong image is worse than no image. Every photo here must actually depict
 * the thing it labels, with human presence. Empty rooms, equipment close-ups
 * and unrelated architecture all failed this test and were removed:
 *
 *   - Healthcare was an empty hospital reception with no people.
 *   - Community was a truck being unloaded on an American street.
 *   - Innovation was a circuit-board macro — equipment, not people.
 *   - Education pointed at a dead Unsplash id and served a 29-byte error.
 *
 * Two slots have NO photograph because nothing honest was available. They
 * render a designed gradient instead, which is a deliberate choice rather
 * than a missing asset — see `gradient` below.
 *
 * Also rejected, on dignity grounds rather than composition: stock photographs
 * of visibly impoverished children from other continents. Using those to stand
 * in for Tamil Nadu community work misrepresents the work and the people, and
 * an institutional trust should not trade on that imagery.
 *
 * RULES FOR NEW IMAGES
 *
 *  - `alt` is empty ("") only when the image is decorative AND the naming
 *    text sits directly beside it. Otherwise write a real description.
 *  - `priority: true` ONLY above the fold. At most one per route.
 *  - Remote hosts must be in next.config.ts images.remotePatterns.
 */

export interface SiteImage {
  /** Swap this to the real asset. Undefined means the slot uses `gradient`. */
  src?: string;
  /**
   * Tailwind classes for a designed gradient panel, used when no honest
   * photograph exists for this slot. Delete once a real photo lands.
   */
  gradient?: string;
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

/** True when this slot should render a gradient rather than an <Image>. */
export const isGradient = (i: SiteImage) => !i.src && !!i.gradient;

// ---------------------------------------------------------------------------
// Hero and page banners
// ---------------------------------------------------------------------------

export const HERO_CAMPUS: SiteImage = {
  // Graduates throwing caps at golden hour. Kept because it has what the
  // alternatives lacked: people, warmth and the right emotional register.
  src: unsplash("1541339907198-e08756dedf3f", 1920),
  alt: "",
  brief:
    "REPLACE — the placeholder has a Singapore skyline behind the graduates, " +
    "which is the wrong place. Shoot: graduation or convocation at Vandalur, " +
    "late-afternoon light, students the clear subject, campus recognisable " +
    "behind them. Landscape, with the left third uncluttered so the headline " +
    "can sit over it. People must be present — an empty campus reads as a " +
    "brochure for a building, not for a community.",
  placeholder: true,
  priority: true,
};

export const BANNER_INSTITUTIONS: SiteImage = {
  // No photograph. The stand-in was an American collegiate building with no
  // people, and this band is dimmed to ~85% anyway, so a photo contributed
  // nothing but a wrong signal. A gradient is the honest placeholder.
  gradient:
    "bg-[radial-gradient(52rem_26rem_at_15%_0%,rgba(47,87,166,0.55),transparent_62%),radial-gradient(40rem_24rem_at_92%_100%,rgba(13,118,112,0.42),transparent_62%),linear-gradient(135deg,#0f2140_0%,#12294d_55%,#091428_100%)]",
  alt: "",
  brief:
    "Banner band for the Institutions page. Shoot: a wide view across a " +
    "Crescent campus with students moving through it, or a gateway with " +
    "people passing. Will sit behind a heading under a heavy scrim, so " +
    "composition matters more than detail. Currently a gradient — no honest " +
    "stock photograph of a Crescent campus exists.",
  placeholder: true,
};

export const BANNER_ABOUT_MISSION: SiteImage = {
  // Students collaborating in a library — people, warmth, learning. Keeps.
  src: unsplash("1523240795612-9a054b0db644", 1600),
  alt: "",
  brief:
    "Breathing space between the Mission and Strategic Streams sections. " +
    "Students in genuine discussion — a seminar table, a lab bench, a " +
    "corridor conversation. Candid, not posed to camera. The placeholder has " +
    "the right feeling; replace it with Crescent students.",
  placeholder: true,
};

export const CONNECT_COMMUNITY: SiteImage = {
  // Friends arm-in-arm looking outward — belonging rather than networking.
  src: unsplash("1529156069898-49953e39b3ac", 1600),
  alt: "",
  brief:
    "Supports the Crescent Connect message. Alumni and students together — a " +
    "chapter gathering, a reunion, a mentoring moment. Should feel like " +
    "belonging, not like a corporate networking event.",
  placeholder: true,
};

export const CONTACT_VISUAL: SiteImage = {
  // No photograph. The stand-in was an empty corporate office interior —
  // precisely the "nothing corporate-stock" the brief warns against, with no
  // human presence at all. A gradient is better than a cold wrong room.
  gradient:
    "bg-[radial-gradient(30rem_20rem_at_25%_15%,rgba(107,206,196,0.35),transparent_65%),linear-gradient(150deg,#12294d_0%,#0f2140_60%,#091428_100%)]",
  alt: "",
  brief:
    "Sits beside the contact form. Shoot: the CGOM office or reception with " +
    "someone actually present — a person at a desk, a conversation. Calm and " +
    "approachable. Currently a gradient: every candidate stock interior was " +
    "empty and cold, which is worse than no photograph.",
  placeholder: true,
};

// ---------------------------------------------------------------------------
// Ecosystem pillars
// ---------------------------------------------------------------------------

export const PILLAR_EDUCATION: SiteImage = {
  // Classroom mid-lesson, teacher at the board, students engaged.
  src: unsplash("1509062522246-3755977927d7", 800),
  alt: "",
  brief:
    "Education pillar. A Crescent classroom or lecture theatre in session, " +
    "students visibly engaged rather than posing. Uniforms or campus signage " +
    "welcome. The subject is the learning, not the room.",
  placeholder: true,
};

export const PILLAR_HEALTHCARE: SiteImage = {
  // Clinician in conversation with a patient. Care, not clinical drama.
  src: unsplash("1631217868264-e5b90bb7e133", 800),
  alt: "",
  brief:
    "Healthcare pillar. The Kilakarai medical centre with people in it — a " +
    "clinician with a patient, staff at reception, a consultation. Warm and " +
    "human. Avoid empty corridors and avoid operating-theatre drama; this is " +
    "a community medical centre, not a surgical suite.",
  placeholder: true,
};

export const PILLAR_COMMUNITY: SiteImage = {
  // A volunteer working at a community event.
  src: unsplash("1559027615-cd4628902d4a", 800),
  alt: "",
  brief:
    "Community pillar. A Crescent outreach activity in progress — a camp, a " +
    "distribution, a volunteer team at work. People doing something specific. " +
    "Do NOT photograph recipients as subjects of need; photograph the work " +
    "and the people doing it.",
  placeholder: true,
};

export const PILLAR_INNOVATION: SiteImage = {
  // A team working together in a shared workspace.
  src: unsplash("1522071820081-009f0129c71c", 800),
  alt: "",
  brief:
    "Innovation pillar. The CIIC incubation centre — a team mid-discussion, a " +
    "prototype on a bench, a pitch in progress. Energy over equipment: a " +
    "close-up of hardware says nothing about the people building it.",
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

/** Names still using a stand-in. Computed, so it cannot drift. */
export const PLACEHOLDER_AUDIT = Object.entries(ALL_IMAGES)
  .filter(([, img]) => img.placeholder)
  .map(([name]) => name);

/** Slots rendering a designed gradient because no honest photo exists yet. */
export const GRADIENT_SLOTS = Object.entries(ALL_IMAGES)
  .filter(([, img]) => isGradient(img))
  .map(([name]) => name);
