"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { MessageCircle, Map, ShieldCheck, LogOut, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useToast } from "@/components/providers/ToastProvider";

const NAV_LINKS = [
  { href: "/fan-assistant", label: "Fan Assistant", icon: MessageCircle },
  { href: "/crowd-intelligence", label: "Crowd Intelligence", icon: Map },
  { href: "/dashboard", label: "Ops Dashboard", icon: ShieldCheck },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { showToast } = useToast();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = async () => {
    setMenuOpen(false);
    await signOut({ redirect: false });
    showToast("You've been signed out.", "success");
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-40 border-b border-pitch-line bg-pitch/90 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="font-display text-lg font-bold text-floodlight" onClick={() => setMenuOpen(false)}>
          Stadium<span className="text-turf">Mind</span> AI
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-pitch-surface text-turf"
                    : "text-floodlight-dim hover:bg-pitch-surface hover:text-floodlight"
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </Link>
            );
          })}
          {status === "authenticated" ? (
            <button
              type="button"
              onClick={handleSignOut}
              className="ml-2 flex items-center gap-1.5 rounded-md border border-pitch-line px-3 py-2 text-sm font-medium text-floodlight-dim transition-colors hover:border-alert-red hover:text-alert-red"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sign out{session?.user?.email ? ` (${session.user.email})` : ""}
            </button>
          ) : (
            <Link
              href="/login"
              className="ml-2 rounded-md border border-pitch-line px-3 py-2 text-sm font-medium text-floodlight-dim transition-colors hover:border-turf hover:text-floodlight"
            >
              Staff sign in
            </Link>
          )}
        </nav>

        {/* Mobile menu toggle */}
        <button
          type="button"
          className="rounded-md p-2 text-floodlight md:hidden"
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <nav id="mobile-nav" aria-label="Primary" className="border-t border-pitch-line px-4 pb-4 pt-2 md:hidden">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                    active ? "bg-pitch-surface text-turf" : "text-floodlight-dim hover:text-floodlight"
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {label}
                </Link>
              );
            })}
            {status === "authenticated" ? (
              <button
                type="button"
                onClick={handleSignOut}
                className="flex items-center gap-2 rounded-md px-3 py-2.5 text-left text-sm font-medium text-floodlight-dim transition-colors hover:text-alert-red"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Sign out
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium text-floodlight-dim transition-colors hover:text-floodlight"
              >
                Staff sign in
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
