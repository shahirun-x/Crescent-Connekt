import Link from "next/link";
import Hero from "@/components/Hero";
import EcosystemGrid from "@/components/EcosystemGrid";
import EventsStrip from "@/components/EventsStrip";
import Timeline from "@/components/Timeline";
import SectionHeading from "@/components/SectionHeading";
import Reveal from "@/components/Reveal";
import Pipeline from "@/components/Pipeline";
import InstitutionMapCard from "@/components/InstitutionMapCard";
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

      <section className="border-t border-slate-200 bg-slate-50 py-20">
        <div className="container-page">
          <SectionHeading
            eyebrow="The CGOM Pipeline"
            title="From classroom learning to global entrepreneurial impact"
            description="A structured School-to-Start-up continuum — the backbone of the Crescent Global Outreach Mission."
          />
          <div className="mt-12 rounded-card border border-slate-200 bg-white p-6 sm:p-10">
            <Pipeline />
          </div>
          <p className="mt-6 text-sm font-medium text-slate-600">
            A continuous pathway from classroom learning to global entrepreneurial
            impact.
          </p>
          <Link
            href="/about#strategic-streams"
            className="mt-4 inline-flex rounded-full border border-crescent-300 px-4 py-2 text-sm font-semibold text-crescent-700 transition-colors hover:bg-crescent-50"
          >
            See the three strategic streams →
          </Link>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white py-20">
        <div className="container-page">
          <SectionHeading
            eyebrow="Our Presence"
            title="Our Presence Across Tamil Nadu"
            description="From Chennai to Kilakarai — institutions serving communities across the state."
          />
          <div className="mt-10">
            <InstitutionMapCard
              institutions={institutions}
              className="h-[350px] md:h-[450px]"
            />
          </div>
        </div>
      </section>

      <EventsStrip events={events} />

      <section className="container-page py-20">
        <SectionHeading
          eyebrow="One Network. Many Opportunities."
          title="Built to connect people, not just list institutions"
          description="Crescent Global is a coordination layer — a glossary and guide that helps the whole family move together."
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {audiences.map((a, idx) => (
            <Reveal key={a.title} delay={idx * 0.06} as="article">
              <div className="h-full rounded-card bg-slate-50 p-6">
                <h3 className="text-base font-semibold text-crescent-800">
                  {a.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {a.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-t border-slate-200 bg-slate-50 py-20">
        <div className="container-page">
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
            className="mt-8 inline-flex rounded-full border border-crescent-300 px-4 py-2 text-sm font-semibold text-crescent-700 transition-colors hover:bg-crescent-50"
          >
            Read the full story →
          </Link>
        </div>
      </section>

      <section className="bg-crescent-700 py-20 text-white">
        <div className="container-page flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Help channel the collective effort
            </h2>
            <p className="mt-3 text-crescent-100">
              Crescent Connect will link students, alumni, faculty, management,
              parents, entrepreneurs and well-wishers. Register your interest for
              early access.
            </p>
          </div>
          <Link
            href="/connect"
            className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-crescent-800 transition-colors hover:bg-crescent-50"
          >
            Join Crescent Connect
          </Link>
        </div>
      </section>
    </>
  );
}
