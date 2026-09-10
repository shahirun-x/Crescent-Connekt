import type { Metadata } from "next";

/**
 * Client page, so it cannot export metadata itself (DECISIONS #26).
 *
 * `nocache` matters more here than on the other auth pages: the recovery token
 * arrives in the URL fragment, so this URL is one that has carried a
 * credential. It must never be indexed or cached.
 */
export const metadata: Metadata = {
  title: "Choose a new password",
  robots: { index: false, follow: false, nocache: true },
};

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
