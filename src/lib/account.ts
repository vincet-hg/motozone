import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { isDemo } from "./demo";
import { DEMO_CUSTOMER_COOKIE, demoProfile, demoSaveProfile, demoSetWishlist, demoUser, demoWishlist } from "./demo-accounts";
import { createAdminClient } from "./supabase-server";
import { service } from "./supabase-service";
import type { Customer, Order, Profile } from "./types";

// Customer accounts. The signed-in customer always comes from the verified session (never from a form),
// and every read or write below is limited to that customer's id. The database enforces the same rule
// with row level security for anything that reaches it directly.

// Once per request, however many parts of the page ask.
export const getCustomer = cache(async function getCustomer(): Promise<Customer | null> {
  if (isDemo) {
    const user = demoUser((await cookies()).get(DEMO_CUSTOMER_COOKIE)?.value);
    return user ? { id: user.id, email: user.email, phone: user.phone, provider: user.email ? "email" : "phone" } : null;
  }
  const supabase = await createAdminClient();
  // Checked locally against Supabase's signing key, so no round trip to the Auth server.
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) return null;
  return {
    id: claims.sub,
    email: (claims.email as string | undefined) || null,
    phone: (claims.phone as string | undefined) || null,
    provider: String((claims.app_metadata as { provider?: string } | undefined)?.provider ?? "email"),
  };
});

// Pages and actions that need a signed-in customer start here; others are sent to sign in and back.
export async function requireCustomer(next: string) {
  const customer = await getCustomer();
  if (!customer) redirect(`/login?next=${encodeURIComponent(next)}`);
  return customer;
}

export async function getProfile(userId: string): Promise<Profile> {
  const empty = { name: "", phone: "", address: "" };
  if (isDemo) return demoProfile(userId) ?? empty;
  const { data } = await service.from("profiles").select("name, phone, address").eq("user_id", userId).maybeSingle();
  return (data as Profile | null) ?? empty;
}

export async function saveProfile(userId: string, profile: Profile) {
  const clean = {
    name: profile.name.trim().slice(0, 100),
    phone: profile.phone.replace(/[^0-9+]/g, "").slice(0, 20),
    address: profile.address.trim().slice(0, 300),
  };
  if (isDemo) return demoSaveProfile(userId, clean);
  const { error } = await service.from("profiles").upsert({ user_id: userId, ...clean });
  if (error) throw new Error(`profile save failed: ${error.message}`);
}

export async function getWishlistIds(userId: string): Promise<string[]> {
  if (isDemo) return demoWishlist(userId);
  const { data } = await service.from("wishlist_items").select("product_id").eq("user_id", userId).order("created_at");
  return (data ?? []).map((row) => String(row.product_id));
}

// Makes the saved wishlist exactly this list of product ids.
export async function setWishlistIds(userId: string, productIds: string[]) {
  const ids = [...new Set(productIds)].slice(0, 200);
  if (isDemo) return demoSetWishlist(userId, ids);
  const current = await getWishlistIds(userId);
  const removed = current.filter((id) => !ids.includes(id));
  const added = ids.filter((id) => !current.includes(id));
  if (removed.length) await service.from("wishlist_items").delete().eq("user_id", userId).in("product_id", removed);
  // A product deleted meanwhile fails its foreign key; insert one at a time so the rest still save.
  for (const id of added) await service.from("wishlist_items").insert({ user_id: userId, product_id: id });
}

export type CustomerOrderItem = { id: number; product_id: string | null; product_name: string; price: number; qty: number; slug: string | null; image: string | null };
export type CustomerOrder = Omit<Order, "user_id"> & {
  items: CustomerOrderItem[];
  // Worked out from how the cart writes the order: the courier fee sits at the start of the note,
  // and a pickup order carries the pickup point as its address.
  deliveryFee: number;
  pickup: boolean;
  customerNote: string;
};

// Only what the customer may see: never purchase costs.
const ORDER_COLUMNS = "id, customer_name, phone, city, address, note, total, status, created_at";
const ITEM_COLUMNS = "id, order_id, product_id, product_name, price, qty";

async function withItems(orders: Order[]): Promise<CustomerOrder[]> {
  if (orders.length === 0) return [];
  const { data: items } = await service.from("order_items").select(ITEM_COLUMNS).in("order_id", orders.map((order) => order.id));
  const rows = (items ?? []) as { id: number; order_id: number; product_id: string | null; product_name: string; price: number; qty: number }[];
  const productIds = [...new Set(rows.map((row) => row.product_id).filter((id): id is string => Boolean(id)))];
  const { data: products } = productIds.length
    ? await service.from("products").select("id, slug, images").in("id", productIds)
    : { data: [] };
  const byId = new Map(((products ?? []) as { id: string; slug: string; images: string[] }[]).map((product) => [product.id, product]));

  return orders.map((order) => {
    const fee = /^\[მიტანა \+(\d+(?:\.\d+)?) ₾\]\s*/.exec(order.note ?? "");
    return {
      ...order,
      total: Number(order.total),
      deliveryFee: fee ? Number(fee[1]) : 0,
      customerNote: fee ? order.note.slice(fee[0].length) : order.note ?? "",
      pickup: order.address.startsWith("გატანა:"),
      items: rows
        .filter((row) => row.order_id === order.id)
        .map((row) => {
          const product = row.product_id ? byId.get(row.product_id) : undefined;
          return {
            id: row.id,
            product_id: row.product_id,
            product_name: row.product_name,
            price: Number(row.price),
            qty: row.qty,
            slug: product?.slug ?? null,
            image: product?.images?.[0] ?? null,
          };
        }),
    };
  });
}

export async function getCustomerOrders(userId: string): Promise<CustomerOrder[]> {
  const { data } = await service.from("orders").select(ORDER_COLUMNS).eq("user_id", userId).order("created_at", { ascending: false }).limit(50);
  return withItems((data ?? []) as Order[]);
}

// One order, only if it belongs to this customer.
export async function getCustomerOrder(userId: string, id: number): Promise<CustomerOrder | null> {
  if (!Number.isSafeInteger(id) || id <= 0) return null;
  const { data } = await service.from("orders").select(ORDER_COLUMNS).eq("user_id", userId).eq("id", id).maybeSingle();
  return data ? (await withItems([data as Order]))[0] : null;
}

// The letter in the customer's avatar. Georgian letters stay as they are: their capital form looks foreign.
export function initialOf(text: string) {
  const letter = text.trim().charAt(0);
  return /[a-z]/.test(letter) ? letter.toUpperCase() : letter;
}

// Turns a Georgian mobile number into the international form Supabase expects (+9955XXXXXXXX).
export function toE164(phone: string) {
  let digits = phone.replace(/[^0-9]/g, "");
  if (digits.startsWith("995")) digits = digits.slice(3);
  return /^5[0-9]{8}$/.test(digits) ? `+995${digits}` : null;
}
