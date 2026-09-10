import type { Metadata } from "next";

/**
 * A "use client" page cannot export `metadata` — it silently inherits the root
 * layout's `index: true` instead, with no warning (DECISIONS #26). This layout
 * supplies the noindex the page itself cannot.
 */
export const metadata: Metadata = {
  title: "Reset your password",
  description:
    "Request a password reset link for your Crescent Connect account.",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
