import type { NextConfig } from "next";

const supabase = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co");
const isLocalSupabase = ["localhost", "127.0.0.1"].includes(supabase.hostname);

// Lets someone else open the local dev server through a temporary Cloudflare link
// (`cloudflared tunnel --url http://localhost:3000`). Has no effect in production.
const devTunnels = process.env.NODE_ENV === "development" ? ["*.trycloudflare.com"] : [];

const isDev = process.env.NODE_ENV === "development";
// HTTPS-only rules are sent only when the site address is https, so `npm start` on localhost keeps working.
const isHttps = (process.env.NEXT_PUBLIC_SITE_URL ?? "").startsWith("https://");
const supabaseOrigin = process.env.NEXT_PUBLIC_SUPABASE_URL ? supabase.origin : "";

// Pages are pre-built and cached, so the policy uses 'unsafe-inline' for scripts instead of
// per-request nonces, which would make every page dynamic. Everything else is locked to this
// site and Supabase. Add an analytics domain here if you add one.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${supabaseOrigin}`,
  "font-src 'self'",
  `connect-src 'self' ${supabaseOrigin}${isDev ? " ws:" : ""}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isHttps ? ["upgrade-insecure-requests"] : []),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  ...(isHttps ? [{ key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" }] : []),
];

const config: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Keeps the admin out of search engines.
      { source: "/admin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
      { source: "/admin", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
    ];
  },
  allowedDevOrigins: devTunnels,
  experimental: {
    inlineCss: true,
    serverActions: { allowedOrigins: devTunnels },
  },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 828, 1080, 1600],
    imageSizes: [96, 200, 320, 480],
    qualities: [75],
    // Uploaded files get unique names, so an optimized image never goes stale.
    minimumCacheTTL: 31536000,
    dangerouslyAllowLocalIP: isLocalSupabase,
    remotePatterns: [
      {
        protocol: supabase.protocol.replace(":", "") as "http" | "https",
        hostname: supabase.hostname,
        port: supabase.port,
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default config;
