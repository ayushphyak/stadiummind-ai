"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import type { ReactNode } from "react";

/**
 * The app previously had no SessionProvider at all, so useSession() couldn't
 * be used anywhere (including for a sign-out button, which didn't exist).
 * Refetch on window focus is disabled — a control-room dashboard shouldn't
 * silently re-check auth and flicker while an operator is mid-task.
 */
export function SessionProvider({ children }: { children: ReactNode }) {
  return (
    <NextAuthSessionProvider refetchOnWindowFocus={false}>{children}</NextAuthSessionProvider>
  );
}
