import Link from "next/link";
import Shot from "@/components/Shot";
import Figure, { Rise } from "./Figure";
import { MEMBERS } from "@/lib/images";

/**
 * The closing invitation.
 *
 * One large photograph of people together, a short invitation, one action.
 * The page ends on the thing it wants a visitor to do, and on nothing else —
 * no secondary CTA competing with it, no newsletter box beneath.
 */
export default function MemberInvite() {
  return (
    <section className="bg-paper">
      <Figure>
        <figure className="frame-zoom relative">
          <Shot
            image={MEMBERS}
            className="aspect-[16/9] w-full md:aspect-[21/9]"
            sizes="100vw"
          />
        </figure>
      </Figure>

      <div className="container-page py-20 md:py-28">
        <div className="max-w-2xl">
          <Rise>
            <h2 className="type-h1 text-balance text-ink-900">
              The network is only as good as who is in it.
            </h2>
          </Rise>
          <Rise delay={0.08}>
            <p className="type-lead mt-7 text-ink-700">
              Students, alumni, faculty, management, parents, entrepreneurs and
              well-wishers — every campus, every generation. Profiles are
              reviewed before they join the directory, and what you share is up
              to you.
            </p>
            <Link
              href="/connect"
              className="mt-10 inline-flex min-h-[3.25rem] items-center bg-crescent-900 px-8 text-[0.95rem] font-semibold text-white transition-colors hover:bg-crescent-800"
            >
              Join the Member Network
            </Link>
          </Rise>
        </div>
      </div>
    </section>
  );
}
