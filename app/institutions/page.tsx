import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
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
      <PageHeader
        eyebrow="The Network"
        title="Institutions of the Crescent ecosystem"
        description="This directory is a guide, not a replacement — each card links out to the institution's own website. Filter by pillar or search by place."
      />
      <div className="container-page py-14">
        <InstitutionMapCard institutions={institutions} className="h-[400px]" />
        <div className="mt-12">
          <InstitutionsExplorer institutions={institutions} />
        </div>
      </div>
    </>
  );
}
