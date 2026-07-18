import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12" aria-busy="true" aria-label="Loading Crowd Intelligence">
      <Skeleton className="h-9 w-72" />
      <Skeleton className="mt-3 h-5 w-full max-w-2xl" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-card border border-pitch-line bg-pitch-surface/80 p-5 space-y-3">
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    </main>
  );
}
