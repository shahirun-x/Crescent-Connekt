import type { Metadata } from "next";

/**
 * The OAuth / email-verification landing page. It was inheriting the root
 * layout's `index: true`.
 *
 * This one matters more than the other auth pages: Supabase returns the
 * session in the URL fragment, so any indexed or shared copy of this URL is a
 * link that once carried credentials. It must never appear in a search index.
 */
export const metadata: Metadata = {
  title: "Signing you in",
  robots: { index: false, follow: false, nocache: true },
};

export default function ConnectCallbackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
