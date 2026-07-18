/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false, // don't leak framework fingerprint
  images: {
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
  async headers() {
    return [
      {
        // Applies to every route — defense-in-depth, not a substitute for
        // per-route checks (see src/middleware.ts and lib/security/*).
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(self), geolocation=(self)" },
          // Content-Security-Policy is intentionally NOT set here. It's set
          // per-request in src/middleware.ts instead, because a strict
          // script-src needs a fresh nonce on every request — a static
          // value in next.config.js can only ever be 'unsafe-inline',
          // which defeats the point (see middleware.ts buildCsp() for the
          // full rationale). Keeping it here as a static header would
          // silently override or conflict with the dynamic one depending
          // on header-merge order, so it's removed rather than duplicated.
        ],
      },
    ];
  },
};

module.exports = nextConfig;
