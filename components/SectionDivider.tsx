/**
 * SVG shape divider between sections of different tone.
 *
 * Uses preserveAspectRatio="none" so the curve stretches to any width without
 * a horizontal scrollbar — the usual failure mode for shape dividers is a
 * fixed-width SVG overflowing the viewport on mobile. Height shrinks at small
 * breakpoints so the curve stays a detail rather than eating the fold.
 *
 * The divider is purely decorative and is hidden from assistive tech.
 */

export type DividerShape = "curve" | "slope" | "arch";

const PATHS: Record<DividerShape, string> = {
  // A shallow, even curve. The workhorse.
  curve: "M0,64 C360,0 1080,0 1440,64 L1440,80 L0,80 Z",
  // Asymmetric — gives direction without drama.
  slope: "M0,80 L1440,8 L1440,80 Z",
  // A wide, low arch. Echoes the crescent without being literal about it.
  arch: "M0,80 C480,8 960,8 1440,80 L1440,80 L0,80 Z",
};

export default function SectionDivider({
  shape = "curve",
  /** Tailwind text-* class naming the colour of the section BELOW. */
  fill,
  flip = false,
  className = "",
}: {
  shape?: DividerShape;
  fill: string;
  flip?: boolean;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none relative -mb-px w-full overflow-hidden leading-[0] ${
        flip ? "rotate-180" : ""
      } ${className}`}
    >
      <svg
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        className={`block h-8 w-full sm:h-12 lg:h-16 ${fill}`}
        focusable="false"
      >
        <path d={PATHS[shape]} fill="currentColor" />
      </svg>
    </div>
  );
}
