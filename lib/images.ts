/**
 * ============================================================================
 * SINGLE SOURCE OF TRUTH FOR EVERY PHOTOGRAPH ON THE SITE
 * ============================================================================
 *
 * HOW TO SWAP IN REAL CLIENT PHOTOGRAPHY
 *
 * Change `src` on the entry below and flip `placeholder` to false. That is the
 * whole job — one line per image, no hunting through components.
 *
 * For a slot currently rendering a `tone` block, set `src` and delete `tone`.
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

export interface SiteImage {
  /** Swap this to the real asset. Undefined means the slot uses `tone`. */
  src?: string;
  /**
   * Tailwind background classes for a designed neutral panel, used when no
   * honest photograph exists. Flat warm tones — deliberately NOT a gradient
   * blob or a mesh, which would read as decoration rather than as reserved
   * space. Delete once a real photo lands.
   */
  tone?: string;
  /** Empty string only for decorative images with adjacent naming text. */
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
  /** True while this is a stand-in. Flip to false when the real photo lands. */
  placeholder: boolean;
  /** Above-the-fold on first paint. At most one per route. */
  priority?: boolean;
}

const unsplash = (id: string, w = 1600) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`;

/** True when this slot should render a tone block rather than an <Image>. */
export const isTone = (i: SiteImage) => !i.src && !!i.tone;

// ---------------------------------------------------------------------------
// Homepage — hero
// ---------------------------------------------------------------------------

export const HERO: SiteImage = {
  src: "/images/home/HERO-1D.webp",
  alt: "Students walking along the tree-lined avenue on the Crescent campus at Vandalur",
  where: "Homepage hero, full-bleed, desktop and tablet (768px and up)",
  crop:
    "Landscape 16:9 or wider. The headline sits BOTTOM-LEFT over a scrim, so " +
    "keep the lower-left third free of faces and detail.",
  brief:
    "The single most important photograph on the site. Convocation, assembly " +
    "or an ordinary busy moment at Vandalur — students clearly the subject, " +
    "campus recognisable behind them. Late-afternoon light. Candid, not lined " +
    "up for the camera. One frame where someone is mid-sentence beats ten " +
    "where everyone is smiling at the lens.",
  avoid:
    "Empty campus (reads as a brochure for a building), drone shots, rows of " +
    "people posed front-on, harsh midday sun.",
  minResolution: "3000px wide",
  placeholder: false,
  priority: true,
};

export const HERO_2: SiteImage = {
  src: "/images/home/HERO-2D.webp",
  alt: "Students playing football at Crescent Residential Matriculation Higher Secondary School",
  where: "Homepage hero slide 2 — residential school athletics",
  crop: "Landscape 16:9 or wider.",
  brief:
    "Sports and campus activities at Crescent Residential School in Vandalur.",
  avoid: "Staged posed lineups.",
  minResolution: "3000px wide",
  placeholder: false,
};

export const HERO_3: SiteImage = {
  src: "/images/home/HERO-3D.webp",
  alt: "Students in collaborative classroom study at Crescent Girls School",
  where: "Homepage hero slide 3 — classroom learning",
  crop: "Landscape 16:9 or wider.",
  brief:
    "Collaborative study and discussion inside the classroom.",
  avoid: "Stiff camera-facing poses.",
  minResolution: "3000px wide",
  placeholder: false,
};

export const HERO_4: SiteImage = {
  src: "/images/home/HERO-4D.webp",
  alt: "Students studying in the university central library",
  where: "Homepage hero slide 4 — central library research",
  crop: "Landscape 16:9 or wider.",
  brief:
    "University library study and research sessions with students at work.",
  avoid: "Empty library corridors.",
  minResolution: "3000px wide",
  placeholder: false,
};

export const HERO_5: SiteImage = {
  src: "/images/home/HERO-5D.webp",
  alt: "Student presenting in the university auditorium",
  where: "Homepage hero slide 5 — auditorium presentation and symposium",
  crop: "Landscape 16:9 or wider.",
  brief:
    "Student presentation or keynote before an engaged audience.",
  avoid: "Empty auditorium seats.",
  minResolution: "3000px wide",
  placeholder: false,
};

export const HERO_SLIDES: SiteImage[] = [
  HERO,
  HERO_2,
  HERO_3,
  HERO_4,
  HERO_5,
];

export const HERO_MOBILE: SiteImage = {
  src: "/images/home/HERO-1D.webp",
  alt: "Students on the Crescent campus at Vandalur",
  where: "Homepage hero below 768px — replaces HERO entirely, never crops it",
  crop:
    "Portrait 4:5 or 3:4. Subject in the UPPER half; the headline occupies " +
    "the lower half of the frame.",
  brief:
    "Shot for the phone, on the same day as HERO but composed vertically. " +
    "One or two students rather than a crowd — a wide group becomes " +
    "unreadable at 390px. Close enough to read a face.",
  avoid:
    "Cropping the landscape hero instead of shooting this. Wide group shots. " +
    "Detail that only survives at desktop size.",
  minResolution: "1600px wide",
  placeholder: false,
};

// ---------------------------------------------------------------------------
// Homepage — the institutions, by place
//
// Real photography for Chennai and Kilakarai. Madurai and Nagore step from
// warm sand to cool grey until client photographs land.
// ---------------------------------------------------------------------------

const PLACE_AVOID =
  "Temple gopurams, generic city skylines, traffic, tourist landmarks. This " +
  "is a photograph of an institution in its town, not a photograph of the " +
  "town. If the campus is not identifiable in it, it is the wrong frame.";

export const PLACE_CHENNAI: SiteImage = {
  src: "/images/home/Chennai__CIIC.webp",
  alt: "Crescent Innovation & Incubation Council (CIIC) campus at Vandalur, Chennai",
  where: "Homepage, 'The institutions, by place' — Chennai and Vandalur row",
  crop: "Landscape 4:3. Sits beside a typographic list of institutions.",
  brief:
    "The Vandalur campus as it actually is — the gate, a main building with " +
    "people moving through it, or the main block seen from the approach road. " +
    "Students in frame, walking rather than posed.",
  avoid: PLACE_AVOID,
  minResolution: "2400px wide",
  placeholder: false,
};

export const PLACE_KILAKARAI: SiteImage = {
  src: "/images/home/Thassim-beevi.webp",
  alt: "Thassim Beevi Abdul Kader College for Women campus in Kilakarai",
  where: "Homepage, 'The institutions, by place' — Kilakarai row",
  crop: "Landscape 4:3.",
  brief:
    "Kilakarai is where the trust's coastal institutions and the medical " +
    "centre sit. Shoot the school or the medical centre with people present — " +
    "a clinician with a patient, students at the gate. The coastal light is " +
    "distinctive; use it.",
  avoid: PLACE_AVOID + " Also avoid empty clinical corridors.",
  minResolution: "2400px wide",
  placeholder: false,
};

export const PLACE_MADURAI: SiteImage = {
  tone: "bg-[#cdbfa6]",
  alt: "",
  where: "Homepage, 'The institutions, by place' — Madurai row",
  crop: "Landscape 4:3.",
  brief:
    "The Madurai institution in its own setting, with students. A classroom " +
    "through a window, a corridor between classes, the entrance at the start " +
    "of the day.",
  avoid: PLACE_AVOID + " Specifically: not the Meenakshi temple.",
  minResolution: "2400px wide",
  placeholder: true,
};

export const PLACE_NAGORE: SiteImage = {
  tone: "bg-[#b2b6bd]",
  alt: "",
  where: "Homepage, 'The institutions, by place' — Nagore row",
  crop: "Landscape 4:3.",
  brief:
    "The Nagore institution, with students or staff in frame. As with the " +
    "others: the building alone says nothing, the people in it say everything.",
  avoid: PLACE_AVOID,
  minResolution: "2400px wide",
  placeholder: true,
};

// ---------------------------------------------------------------------------
// Homepage — what Crescent Connekt does
// ---------------------------------------------------------------------------

export const FEATURE_CALENDAR: SiteImage = {
  // A bright Indian classroom mid-term. The calendar is about term dates and
  // the rhythm of an academic year, so an ordinary working day is the subject.
  src: unsplash("1719159381916-062fa9f435a6", 1600),
  alt: "",
  where: "Homepage, 'What Crescent Connekt does' — the large Calendar feature",
  crop: "Landscape 3:2. The largest of the three feature images.",
  brief:
    "The academic year in motion: an assembly, a prize day, an inter-school " +
    "fixture, a convocation — something dated, with a crowd. The Central " +
    "Calendar exists so these stop clashing, so the photograph should look " +
    "like an event worth not clashing with.",
  avoid:
    "Literal calendars, diaries, planners or wall charts. A screen with a " +
    "calendar app open on it.",
  minResolution: "2400px wide",
  placeholder: true,
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
  // Someone addressing a gathering — a chapter meeting in progress.
  src: unsplash("1551731409-43eb3e517a1a", 1600),
  alt: "",
  where: "Homepage, the closing Member Network invitation",
  crop:
    "Landscape 16:9, wide. Runs nearly full width with the invitation beside " +
    "or beneath it.",
  brief:
    "People together and glad to be — a reunion, a chapter gathering, alumni " +
    "back on campus. Mixed ages in one frame is what sells a network spanning " +
    "generations. Warm and candid.",
  avoid:
    "A posed group lined up against a wall. Anyone looking at the camera and " +
    "waiting for the shutter.",
  minResolution: "3000px wide",
  placeholder: true,
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
  src: "/images/home/Chennai__CIIC.webp",
  alt: "Crescent Innovation & Incubation Council (CIIC) at Vandalur, Chennai",
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
  HERO_MOBILE,
  HERO_2,
  HERO_3,
  HERO_4,
  HERO_5,
  PLACE_CHENNAI,
  PLACE_KILAKARAI,
  PLACE_MADURAI,
  PLACE_NAGORE,
  FEATURE_CALENDAR,
  FEATURE_NETWORK,
  FEATURE_INSTITUTIONS,
  HERITAGE,
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
