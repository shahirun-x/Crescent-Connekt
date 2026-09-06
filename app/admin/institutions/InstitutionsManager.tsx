"use client";

import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/components/admin/Toast";
import Modal from "@/components/admin/Modal";
import type { Institution, Category } from "@/lib/types";

const CATEGORIES: Category[] = ["education", "healthcare", "community", "innovation"];

export default function InstitutionsManager() {
  const { toast } = useToast();
  const [items, setItems] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Institution> | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/institutions");
    if (res.ok) {
      const { data } = await res.json();
      setItems(data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleSave() {
    if (!editing?.id) return;
    setSaving(true);
    const res = await fetch("/api/admin/institutions", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    });
    const json = await res.json();
    setSaving(false);
    if (!res.ok) { toast(json.error ?? "Failed", "error"); return; }
    toast("Institution updated");
    setEditing(null);
    load();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800">Institutions</h1>
      <p className="mt-1 text-sm text-slate-500">Edit existing institutions (add/delete disabled).</p>

      {editing && (
        <Modal
          title="Edit Institution"
          onClose={() => setEditing(null)}
          footer={
            <>
              <button onClick={() => setEditing(null)} className="rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-100">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving} className="rounded-lg bg-crescent-700 px-4 py-2 text-sm font-medium text-white hover:bg-crescent-800 disabled:opacity-60">
                {saving ? "Saving..." : "Save"}
              </button>
            </>
          }
        >
            <div className="space-y-3">
              <Field label="Name" value={editing.name ?? ""} onChange={(v) => setEditing({ ...editing, name: v })} />
              <Field label="Location" value={editing.location ?? ""} onChange={(v) => setEditing({ ...editing, location: v })} />
              <Field label="City" value={editing.city ?? ""} onChange={(v) => setEditing({ ...editing, city: v })} />
              <Field label="Established Year" type="number" value={String(editing.established_year ?? "")} onChange={(v) => setEditing({ ...editing, established_year: v ? Number(v) : null })} />
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Category</label>
                <select
                  value={editing.category ?? "education"}
                  onChange={(e) => setEditing({ ...editing, category: e.target.value as Category })}
                  className="w-full rounded-lg border border-control px-3 py-2 text-sm"
                >
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <Field label="External URL" value={editing.external_url ?? ""} onChange={(v) => setEditing({ ...editing, external_url: v })} />
              <Field label="Logo URL" value={editing.logo_url ?? ""} onChange={(v) => setEditing({ ...editing, logo_url: v })} />
              <Field label="Parent Org" value={editing.parent_org ?? ""} onChange={(v) => setEditing({ ...editing, parent_org: v })} />
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Description</label>
                <textarea
                  value={editing.description ?? ""}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-control px-3 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Latitude" type="number" value={String(editing.latitude ?? "")} onChange={(v) => setEditing({ ...editing, latitude: v ? Number(v) : null })} />
                <Field label="Longitude" type="number" value={String(editing.longitude ?? "")} onChange={(v) => setEditing({ ...editing, longitude: v ? Number(v) : null })} />
              </div>
            </div>
        </Modal>
      )}

      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white">
        {loading ? (
          <p className="p-6 text-center text-sm text-slate-500">Loading...</p>
        ) : items.length === 0 ? (
          <p className="p-6 text-center text-sm text-slate-500">No institutions.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">City</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Est.</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((inst) => (
                <tr key={inst.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{inst.name}</td>
                  <td className="px-4 py-3 text-slate-500">{inst.city}</td>
                  <td className="px-4 py-3 text-slate-500 capitalize">{inst.category}</td>
                  <td className="px-4 py-3 text-slate-500">{inst.established_year ?? "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setEditing({ ...inst })} className="text-crescent-700 hover:underline">
                      Edit
                    </button>
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

function Field({
  label, value, onChange, type = "text",
}: {
  label: string; value: string; onChange: (v: string) => void; type?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-600">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-control px-3 py-2 text-sm"
      />
    </div>
  );
}
