import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { template: "%s · Admin · Crescent Connekt", default: "Admin · Crescent Connekt" },
  robots: "noindex, nofollow",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
