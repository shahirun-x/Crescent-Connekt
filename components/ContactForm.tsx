"use client";

import { useState } from "react";
import { site } from "@/lib/site";

type Status = "idle" | "sending" | "ok" | "error";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      message: String(data.get("message") ?? ""),
    };

    setStatus("sending");
    setError("");
    setFieldErrors({});
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setFieldErrors(json.fieldErrors ?? {});
        throw new Error(json.error ?? "Something went wrong.");
      }
      setStatus("ok");
      form.reset();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  const fieldClass = (field: string) =>
    `mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none ${
      fieldErrors[field]
        ? "border-accent-500 focus:border-accent-600"
        : "border-slate-300 focus:border-crescent-400"
    }`;

  if (status === "ok") {
    return (
      <div className="rounded-card border border-emerald-200 bg-emerald-50 p-6 text-sm text-emerald-800">
        <p className="font-semibold">Thank you — your message is on its way.</p>
        <p className="mt-1">
          We&apos;ll get back to you at the email address you provided.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-slate-700">
          Name
          <input
            name="name"
            type="text"
            required
            minLength={2}
            autoComplete="name"
            aria-invalid={!!fieldErrors.name}
            aria-describedby={fieldErrors.name ? "contact-name-error" : undefined}
            className={fieldClass("name")}
          />
          {fieldErrors.name && (
            <span
              id="contact-name-error"
              className="mt-1 block text-xs font-normal text-accent-600"
            >
              {fieldErrors.name}
            </span>
          )}
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Email
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            aria-invalid={!!fieldErrors.email}
            aria-describedby={fieldErrors.email ? "contact-email-error" : undefined}
            className={fieldClass("email")}
          />
          {fieldErrors.email && (
            <span
              id="contact-email-error"
              className="mt-1 block text-xs font-normal text-accent-600"
            >
              {fieldErrors.email}
            </span>
          )}
        </label>
      </div>
      <label className="block text-sm font-medium text-slate-700">
        Message
        <textarea
          name="message"
          required
          minLength={10}
          rows={5}
          aria-invalid={!!fieldErrors.message}
          aria-describedby={fieldErrors.message ? "contact-message-error" : undefined}
          className={fieldClass("message")}
        />
        {fieldErrors.message && (
          <span
            id="contact-message-error"
            className="mt-1 block text-xs font-normal text-accent-600"
          >
            {fieldErrors.message}
          </span>
        )}
      </label>

      {status === "error" && (
        <div
          className="rounded-lg border border-accent-200 bg-accent-50/60 p-3 text-sm text-accent-700"
          role="alert"
        >
          <p>{error}</p>
          <p className="mt-1 text-xs">
            You can also email us directly at{" "}
            <a
              href={`mailto:${site.contactEmail}`}
              className="font-semibold underline"
            >
              {site.contactEmail}
            </a>
            .
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="inline-flex items-center justify-center rounded-full bg-crescent-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-crescent-800 disabled:opacity-60"
      >
        {status === "sending" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
