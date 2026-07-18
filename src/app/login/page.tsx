import { Suspense } from "react";
import { LoginContent } from "@/features/auth/components/LoginContent";
import { Skeleton } from "@/components/ui/skeleton";

// This page reads the callbackUrl query param per request. Left as the
// default static rendering, Next.js has no request context to resolve
// that param at build time and bails the whole Suspense boundary out to
// client-side-only rendering — the form flashes in blank on every load
// until JS hydrates. Forcing dynamic rendering fixes that by rendering
// the real content on the server for every request.
export const dynamic = "force-dynamic";

function LoginSkeleton() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-6 py-12" aria-busy="true">
      <div className="w-full max-w-sm space-y-4">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-8 w-40 mx-auto" />
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginSkeleton />}>
      <LoginContent />
    </Suspense>
  );
}
