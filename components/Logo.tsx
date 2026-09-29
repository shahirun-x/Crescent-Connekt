/**
 * ============================================================================
 * THE CRESCENT CONNEKT WORDMARK — the one place the brand mark is defined
 * ============================================================================
 *
 * TO SWAP IN THE CLIENT'S REAL LOGO FILE
 *
 * Replace the body of <Wordmark> below with an <Image> (or inline <svg>)
 * pointing at the supplied asset. That is the whole change — the header,
 * footer, 404 and error pages all render this component, so nothing else needs
 * touching:
 *
 *   import Image from "next/image";
 *   import wordmark from "@/public/brand/crescent-connekt.svg";
 *   ...
 *   <Image src={wordmark} alt="Crescent Connekt" priority height={32} />
 *
 * Keep the accessible name as "Crescent Connekt", and keep `mono` working —
 * the footer and dark sections render the mark on navy.
 *
 * CURRENT MARK
 *
 * Typeset rather than an image: "CrescentConneKt" in the display serif,
 * matching the holding page at crescentconnekt.com — "Crescent" and "Kt" in
 * navy, "Conne" in red. Typesetting keeps it crisp at any size, costs no
 * request, and inherits the font the site already loads.
 */

interface LogoProps {
  className?: string;
  /** Single colour, for dark grounds where the red would vibrate. */
  mono?: boolean;
  /** Tagline beneath the mark. Off by default; the footer wants it. */
  withTagline?: boolean;
  /** Tailwind text-size class for the mark itself. */
  size?: string;
}

export default function Logo({
  className,
  mono = false,
  withTagline = false,
  size = "text-[1.3rem]",
}: LogoProps) {
  return (
    <span className={`inline-flex flex-col leading-none ${className ?? ""}`}>
      <Wordmark mono={mono} size={size} />
      {withTagline && (
        <span
          className={`mt-2 text-[0.72rem] leading-snug ${
            mono ? "text-crescent-100" : "text-slate-600"
          }`}
        >
          One Crescent. Many institutions. One connected network.
        </span>
      )}
    </span>
  );
}

function Wordmark({ mono, size }: { mono: boolean; size: string }) {
  // One accessible name for the whole mark — the coloured spans are
  // typography, not three separate words.
  return (
    <span
      role="img"
      aria-label="Crescent Connekt"
      className={`font-serif font-semibold tracking-[-0.015em] ${size}`}
    >
      <span aria-hidden="true" className={mono ? "text-white" : "text-crescent-900"}>
        Crescent
      </span>
      <span
        aria-hidden="true"
        className={mono ? "text-crescent-200" : "text-accent-600"}
      >
        Conne
      </span>
      <span aria-hidden="true" className={mono ? "text-white" : "text-crescent-900"}>
        Kt
      </span>
    </span>
  );
}
