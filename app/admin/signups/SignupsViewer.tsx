"use client";

import { useCallback, useEffect, useState } from "react";

interface Signup {
  id: string;
  name: string | null;
  email: string;
  role: string | null;
  created_at: string;
}

export default function SignupsViewer() {
  const [items, setItems] = useState<Signup[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/signups");
    if (res.ok) {
      const { data } = await res.json();
      setItems(data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800">Connect Signups</h1>
      <p className="mt-1 text-sm text-slate-500">
        {items.length} total registration{items.length !== 1 ? "s" : ""}
      </p>

      <div className="mt-4 rounded-lg border border-crescent-200 bg-crescent-50/60 px-4 py-3 text-sm text-crescent-900">
        <p className="font-semibold">Pre-launch early-access list</p>
        <p className="mt-1 leading-relaxed text-crescent-800/90">
          These are people who registered interest before Crescent Connect
          opened. They are <strong>not</strong> member accounts — approved
          members live under{" "}
          <a href="/admin/members" className="font-semibold underline">
            Members
          </a>
          . This list is still useful as a launch invitation list.
        </p>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white">
        {loading ? (
          <p className="p-6 text-center text-sm text-slate-400">Loading...</p>
        ) : items.length === 0 ? (
          <p className="p-6 text-center text-sm text-slate-400">No signups yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{s.name ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-500">{s.email}</td>
                  <td className="px-4 py-3 text-slate-500">{s.role ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(s.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
