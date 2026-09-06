"use client";

import { useEffect } from "react";

/**
 * Last-resort boundary for failures in the root layout itself.
 *
 * This replaces the entire document, so it must render its own <html> and
 * <body> and cannot rely on the layout, global stylesheet, fonts, or any
 * shared component. Everything here is inline on purpose — if globals.css
 * failed to load, Tailwind classes would be meaningless.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global-error] Root layout failure", {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
    });
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem 1.25rem",
          background: "#f8fafc",
          color: "#0f172a",
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
          textAlign: "center",
        }}
      >
        <main style={{ maxWidth: "30rem" }}>
          <svg
            viewBox="0 0 48 48"
            role="img"
            aria-label="Crescent Global"
            style={{ width: 56, height: 56, marginBottom: "1.25rem" }}
          >
            <circle cx="24" cy="24" r="22" fill="#1a3a6b" />
            <path d="M24 8a16 16 0 1 0 0 32 13 13 0 1 1 0-32Z" fill="#ffffff" />
            <circle cx="33" cy="15" r="3.4" fill="#d7263d" />
          </svg>

          <h1
            style={{
              margin: 0,
              fontSize: "1.5rem",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: "#142d54",
            }}
          >
            Crescent Global is temporarily unavailable
          </h1>

          <p
            style={{
              margin: "0.75rem 0 0",
              lineHeight: 1.6,
              color: "#475569",
              fontSize: "0.95rem",
            }}
          >
            Something failed while loading the site shell. Please try again in a
            moment.
          </p>

          {error.digest && (
            <p
              style={{
                margin: "1rem 0 0",
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                fontSize: "0.75rem",
                color: "#94a3b8",
              }}
            >
              Reference: {error.digest}
            </p>
          )}

          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "1.75rem",
              padding: "0.7rem 1.4rem",
              borderRadius: "9999px",
              border: "none",
              background: "#1a3a6b",
              color: "#ffffff",
              fontSize: "0.875rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
