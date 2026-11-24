import "server-only";
import { createClient } from "@supabase/supabase-js";
import { isDemo } from "./demo";
import { demoClient } from "./demo-data";
import { env } from "./env";

// The store's own server identity. It can place orders and check rate limits, which customers'
// browsers cannot do directly. The key never leaves the server: it has no NEXT_PUBLIC_ prefix.
export const serviceClient = isDemo
  ? (demoClient as never as ReturnType<typeof createClient>)
  : createClient(env.supabaseUrl, env.serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
