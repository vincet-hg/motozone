import type { NextConfig } from "next";

const supabase = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co");
const isLocalSupabase = ["localhost", "127.0.0.1"].includes(supabase.hostname);

// Lets someone else open the local dev server through a temporary Cloudflare link
// (`cloudflared tunnel --url http://localhost:3000`). Has no effect in production.
const devTunnels = process.env.NODE_ENV === "development" ? ["*.trycloudflare.com"] : [];

const config: NextConfig = {
  poweredByHeader: false,
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
