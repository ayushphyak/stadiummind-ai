import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12" aria-busy="true" aria-label="Loading Fan Assistant">
      <Skeleton className="h-9 w-56" />
      <Skeleton className="mt-3 h-5 w-full max-w-xl" />
      <div className="mt-8 flex h-[70vh] flex-col rounded-card border border-pitch-line bg-pitch-surface/60 p-4">
        <div className="flex-1 space-y-3">
          <Skeleton className="h-16 w-3/4" />
          <Skeleton className="ml-auto h-10 w-1/2" />
          <Skeleton className="h-16 w-2/3" />
        </div>
        <Skeleton className="h-11 w-full" />
      </div>
    </main>
  );
}
