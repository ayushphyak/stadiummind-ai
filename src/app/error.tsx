"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Catches unhandled render-time errors for everything under this segment
 * (i.e. every page — there was previously no error.tsx anywhere, so any
 * uncaught render error produced Next's raw, unstyled default error screen
 * with no way to recover except a manual reload).
 */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[app/error]", error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-6 py-20 text-center">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-alert-red/10">
        <AlertTriangle className="h-7 w-7 text-alert-red" aria-hidden="true" />
      </div>
      <h1 className="font-display text-2xl font-semibold text-floodlight">Something went wrong</h1>
      <p className="mt-2 text-floodlight-dim">
        This page hit an unexpected error. You can try again, or head back to the homepage.
      </p>
      {error.digest && (
        <p className="mt-3 font-mono text-xs text-floodlight-dim/70">Reference: {error.digest}</p>
      )}
      <div className="mt-6 flex gap-3">
        <Button onClick={reset} variant="primary">
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Try again
        </Button>
        <Button onClick={() => (window.location.href = "/")} variant="secondary">
          Go home
        </Button>
      </div>
    </main>
  );
}
