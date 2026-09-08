import Link from "next/link";
import Hero from "@/components/Hero";
import EcosystemGrid from "@/components/EcosystemGrid";
import EventsStrip from "@/components/EventsStrip";
import Timeline from "@/components/Timeline";
import SectionHeading from "@/components/SectionHeading";
import Reveal from "@/components/Reveal";
import Pipeline from "@/components/Pipeline";
import InstitutionMapCard from "@/components/InstitutionMapCard";
import Image from "next/image";
import { BANNER_ABOUT_MISSION } from "@/lib/images";
import Section from "@/components/Section";
import SectionDivider from "@/components/SectionDivider";
import { getEvents, getInstitutions, getTimeline } from "@/lib/data";
import type { Metadata } from "next";

/**
 * The layout's default title is "Crescent Global — One Crescent. One Community.
 * One Global Network." at 66 characters, which Google truncates. `absolute`
 * bypasses the "%s · Crescent Global" template so the homepage gets a title
 * that fits, while the full tagline stays as the OG title for social cards,
 * where the length limit is far more generous.
 */
export const metadata: Metadata = {
  title: { absolute: "Crescent Global — One Network, Many Institutions" },
  alternates: { canonical: "/" },
};

export const revalidate = 3600;

const audiences = [
  {
    title: "Students",
    body: "Discover courses, events and mentors across every Crescent campus — not just your own.",
  },
  {
    title: "Faculty",
    body: "Coordinate shared workshops, research and exchanges through one calendar and directory.",
  },
  {
    title: "Alumni",
    body: "Reconnect with your institution and give back through mentoring, hiring and chapters.",
  },
  {
    title: "Institutions",
    body: "Amplify reach, avoid event clashes and run joint programmes at network scale.",
  },
];

export default async function HomePage() {
  const [institutions, events, timeline] = await Promise.all([
    getInstitutions(),
    getEvents(),
    getTimeline(),
  ]);

  return (
    <>
      <Hero />

      <EcosystemGrid institutions={institutions} />

      {/*
        ARCHETYPES, top to bottom. No two consecutive sections share one, and
        exactly ONE card grid survives on the page (the ecosystem pillars).
        Alternating background colour was never the problem — the problem was
        that every section had the same skeleton underneath it.

          1. Hero            full-bleed editorial
          2. Ecosystem       card grid            <- the one permitted grid
          3. Pipeline        full-bleed dark centrepiece
          4. Map             overlapping layers (breaks the section boundary)
          5. Events          horizontal rail
          6. Audiences       editorial list (numbered rows, rules, no boxes)
          7. Journey         asymmetric split, image bleeding off the edge
          8. Closing         oversized statement
      */}

      {/* 3 — PIPELINE: full-bleed dark centrepiece. No container, no card. */}
      <section className="relative isolate overflow-hidden bg-crescent-950 py-20 text-white lg:py-28">
        <div aria-hidden="true" className="texture-bloom pointer-events-none absolute inset-0 -z-10" />
        <div className="container-page">
          <p className="type-eyebrow flex items-center gap-3 text-gold-300">
            <span aria-hidden="true" className="h-px w-8 bg-gold-300/70" />
            The CGOM Pipeline
          </p>
          <h2 className="type-h1 mt-5 max-w-3xl text-balance text-white">
            From a classroom in Vandalur to a company in the world
          </h2>
          <p className="type-lead mt-5 text-crescent-100">
            The School-to-Start-up continuum is the backbone of the mission —
            seven stages, one unbroken pathway.
          </p>

          <div className="mt-14 lg:mt-20">
            <Pipeline />
          </div>

          <Link
            href="/about#strategic-streams"
            className="mt-14 inline-flex rounded-full border border-white/45 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            See the three strategic streams →
          </Link>
        </div>
      </section>

      {/*
        4 — MAP: overlapping layers. The map panel is pulled UP so it breaks
        the boundary between the dark pipeline section and the white one
        below, sitting across both. -mt on the panel, matching pt on the
        section, so nothing is clipped and no horizontal scroll is introduced.
      */}
      <section className="relative bg-white pb-20 lg:pb-28">
        <div className="container-page">
          <Reveal>
            <div className="-mt-16 overflow-hidden rounded-card shadow-raised ring-1 ring-slate-200 lg:-mt-24">
              <InstitutionMapCard
                institutions={institutions}
                className="h-[340px] md:h-[460px]"
              />
            </div>
          </Reveal>

          <div className="mt-10 max-w-2xl">
            <p className="type-eyebrow flex items-center gap-2.5 text-accent-600">
              <span aria-hidden="true" className="h-px w-6 bg-accent-600/40" />
              Our Presence
            </p>
            <h2 className="type-h2 mt-3 text-crescent-800">
              Sixteen institutions across Tamil Nadu
            </h2>
            <p className="mt-3 leading-relaxed text-slate-600">
              From Chennai to Kilakarai — serving communities the length of the
              state, and through alumni, far beyond it.
            </p>
          </div>
        </div>
      </section>

      {/* 5 — EVENTS: horizontal rail. */}
      <EventsStrip events={events} />

      {/*
        6 — AUDIENCES: editorial list. Numbered rows with a rule between them
        and generous spacing. Deliberately NOT cards — this is the section
        that most obviously used to be a fourth identical grid.
      */}
      <SectionDivider shape="arch" fill="text-crescent-900" />

      <Section tone="navy" className="py-20 lg:py-28">
        <div className="max-w-3xl">
          <p className="type-eyebrow flex items-center gap-3 text-gold-300">
            <span aria-hidden="true" className="h-px w-8 bg-gold-300/70" />
            One Network. Many Opportunities.
          </p>
          <h2 className="type-h1 mt-5 text-balance text-white">
            Built to connect people, not to list institutions
          </h2>
        </div>

        <ol className="mt-14 border-t border-white/15">
          {audiences.map((a, idx) => (
            <Reveal key={a.title} delay={idx * 0.05} as="li">
              <div className="grid gap-2 border-b border-white/15 py-8 md:grid-cols-[5rem_minmax(0,18rem)_1fr] md:items-baseline md:gap-8 lg:py-10">
                <span
                  aria-hidden="true"
                  className="text-2xl font-extrabold tabular-nums text-gold-300/70 md:text-3xl"
                >
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <h3 className="type-h3 text-white">{a.title}</h3>
                {/* crescent-100 on crescent-900 is 12.24:1 */}
                <p className="max-w-[52ch] leading-relaxed text-crescent-100">
                  {a.body}
                </p>
              </div>
            </Reveal>
          ))}
        </ol>
      </Section>

      {/*
        7 — JOURNEY: asymmetric split, 40/60. The image column bleeds off the
        LEFT viewport edge on desktop rather than sitting inside the
        container. Stacks to a normal band on mobile, where bleeding both
        edges would just be a full-width image.
      */}
      <section className="relative overflow-hidden bg-sand-50 py-20 lg:py-28">
        <div aria-hidden="true" className="texture-dots pointer-events-none absolute inset-0" />
        <div className="relative grid gap-12 lg:grid-cols-[38%_1fr] lg:items-center lg:gap-16">
          <div className="relative h-56 overflow-hidden sm:h-72 lg:h-[30rem] lg:rounded-r-card">
            <Image
              src={BANNER_ABOUT_MISSION.src as string}
              alt={BANNER_ABOUT_MISSION.alt}
              fill
              sizes="(min-width: 1024px) 38vw, 100vw"
              className="object-cover"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-r from-crescent-950/45 to-transparent"
            />
          </div>

          <div className="container-page lg:pl-0 lg:pr-8">
            <p className="type-eyebrow flex items-center gap-2.5 text-accent-600">
              <span aria-hidden="true" className="h-px w-6 bg-accent-600/40" />
              Our Journey
            </p>
            <h2 className="type-h2 mt-3 max-w-xl text-balance text-crescent-800">
              From one school in 1968 to a global network
            </h2>
            <div className="mt-10 max-w-2xl">
              <Timeline entries={timeline} />
            </div>
            <Link
              href="/about"
              className="mt-8 inline-flex rounded-full border border-crescent-300 px-5 py-2.5 text-sm font-semibold text-crescent-700 transition-all hover:bg-crescent-100 active:scale-[0.98]"
            >
              Read the full story →
            </Link>
          </div>
        </div>
      </section>

      {/*
        8 — CLOSING: oversized statement. One very large piece of typography,
        generous whitespace, one link. No cards, no grid, no supporting
        paragraph competing with it.
      */}
      <section className="relative isolate overflow-hidden bg-crescent-900 py-24 text-white lg:py-36">
        <div aria-hidden="true" className="texture-bloom pointer-events-none absolute inset-0 -z-10" />
        <div className="container-page">
          <Reveal>
            <p className="type-display max-w-5xl text-balance">
              Supplementing,{" "}
              <span className="text-gold-300">never replacing.</span>
            </p>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="type-lead mt-8 text-crescent-100">
              Crescent Connect links students, alumni, faculty, management,
              parents, entrepreneurs and well-wishers — one family, across every
              campus and every generation.
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <Link
              href="/connect"
              className="mt-10 inline-flex items-center justify-center rounded-full bg-gold-300 px-8 py-4 text-sm font-bold text-crescent-950 shadow-raised transition-all hover:bg-gold-200 active:scale-[0.98]"
            >
              Join Crescent Connect →
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
