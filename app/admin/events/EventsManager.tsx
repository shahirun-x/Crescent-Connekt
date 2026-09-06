"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useToast } from "@/components/admin/Toast";
import ImageUpload from "@/components/admin/ImageUpload";
import { Field, TextareaField, InstitutionSelect } from "@/components/admin/fields";
import type { EventCategory, Institution } from "@/lib/types";

const CATEGORIES: EventCategory[] = [
  "Schools", "Colleges", "University", "Healthcare",
  "Alumni", "Community", "Sports", "Cultural", "Conferences",
];

/**
 * A row exactly as stored in public.events — note there is no
 * `institution_name` column; the name is resolved client-side from
 * the institutions list for display only.
 */
interface EventRow {
  id: string;
  title: string;
  date_start: string;
  date_end: string | null;
  institution_id: string | null;
  category: EventCategory;
  location: string;
  description: string;
  is_featured: boolean;
  image_url: string | null;
}

const EMPTY: Partial<EventRow> = {
  title: "", date_start: "", date_end: "", institution_id: null,
  category: "Community", location: "", description: "",
  is_featured: false, image_url: null,
};

export default function EventsManager() {
  const { toast } = useToast();
  const [items, setItems] = useState<EventRow[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<EventRow> | null>(null);
  const [saving, setSaving] = useState(false);

  const instMap = useMemo(
    () => new Map(institutions.map((i) => [i.id, i.name])),
    [institutions]
  );

  const load = useCallback(async () => {
    setLoading(true);
    const [evRes, instRes] = await Promise.all([
      fetch("/api/admin/events"),
      fetch("/api/admin/institutions"),
    ]);
    if (evRes.ok) setItems((await evRes.json()).data ?? []);
    if (instRes.ok) setInstitutions((await instRes.json()).data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleSave() {
    if (!editing) return;
    if (!editing.title?.trim() || !editing.date_start) {
      toast("Title and start date are required.", "error");
      return;
    }
    setSaving(true);
    const isNew = !editing.id;
    const res = await fetch("/api/admin/events", {
      method: isNew ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    });
    const json = await res.json();
    setSaving(false);
    if (!res.ok) { toast(json.error ?? "Failed", "error"); return; }
    toast(isNew ? "Event created" : "Event updated");
    setEditing(null);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this event?")) return;
    const res = await fetch("/api/admin/events", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) { toast("Event deleted"); load(); }
    else toast("Delete failed", "error");
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Events</h1>
        <button
          onClick={() => setEditing({ ...EMPTY })}
          className="rounded-lg bg-crescent-700 px-4 py-2 text-sm font-medium text-white hover:bg-crescent-800"
        >
          + Add Event
        </button>
      </div>

      {editing && (
        <div className="fixed inset-0 z-40 overflow-y-auto bg-black/30 py-10">
          <div className="mx-auto w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold">
              {editing.id ? "Edit Event" : "New Event"}
            </h2>
            <div className="space-y-3">
              <Field label="Title" value={editing.title ?? ""} onChange={(v) => setEditing({ ...editing, title: v })} />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Start Date" type="date" value={editing.date_start ?? ""} onChange={(v) => setEditing({ ...editing, date_start: v })} />
                <Field label="End Date" type="date" value={editing.date_end ?? ""} onChange={(v) => setEditing({ ...editing, date_end: v })} />
              </div>

              <InstitutionSelect
                value={editing.institution_id}
                onChange={(id) => setEditing({ ...editing, institution_id: id })}
                institutions={institutions}
              />

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Category</label>
                <select
                  value={editing.category ?? "Community"}
                  onChange={(e) => setEditing({ ...editing, category: e.target.value as EventCategory })}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                >
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>

              <Field label="Location" value={editing.location ?? ""} onChange={(v) => setEditing({ ...editing, location: v })} />

              <TextareaField
                label="Description"
                value={editing.description ?? ""}
                onChange={(v) => setEditing({ ...editing, description: v })}
              />

              <ImageUpload
                label="Cover Image"
                folder="events"
                value={editing.image_url}
                onChange={(url) => setEditing({ ...editing, image_url: url })}
              />

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={editing.is_featured ?? false}
                  onChange={(e) => setEditing({ ...editing, is_featured: e.target.checked })}
                />
                Featured event
              </label>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setEditing(null)} className="rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-100">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving} className="rounded-lg bg-crescent-700 px-4 py-2 text-sm font-medium text-white hover:bg-crescent-800 disabled:opacity-60">
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white">
        {loading ? (
          <p className="p-6 text-center text-sm text-slate-400">Loading...</p>
        ) : items.length === 0 ? (
          <p className="p-6 text-center text-sm text-slate-400">No events yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Institution</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((ev) => (
                <tr key={ev.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">
                    <span className="flex items-center gap-2">
                      {ev.image_url && (
                        <span className="text-xs text-slate-400" title="Has cover image">▣</span>
                      )}
                      {ev.title}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {ev.institution_id
                      ? instMap.get(ev.institution_id) ?? "—"
                      : "Network-wide"}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{ev.date_start}</td>
                  <td className="px-4 py-3 text-slate-500">{ev.category}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setEditing({ ...ev })} className="text-crescent-700 hover:underline">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(ev.id)} className="ml-3 text-red-600 hover:underline">
                      Delete
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
