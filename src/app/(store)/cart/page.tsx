import type { Metadata } from "next";
import { getCustomer, getProfile } from "@/lib/account";
import { CartView } from "./cart-view";

export const metadata: Metadata = { title: "კალათა", robots: { index: false } };

export default async function CartPage() {
  const customer = await getCustomer();
  const saved = customer ? await getProfile(customer.id) : null;
  // Someone who signed in with their phone does not have to type it again.
  const verifiedPhone = customer?.phone?.replace(/^\+?995/, "") ?? "";
  const profile = customer ? { name: saved?.name ?? "", address: saved?.address ?? "", phone: saved?.phone || verifiedPhone } : null;

  return (
    <main className="mx-auto max-w-5xl px-3 py-4 sm:px-4 md:py-8">
      <h1 className="text-2xl font-extrabold">კალათა</h1>
      <CartView signedIn={Boolean(customer)} profile={profile} />
    </main>
  );
}
