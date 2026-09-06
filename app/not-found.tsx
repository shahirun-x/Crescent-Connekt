import Link from "next/link";
import type { Metadata } from "next";
import Logo from "@/components/Logo";

/**
 * Without its own metadata the 404 inherited the homepage title and
 * description verbatim, so a soft-404 could be indexed as a duplicate of the
 * home page. Distinct title, and explicitly noindex.
 */
export const metadata: Metadata = {
  title: { absolute: "Page not found · Crescent Global" },
  description: "This page isn't part of the Crescent Global network.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <section className="container-page flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
      <Logo withWordmark={false} className="mb-6 scale-150" />

      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent-600">
        404
      </p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-crescent-800 sm:text-4xl">
        This page isn&apos;t part of the network
      </h1>
      <p className="mt-3 max-w-md text-balance leading-relaxed text-slate-600">
        The page you&apos;re looking for may have moved or never existed. These
        are the places most people are headed.
      </p>

      <nav aria-label="Suggested pages" className="mt-8">
        <ul className="flex flex-wrap justify-center gap-3">
          <li>
            <Link
              href="/"
              className="inline-block rounded-full bg-crescent-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-crescent-800"
            >
              Back home
            </Link>
          </li>
          <li>
            <Link
              href="/institutions"
              className="inline-block rounded-full border border-crescent-300 px-5 py-2.5 text-sm font-semibold text-crescent-700 transition-colors hover:bg-crescent-50"
            >
              Browse institutions
            </Link>
          </li>
          <li>
            <Link
              href="/calendar"
              className="inline-block rounded-full border border-crescent-300 px-5 py-2.5 text-sm font-semibold text-crescent-700 transition-colors hover:bg-crescent-50"
            >
              Central Calendar
            </Link>
          </li>
        </ul>
      </nav>
    </section>
  );
}
