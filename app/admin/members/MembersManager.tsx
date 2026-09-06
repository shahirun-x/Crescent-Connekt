"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useToast } from "@/components/admin/Toast";
import { roleMeta, statusMeta, type MemberRole, type MemberStatus } from "@/lib/roles";

interface MemberRow {
  id: string;
  full_name: string;
  role: MemberRole;
  institution_id: string | null;
  institutions: { name: string } | null;
  batch_year: number | null;
  current_city: string | null;
  current_country: string | null;
  headline: string | null;
  bio: string | null;
  avatar_url: string | null;
  linkedin_url: string | null;
  status: MemberStatus;
  rejection_reason: string | null;
  show_email: boolean;
  show_phone: boolean;
  phone: string | null;
  email: string | null;
  created_at: string;
}

const TABS: MemberStatus[] = ["pending", "approved", "rejected", "suspended"];

export default function MembersManager() {
  const { toast } = useToast();
  const [tab, setTab] = useState<MemberStatus>("pending");
  const [items, setItems] = useState<MemberRow[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<MemberRow | null>(null);
  const [reason, setReason] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const p = new URLSearchParams({ status: tab });
    if (search) p.set("q", search);
    const res = await fetch(`/api/admin/members?${p}`);
    if (res.ok) {
      const json = await res.json();
      setItems(json.data ?? []);
      setCounts(json.counts ?? {});
    }
    setLoading(false);
  }, [tab, search]);

  useEffect(() => {
    const t = setTimeout(load, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [load, search]);

  async function setStatus(id: string, status: MemberStatus, reasonText?: string) {
    setBusy(id);
    const res = await fetch(`/api/admin/members/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, reason: reasonText }),
    });
    const json = await res.json();
    setBusy(null);

    if (!res.ok) {
      toast(json.error ?? "Could not update status", "error");
      return;
    }
    toast(
      status === "approved"
        ? "Member approved"
        : status === "rejected"
          ? "Application rejected"
          : status === "suspended"
            ? "Member suspended"
            : "Status updated"
    );
    setRejecting(null);
    setReason("");
    load();
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-800">Members</h1>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name or headline…"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      {/* Tabs */}
      <div className="mt-4 flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold capitalize transition-colors ${
              tab === t
                ? "bg-crescent-700 text-white"
                : "border border-slate-200 text-slate-600 hover:border-crescent-300"
            }`}
          >
            {t}
            {counts[t] ? (
              <span
                className={`ml-1.5 text-xs ${
                  tab === t ? "text-white/70" : "text-slate-400"
                }`}
              >
                {counts[t]}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {/* Reject dialog */}
      {rejecting && (
        <div className="fixed inset-0 z-40 flex items-start justify-center bg-black/30 pt-24">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold">
              Reject {rejecting.full_name}?
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              You can add a reason. It is stored on the profile and included in
              the notification the member sees.
            </p>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              maxLength={500}
              placeholder="Optional reason…"
              className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => {
                  setRejecting(null);
                  setReason("");
                }}
                className="rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={() => setStatus(rejecting.id, "rejected", reason)}
                disabled={busy === rejecting.id}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
              >
                {busy === rejecting.id ? "Rejecting…" : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <p className="mt-8 text-center text-sm text-slate-400">Loading…</p>
      ) : items.length === 0 ? (
        <EmptyState tab={tab} />
      ) : tab === "pending" ? (
        <div className="mt-5 space-y-4">
          {items.map((m) => (
            <ApplicantCard
              key={m.id}
              m={m}
              busy={busy === m.id}
              onApprove={() => setStatus(m.id, "approved")}
              onReject={() => setRejecting(m)}
            />
          ))}
        </div>
      ) : (
        <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Institution</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{m.full_name}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${roleMeta[m.role].badge}`}
                    >
                      {roleMeta[m.role].label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {m.institutions?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{m.email ?? "—"}</td>
                  <td className="px-4 py-3 text-right">
                    {m.status === "approved" ? (
                      <button
                        onClick={() => setStatus(m.id, "suspended")}
                        disabled={busy === m.id}
                        className="text-amber-700 hover:underline disabled:opacity-50"
                      >
                        Suspend
                      </button>
                    ) : (
                      <button
                        onClick={() => setStatus(m.id, "approved")}
                        disabled={busy === m.id}
                        className="text-emerald-700 hover:underline disabled:opacity-50"
                      >
                        {m.status === "suspended" ? "Reinstate" : "Approve"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ApplicantCard({
  m,
  busy,
  onApprove,
  onReject,
}: {
  m: MemberRow;
  busy: boolean;
  onApprove: () => void;
  onReject: () => void;
}) {
  const meta = roleMeta[m.role];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-start gap-4">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200">
          {m.avatar_url ? (
            <Image src={m.avatar_url} alt="" fill sizes="64px" className="object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-xl font-bold text-slate-400">
              {m.full_name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-bold text-slate-800">{m.full_name}</h3>
            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${meta.badge}`}>
              {meta.label}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusMeta[m.status].badge}`}
            >
              {statusMeta[m.status].label}
            </span>
          </div>
          {m.headline && <p className="mt-1 text-sm text-slate-600">{m.headline}</p>}

          <dl className="mt-3 grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
            <Item label="Email">{m.email ?? "—"}</Item>
            <Item label="Institution">{m.institutions?.name ?? "Not affiliated"}</Item>
            <Item label="Location">
              {[m.current_city, m.current_country].filter(Boolean).join(", ") || "—"}
            </Item>
            <Item label="Batch">{m.batch_year ?? "—"}</Item>
            <Item label="Phone">{m.phone ?? "—"}</Item>
            <Item label="LinkedIn">
              {m.linkedin_url ? (
                <a
                  href={m.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-crescent-700 hover:underline"
                >
                  View ↗
                </a>
              ) : (
                "—"
              )}
            </Item>
            <Item label="Shares email">{m.show_email ? "Yes" : "No"}</Item>
            <Item label="Shares phone">{m.show_phone ? "Yes" : "No"}</Item>
          </dl>

          {m.bio && (
            <div className="mt-3 rounded-lg bg-slate-50 p-3">
              <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">
                {m.bio}
              </p>
            </div>
          )}

          <p className="mt-3 text-xs text-slate-400">
            Applied {new Date(m.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="mt-4 flex justify-end gap-2 border-t border-slate-100 pt-4">
        <button
          onClick={onReject}
          disabled={busy}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
        >
          Reject
        </button>
        <button
          onClick={onApprove}
          disabled={busy}
          className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {busy ? "Working…" : "Approve"}
        </button>
      </div>
    </div>
  );
}

function Item({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="inline text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}:{" "}
      </dt>
      <dd className="inline text-slate-700">{children}</dd>
    </div>
  );
}

function EmptyState({ tab }: { tab: MemberStatus }) {
  const copy: Record<MemberStatus, { title: string; body: string }> = {
    pending: {
      title: "No applications waiting",
      body: "New Crescent Connect profiles will appear here for review as people sign up.",
    },
    approved: {
      title: "No approved members yet",
      body: "Approve a pending application and the member will appear here and in the directory.",
    },
    rejected: {
      title: "No rejected applications",
      body: "Applications you decline will be listed here.",
    },
    suspended: {
      title: "No suspended members",
      body: "Members you suspend lose directory access and are listed here.",
    },
  };
  const c = copy[tab];

  return (
    <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
      <h3 className="text-base font-semibold text-slate-700">{c.title}</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
        {c.body}
      </p>
    </div>
  );
}
