import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isDemo } from "@/lib/demo";
import { requirePasswordSession } from "@/lib/supabase-server";
import { MfaChallenge, MfaSetupForm } from "./mfa-forms";

export const metadata: Metadata = { title: "ორფაქტორიანი შესვლა", robots: { index: false, follow: false } };

// Second sign-in step. Admin access, in the app and in the database, needs this step.
export default async function MfaPage() {
  if (isDemo) redirect("/admin/orders");
  const { supabase } = await requirePasswordSession();

  const { data: level } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (level?.currentLevel === "aal2") redirect("/admin/orders");

  const { data: factors } = await supabase.auth.mfa.listFactors();
  const verified = factors?.totp.find((factor) => factor.status === "verified");

  return (
    <main className="flex flex-1 items-center justify-center bg-neutral-100 px-4 py-10 text-black">
      <div className="w-full max-w-sm space-y-4 rounded border border-neutral-200 bg-white p-6">
        <h1 className="text-lg font-bold">ორფაქტორიანი შესვლა</h1>
        {verified ? <MfaChallenge factorId={verified.id} /> : <MfaSetupForm />}
      </div>
    </main>
  );
}
