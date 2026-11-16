import "server-only";
import { isDemo } from "./demo";

// Read once on the server. A production deployment with a missing value stops with a clear message
// instead of showing broken pages or failing checkouts.
const REQUIRED = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY", "NEXT_PUBLIC_SITE_URL"] as const;

if (!isDemo && process.env.NODE_ENV === "production") {
  const missing = REQUIRED.filter((name) => !process.env[name]);
  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(", ")}. See .env.example.`);
  }
  if (process.env.SUPABASE_SERVICE_ROLE_KEY === process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY must be the service_role key, not the anon key.");
  }
}

export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  telegramToken: process.env.TELEGRAM_BOT_TOKEN ?? "",
  telegramChatId: process.env.TELEGRAM_CHAT_ID ?? "",
};
