import "server-only";
import { isDemo } from "./demo";

// Read once on the server. A production deployment with a missing value stops with a clear message
// instead of showing broken pages or failing checkouts.
// NEXT_PUBLIC_SITE_URL is required only for Vercel production. Previews use their own address,
// and without it the site is never indexed (see isLiveSite).
const REQUIRED = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_SECRET_KEY",
  ...(process.env.VERCEL_ENV === "production" ? ["NEXT_PUBLIC_SITE_URL"] : []),
];

if (!isDemo && process.env.NODE_ENV === "production") {
  const missing = REQUIRED.filter((name) => !process.env[name]);
  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(", ")}. See .env.example.`);
  }
  if (process.env.SUPABASE_SECRET_KEY === process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_SECRET_KEY!.startsWith("sb_publishable_")) {
    throw new Error("SUPABASE_SECRET_KEY must be the secret key (sb_secret_...), not the publishable key.");
  }
  if (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!.startsWith("sb_secret_")) {
    throw new Error("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY holds a secret key. Use the publishable key (sb_publishable_...); the secret key must never be public.");
  }
}

export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
  serviceKey: process.env.SUPABASE_SECRET_KEY ?? "",
  telegramToken: process.env.TELEGRAM_BOT_TOKEN ?? "",
  telegramChatId: process.env.TELEGRAM_CHAT_ID ?? "",
};
