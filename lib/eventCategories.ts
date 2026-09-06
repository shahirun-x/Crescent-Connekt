import type { EventCategory } from "./types";

export const EVENT_CATEGORIES: EventCategory[] = [
  "Schools",
  "Colleges",
  "University",
  "Healthcare",
  "Alumni",
  "Community",
  "Sports",
  "Cultural",
  "Conferences",
];

export type CategoryFilter = "All" | EventCategory;

export const CATEGORY_FILTERS: CategoryFilter[] = ["All", ...EVENT_CATEGORIES];

/**
 * One colour per event category, shared by the calendar dots, the week-view
 * event blocks and the filter pills so the whole page reads as a single system.
 * Class strings are written out in full so Tailwind's scanner keeps them.
 */
export const eventCategoryColor: Record<
  EventCategory,
  { dot: string; glow: string; soft: string; text: string }
> = {
  Schools: {
    dot: "bg-sky-500",
    glow: "ring-2 ring-sky-500/25",
    soft: "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200",
    text: "text-sky-700",
  },
  Colleges: {
    dot: "bg-indigo-500",
    glow: "ring-2 ring-indigo-500/25",
    soft: "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-200",
    text: "text-indigo-700",
  },
  University: {
    dot: "bg-blue-600",
    glow: "ring-2 ring-blue-600/25",
    soft: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200",
    text: "text-blue-700",
  },
  Healthcare: {
    dot: "bg-emerald-500",
    glow: "ring-2 ring-emerald-500/25",
    soft: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
    text: "text-emerald-700",
  },
  Alumni: {
    dot: "bg-amber-500",
    glow: "ring-2 ring-amber-500/25",
    soft: "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200",
    text: "text-amber-800",
  },
  Community: {
    dot: "bg-orange-500",
    glow: "ring-2 ring-orange-500/25",
    soft: "bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-200",
    text: "text-orange-700",
  },
  Sports: {
    dot: "bg-lime-600",
    glow: "ring-2 ring-lime-600/25",
    soft: "bg-lime-50 text-lime-700 ring-1 ring-inset ring-lime-200",
    text: "text-lime-700",
  },
  Cultural: {
    dot: "bg-fuchsia-500",
    glow: "ring-2 ring-fuchsia-500/25",
    soft: "bg-fuchsia-50 text-fuchsia-700 ring-1 ring-inset ring-fuchsia-200",
    text: "text-fuchsia-700",
  },
  Conferences: {
    dot: "bg-violet-500",
    glow: "ring-2 ring-violet-500/25",
    soft: "bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-200",
    text: "text-violet-700",
  },
};

export const catDot = (c: EventCategory) => eventCategoryColor[c].dot;
export const catGlow = (c: EventCategory) => eventCategoryColor[c].glow;

/**
 * Raw hex per category, for places that need a colour value rather than a
 * class — the CSS custom property behind the no-image card fallback, and any
 * inline SVG. Mirrors the `dot` shade above; keep the two in step.
 */
export const eventCategoryHex: Record<EventCategory, string> = {
  Schools: "#0ea5e9",
  Colleges: "#6366f1",
  University: "#2563eb",
  Healthcare: "#10b981",
  Alumni: "#f59e0b",
  Community: "#f97316",
  Sports: "#65a30d",
  Cultural: "#d946ef",
  Conferences: "#8b5cf6",
};

/** Full `border-l-*` class per category — for the event-card accent border. */
export const eventCategoryBorderL: Record<EventCategory, string> = {
  Schools: "border-l-sky-500",
  Colleges: "border-l-indigo-500",
  University: "border-l-blue-600",
  Healthcare: "border-l-emerald-500",
  Alumni: "border-l-amber-500",
  Community: "border-l-orange-500",
  Sports: "border-l-lime-600",
  Cultural: "border-l-fuchsia-500",
  Conferences: "border-l-violet-500",
};
