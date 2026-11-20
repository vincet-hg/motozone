import type { Metadata } from "next";
import { requireCustomer } from "@/lib/account";
import { PasswordForm } from "./password-form";

export const metadata: Metadata = { title: "პაროლის შეცვლა", robots: { index: false, follow: false } };

export default async function PasswordPage() {
  await requireCustomer("/account/password");
  return (
    <section aria-labelledby="password-title" className="mx-auto max-w-xl rounded-card border border-line bg-card p-5 sm:p-6">
      <h2 id="password-title" className="text-lg font-bold">პაროლის შეცვლა</h2>
      <p className="mt-1 mb-4 text-sm text-muted">მინიმუმ 8 სიმბოლო. ძველი პაროლი აღარ იმუშავებს.</p>
      <PasswordForm />
    </section>
  );
}
