"use client";

import { useState } from "react";

const roles = [
  "Student",
  "Alumnus / Alumna",
  "Faculty",
  "Management",
  "Parent",
  "Entrepreneur",
  "Well-wisher",
];

type Status = "idle" | "sending" | "ok" | "error";

export default function EarlyAccessForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: String(data.get("email") ?? ""),
          role: String(data.get("role") ?? ""),
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error ?? "Something went wrong.");
      setNotice(json.message ?? "");
      setStatus("ok");
      form.reset();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (status === "ok") {
    return (
      <div className="rounded-card border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-800">
        <p className="font-semibold">
          {notice || "You're on the early-access list."}
        </p>
        <p className="mt-1">We&apos;ll be in touch when Crescent Connect opens.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end" noValidate>
      <label className="block text-sm font-medium text-slate-700 sm:flex-1">
        Email address
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className="mt-1 w-full rounded-lg border border-control px-3 py-2 text-sm outline-none focus:border-crescent-400"
        />
      </label>
      <label className="block text-sm font-medium text-slate-700 sm:w-48">
        I am a…
        <select
          name="role"
          className="mt-1 w-full rounded-lg border border-control bg-white px-3 py-2 text-sm outline-none focus:border-crescent-400"
        >
          <option value="">Select</option>
          {roles.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </label>
      <button
        type="submit"
        disabled={status === "sending"}
        className="inline-flex h-[42px] items-center justify-center rounded-lg bg-crescent-700 px-5 text-sm font-semibold text-white transition-colors hover:bg-crescent-800 disabled:opacity-60"
      >
        {status === "sending" ? "Adding…" : "Notify me"}
      </button>

      {status === "error" && (
        <p className="text-sm text-accent-600 sm:w-full" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
