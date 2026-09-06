import type { Metadata } from "next";
import AboutHero from "@/components/about/AboutHero";
import VisionSection from "@/components/about/VisionSection";
import MissionSection from "@/components/about/MissionSection";
import StrategicStreamsSection from "@/components/about/StrategicStreamsSection";
import PhotoBreak from "@/components/PhotoBreak";
import { BANNER_ABOUT_MISSION } from "@/lib/images";
import PhilosophySection from "@/components/about/PhilosophySection";
import OutcomeSection from "@/components/about/OutcomeSection";
import ClosingTagline from "@/components/about/ClosingTagline";
import TimelineScroll from "@/components/about/TimelineScroll";
import { getTimeline } from "@/lib/data";

export const metadata: Metadata = {
  title: "About CGOM",
  description:
    "The Crescent Global Outreach Mission (CGOM) — vision, mission, strategic streams and the School-to-Start-up continuum behind the network.",
  alternates: { canonical: "/about" },
};

// Static page — every animation is client-side.
export const revalidate = 86400;

export default async function AboutPage() {
  const timeline = await getTimeline();

  return (
    <>
      <AboutHero />
      <VisionSection />
      <MissionSection />

      {/* Breathing space between the two heaviest text sections on the site. */}
      <PhotoBreak
        image={BANNER_ABOUT_MISSION}
        quote="Supplementing, never replacing — channelling the collective effort of the whole Crescent family."
        attribution="Crescent Global Outreach Mission"
      />

      <StrategicStreamsSection />
      <PhilosophySection />
      <OutcomeSection />
      <ClosingTagline />
      <TimelineScroll entries={timeline} />
    </>
  );
}
