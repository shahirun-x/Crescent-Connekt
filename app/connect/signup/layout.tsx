import type { Metadata } from "next";

/**
 * See app/connect/login/layout.tsx — a client page cannot export metadata, so
 * this layout supplies the noindex the signup page was missing.
 */
export const metadata: Metadata = {
  title: "Join the Member Network",
  description:
    "Create a Member Network account to join the members-only directory of the Crescent network.",
  robots: { index: false, follow: false },
};

export default function ConnectSignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
