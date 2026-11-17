import { isDemo } from "@/lib/demo";
import { requireAdmin } from "@/lib/supabase-server";
import { PasswordForm } from "./password-form";

export default async function AccountPage() {
  const supabase = await requireAdmin();
  // Demo mode has no real accounts.
  const { data } = isDemo ? { data: null } : await supabase.auth.getClaims();
  const email = (data?.claims?.email as string | undefined) ?? "";

  return (
    <>
      <h1 className="text-xl font-bold">ჩემი ანგარიში</h1>
      {email && <p className="mt-1 text-sm text-neutral-700">{email}</p>}
      <PasswordForm />
    </>
  );
}
