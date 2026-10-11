"use client";

import { getImageProps, type StaticImageData } from "next/image";
import { useEffect, useRef, useState } from "react";

/**
 * A client photograph, art-directed and faded in from its blur placeholder.
 *
 * ART DIRECTION. When a desktop AND a mobile crop exist they are different
 * photographs of the same subject, composed for different frames. They are
 * served through <picture> with a media query — the browser picks one and
 * downloads only that one — rather than one image squeezed into both frames.
 * With a single crop, `focal` (CSS object-position) keeps the subject in frame
 * when the box is a different aspect from the file.
 *
 * BLUR → SHARP. The blur placeholder is a layer underneath. The <img> above it
 * is visible by default; only if JavaScript finds it still loading after
 * hydration does it drop to opacity 0 and fade up on `load`. So:
 *   - with no JavaScript the photograph simply appears, never stuck hidden;
 *   - an image that loaded before hydration is never hidden and re-shown;
 *   - `instant` (the LCP image) skips the fade entirely — LCP does not count
 *     an element while it is transparent, so fading the hero would delay it.
 *
 * The parent must be positioned and sized: the image fills it.
 */
export default function PhotoImage({
  desktop,
  mobile,
  alt,
  sizes,
  focal = "50% 50%",
  priority = false,
  instant = false,
  className = "",
}: {
  desktop?: StaticImageData;
  mobile?: StaticImageData;
  alt: string;
  /** Required: without it the browser downloads the widest candidate. */
  sizes: string;
  focal?: string;
  priority?: boolean;
  /** Skip the blur fade (above-the-fold / LCP images). */
  instant?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLImageElement>(null);
  const [phase, setPhase] = useState<"idle" | "pending" | "loaded">("idle");

  useEffect(() => {
    if (instant) return;
    const img = ref.current;
    if (img && !img.complete) setPhase("pending");
  }, [instant]);

  const base = mobile ?? desktop;
  if (!base) return null;

  const common = { alt, fill: true, sizes, quality: 80, priority } as const;
  const { props: img } = getImageProps({ ...common, src: base });
  // Both crops present: desktop from 768px up, mobile below. The <img> itself
  // carries the mobile set and is what a browser without <picture> gets.
  const desktopSrcSet =
    desktop && mobile ? getImageProps({ ...common, src: desktop }).props.srcSet : undefined;

  const blurLayer = (src: StaticImageData, cls: string) =>
    src.blurDataURL ? (
      <span
        aria-hidden="true"
        className={`absolute inset-0 ${cls}`}
        style={{
          backgroundImage: `url("${src.blurDataURL}")`,
          backgroundSize: "cover",
          backgroundPosition: focal,
          filter: "blur(14px)",
          transform: "scale(1.06)",
        }}
      />
    ) : null;

  return (
    <>
      {desktop && mobile ? (
        <>
          {blurLayer(mobile, "md:hidden")}
          {blurLayer(desktop, "hidden md:block")}
        </>
      ) : (
        blurLayer(base, "")
      )}
      <picture>
        {desktopSrcSet && (
          <source media="(min-width: 768px)" srcSet={desktopSrcSet} sizes={sizes} />
        )}
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img
          {...img}
          ref={ref}
          onLoad={() => setPhase("loaded")}
          style={{ ...img.style, objectFit: "cover", objectPosition: focal }}
          className={`transition-opacity duration-700 ease-out ${
            phase === "pending" ? "opacity-0" : "opacity-100"
          } ${className}`}
        />
      </picture>
    </>
  );
}
