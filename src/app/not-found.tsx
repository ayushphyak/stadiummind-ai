import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <main id="main-content" className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-6 py-20 text-center">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-turf/10">
        <Compass className="h-7 w-7 text-turf" aria-hidden="true" />
      </div>
      <h1 className="font-display text-3xl font-semibold text-floodlight">Page not found</h1>
      <p className="mt-2 text-floodlight-dim">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/">
          <Button variant="primary">Go to homepage</Button>
        </Link>
        <Link href="/fan-assistant">
          <Button variant="secondary">Try the Fan Assistant</Button>
        </Link>
      </div>
    </main>
  );
}
