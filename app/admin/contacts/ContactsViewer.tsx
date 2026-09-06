"use client";

import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/components/admin/Toast";

interface Contact {
  id: string;
  name: string;
  email: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function ContactsViewer() {
  const { toast } = useToast();
  const [items, setItems] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  // Guards against a double-click firing two read/unread writes.
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/contacts");
    if (res.ok) {
      const { data } = await res.json();
      setItems(data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function toggleRead(id: string, currentlyRead: boolean) {
    if (busyId) return;
    setBusyId(id);
    try {
      const res = await fetch("/api/admin/contacts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_read: !currentlyRead }),
      });
      if (res.ok) {
        toast(currentlyRead ? "Marked unread" : "Marked read");
        load();
      } else {
        toast("Update failed", "error");
      }
    } finally {
      setBusyId(null);
    }
  }

  const unreadCount = items.filter((c) => !c.is_read).length;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800">Contact Messages</h1>
      <p className="mt-1 text-sm text-slate-500">
        {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
      </p>

      <div className="mt-4 space-y-2">
        {loading ? (
          <p className="p-6 text-center text-sm text-slate-500">Loading...</p>
        ) : items.length === 0 ? (
          <p className="p-6 text-center text-sm text-slate-500">No messages yet.</p>
        ) : (
          items.map((c) => (
            <div
              key={c.id}
              className={`rounded-xl border bg-white ${
                c.is_read ? "border-slate-200" : "border-crescent-300 bg-crescent-50/30"
              }`}
            >
              <button
                onClick={() => setExpanded(expanded === c.id ? null : c.id)}
                className="flex w-full items-center justify-between px-4 py-3 text-left"
              >
                <div className="flex items-center gap-3">
                  {!c.is_read && (
                    <span className="h-2 w-2 rounded-full bg-crescent-600" />
                  )}
                  <div>
                    <span className="font-medium text-slate-800">{c.name}</span>
                    <span className="ml-2 text-sm text-slate-500">{c.email}</span>
                  </div>
                </div>
                <span className="text-xs text-slate-500">
                  {new Date(c.created_at).toLocaleDateString()}
                </span>
              </button>
              {expanded === c.id && (
                <div className="border-t px-4 py-3">
                  <p className="whitespace-pre-wrap text-sm text-slate-700">{c.message}</p>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => toggleRead(c.id, c.is_read)}
                      disabled={busyId === c.id}
                      className="rounded-lg border border-control px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                    >
                      {busyId === c.id
                        ? "Saving…"
                        : `Mark ${c.is_read ? "unread" : "read"}`}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
