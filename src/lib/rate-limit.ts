import "server-only";
import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { serviceClient } from "./supabase-service";

// The visitor's IP as reported by the hosting platform (Vercel sets x-forwarded-for).
export async function getClientIp() {
  const list = await headers();
  return list.get("x-forwarded-for")?.split(",")[0]?.trim() || list.get("x-real-ip") || "unknown";
}

const hash = (value: string) => createHash("sha256").update(value).digest("hex").slice(0, 32);

// Returns false once `key` was used `max` times within `windowSeconds`.
// IPs and emails are hashed, so the table holds no personal data.
// If the check itself fails, the request is let through: a database hiccup must not block sales.
export async function isWithinRateLimit(scope: string, value: string, max: number, windowSeconds: number) {
  const { data, error } = await serviceClient.rpc("rate_limit_hit", {
    p_key: `${scope}:${hash(value.toLowerCase())}`,
    p_max: max,
    p_window_seconds: windowSeconds,
  });
  if (error) {
    console.error("rate_limit_hit failed", error.message);
    return true;
  }
  return data === true;
}
