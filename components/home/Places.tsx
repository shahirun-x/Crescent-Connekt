import Link from "next/link";
import { ShotBrief } from "@/components/Shot";
import { Rise } from "./Figure";
import PlaceRow, { type Photo } from "./PlaceRow";
import {
  IMAGE_NAMES,
  INSTITUTION_PHOTOS,
  PLACE_CHENNAI,
  PLACE_KILAKARAI,
  PLACE_MADURAI,
  PLACE_NAGORE,
  type SiteImage,
} from "@/lib/images";
import type { Institution } from "@/lib/types";

/**
 * The institutions, by place. The heart of the page.
 *
 * Four rows, one per town, each a photograph beside a typographic list. Not a
 * grid of sixteen cards: sixteen equal tiles tell you the network is large and
 * nothing else, while four places with names set large tell you where it is
 * and how it is shaped.
 *
 * The map used to live here and has moved to /institutions. A map on the
 * homepage answers "where exactly", which is a second question — this section
 * answers the first one, and a Leaflet bundle is a lot of JavaScript to ship
 * for a question nobody asked yet.
 */

interface Place {
  name: string;
  /** Cities in lib/seed.ts that belong to this place. Client truth, not guessed. */
  cities: string[];
  note: string;
  image: SiteImage;
}

const PLACES: Place[] = [
  {
    name: "Chennai",
    cities: ["Chennai", "Vandalur"],
    note: "Where it started, and where most of it is.",
    image: PLACE_CHENNAI,
  },
  {
    name: "Kilakarai",
    cities: ["Kilakarai"],
    note: "The coastal town the trust has served longest.",
    image: PLACE_KILAKARAI,
  },
  {
    name: "Madurai",
    cities: ["Madurai"],
    note: "Inland, and the newest of the four.",
    image: PLACE_MADURAI,
  },
  {
    name: "Nagore",
    cities: ["Nagore", "Nagapattinam"],
    note: "On the delta coast, east of Thanjavur.",
    image: PLACE_NAGORE,
  },
];

export default function Places({
  institutions,
}: {
  institutions: Institution[];
}) {
  const rows = PLACES.map((place) => ({
    ...place,
    list: institutions.filter((i) => place.cities.includes(i.city)),
  })).filter((r) => r.list.length > 0);

  return (
    <section className="bg-paper">
      <div className="container-page py-16 md:py-32">
        <Rise>
          <h2 className="type-h1 max-w-[18ch] text-balance text-ink-900">
            Four towns. One family of institutions.
          </h2>
        </Rise>

        <div className="mt-10 md:mt-20">
          {rows.map((row, i) => (
            <div
              key={row.name}
              // Hairline between rows, nothing around them. A rule is enough
              // separation; a border on four sides makes a card.
              className="border-t border-ink-200 py-12 first:border-t-0 first:pt-0 md:py-16"
            >
              <PlaceRow
                name={row.name}
                note={row.note}
                flip={i % 2 === 1}
                lead={photo(row.image)}
                leadBrief={<ShotBrief name={IMAGE_NAMES.get(row.image) ?? row.name} image={row.image} />}
                items={row.list.map((inst) => {
                  const img = INSTITUTION_PHOTOS[inst.id];
                  return {
                    id: inst.id,
                    name: inst.name,
                    year: inst.established_year,
                    url: inst.external_url,
                    photo: img ? photo(img) : undefined,
                    brief: img ? (
                      <ShotBrief name={IMAGE_NAMES.get(img) ?? inst.id} image={img} />
                    ) : undefined,
                  };
                })}
              />
            </div>
          ))}
        </div>

        <Rise delay={0.06}>
          <Link href="/institutions" className="link-rule mt-14 inline-block text-ink-900">
            All sixteen, with the map
          </Link>
        </Rise>
      </div>
    </section>
  );
}

/** Only what the client component needs — never the whole registry entry. */
function photo(img: SiteImage): Photo {
  return { desktop: img.desktop, mobile: img.mobile, focal: img.focal, alt: img.alt };
}
