import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { isDemo } from "@/lib/demo";
import { createAdminClient } from "@/lib/supabase-server";

// Where links from Supabase land: Google sign-in, the email confirmation and the password reset link.
// It turns the one-time code into a session cookie and sends the customer on.
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const raw = url.searchParams.get("next") ?? "/account";
  const next = raw.startsWith("/") && !raw.startsWith("//") && !raw.startsWith("/admin") ? raw : "/account";
  if (isDemo) return NextResponse.redirect(new URL(next, url.origin));

  const supabase = await createAdminClient();
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;

  const { error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : tokenHash && type
      ? await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
      : { error: new Error("missing code") };

  if (error) {
    console.error("auth callback failed", error.message);
    return NextResponse.redirect(new URL("/login?error=link", url.origin));
  }
  return NextResponse.redirect(new URL(next, url.origin));
}
