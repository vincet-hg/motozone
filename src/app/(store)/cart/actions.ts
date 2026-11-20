"use server";

import { updateTag } from "next/cache";
import { after } from "next/server";
import { CATALOG_TAG, getProductsByIds } from "@/lib/catalog";
import { orderMessage, sendTelegram, type PlacedOrder } from "@/lib/notify";
import { allow, clientIp } from "@/lib/request-guard";
import { site } from "@/lib/site";
import { service } from "@/lib/supabase-service";
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
    items = JSON.parse(String(form.get("items")).slice(0, 20000));
  } catch {
    return { error: "კალათა დაზიანებულია. განაახლე გვერდი." };
  }

  // Ten orders an hour from one address is far beyond a real customer, and stops a script.
  if (!(await allow("order", await clientIp(), 10, 3600))) {
    return { error: "ძალიან ბევრი მცდელობაა. სცადე მოგვიანებით ან დაგვირეკე." };
  }

  // Delivery runs in Tbilisi only. A pickup order carries the pickup point as its address,
  // so the admin and the Telegram message show it plainly.
  const pickup = form.get("method") === "pickup";
  const customer = {
    name: String(form.get("name") ?? "").slice(0, 200),
    phone: String(form.get("phone") ?? "").slice(0, 40),
    city: "თბილისი",
    address: pickup ? `გატანა: ${site.pickup.address}` : String(form.get("address") ?? "").slice(0, 600),
    note: String(form.get("note") ?? "").slice(0, 1000),
  };

  // Only the server can place orders: the function is closed to customers' browsers.
  const { data, error } = await service.rpc("place_order", {
    p_name: customer.name,
    p_phone: customer.phone,
    p_city: customer.city,
    p_address: customer.address,
    p_note: customer.note,
    p_items: items,
  });

  if (error) {
    switch (error.message) {
      case "invalid_phone":
        return { error: "შეიყვანე სწორი ტელეფონის ნომერი, მაგალითად 555123456." };
      case "invalid_customer":
        return { error: "შეავსე სახელი და მისამართი." };
      case "out_of_stock":
        return { error: `მარაგში საკმარისი რაოდენობა აღარ არის: ${error.details}. შეცვალე რაოდენობა.` };
      case "product_unavailable":
        return { error: "კალათაში არის პროდუქტი, რომელიც აღარ იყიდება. წაშალე და სცადე თავიდან." };
      case "too_many_orders":
        return { error: "ამ ნომრიდან ბევრი შეკვეთაა გაფორმებული. დაგვირეკე და დაგეხმარებით." };
      default:
        console.error("place_order failed", error.message);
        return { error: "შეკვეთა ვერ გაფორმდა. სცადე თავიდან." };
    }
  }

  const order = data as PlacedOrder;
  // Runs after the customer already sees the confirmation, so a slow Telegram never delays checkout.
  after(() => sendTelegram(orderMessage(order, { ...customer, name: customer.name.trim() })));

  updateTag(CATALOG_TAG);
  return { orderId: order.order_id, total: order.total };
}
