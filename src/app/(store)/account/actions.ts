"use server";

import { revalidatePath } from "next/cache";
import { getCustomer, getProfile, initialOf, saveProfile, setWishlistIds, getWishlistIds } from "@/lib/account";
import type { AccountSummary } from "@/lib/account-state";
import type { AuthState } from "../login/actions";

export async function updateProfile(_: AuthState, form: FormData): Promise<AuthState> {
  const customer = await getCustomer();
  if (!customer) return { error: "სესია დასრულდა. შედი თავიდან." };
  const name = String(form.get("name") ?? "").trim();
  const phone = String(form.get("phone") ?? "").trim();
  const address = String(form.get("address") ?? "").trim();
  if (phone && !/^(\+?995)?\s*5[0-9 ]{8,11}$/.test(phone.replace(/[-()]/g, ""))) return { error: "შეიყვანე სწორი მობილურის ნომერი." };
  await saveProfile(customer.id, { name, phone, address });
  revalidatePath("/account", "layout");
  return { info: "შენახულია." };
}

// What the header shows for the signed-in customer: their name (or email or phone) and its first letter.
export async function getAccountSummary(): Promise<AccountSummary | null> {
  const customer = await getCustomer();
  if (!customer) return null;
  const profile = await getProfile(customer.id);
  const phone = customer.phone?.replace(/^\+995(\d{3})(\d{2})(\d{2})(\d{2})$/, "+995 $1 $2 $3 $4") ?? "";
  const name = profile.name.trim();
  const label = customer.email ?? phone;
  const initial = initialOf(name || customer.email || "");
  return { id: customer.id, name, label, initial, canChangePassword: customer.provider === "email" };
}

// Called by the header once per page load for a signed-in customer: merges this browser's wishlist
// with the saved one and returns the result. Returns null for visitors, who keep the local list only.
export async function syncWishlist(localIds: string[]): Promise<string[] | null> {
  const customer = await getCustomer();
  if (!customer) return null;
  const ids = localIds.filter((id) => /^[0-9a-f-]{36}$/i.test(id)).slice(0, 200);
  const saved = await getWishlistIds(customer.id);
  const merged = [...new Set([...saved, ...ids])];
  if (merged.length !== saved.length) await setWishlistIds(customer.id, merged);
  return merged;
}

// Saves the wishlist after a change in this browser.
export async function saveWishlist(ids: string[]) {
  const customer = await getCustomer();
  if (!customer) return;
  await setWishlistIds(customer.id, ids.filter((id) => /^[0-9a-f-]{36}$/i.test(id)));
}
