"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ToastProvider } from "./Toast";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: "□" },
  { href: "/admin/events", label: "Events", icon: "◈" },
  { href: "/admin/news", label: "News", icon: "◇" },
  { href: "/admin/institutions", label: "Institutions", icon: "◆" },
  { href: "/admin/members", label: "Members", icon: "◉" },
  { href: "/admin/contacts", label: "Contacts", icon: "✉" },
  { href: "/admin/signups", label: "Signups", icon: "→" },
];

export default function AdminShell({
  email,
  children,
}: {
  email: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [pendingMembers, setPendingMembers] = useState(0);

  // Badge the Members link with the number of applications awaiting review.
  useEffect(() => {
    fetch("/api/admin/members?status=pending")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => setPendingMembers(j?.counts?.pending ?? 0))
      .catch(() => {});
  }, [pathname]);

  function handleLogout() {
    document.cookie = "sb-access-token=; path=/; max-age=0";
    document.cookie = "sb-refresh-token=; path=/; max-age=0";
    router.push("/admin/login");
  }

  return (
    <ToastProvider>
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="flex w-56 shrink-0 flex-col bg-slate-900 text-white">
          <div className="border-b border-slate-700 px-4 py-4">
            <Link href="/admin" className="text-sm font-bold tracking-wide">
              CRESCENT ADMIN
            </Link>
          </div>
          <nav className="flex-1 space-y-0.5 px-2 py-3">
            {NAV.map((item) => {
              const active =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                    active
                      ? "bg-slate-700/60 font-medium text-white"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <span className="text-xs">{item.icon}</span>
                  {item.label}
                  {item.href === "/admin/members" && pendingMembers > 0 && (
                    <span className="ml-auto rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                      {pendingMembers}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-slate-700 px-4 py-3">
            <p className="truncate text-xs text-slate-400">{email}</p>
            <button
              onClick={handleLogout}
              className="mt-1 text-xs text-slate-500 hover:text-white"
            >
              Sign out
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 bg-slate-50 p-6">{children}</main>
      </div>
    </ToastProvider>
  );
}
