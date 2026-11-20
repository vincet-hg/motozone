import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isDemo } from "@/lib/demo";
import { requirePasswordSession } from "@/lib/supabase-server";
import { MfaChallenge, MfaSetupForm } from "./mfa-forms";

export const metadata: Metadata = { title: "ორ ეტაპიანდა", robots: { index: false, follow: false } };

// Second sign-in step. Admin access, in the app and in the database, needs this step.
export default async function MfaPage() {
  if (isDemo) redirect("/admin");
  const { supabase } = await requirePasswordSession();

  const { data: level } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (level?.currentLevel === "aal2") redirect("/admin");

  const { data: factors } = await supabase.auth.mfa.listFactors();
  const verified = factors?.totp.find((factor) => factor.status === "verified");

  return (
    <main className="admin flex flex-1 items-center justify-center bg-a-bg bg-[radial-gradient(ellipse_at_50%_20%,rgba(227,18,11,0.25),transparent_55%)] px-4 py-10 text-a-text">
      <div className="w-full max-w-sm space-y-4 rounded-3xl border border-a-line bg-a-card/90 p-7 backdrop-blur shadow-[0_10px_30px_-18px_rgba(0,0,0,0.8)]">
        <h1 className="text-lg font-bold">ორფაქტორიანი შესვლა</h1>
        {verified ? <MfaChallenge factorId={verified.id} /> : <MfaSetupForm />}
      </div>
    </main>
  );
}
