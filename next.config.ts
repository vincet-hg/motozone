import type { NextConfig } from "next";

const supabase = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co");
const isLocalSupabase = ["localhost", "127.0.0.1"].includes(supabase.hostname);

const config: NextConfig = {
  poweredByHeader: false,
  experimental: {
    inlineCss: true,
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
