import Link from "next/link";
import Hero from "@/components/Hero";
import EcosystemGrid from "@/components/EcosystemGrid";
import EventsStrip from "@/components/EventsStrip";
import Timeline from "@/components/Timeline";
import SectionHeading from "@/components/SectionHeading";
import Reveal from "@/components/Reveal";
import Pipeline from "@/components/Pipeline";
import InstitutionMapCard from "@/components/InstitutionMapCard";
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
        Section rhythm, top to bottom:
          hero (deep) → ecosystem (white) → pipeline (warm) → map (white)
          → events (sand) → audiences (navy) → journey (warm) → CTA (navy)
        Never two identical tones in a row; the navy audiences block gives the
        middle of the page a strong break so it does not read as one long
        white scroll.
      */}
      <SectionDivider shape="curve" fill="text-sand-50" />

      <Section tone="warm" className="py-20 lg:py-24">
        <SectionHeading
          eyebrow="The CGOM Pipeline"
          title="From classroom learning to global entrepreneurial impact"
          description="A structured School-to-Start-up continuum — the backbone of the Crescent Global Outreach Mission."
        />
        <Reveal>
          <div className="mt-12 rounded-card border border-sand-200 bg-white p-6 shadow-card sm:p-10">
            <Pipeline />
          </div>
        </Reveal>
        <p className="type-body mt-6 text-sm font-medium text-slate-600">
          A continuous pathway from classroom learning to global entrepreneurial
          impact.
        </p>
        <Link
          href="/about#strategic-streams"
          className="mt-4 inline-flex rounded-full border border-crescent-300 px-4 py-2 text-sm font-semibold text-crescent-700 transition-all hover:bg-crescent-50 hover:shadow-card active:scale-[0.98]"
        >
          See the three strategic streams →
        </Link>
      </Section>

      <SectionDivider shape="curve" fill="text-white" />

      <Section tone="white" className="pb-20 pt-8 lg:pb-24">
        <SectionHeading
          eyebrow="Our Presence"
          title="Our Presence Across Tamil Nadu"
          description="From Chennai to Kilakarai — institutions serving communities across the state."
        />
        <Reveal>
          <div className="mt-10 overflow-hidden rounded-card shadow-raised">
            <InstitutionMapCard
              institutions={institutions}
              className="h-[350px] md:h-[450px]"
            />
          </div>
        </Reveal>
      </Section>

      <EventsStrip events={events} />

      {/* Dark break. The one place mid-page where the eye resets. */}
      <SectionDivider shape="arch" fill="text-crescent-900" />

      <Section tone="navy" className="py-20 lg:py-24">
        <SectionHeading
          eyebrow="One Network. Many Opportunities."
          title="Built to connect people, not just list institutions"
          description="Crescent Global is a coordination layer — a glossary and guide that helps the whole family move together."
          onDark
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {audiences.map((a, idx) => (
            <Reveal key={a.title} delay={idx * 0.06} as="article">
              <div className="surface-inner-glow h-full rounded-card border border-white/10 bg-white/[0.06] p-6 transition-colors hover:bg-white/[0.1]">
                <h3 className="type-h3 text-white">{a.title}</h3>
                {/* crescent-100 on crescent-900 is 12.4:1 */}
                <p className="mt-2 text-sm leading-relaxed text-crescent-100">
                  {a.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <SectionDivider shape="curve" fill="text-sand-50" flip />

      <Section tone="warm" className="py-20 lg:py-24">
        <SectionHeading
          eyebrow="Our Journey"
          title="From one school in 1968 to a global network"
          description="Five decades of steady growth across Tamil Nadu — and, through alumni, far beyond it."
        />
        <div className="mt-12 max-w-3xl">
          <Timeline entries={timeline} />
        </div>
        <Link
          href="/about"
          className="mt-8 inline-flex rounded-full border border-crescent-300 px-4 py-2 text-sm font-semibold text-crescent-700 transition-all hover:bg-crescent-50 hover:shadow-card active:scale-[0.98]"
        >
          Read the full story →
        </Link>
      </Section>

      <Section
        tone="navy"
        className="py-20"
        containerClassName="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between"
      >
        <div className="max-w-xl">
          <h2 className="type-h2 text-white">Help channel the collective effort</h2>
          <p className="mt-3 leading-relaxed text-crescent-100">
            Crescent Connect links students, alumni, faculty, management,
            parents, entrepreneurs and well-wishers across the whole family.
          </p>
        </div>
        <Link
          href="/connect"
          className="inline-flex shrink-0 items-center justify-center rounded-full bg-gold-300 px-6 py-3 text-sm font-bold text-crescent-950 shadow-raised transition-all hover:bg-gold-200 active:scale-[0.98]"
        >
          Join Crescent Connect
        </Link>
      </Section>
    </>
  );
}
