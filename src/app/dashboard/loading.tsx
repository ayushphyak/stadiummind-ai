import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12" aria-busy="true" aria-label="Loading Operations Dashboard">
      <Skeleton className="h-9 w-80" />
      <Skeleton className="mt-3 h-5 w-full max-w-2xl" />
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="rounded-card border border-pitch-line bg-pitch-surface/80 p-5 space-y-3">
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-2 w-full" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          ))}
        </div>
        <div className="rounded-card border border-pitch-line bg-pitch-surface/80 p-5 space-y-3">
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      </div>
    </main>
  );
}
