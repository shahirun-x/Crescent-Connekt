"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useToast } from "@/components/admin/Toast";
import ImageUpload from "@/components/admin/ImageUpload";
import { Field, TextareaField, InstitutionSelect } from "@/components/admin/fields";
import type { Institution } from "@/lib/types";

/**
 * A row exactly as stored in public.news — there is no
 * `institution_name` column; the name is resolved client-side from
 * the institutions list for display only.
 */
interface NewsRow {
  id: string;
  title: string;
  summary: string;
  content: string;
  institution_id: string | null;
  published_at: string;
  image_url: string | null;
}

const EMPTY: Partial<NewsRow> = {
  title: "", summary: "", content: "", institution_id: null,
  published_at: new Date().toISOString().split("T")[0], image_url: null,
};

export default function NewsManager() {
  const { toast } = useToast();
  const [items, setItems] = useState<NewsRow[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<NewsRow> | null>(null);
  const [saving, setSaving] = useState(false);

  const instMap = useMemo(
    () => new Map(institutions.map((i) => [i.id, i.name])),
    [institutions]
  );

  const load = useCallback(async () => {
    setLoading(true);
    const [newsRes, instRes] = await Promise.all([
      fetch("/api/admin/news"),
      fetch("/api/admin/institutions"),
    ]);
    if (newsRes.ok) setItems((await newsRes.json()).data ?? []);
    if (instRes.ok) setInstitutions((await instRes.json()).data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleSave() {
    if (!editing) return;
    if (!editing.title?.trim()) {
      toast("Title is required.", "error");
      return;
    }
    setSaving(true);
    const isNew = !editing.id;
    const res = await fetch("/api/admin/news", {
      method: isNew ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    });
    const json = await res.json();
    setSaving(false);
    if (!res.ok) { toast(json.error ?? "Failed", "error"); return; }
    toast(isNew ? "Article created" : "Article updated");
    setEditing(null);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this article?")) return;
    const res = await fetch("/api/admin/news", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) { toast("Article deleted"); load(); }
    else toast("Delete failed", "error");
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">News</h1>
        <button
          onClick={() => setEditing({ ...EMPTY })}
          className="rounded-lg bg-crescent-700 px-4 py-2 text-sm font-medium text-white hover:bg-crescent-800"
        >
          + Add Article
        </button>
      </div>

      {editing && (
        <div className="fixed inset-0 z-40 overflow-y-auto bg-black/30 py-10">
          <div className="mx-auto w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold">
              {editing.id ? "Edit Article" : "New Article"}
            </h2>
            <div className="space-y-3">
              <Field label="Title" value={editing.title ?? ""} onChange={(v) => setEditing({ ...editing, title: v })} />

              <InstitutionSelect
                value={editing.institution_id}
                onChange={(id) => setEditing({ ...editing, institution_id: id })}
                institutions={institutions}
              />

              <Field label="Published Date" type="date" value={editing.published_at ?? ""} onChange={(v) => setEditing({ ...editing, published_at: v })} />

              <TextareaField
                label="Summary"
                rows={3}
                value={editing.summary ?? ""}
                onChange={(v) => setEditing({ ...editing, summary: v })}
              />

              <TextareaField
                label="Content"
                value={editing.content ?? ""}
                onChange={(v) => setEditing({ ...editing, content: v })}
              />

              <ImageUpload
                label="Article Image"
                folder="news"
                value={editing.image_url}
                onChange={(url) => setEditing({ ...editing, image_url: url })}
              />
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
          <p className="p-6 text-center text-sm text-slate-400">No articles yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Institution</th>
                <th className="px-4 py-3">Published</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((n) => (
                <tr key={n.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">
                    <span className="flex items-center gap-2">
                      {n.image_url && (
                        <span className="text-xs text-slate-400" title="Has image">▣</span>
                      )}
                      {n.title}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {n.institution_id
                      ? instMap.get(n.institution_id) ?? "—"
                      : "Network-wide"}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{n.published_at}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setEditing({ ...n })} className="text-crescent-700 hover:underline">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(n.id)} className="ml-3 text-red-600 hover:underline">
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
