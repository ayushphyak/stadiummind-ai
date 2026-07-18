import { cn } from "@/lib/utils/cn";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-pitch-surface", className)}
      role="presentation"
      aria-hidden="true"
    />
  );
}
