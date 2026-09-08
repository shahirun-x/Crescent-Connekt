import type { Metadata } from "next";
import Image from "next/image";
import { BANNER_INSTITUTIONS } from "@/lib/images";
import InstitutionsExplorer from "@/components/InstitutionsExplorer";
import InstitutionMapCard from "@/components/InstitutionMapCard";
import JsonLd from "@/components/JsonLd";
import { breadcrumbJsonLd, institutionListJsonLd } from "@/lib/jsonld";
import { getInstitutions } from "@/lib/data";

export const metadata: Metadata = {
  title: "Institutions",
  description:
    "Every school, college, university, hospital and community initiative in the Crescent ecosystem — with links to each institution's official website.",
  alternates: { canonical: "/institutions" },
};

// Institution data changes rarely — generate statically and revalidate daily.
export const revalidate = 86400;

export default async function InstitutionsPage() {
  const institutions = await getInstitutions();

  return (
    <>
      <JsonLd
        data={[
          institutionListJsonLd(institutions),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Institutions", path: "/institutions" },
          ]),
        ]}
      />
      {/* Header band: photograph behind the heading, dimmed enough that white
          text clears AA against the darkest part of any photo that lands here. */}
      <section className="relative isolate overflow-hidden bg-crescent-900">
        {/* Renders a designed gradient while this slot has no honest photo. */}
        {BANNER_INSTITUTIONS.src ? (
          <>
            <Image
              src={BANNER_INSTITUTIONS.src}
              alt={BANNER_INSTITUTIONS.alt}
              fill
              sizes="100vw"
              className="-z-10 object-cover"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 -z-10 bg-crescent-900/85"
            />
          </>
        ) : (
          <div
            aria-hidden="true"
            className={`absolute inset-0 -z-10 ${BANNER_INSTITUTIONS.gradient}`}
          />
        )}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(48rem 24rem at 12% 0%, rgba(107,206,196,0.28), transparent 62%)",
          }}
        />
        <div className="container-page py-16 md:py-24">
          <p className="type-eyebrow flex items-center gap-2.5 text-gold-300">
            <span aria-hidden="true" className="h-px w-6 bg-gold-300/60" />
            The Network
          </p>
          <h1 className="type-h1 mt-3 text-balance text-white">
            Institutions of the Crescent ecosystem
          </h1>
          <p className="mt-4 max-w-2xl text-pretty leading-relaxed text-crescent-100">
            This directory is a guide, not a replacement — each card links out
            to the institution&apos;s own website. Filter by pillar or search by
            place.
          </p>
        </div>
      </section>
      <div className="container-page py-14">
        <InstitutionMapCard institutions={institutions} className="h-[400px]" />
        <div className="mt-12">
          <InstitutionsExplorer institutions={institutions} />
        </div>
      </div>
    </>
  );
}
