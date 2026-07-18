import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { OfflineBanner } from "@/components/layout/OfflineBanner";

export const metadata: Metadata = {
  title: {
    default: "StadiumMind AI — FIFA World Cup 2026 Operations Platform",
    template: "%s · StadiumMind AI",
  },
  description:
    "AI-powered stadium operations: fan assistance, crowd intelligence, and real-time decision support for FIFA World Cup 2026.",
};

export const viewport = {
  themeColor: "#0B1220",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="flex min-h-screen flex-col bg-pitch font-body text-floodlight antialiased">
        {/* Skip link — first focusable element, required for keyboard users
            to bypass repeated nav on every page (WCAG 2.2 SC 2.4.1). */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-turf focus:px-4 focus:py-2 focus:text-pitch"
        >
          Skip to main content
        </a>
        <SessionProvider>
          <ToastProvider>
            <OfflineBanner />
            <SiteHeader />
            <div className="flex-1">{children}</div>
          </ToastProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
