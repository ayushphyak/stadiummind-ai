"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { BackButton } from "@/components/layout/BackButton";
import { useToast } from "@/components/providers/ToastProvider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

export function LoginContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });
  const { showToast } = useToast();

  const emailValid = /^\S+@\S+\.\S+$/.test(email);
  const passwordValid = password.length >= 8;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await signIn("credentials", {
        email,
        password,
        callbackUrl,
        redirect: false,
      });
      if (res?.error) {
        // Kept consistent with the demo-credentials hint below (an 8+
        // character password is genuinely all this demo checks) — the
        // previous message quoted a specific password that didn't match
        // what the form actually validates.
        setError("Invalid email or password. Use one of the demo accounts below with any 8+ character password.");
      } else if (res?.url) {
        showToast("Signed in successfully.", "success");
        window.location.href = res.url;
      }
    } catch {
      setError("Couldn't reach the sign-in service. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      id="main-content"
      className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-6 py-12"
    >
      <div className="w-full max-w-sm">
        <div className="mb-4">
          <BackButton fallbackHref="/" />
        </div>
        {/* Logo / heading */}
        <div className="mb-8 text-center">
          <span className="inline-block rounded-full border border-turf px-3 py-1 text-xs font-medium text-turf mb-4">
            Staff Login
          </span>
          <h1 className="font-display text-3xl font-bold text-floodlight">
            StadiumMind AI
          </h1>
          <p className="mt-2 text-sm text-floodlight-dim">
            Sign in with your staff credentials to continue.
          </p>
        </div>

        {/* Demo credentials hint */}
        <div className="mb-6 rounded-card border border-pitch-line bg-pitch-surface p-4 text-xs text-floodlight-dim space-y-1">
          <p className="font-semibold text-floodlight">Demo credentials</p>
          <p>organizer@fifa2026.demo · any 8+ char password</p>
          <p>volunteer@fifa2026.demo · any 8+ char password</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-floodlight-dim mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, email: true }))}
              aria-invalid={touched.email && !emailValid}
              aria-describedby={touched.email && !emailValid ? "email-error" : undefined}
              className={cn(
                "w-full rounded-lg border bg-pitch-surface px-4 py-2.5 text-floodlight placeholder-floodlight-dim/50 focus:outline-none focus:ring-1",
                touched.email && !emailValid
                  ? "border-alert-red focus:border-alert-red focus:ring-alert-red"
                  : "border-pitch-line focus:border-turf focus:ring-turf"
              )}
              placeholder="organizer@fifa2026.demo"
            />
            {touched.email && !emailValid && (
              <p id="email-error" className="mt-1 text-xs text-alert-red">
                Enter a valid email address.
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-floodlight-dim mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, password: true }))}
              aria-invalid={touched.password && !passwordValid}
              aria-describedby={touched.password && !passwordValid ? "password-error" : undefined}
              className={cn(
                "w-full rounded-lg border bg-pitch-surface px-4 py-2.5 text-floodlight placeholder-floodlight-dim/50 focus:outline-none focus:ring-1",
                touched.password && !passwordValid
                  ? "border-alert-red focus:border-alert-red focus:ring-alert-red"
                  : "border-pitch-line focus:border-turf focus:ring-turf"
              )}
              placeholder="••••••••"
            />
            {touched.password && !passwordValid && (
              <p id="password-error" className="mt-1 text-xs text-alert-red">
                Password must be at least 8 characters.
              </p>
            )}
          </div>

          {error && (
            <p role="alert" className="text-sm text-alert-red">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={loading}
            size="lg"
            className="w-full"
          >
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-floodlight-dim">
          Not staff?{" "}
          <Link href="/fan-assistant" className="text-turf hover:underline">
            Go to Fan Assistant
          </Link>
        </p>
      </div>
    </main>
  );
}
