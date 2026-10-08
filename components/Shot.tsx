import Image from "next/image";
import { IMAGE_NAMES, isTone, type SiteImage } from "@/lib/images";

/**
 * One image slot.
 *
 * Renders either the photograph or, when no honest photograph exists yet, the
 * designed tone block from `lib/images.ts`. Either way it also emits the
 * photographer's brief as a hidden overlay, revealed by `?shots=1` (see
 * `ShotsMode`). The overlay is `aria-hidden` and `display: none` by default,
 * so it costs nothing at runtime and never reaches assistive technology.
 *
 * This is a server component on purpose: the site has eleven of these on the
 * homepage alone, and making each one a client component to read a query
 * parameter would ship Framer and the whole slot tree to the browser for a
 * feature only the client uses when briefing a photographer.
 */
export default function Shot({
  image,
  sizes,
  className,
  imgClassName,
  priority,
}: {
  image: SiteImage;
  /** Required for photographs — a missing `sizes` downloads the largest source. */
  sizes?: string;
  /** Classes for the frame. Must establish a size; `fill` needs a positioned box. */
  className?: string;
  /** Classes for the <img> itself, e.g. the hover zoom. */
  imgClassName?: string;
  priority?: boolean;
}) {
  const name = IMAGE_NAMES.get(image) ?? "UNNAMED";

  return (
    <div className={`relative overflow-hidden ${className ?? ""}`}>
      {isTone(image) ? (
        <div
          aria-hidden="true"
          className={`absolute inset-0 ${image.tone}`}
          /*
           * A flat tone, not a gradient. The brief bans gradient blobs and
           * meshes, and a reserved space that tries to look decorative reads
           * as a design decision rather than as a photograph that has not
           * arrived. Flat is honest.
           */
        />
      ) : (
        <Image
          src={image.src as string}
          alt={image.alt}
          fill
          sizes={sizes}
          priority={priority ?? image.priority}
          className={`object-cover ${imgClassName ?? ""}`}
        />
      )}

      <ShotBrief name={name} image={image} />
    </div>
  );
}

/**
 * The `?shots=1` overlay.
 *
 * Deliberately verbose — it exists so the client can stand a photographer in
 * front of the live page and say "this frame, here, is the one we need".
 */
function ShotBrief({ name, image }: { name: string; image: SiteImage }) {
  return (
    <div
      aria-hidden="true"
      className="shot-brief absolute inset-0 z-30 overflow-auto bg-crescent-950/92 p-4 text-left text-white sm:p-5"
    >
      <p className="font-mono text-[0.7rem] font-bold uppercase tracking-widest text-gold-300">
        {name}
        {isTone(image)
          ? " · no photograph yet"
          : image.placeholder
          ? " · stand-in"
          : " · real photograph"}
      </p>
      <dl className="mt-3 space-y-2 text-[0.78rem] leading-snug">
        <Row label="Where" value={image.where} />
        <Row label="Crop" value={image.crop} />
        <Row label="Shoot" value={image.brief} />
        <Row label="Avoid" value={image.avoid} />
        <Row label="Min res" value={image.minResolution} />
      </dl>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-mono text-[0.65rem] uppercase tracking-wider text-crescent-200">
        {label}
      </dt>
      <dd className="text-crescent-50">{value}</dd>
    </div>
  );
}
