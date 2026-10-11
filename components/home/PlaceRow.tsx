"use client";

import type { StaticImageData } from "next/image";
import { useState, type ReactNode } from "react";
import PhotoImage from "@/components/PhotoImage";
import Figure, { Rise } from "./Figure";

export interface Photo {
  desktop?: StaticImageData;
  mobile?: StaticImageData;
  focal?: string;
  alt: string;
}

export interface PlaceItem {
  id: string;
  name: string;
  year: number | null;
  url: string;
  photo?: Photo;
  /** Server-rendered `?shots=1` brief for this institution's photo. */
  brief?: ReactNode;
}

/**
 * One place: its name, a lead photograph, and its institutions.
 *
 * DESKTOP. The lead photograph sits beside the typographic list. Hovering an
 * institution's name — or focusing it with the keyboard, which is the same
 * code path — crossfades the frame to that institution's own photograph;
 * leaving the list returns to the lead. Institutions without a photograph keep
 * their row and simply don't swap. The other photographs mount the first time
 * the reader reaches for the list, so a page that is only scrolled past never
 * downloads them.
 *
 * MOBILE. There is no hover, so the photographs become a horizontal
 * scroll-snap strip under the place name, each captioned, followed by the
 * same list. Each strip item is a link, which also makes the strip reachable
 * and scrollable by keyboard.
 *
 * The heading exists once, so a screen reader meets each place once.
 */
export default function PlaceRow({
  name,
  note,
  lead,
  leadBrief,
  items,
  flip,
}: {
  name: string;
  note: string;
  lead: Photo;
  leadBrief?: ReactNode;
  items: PlaceItem[];
  /** Put the photograph on the right (desktop). Rows alternate. */
  flip: boolean;
}) {
  const [active, setActive] = useState<string | null>(null);
  const [primed, setPrimed] = useState(false);

  const withPhoto = items.filter((i) => i.photo);
  const showing = active && withPhoto.some((i) => i.id === active) ? active : null;
  const headingId = `place-${name.toLowerCase()}`;

  // One crop for a frame of a single aspect: the desktop crop if there is one,
  // otherwise the mobile crop cropped at its focal point.
  const single = (p: Photo, prefer: "desktop" | "mobile") =>
    prefer === "desktop"
      ? { desktop: p.desktop ?? p.mobile, mobile: undefined }
      : { desktop: undefined, mobile: p.mobile ?? p.desktop };

  return (
    <section aria-labelledby={headingId} className="md:grid md:grid-cols-2 md:items-start md:gap-14">
      {/* Desktop: the frame. */}
      <div className={`hidden md:block ${flip ? "md:order-2" : ""}`}>
        <Figure>
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-ink-100">
            <Layer visible={!showing}>
              <PhotoImage
                {...single(lead, "desktop")}
                focal={lead.focal}
                alt={lead.alt}
                sizes="(min-width: 1280px) 600px, 45vw"
              />
              {leadBrief}
            </Layer>
            {primed &&
              withPhoto.map((i) => (
                <Layer key={i.id} visible={showing === i.id}>
                  <PhotoImage
                    {...single(i.photo!, "desktop")}
                    focal={i.photo!.focal}
                    // The name is right beside it in the list; repeating the
                    // description here would read every photo on hover.
                    alt=""
                    sizes="(min-width: 1280px) 600px, 45vw"
                  />
                </Layer>
              ))}
          </div>
        </Figure>
      </div>

      <div>
        <Rise>
          <h3 id={headingId} className="type-place text-ink-900">
            {name}
          </h3>
          <p className="type-meta mt-3 text-ink-500">{note}</p>
        </Rise>

        {/* Mobile: the photographs as a captioned strip. */}
        {withPhoto.length > 0 && (
          // The bleed lives on the clipping wrapper: it extends to the screen
          // edges by exactly the container padding (1.25rem), so its width is
          // the viewport's and never more. Inside it, the strip scrolls.
          <Figure className="-mx-5 mt-6 md:hidden">
            <ul
              aria-label={`Photographs of institutions in ${name}`}
              className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-5 px-5 pb-2 [scrollbar-width:none]"
            >
              {withPhoto.map((i) => (
                <li key={i.id} className="w-[72%] max-w-[18rem] shrink-0 snap-start">
                  <a href={i.url} target="_blank" rel="noopener noreferrer" className="group block">
                    <div className="relative aspect-[4/5] overflow-hidden bg-ink-100">
                      <PhotoImage
                        {...single(i.photo!, "mobile")}
                        focal={i.photo!.focal}
                        alt={i.photo!.alt}
                        sizes="(max-width: 767px) 72vw, 288px"
                      />
                      {i.brief}
                    </div>
                    <p className="mt-2.5 text-[0.9rem] leading-snug text-ink-900">
                      {i.name}
                      <span className="sr-only"> (opens in a new tab)</span>
                    </p>
                  </a>
                </li>
              ))}
            </ul>
          </Figure>
        )}

        {/* Both: the list. On desktop it drives the frame. */}
        <ul
          className="mt-8 divide-y divide-ink-100 border-t border-ink-100"
          onPointerEnter={() => setPrimed(true)}
          onMouseLeave={() => setActive(null)}
          onFocus={() => setPrimed(true)}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setActive(null);
          }}
        >
          {items.map((inst) => {
            const on = showing === inst.id;
            return (
              <li key={inst.id} className="flex items-center justify-between gap-5">
                <a
                  href={inst.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={() => inst.photo && setActive(inst.id)}
                  onFocus={() => inst.photo && setActive(inst.id)}
                  className={`flex min-h-[3rem] flex-1 items-center py-3 transition-colors duration-300 hover:text-accent-700 ${
                    on ? "text-accent-700" : "text-ink-900"
                  }`}
                >
                  {inst.name}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
                <span className="type-meta shrink-0 text-ink-500">{inst.year ?? "—"}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/** A crossfading layer of the desktop frame. */
function Layer({ visible, children }: { visible: boolean; children: ReactNode }) {
  return (
    <div
      aria-hidden={!visible}
      className={`absolute inset-0 transition-opacity duration-700 ease-out ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      {children}
    </div>
  );
}
