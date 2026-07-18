"use client";

import { useEffect } from "react";

/**
 * Only triggers if the root layout itself throws (very rare — e.g. a crash
 * in SessionProvider/ToastProvider). Must render a full <html>/<body>
 * since the layout that would normally provide them is what crashed.
 * Deliberately plain inline styles: this must not depend on Tailwind's
 * generated CSS being reachable, since we can't be sure the failure mode
 * doesn't also affect asset loading.
 */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[app/global-error]", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0B1220",
          color: "#F5F7FA",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          padding: "2rem",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "0.5rem" }}>
          StadiumMind AI hit a critical error
        </h1>
        <p style={{ color: "#AEB9CC", marginBottom: "1.5rem", maxWidth: "28rem" }}>
          The app crashed unexpectedly. Reloading usually fixes this — if it keeps happening, please let us know.
        </p>
        {error.digest && (
          <p style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "#AEB9CC", marginBottom: "1.5rem" }}>
            Reference: {error.digest}
          </p>
        )}
        <button
          onClick={reset}
          style={{
            background: "#2F9E5C",
            color: "#0B1220",
            border: "none",
            borderRadius: "0.5rem",
            padding: "0.75rem 1.5rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Reload
        </button>
      </body>
    </html>
  );
}
