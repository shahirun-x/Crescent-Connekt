import type { ReactNode } from "react";

/**
 * Section rhythm primitive.
 *
 * The page used to be white boxes stacked vertically. This gives each major
 * section a declared ground so the eye gets a change of temperature as it
 * scrolls. The rule the layout follows: never two identical tones in a row.
 *
 * Textures are deliberately near-invisible — around 3–5% opacity. They should
 * register as warmth, not as pattern. On the navy tone the texture is a light
 * radial bloom rather than a grid, because a dot grid on dark reads as noise.
 */

export type SectionTone = "white" | "warm" | "sand" | "navy" | "deep";

const TONES: Record<
  SectionTone,
  { bg: string; text: string; texture?: string }
> = {
  white: {
    bg: "bg-white",
    text: "text-crescent-900",
  },
  warm: {
    // sand-50: the lightest warm ground. 15.49:1 with text-primary.
    bg: "bg-sand-50",
    text: "text-crescent-900",
    texture: "texture-dots",
  },
  sand: {
    // sand-100: a touch more presence, for sections that need to hold weight.
    bg: "bg-sand-100",
    text: "text-crescent-900",
    texture: "texture-dots",
  },
  navy: {
    bg: "bg-crescent-900",
    text: "text-white",
    texture: "texture-bloom",
  },
  deep: {
    bg: "bg-crescent-950",
    text: "text-white",
    texture: "texture-bloom",
  },
};

export function isDarkTone(tone: SectionTone) {
  return tone === "navy" || tone === "deep";
}

export default function Section({
  tone = "white",
  children,
  className = "",
  containerClassName = "",
  id,
  as: Tag = "section",
  ariaLabelledBy,
}: {
  tone?: SectionTone;
  children: ReactNode;
  className?: string;
  containerClassName?: string;
  id?: string;
  as?: "section" | "div";
  ariaLabelledBy?: string;
}) {
  const t = TONES[tone];

  return (
    <Tag
      id={id}
      aria-labelledby={ariaLabelledBy}
      className={`relative isolate ${t.bg} ${t.text} ${className}`}
    >
      {t.texture && (
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 -z-10 ${t.texture}`}
        />
      )}
      <div className={`container-page ${containerClassName}`}>{children}</div>
    </Tag>
  );
}
