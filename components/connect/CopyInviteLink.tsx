"use client";

import { useState } from "react";

/**
 * Copies the public Member Network link to the clipboard. Nothing else: it
 * sends no email and calls no API — the member decides who to share it with
 * and how.
 *
 * Status is announced through a polite live region, so a screen-reader user
 * hears "Link copied" instead of pressing a button that appears to do nothing.
 */
export default function CopyInviteLink({ url }: { url: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setState("copied");
    } catch {
      // Clipboard access can be refused (insecure context, permissions). Say
      // so, and leave the URL on screen to copy by hand.
      setState("failed");
    }
  }

  return (
    <div className="mt-5">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <button
          type="button"
          onClick={copy}
          className="inline-flex min-h-[2.75rem] items-center bg-crescent-900 px-5 text-[0.9rem] font-semibold text-white transition-colors hover:bg-crescent-800"
        >
          {state === "copied" ? "Copied" : "Copy invite link"}
        </button>
        <code className="break-all text-sm text-ink-700">{url}</code>
      </div>
      <p aria-live="polite" className="type-meta mt-2 min-h-[1.25rem] text-ink-500">
        {state === "copied" && "Link copied — paste it wherever your classmates are."}
        {state === "failed" && "Couldn’t copy automatically. Select the link above and copy it."}
      </p>
    </div>
  );
}
