import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import Image from "next/image";
import ContactForm from "@/components/ContactForm";
import { CONTACT_VISUAL } from "@/lib/images";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with the Crescent Connekt — for coordination, partnerships, alumni chapters and portal feedback.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Get in touch"
        title="Contact Crescent Connekt"
        description="For coordination between institutions, partnerships, alumni chapters or feedback on this portal."
      />

      <div className="container-page grid gap-12 py-14 lg:grid-cols-[1.3fr_1fr]">
        <div className="rounded-card border border-slate-200 bg-white p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-crescent-800">
            Send us a message
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            We usually reply within a few working days.
          </p>
          <div className="mt-6">
            <ContactForm />
          </div>
        </div>

        <aside className="space-y-6 text-sm">
          {/*
            Visual anchor beside the form. Sits above the address so the
            column has a subject rather than opening on a grey box. Hidden
            below lg, where the aside stacks under the form and an image
            would only push the contact details further down the page.
          */}
          <div className="relative hidden aspect-[4/3] overflow-hidden rounded-card shadow-raised lg:block">
            {/* Gradient while this slot has no honest photograph — see
                lib/images.ts. Every candidate interior was empty and cold. */}
            {CONTACT_VISUAL.src ? (
              <>
                <Image
                  src={CONTACT_VISUAL.src}
                  alt={CONTACT_VISUAL.alt}
                  fill
                  sizes="(min-width: 1024px) 30vw, 0px"
                  className="object-cover"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-crescent-950/70 via-crescent-950/10 to-transparent"
                />
              </>
            ) : (
              <div
                aria-hidden="true"
                className={`absolute inset-0 ${CONTACT_VISUAL.tone}`}
              />
            )}
            {/*
              The caption colour follows the panel. CONTACT_VISUAL used to be
              a dark navy gradient, so this was white; it is now a light tone
              block, and white on it measured 1.9:1. axe caught it.
            */}
            <p
              className={`absolute inset-x-0 bottom-0 p-5 text-sm font-semibold leading-snug ${
                CONTACT_VISUAL.src ? "text-white" : "text-ink-900"
              }`}
            >
              Vandalur, Chennai
            </p>
          </div>

          <div className="rounded-card bg-sand-100 p-6">
            <h2 className="text-base font-semibold text-crescent-800">
              Crescent Connekt
            </h2>
            <p className="mt-2 leading-relaxed text-slate-600">
              Crescent Campus, GST Road, Vandalur,
              <br />
              Chennai 600048, Tamil Nadu, India
            </p>
          </div>
          <div className="rounded-card bg-sand-100 p-6">
            <h2 className="text-base font-semibold text-crescent-800">Email</h2>
            <a
              href={`mailto:${site.contactEmail}`}
              className="mt-2 inline-block font-medium text-crescent-600 hover:text-crescent-800"
            >
              {site.contactEmail}
            </a>
          </div>
          <div className="rounded-card bg-sand-100 p-6">
            <h2 className="text-base font-semibold text-crescent-800">
              Looking for a specific institution?
            </h2>
            <p className="mt-2 leading-relaxed text-slate-600">
              Each institution runs its own admissions and enquiries. Find direct
              links on the{" "}
              <a href="/institutions" className="font-medium text-crescent-600 hover:text-crescent-800">
                Institutions
              </a>{" "}
              page.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
