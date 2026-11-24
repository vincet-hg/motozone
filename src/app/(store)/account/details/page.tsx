import type { Metadata } from "next";
import { getProfile, requireCustomer } from "@/lib/account";
import { ProfileForm } from "../profile-form";

export const metadata: Metadata = { title: "ჩემი მონაცემები", robots: { index: false, follow: false } };

export default async function AccountDetailsPage() {
  const customer = await requireCustomer("/account/details");
  const profile = await getProfile(customer.id);
  return (
    <section aria-labelledby="details-title" className="mx-auto max-w-xl rounded-card border border-line bg-card p-5 sm:p-6">
      <h2 id="details-title" className="text-lg font-bold">ჩემი მონაცემები</h2>
      <p className="mt-1 text-sm text-muted">შეკვეთის გაფორმებისას ეს ველები თავისით შეივსება.</p>
      <ProfileForm profile={{ ...profile, phone: profile.phone || (customer.phone?.replace(/^\+?995/, "") ?? "") }} />
    </section>
  );
}
