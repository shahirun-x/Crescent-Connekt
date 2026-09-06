import type { Metadata } from "next";

/**
 * A "use client" page cannot export `metadata`, so without this layout the
 * sign-in page inherited the root layout's `index: true` and was emitting
 * <meta name="robots" content="index, follow">. Auth entry points should never
 * be indexed.
 */
export const metadata: Metadata = {
  title: "Sign in",
  description:
    "Sign in to Crescent Connect, the members-only network for the Crescent ecosystem.",
  robots: { index: false, follow: false },
};

export default function ConnectLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
