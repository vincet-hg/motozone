import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isDemo, isDemoAdmin } from "./demo";
import { demoClient } from "./demo-data";

export async function createAdminClient() {
  if (isDemo) return demoClient as never;
  const store = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
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

// Every admin page and action starts here. The database enforces the same rule.
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

  const { data } = await supabase.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!data) redirect("/admin/login?denied=1");

  return supabase;
}
