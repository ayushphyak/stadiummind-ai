/**
 * Runs once when the Next.js server process starts (Node runtime only —
 * guarded below since this file is also loaded on the edge runtime, which
 * doesn't support the same env surface).
 *
 * Purpose: turn silent/confusing runtime failures into a loud, actionable
 * message in the server logs at boot time, instead of discovering
 * misconfiguration later as an opaque "Server error" on a user's screen.
 * This does not block requests — Next.js has no supported way to hard-fail
 * boot from here — but it gives operators (and this app's own maintainers)
 * an unmissable log line pointing at the exact fix.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const problems: string[] = [];
  const warnings: string[] = [];

  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret || secret === "replace-with-openssl-rand-base64-32") {
    if (process.env.NODE_ENV === "production") {
      problems.push(
        "NEXTAUTH_SECRET is missing or still set to the placeholder value. " +
          "NextAuth will fail every auth request in production with a generic " +
          '"Server error. There is a problem with the server configuration." ' +
          "Generate one with: openssl rand -base64 32"
      );
    } else {
      warnings.push(
        "NEXTAUTH_SECRET is not set — using NextAuth's insecure dev fallback. " +
          "Fine for local dev, but set this before deploying."
      );
    }
  }

  const provider = process.env.AI_PROVIDER ?? "gemini";
  const hasGemini = Boolean(process.env.GEMINI_API_KEY);
  const hasOpenAi = Boolean(process.env.OPENAI_API_KEY);
  if ((provider === "gemini" && !hasGemini) || (provider === "openai" && !hasOpenAi)) {
    warnings.push(
      `AI_PROVIDER is "${provider}" but its API key is not set. ` +
        "The Fan Assistant will automatically fall back to canned demo " +
        "responses instead of live AI replies — set the key to enable real answers."
    );
  }

  if (problems.length > 0) {
    console.error(
      "\n🚨 StadiumMind AI — startup configuration problems:\n" +
        problems.map((p) => `   • ${p}`).join("\n") +
        "\n"
    );
  }
  if (warnings.length > 0) {
    console.error(
      "\n⚠️  StadiumMind AI — startup configuration warnings:\n" +
        warnings.map((w) => `   • ${w}`).join("\n") +
        "\n"
    );
  }
  if (problems.length === 0 && warnings.length === 0) {
    console.error("✅ StadiumMind AI — environment configuration looks good.");
  }
}
