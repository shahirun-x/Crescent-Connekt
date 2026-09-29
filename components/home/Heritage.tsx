import Link from "next/link";
import Shot from "@/components/Shot";
import Figure, { Rise } from "./Figure";
import { HERITAGE } from "@/lib/images";

/**
 * Heritage. The one dark section on the page.
 *
 * Exactly one, and it sits near the end where the page has earned a change of
 * register. Alternating light and dark section by section is the mechanical
 * rhythm the brief rules out; a single dark band reads as a deliberate pause.
 *
 * The photograph is desaturated and dimmed in CSS rather than supplied as a
 * black-and-white file, so a genuine archival scan can be dropped straight in
 * without being pre-treated — and so a colour photograph, if that is all the
 * archive has, still sits correctly in this band.
 */
export default function Heritage() {
  return (
    <section className="bg-crescent-950 text-paper">
      <div className="container-page py-24 md:py-32">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-20">
          <Figure>
            <figure className="frame-zoom">
              <Shot
                image={HERITAGE}
                className="aspect-[3/2] w-full"
                imgClassName="grayscale contrast-[1.08] brightness-[0.82]"
                sizes="(min-width: 1024px) 46vw, 100vw"
              />
            </figure>
          </Figure>

          <div>
            <Rise>
              <h2 className="type-h1 max-w-[15ch] text-balance text-paper">
                One school in Chetpet, 1968.
              </h2>
            </Rise>
            <Rise delay={0.08}>
              <p className="type-lead mt-7 text-crescent-100">
                Alhaj B.S. Abdur Rahman founded a single school in Chetpet and
                moved it to Vandalur three years later. Everything since — a
                university, colleges, schools, a medical centre, an incubation
                centre — grew out of that one decision.
              </p>
              <p className="type-lead mt-5 text-crescent-100">
                Sixteen institutions, fifty-seven years, two trusts.
              </p>
              <Link
                href="/about"
                className="mt-9 inline-flex min-h-[2.75rem] items-center border-b-2 border-accent-400 pb-1 text-paper transition-colors hover:border-accent-300 hover:text-accent-300"
              >
                The full story
              </Link>
            </Rise>
          </div>
        </div>
      </div>
    </section>
  );
}
