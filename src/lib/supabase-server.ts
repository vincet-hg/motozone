import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isDemo, isDemoAdmin } from "./demo";
import { demoClient } from "./demo-data";
import { env } from "./env";

export async function createAdminClient() {
  if (isDemo) return demoClient as never;
  const store = await cookies();
  return createServerClient(env.supabaseUrl, env.anonKey, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (cookiesToSet) => {
        try {
          cookiesToSet.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // Server Components cannot set cookies; proxy.ts refreshes the session instead.
        }
      },
    },
  });
}

// Signed in with a password but not yet with the authenticator code. Used only by the two-factor page.
export async function requirePasswordSession() {
  const supabase = await createAdminClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  const { data } = await supabase.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!data) redirect("/admin/login?denied=1");
  return { supabase, user };
}

// Every admin page and action starts here. The database enforces the same rule,
// including the two-factor requirement (see is_admin in the migrations).
export async function requireAdmin() {
  if (isDemo) {
    if (!isDemoAdmin(await cookies())) redirect("/admin/login");
    return createAdminClient();
  }

  const supabase = await createAdminClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: level } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (level?.currentLevel !== "aal2") redirect("/admin/mfa");

  const { data } = await supabase.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!data) redirect("/admin/login?denied=1");

  return supabase;
}
