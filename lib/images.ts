/**
 * ============================================================================
 * SINGLE SOURCE OF TRUTH FOR EVERY PHOTOGRAPH ON THE SITE
 * ============================================================================
 *
 * HOW TO SWAP IN REAL CLIENT PHOTOGRAPHY
 *
 * Put the file in public/images/home/ as <subject>-desktop.webp and/or
 * <subject>-mobile.webp, import it below, set `desktop` / `mobile` on the
 * entry and flip `placeholder` to false. One import and one line per image.
 * If only one crop exists, set `focal` (CSS object-position) so the subject
 * survives the other aspect — check it by cropping, not by guessing.
 *
 * For a slot currently rendering a `tone` block, add the photo and delete `tone`.
 *
 * SEE THE BRIEFS ON THE LIVE PAGE
 *
 * Append `?shots=1` to any page to overlay each slot's name and brief on the
 * image itself, so a photographer can be walked through the site slot by slot.
 * The same briefs are collected in `docs/PHOTO_BRIEF.md` as a shot list.
 *
 * ---------------------------------------------------------------------------
 * THE SELECTION RULE — the one that matters
 * ---------------------------------------------------------------------------
 *
 * A wrong image is worse than no image.
 *
 * Every stand-in must show South Asian people in genuine educational,
 * healthcare or community settings. Not Western campuses. Not city skylines.
 * Not stock photographs of visibly impoverished children — using those to
 * stand in for Tamil Nadu misrepresents both the work and the people, and an
 * institutional trust should not trade on that imagery.
 *
 * **If no genuinely fitting stand-in exists, the slot renders a designed
 * neutral toned block.** That is a deliberate choice, not a missing asset. It
 * is honest about having no photograph, and it tells the client exactly which
 * pictures only they can supply.
 *
 * Applying that rule cleared out every photograph the site used to carry. All
 * seven were Western stock: students in an American bookshop, friends on a
 * beach at sunset, a Western classroom, a white clinician with a white
 * patient, a volunteer at a Western event, a team of Western founders at
 * laptops, and graduates photographed against the Singapore skyline. Each one
 * quietly told a visitor that this network is somewhere else.
 *
 * The four PLACE slots have no photograph at all, and that is the most
 * important entry in this file. Chennai, Kilakarai, Madurai and Nagore are
 * where these institutions actually are. Stock libraries offer city streets,
 * temple gopurams and coastal scenery for them — none of which shows a
 * Crescent campus, and a Hindu temple tower standing in for a town where an
 * Islamic trust runs a college would be actively wrong. They render tone
 * blocks until the client supplies real photographs.
 *
 * RULES FOR NEW IMAGES
 *
 *  - `alt` is "" only when the image is decorative AND naming text sits
 *    directly beside it. Otherwise write a real description.
 *  - `priority: true` ONLY above the fold. At most one per route.
 *  - Remote hosts must be in next.config.ts images.remotePatterns.
 */

import type { StaticImageData } from "next/image";

// ---------------------------------------------------------------------------
// Client photography — static imports, so next/image knows the real
// dimensions (no layout shift) and generates a blur placeholder for each.
// Files live in public/images/home/ as <subject>-desktop.webp /
// <subject>-mobile.webp; <subject> is the institution id from lib/seed.ts.
// ---------------------------------------------------------------------------
import hero1 from "@/public/images/home/hero-1-desktop.webp";
import hero2 from "@/public/images/home/hero-2-desktop.webp";
import hero3 from "@/public/images/home/hero-3-desktop.webp";
import hero4 from "@/public/images/home/hero-4-desktop.webp";
import hero5 from "@/public/images/home/hero-5-desktop.webp";
import bsaD from "@/public/images/home/bsa-crescent-institute-desktop.webp";
import bsaM from "@/public/images/home/bsa-crescent-institute-mobile.webp";
import ciicD from "@/public/images/home/ciic-desktop.webp";
import girlsD from "@/public/images/home/crescent-girls-school-desktop.webp";
import girlsM from "@/public/images/home/crescent-girls-school-mobile.webp";
import boysD from "@/public/images/home/crescent-residential-boys-school-desktop.webp";
import cschoolD from "@/public/images/home/crescent-school-vandalur-desktop.webp";
import cschoolM from "@/public/images/home/crescent-school-vandalur-mobile.webp";
import bukhariM from "@/public/images/home/buhari-aalim-arabic-college-mobile.webp";
import tbakD from "@/public/images/home/tbak-college-women-desktop.webp";
import pearlD from "@/public/images/home/pearl-matriculation-school-desktop.webp";
import pearlM from "@/public/images/home/pearl-matriculation-school-mobile.webp";
import educD from "@/public/images/home/crescent-college-education-madurai-desktop.webp";
import educM from "@/public/images/home/crescent-college-education-madurai-mobile.webp";
import nursingD from "@/public/images/home/crescent-yz-school-nursing-madurai-desktop.webp";
import nursingM from "@/public/images/home/crescent-yz-school-nursing-madurai-mobile.webp";
import maduraiM from "@/public/images/home/madurai-crescent-school-mobile.webp";
import alMuminD from "@/public/images/home/al-mumin-childrens-home-desktop.webp";
import alMuminM from "@/public/images/home/al-mumin-childrens-home-mobile.webp";
import nagoreD from "@/public/images/home/nagore-crescent-school-desktop.webp";
import nagoreM from "@/public/images/home/nagore-crescent-school-mobile.webp";
import calendarD from "@/public/images/home/central-calendar-desktop.webp";
import networkD from "@/public/images/home/member-network-desktop.webp";
import statementD from "@/public/images/home/network-statement-desktop.webp";

export interface SiteImage {
  /**
   * Client photography, statically imported. When both exist they are two
   * DIFFERENT crops and are art-directed with <picture> (desktop from 768px),
   * never one image squeezed into the other's frame.
   */
  desktop?: StaticImageData;
  mobile?: StaticImageData;
  /**
   * CSS object-position for a photo that has only ONE crop and must survive
   * the other aspect (a landscape in a portrait phone frame, or the reverse).
   * Chosen by looking at the crop, e.g. "52% 50%". Defaults to centre.
   */
  focal?: string;
  /** A remote stand-in (Unsplash). Only for slots with no client photo. */
  src?: string;
  /**
   * Tailwind background classes for a designed neutral panel, used when no
   * honest photograph exists. Flat warm tones — deliberately NOT a gradient
   * blob or a mesh, which would read as decoration rather than as reserved
   * space. Delete once a real photo lands.
   */
  tone?: string;
  /** Describes the actual scene. Empty only when decorative AND named alongside. */
  alt: string;
  /** Where this appears, so a brief can be read in context. */
  where: string;
  /** Orientation and crop the photographer should shoot for. */
  crop: string;
  /** What to capture. Written for a photographer, not for a developer. */
  brief: string;
  /** What will make the frame unusable. */
  avoid: string;
  /** Minimum delivered resolution. */
  minResolution: string;
  /** True while this is a stand-in. False once it is the client's own photograph. */
  placeholder: boolean;
  /** Above-the-fold on first paint. At most one per route. */
  priority?: boolean;
}

const unsplash = (id: string, w = 1600) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`;

/** Any photograph at all — client or stand-in. */
export const hasPhoto = (i: SiteImage) => !!(i.desktop || i.mobile || i.src);

/** True when this slot should render a tone block rather than a photograph. */
export const isTone = (i: SiteImage) => !hasPhoto(i) && !!i.tone;

/** Shared brief text for client photographs that are already in place. */
const SUPPLIED = {
  brief:
    "Supplied by the client. A later reshoot should keep the same subject and " +
    "framing, with students or staff in frame where possible.",
  avoid: "Empty grounds; posed rows facing the lens; harsh midday light.",
} as const;

// ---------------------------------------------------------------------------
// Homepage — hero slideshow. Five desktop frames; no mobile crops were
// supplied, so each carries a focal point checked against a 9:16 crop.
// ---------------------------------------------------------------------------

const heroSlide = (
  n: number,
  desktop: StaticImageData,
  focal: string,
  alt: string
): SiteImage => ({
  desktop,
  focal,
  alt,
  where: `Homepage hero, slide ${n} of 5 (full-bleed; phones crop to portrait at the focal point)`,
  crop:
    "Landscape 16:9. The headline sits BOTTOM-LEFT over a scrim, so keep the " +
    "lower-left third quiet. A portrait 4:5 version would let phones stop cropping.",
  ...SUPPLIED,
  minResolution: "2400px wide",
  placeholder: false,
});

export const HERO: SiteImage = {
  ...heroSlide(1, hero1, "52% 50%",
    "Three students in hijabs walking together along a tree-lined campus avenue"),
  priority: true,
};
export const HERO_2 = heroSlide(2, hero2, "36% 50%",
  "Boys in white shirts playing football on a grass field");
export const HERO_3 = heroSlide(3, hero3, "48% 50%",
  "Girls in grey school uniform studying together around a classroom table");
export const HERO_4 = heroSlide(4, hero4, "60% 50%",
  "Students reading and working on a laptop in a library");
export const HERO_5 = heroSlide(5, hero5, "64% 40%",
  "A student presenting on stage to a full auditorium");

export const HERO_SLIDES: SiteImage[] = [HERO, HERO_2, HERO_3, HERO_4, HERO_5];

// ---------------------------------------------------------------------------
// Homepage — institutions, by place
//
// One photograph per institution, keyed by the institution id in lib/seed.ts.
// Assigned by LOOKING at each picture's signage, not by filename — two of the
// client's filenames were wrong (see docs/PHOTO_BRIEF.md).
// ---------------------------------------------------------------------------

const institution = (
  name: string,
  img: { desktop?: StaticImageData; mobile?: StaticImageData; focal?: string },
  alt: string
): SiteImage => ({
  ...img,
  alt,
  where: `Homepage, 'The institutions, by place' — ${name}`,
  crop:
    img.desktop && img.mobile
      ? "Desktop 16:9 and mobile 4:5, both supplied."
      : img.desktop
        ? "Desktop 16:9 only — a 4:5 portrait would let phones stop cropping."
        : "Mobile 4:5 only — a 16:9 landscape would let desktop stop cropping.",
  ...SUPPLIED,
  minResolution: "2400px wide (desktop), 1200px wide (mobile)",
  placeholder: false,
});

export const INSTITUTION_PHOTOS: Record<string, SiteImage> = {
  "bsa-crescent-institute": institution(
    "B.S. Abdur Rahman Crescent Institute",
    { desktop: bsaD, mobile: bsaM },
    "The white arched entrance gate of B.S. Abdur Rahman University with its name board"
  ),
  "crescent-innovation-incubation-centre": institution(
    "CIIC",
    { desktop: ciicD, focal: "42% 50%" },
    "The covered entrance of the Crescent innovation and incubation building among tropical planting"
  ),
  "crescent-girls-school": institution(
    "Crescent Matriculation HSS for Girls, Chennai",
    { desktop: girlsD, mobile: girlsM },
    "The front of Crescent Matriculation Higher Secondary School for Girls, the Crescent emblem above its entrance"
  ),
  "crescent-residential-boys-school": institution(
    "Crescent Residential Matriculation HSS Boys School",
    { desktop: boysD, focal: "52% 50%" },
    "Rows of boys in blue uniform at morning assembly in front of the residential school"
  ),
  "crescent-school-vandalur": institution(
    "Crescent School (CBSE & IGCSE)",
    { desktop: cschoolD, mobile: cschoolM },
    "Students in rows at assembly outside the Crescent School building"
  ),
  "buhari-aalim-arabic-college": institution(
    "Kilakarai Bukhari Aalim Arabic College (Vandalur campus)",
    { mobile: bukhariM, focal: "50% 42%" },
    "The tall glass-fronted entrance of Kilakarai Bukhari Aalim Arabic College"
  ),
  "tbak-college-women": institution(
    "Thassim Beevi Abdul Kader College for Women",
    { desktop: tbakD, focal: "24% 50%" },
    "The main building of Thassim Beevi Abdul Kader College for Women behind its name sign"
  ),
  "pearl-matriculation-school": institution(
    "Pearl Matriculation School",
    { desktop: pearlD, mobile: pearlM },
    "Pearl Matriculation School's teal-trimmed building with a yellow school bus outside"
  ),
  "crescent-college-education-madurai": institution(
    "Crescent College of Education for Women",
    { desktop: educD, mobile: educM },
    "Students walking through the arched gate of Crescent College of Education for Women"
  ),
  "crescent-yz-school-nursing-madurai": institution(
    "Crescent Yousuf Zulaikha School of Nursing",
    { desktop: nursingD, mobile: nursingM },
    "Nursing students in white uniforms outside the Crescent Yousuf Zulaikha School of Nursing"
  ),
  "madurai-crescent-school": institution(
    "Madurai Crescent Matriculation HSS for Girls",
    { mobile: maduraiM, focal: "50% 45%" },
    "The rounded white front of Madurai Crescent Matriculation Higher Secondary School for Girls"
  ),
  "childrens-homes-community-initiatives": institution(
    "Al Mumin KTMS Hamid Sahib Children Home for Girls",
    { desktop: alMuminD, mobile: alMuminM },
    "The entrance of Al Mumin KTMS Hamid Sahib Children Home for Girls among flowering shrubs"
  ),
  "nagore-crescent-school": institution(
    "Nagore Crescent Matriculation HSS for Girls",
    { desktop: nagoreD, mobile: nagoreM },
    "The green and cream front of Nagore Crescent Matriculation Higher Secondary School for Girls"
  ),
};

/**
 * Each place's lead photograph — shown until a reader hovers or focuses an
 * institution. A distinct object (not the institution's own entry) so that
 * `?shots=1` labels it as the place slot.
 */
const lead = (place: string, id: string): SiteImage => ({
  ...INSTITUTION_PHOTOS[id],
  where: `Homepage, 'The institutions, by place' — ${place} lead photograph`,
});

export const PLACE_CHENNAI = lead("Chennai", "bsa-crescent-institute");
export const PLACE_KILAKARAI = lead("Kilakarai", "tbak-college-women");
export const PLACE_MADURAI = lead("Madurai", "crescent-college-education-madurai");
export const PLACE_NAGORE = lead("Nagore", "nagore-crescent-school");

// ---------------------------------------------------------------------------
// Homepage — what Crescent Connekt does
// ---------------------------------------------------------------------------

export const FEATURE_CALENDAR: SiteImage = {
  desktop: calendarD,
  focal: "46% 50%",
  alt: "A packed auditorium facing a stage screen showing the Crescent Connekt logo",
  where: "Homepage, 'What Crescent Connekt does' — the large Calendar feature",
  crop: "Landscape 16:9 supplied; shown 3:2.",
  ...SUPPLIED,
  minResolution: "2400px wide",
  placeholder: false,
};

export const FEATURE_NETWORK: SiteImage = {
  // People gathered around tables at a session — a meeting, not a mixer.
  src: unsplash("1722573783625-eceb04251036", 1200),
  alt: "",
  where: "Homepage, 'What Crescent Connekt does' — Member Network card",
  crop: "Landscape 3:2, smaller than the calendar feature.",
  brief:
    "Alumni and students in the same room and genuinely talking — a chapter " +
    "meeting, a mentoring session, a panel with the audience visible. Two or " +
    "three people in real conversation beats a full hall.",
  avoid:
    "Corporate networking imagery: lanyards, handshakes to camera, business " +
    "cards, a hotel ballroom.",
  minResolution: "2000px wide",
  placeholder: true,
};

export const FEATURE_INSTITUTIONS: SiteImage = {
  // An Indian campus with students sitting outside it.
  src: unsplash("1635246550194-11af93a2763f", 1200),
  alt: "",
  where: "Homepage, 'What Crescent Connekt does' — Institutions card",
  crop: "Landscape 3:2, smaller than the calendar feature.",
  brief:
    "One Crescent campus, photographed so it is obviously a place with people " +
    "in it. A gateway with students passing, steps at the end of a lecture.",
  avoid: "An architectural elevation with nobody in it. Drone shots.",
  minResolution: "2000px wide",
  placeholder: true,
};

// ---------------------------------------------------------------------------
// Homepage — heritage and members
// ---------------------------------------------------------------------------

export const HERITAGE: SiteImage = {
  // Black and white, a gathered crowd. Reads as archive, which is the point.
  src: unsplash("1701709304274-bd9e5402d979", 1600),
  alt: "",
  where: "Homepage, the dark navy heritage band",
  crop: "Landscape 3:2. Sits on navy at reduced brightness.",
  brief:
    "THE MOST VALUABLE FRAME ON THIS LIST, and the one that cannot be shot — " +
    "it has to be found. A genuine photograph from the founding years: the " +
    "Chetpet school in 1968, the move to Vandalur in 1971, Alhaj B.S. Abdur " +
    "Rahman, an early class or an early building. Check the trust's archive, " +
    "old annual reports and alumni collections. A scanned print with dust and " +
    "a soft corner is worth more here than anything taken this year. Deliver " +
    "the flattest scan available; the page applies its own treatment.",
  avoid:
    "A modern photograph filtered to look old. Reproductions of documents. " +
    "Anything undated.",
  minResolution: "1600px on the long edge, or the best the original allows",
  placeholder: true,
};

export const MEMBERS: SiteImage = {
  desktop: networkD,
  focal: "60% 50%",
  alt: "Two professionals shaking hands beside a Crescent Connekt banner while others talk behind them",
  where: "Homepage, the closing Member Network invitation",
  crop: "Landscape 16:9 supplied; runs full width.",
  ...SUPPLIED,
  minResolution: "2400px wide",
  placeholder: false,
};

/**
 * The full-width statement moment. The client's filename carried the line
 * meant to sit over it — "The network is only as good as who is it" — which
 * the page sets corrected: "…as who is in it."
 */
export const STATEMENT: SiteImage = {
  desktop: statementD,
  focal: "42% 50%",
  alt: "Alumni laughing together over coffee at a reception",
  where: "Homepage, full-width statement between Heritage and the Member Network invitation",
  crop: "Landscape 3:2 supplied; the line sits over its lower-left.",
  ...SUPPLIED,
  minResolution: "2400px wide",
  placeholder: false,
};

// ---------------------------------------------------------------------------
// Other routes
//
// These are outside the homepage redesign but share this file, so they follow
// the same rule. Every photograph they used to carry was Western stock and has
// been replaced by a tone block rather than by another wrong picture.
// ---------------------------------------------------------------------------

export const BANNER_INSTITUTIONS: SiteImage = {
  tone: "bg-crescent-950",
  alt: "",
  where: "/institutions page banner, behind the heading under a heavy scrim",
  crop: "Landscape 21:9 or wider. Composition matters more than detail.",
  brief:
    "A wide view across a Crescent campus with students moving through it, or " +
    "a gateway with people passing.",
  avoid: "Empty architecture. Western collegiate buildings.",
  minResolution: "2800px wide",
  placeholder: true,
};

export const CONNECT_COMMUNITY: SiteImage = {
  tone: "bg-[#b8c6c3]",
  alt: "",
  where: "/connect landing, supporting the Member Network message",
  crop: "Landscape 3:2.",
  brief:
    "Alumni and students together — a chapter gathering, a reunion, a " +
    "mentoring moment. Should feel like belonging, not like a networking event.",
  avoid: "Corporate networking imagery. Beaches, sunsets, arm-in-arm stock.",
  minResolution: "2000px wide",
  placeholder: true,
};

export const CONTACT_VISUAL: SiteImage = {
  tone: "bg-[#d8cbb4]",
  alt: "",
  where: "/contact, beside the form",
  crop: "Portrait 4:5 or square.",
  brief:
    "A Crescent Connekt reception or office with someone actually present — a " +
    "person at a desk, a conversation mid-flow. Calm and approachable.",
  avoid:
    "Empty corporate interiors. Every candidate stock interior was empty and " +
    "cold, which is worse than no photograph.",
  minResolution: "1600px wide",
  placeholder: true,
};

// ---------------------------------------------------------------------------
// Ecosystem pillars (/institutions category cards)
// ---------------------------------------------------------------------------

export const PILLAR_EDUCATION: SiteImage = {
  src: unsplash("1692269725911-87697c558be1", 800),
  alt: "",
  where: "Education pillar card",
  crop: "Landscape 16:7 band.",
  brief:
    "A Crescent classroom or lecture theatre in session, students visibly " +
    "engaged rather than posing. The subject is the learning, not the room.",
  avoid: "Empty classrooms. Equipment close-ups.",
  minResolution: "1600px wide",
  placeholder: true,
};

export const PILLAR_HEALTHCARE: SiteImage = {
  tone: "bg-[#b8c6c3]",
  alt: "",
  where: "Healthcare pillar card",
  crop: "Landscape 16:7 band.",
  brief:
    "The Kilakarai medical centre with people in it — a clinician with a " +
    "patient, staff at reception, a consultation. Warm and human.",
  avoid:
    "Empty corridors. Operating-theatre drama; this is a community medical " +
    "centre, not a surgical suite. Western clinicians and Western patients.",
  minResolution: "1600px wide",
  placeholder: true,
};

export const PILLAR_COMMUNITY: SiteImage = {
  tone: "bg-[#cdbfa6]",
  alt: "",
  where: "Community pillar card",
  crop: "Landscape 16:7 band.",
  brief:
    "A Crescent outreach activity in progress — a camp, a distribution, a " +
    "volunteer team at work. People doing something specific.",
  avoid:
    "Photographing recipients as subjects of need. Photograph the work and " +
    "the people doing it.",
  minResolution: "1600px wide",
  placeholder: true,
};

export const PILLAR_INNOVATION: SiteImage = {
  desktop: ciicD,
  focal: "42% 50%",
  alt: "The covered entrance of the Crescent innovation and incubation building among tropical planting",
  where: "Innovation pillar card",
  crop: "Landscape 16:7 band.",
  brief:
    "The CIIC incubation centre — a team mid-discussion, a prototype on a " +
    "bench, a pitch in progress. Energy over equipment.",
  avoid:
    "Circuit-board macros. A close-up of hardware says nothing about the " +
    "people building it. Western founders at laptops.",
  minResolution: "1600px wide",
  placeholder: false,
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
  HERO,
  HERO_2,
  HERO_3,
  HERO_4,
  HERO_5,
  PLACE_CHENNAI,
  PLACE_KILAKARAI,
  PLACE_MADURAI,
  PLACE_NAGORE,
  ...Object.fromEntries(
    Object.entries(INSTITUTION_PHOTOS).map(([id, img]) => [`INSTITUTION:${id}`, img])
  ),
  FEATURE_CALENDAR,
  FEATURE_NETWORK,
  FEATURE_INSTITUTIONS,
  HERITAGE,
  STATEMENT,
  MEMBERS,
  BANNER_INSTITUTIONS,
  CONNECT_COMMUNITY,
  CONTACT_VISUAL,
  PILLAR_EDUCATION,
  PILLAR_HEALTHCARE,
  PILLAR_COMMUNITY,
  PILLAR_INNOVATION,
};

/** Reverse lookup, so a component can label a slot without being handed its name. */
export const IMAGE_NAMES = new Map<SiteImage, string>(
  Object.entries(ALL_IMAGES).map(([name, img]) => [img, name])
);

/** Names still using a stand-in. Computed, so it cannot drift. */
export const PLACEHOLDER_AUDIT = Object.entries(ALL_IMAGES)
  .filter(([, img]) => img.placeholder)
  .map(([name]) => name);

/** Slots rendering a tone block because no honest photograph exists yet. */
export const TONE_SLOTS = Object.entries(ALL_IMAGES)
  .filter(([, img]) => isTone(img))
  .map(([name]) => name);
