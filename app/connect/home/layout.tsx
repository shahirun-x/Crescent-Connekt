import type { Metadata } from "next";

/**
 * Metadata lives in a sibling layout, matching the other /connect routes
 * (DECISIONS #26): a members-only page must never inherit the root layout's
 * `index: true`. The X-Robots-Tag header in next.config.ts (/connect/:path+)
 * covers this route as well — the meta tag and the header are two layers.
 */
export const metadata: Metadata = {
  title: "Your Member Network",
  robots: { index: false, follow: false },
};

export default function MemberHomeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
