"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

/**
 * Browser `history.back()` silently does nothing if the user landed on the
 * page directly (typed URL, opened link in new tab, refreshed) — that's
 * the most common cause of a "broken" back button. This falls back to a
 * known-good destination instead of leaving the user stuck.
 */
export function BackButton({ fallbackHref = "/", label = "Back" }: { fallbackHref?: string; label?: string }) {
  const router = useRouter();

  const handleClick = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex items-center gap-1.5 rounded-md py-1.5 pr-2 text-sm font-medium text-floodlight-dim transition-colors hover:text-floodlight"
    >
      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      {label}
    </button>
  );
}
