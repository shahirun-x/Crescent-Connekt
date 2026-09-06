import Image from "next/image";
import type { SiteImage } from "@/lib/images";

/**
 * Full-bleed photographic band between two heavy text sections.
 *
 * The About page runs long stretches of prose; this gives the eye somewhere to
 * rest without introducing another card. An optional quote sits over the
 * image — when used, the scrim is darkened enough that white text clears AA
 * against the darkest plausible photograph, since we cannot know what will
 * eventually be dropped in here.
 *
 * Height is capped in vh on mobile so a landscape crop never eats the whole
 * screen on a phone.
 */
export default function PhotoBreak({
  image,
  quote,
  attribution,
  className = "",
}: {
  image: SiteImage;
  quote?: string;
  attribution?: string;
  className?: string;
}) {
  return (
    <section
      className={`relative isolate overflow-hidden bg-crescent-950 ${className}`}
      aria-label={quote ? undefined : "Photograph"}
    >
      <Image
        src={image.src}
        alt={image.alt}
        fill
        sizes="100vw"
        className="-z-10 object-cover"
      />

      {/* Scrim. crescent-950/72 keeps white text above 7:1 even over a bright
          sky, which is the worst case for a campus photograph. */}
      <div
        aria-hidden="true"
        className={`absolute inset-0 -z-10 ${
          quote ? "bg-crescent-950/72" : "bg-crescent-950/35"
        }`}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-50"
        style={{
          backgroundImage:
            "radial-gradient(40rem 20rem at 20% 0%, rgba(107,206,196,0.22), transparent 60%)",
        }}
      />

      {quote ? (
        <blockquote className="container-page flex min-h-[16rem] flex-col justify-center py-16 sm:min-h-[20rem] md:py-24">
          <p className="max-w-3xl text-balance text-xl font-semibold leading-snug text-white sm:text-2xl md:text-3xl">
            <span aria-hidden="true" className="text-gold-300">
              &ldquo;
            </span>
            {quote}
            <span aria-hidden="true" className="text-gold-300">
              &rdquo;
            </span>
          </p>
          {attribution && (
            <footer className="mt-5 flex items-center gap-2.5 text-sm font-semibold text-crescent-100">
              <span aria-hidden="true" className="h-px w-8 bg-gold-300/70" />
              {attribution}
            </footer>
          )}
        </blockquote>
      ) : (
        <div className="h-40 sm:h-56 md:h-72" />
      )}
    </section>
  );
}
