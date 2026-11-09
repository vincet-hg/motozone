"use server";

import { updateTag } from "next/cache";
import { CATALOG_TAG, getProductsByIds, live } from "@/lib/catalog";
import type { ProductCard } from "@/lib/types";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getCartProducts(ids: string[]): Promise<ProductCard[]> {
  if (!Array.isArray(ids)) return [];
  return getProductsByIds(ids.filter((id) => typeof id === "string" && UUID.test(id)).slice(0, 50));
}

export type OrderState = { orderId?: number; total?: number; error?: string };

export async function placeOrder(_previous: OrderState, form: FormData): Promise<OrderState> {
  // Hidden field that only bots fill in.
  if (form.get("website")) return { error: "შეკვეთა ვერ გაფორმდა. სცადე თავიდან." };

  let items: unknown;
  try {
    items = JSON.parse(String(form.get("items")));
  } catch {
    return { error: "კალათა დაზიანებულია. განაახლე გვერდი." };
  }

  const { data, error } = await live.rpc("place_order", {
    p_name: String(form.get("name") ?? ""),
    p_phone: String(form.get("phone") ?? ""),
    p_city: String(form.get("city") ?? ""),
    p_address: String(form.get("address") ?? ""),
    p_note: String(form.get("note") ?? ""),
    p_items: items,
  });

  if (error) {
    switch (error.message) {
      case "invalid_phone":
        return { error: "შეიყვანე სწორი ტელეფონის ნომერი, მაგალითად 555123456." };
      case "invalid_customer":
        return { error: "შეავსე სახელი, ქალაქი და მისამართი." };
      case "out_of_stock":
        return { error: `მარაგში საკმარისი რაოდენობა აღარ არის: ${error.details}. შეცვალე რაოდენობა.` };
      case "product_unavailable":
        return { error: "კალათაში არის პროდუქტი, რომელიც აღარ იყიდება. წაშალე და სცადე თავიდან." };
      case "too_many_orders":
        return { error: "ამ ნომრიდან ბევრი შეკვეთაა გაფორმებული. დაგვირეკე და დაგეხმარებით." };
      default:
        return { error: "შეკვეთა ვერ გაფორმდა. სცადე თავიდან." };
    }
  }

  updateTag(CATALOG_TAG);
  return { orderId: data.order_id, total: data.total };
}
