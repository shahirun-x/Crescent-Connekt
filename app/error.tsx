"use client";

import { useEffect } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";

/**
 * Route-level error boundary. Catches render and data errors below the root
 * layout, so the nav and footer stay in place.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Vercel captures console.error from the server and the browser. Log the
    // digest explicitly — in production React strips the message, and the
    // digest is the only handle that ties this render to the server-side stack.
    console.error("[error-boundary] Unhandled error", {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
      url: typeof window !== "undefined" ? window.location.href : undefined,
    });
  }, [error]);

  return (
    <section className="container-page flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
      <Logo withWordmark={false} className="mb-6 scale-150" />

      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent-600">
        Something went wrong
      </p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-crescent-800 sm:text-4xl">
        We couldn&apos;t load this page
      </h1>
      <p className="mt-3 max-w-md text-balance leading-relaxed text-slate-600">
        This is on our side, not yours. Trying again usually works — the network
        itself is fine.
      </p>

      {error.digest && (
        <p className="mt-4 rounded-full bg-slate-100 px-3 py-1 font-mono text-xs text-slate-500">
          Reference: {error.digest}
        </p>
      )}

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-crescent-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-crescent-800"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-full border border-crescent-300 px-5 py-2.5 text-sm font-semibold text-crescent-700 transition-colors hover:bg-crescent-50"
        >
          Back home
        </Link>
      </div>
    </section>
  );
}
