import Link from "next/link";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";
import Image from "next/image";
import { PILLAR_IMAGES } from "@/lib/images";
import { categoryMeta, institutionCategoryStyle } from "@/lib/site";
import type { Institution } from "@/lib/types";

const order = ["education", "healthcare", "community", "innovation"] as const;

const icons: Record<string, string> = {
  education: "M12 3 1 8l11 5 9-4.09V17h2V8L12 3ZM5 13.18V17c0 1.66 3.13 3 7 3s7-1.34 7-3v-3.82l-7 3.18-7-3.18Z",
  healthcare: "M12 21s-7.5-4.35-10-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 10 6c-2.5 4.65-10 9-10 9Z",
  community:
    "M16 11a3 3 0 1 0-3-3 3 3 0 0 0 3 3Zm-8 0a3 3 0 1 0-3-3 3 3 0 0 0 3 3Zm0 2c-2.67 0-8 1.34-8 4v3h10v-3c0-.99.73-1.86 1.9-2.5A13.4 13.4 0 0 0 8 13Zm8 0c-.29 0-.62 0-.97.05C16.2 14 17 15.03 17 16v3h7v-3c0-2.66-5.33-4-8-4Z",
  innovation:
    "M9 21h6v-1H9v1Zm3-19a7 7 0 0 0-4 12.74V17h8v-2.26A7 7 0 0 0 12 2Z",
};

export default function EcosystemGrid({
  institutions,
}: {
  institutions: Institution[];
}) {
  const counts = institutions.reduce<Record<string, number>>((acc, i) => {
    acc[i.category] = (acc[i.category] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <section className="container-page py-20">
      <SectionHeading
        eyebrow="The Crescent Ecosystem"
        title="Five pillars, one shared mission"
        description="Every institution in the network contributes to the same goal — widening access to education, care and opportunity. Alumni bind it all together."
      />

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {order.map((cat, idx) => {
          const isStrategic = cat === "innovation";
          return (
            <Reveal key={cat} delay={idx * 0.06} as="article">
              <Link
                href={
                  isStrategic
                    ? "/about#strategic-streams"
                    : `/institutions?category=${cat}`
                }
                className={`group flex h-full flex-col overflow-hidden rounded-card border border-slate-200 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-crescent-300 hover:shadow-card-hover ${institutionCategoryStyle[cat].cardGradient}`}
              >
                {/*
                  Pillar photograph. Short band rather than a hero crop so the
                  card stays a card — the image supports the label, it is not
                  the subject. Decorative: the pillar name sits directly below.
                */}
                <span className="relative block aspect-[16/7] w-full overflow-hidden bg-crescent-900">
                  <Image
                    src={PILLAR_IMAGES[cat].src}
                    alt={PILLAR_IMAGES[cat].alt}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-crescent-950/75 via-crescent-950/25 to-transparent"
                  />
                  {/* Icon overlaps the image edge, tying the two halves together. */}
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-5 left-5 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white text-crescent-700 shadow-raised ring-1 ring-slate-200"
                  >
                    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
                      <path d={icons[cat]} />
                    </svg>
                  </span>
                </span>

                <span className="flex flex-1 flex-col p-6 pt-9">
                  <h3 className="type-h3 text-crescent-800">
                    {categoryMeta[cat].label}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
                    {categoryMeta[cat].blurb}
                  </p>
                <p className="mt-4 text-sm font-semibold text-crescent-600 group-hover:text-crescent-700">
                  {isStrategic
                    ? "Explore the strategic streams →"
                    : `${counts[cat] ?? 0} institution${
                        (counts[cat] ?? 0) === 1 ? "" : "s"
                      } →`}
                  </p>
                </span>
              </Link>
            </Reveal>
          );
        })}

        <Reveal delay={order.length * 0.06} as="article">
          <Link
            href="/connect"
            className="group flex h-full flex-col justify-between rounded-card border border-crescent-700 bg-crescent-700 p-6 text-white transition-all hover:-translate-y-0.5 hover:bg-crescent-800"
          >
            <div>
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
                  <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4 0-9 2-9 6v2h18v-2c0-4-5-6-9-6Z" />
                </svg>
              </span>
              <h3 className="mt-4 text-lg font-semibold">Alumni & Crescent Connect</h3>
              <p className="mt-2 text-sm leading-relaxed text-crescent-100">
                A secure network linking students, alumni, faculty, parents and
                well-wishers worldwide.
              </p>
            </div>
            <p className="mt-4 text-sm font-semibold text-gold-300">
              Join Crescent Connect →
            </p>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
