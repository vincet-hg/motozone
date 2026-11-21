import "server-only";
import { env } from "./env";
import { formatPrice } from "./format";
import { site } from "./site";

const escape = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Sends a message to the shop's Telegram chat. Does nothing until both variables are set.
export async function sendTelegram(html: string) {
  if (!env.telegramToken || !env.telegramChatId) return;
  try {
    const response = await fetch(`https://api.telegram.org/bot${env.telegramToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: env.telegramChatId, text: html, parse_mode: "HTML", disable_web_page_preview: true }),
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) console.error("Telegram notification failed", response.status, await response.text());
  } catch (error) {
    console.error("Telegram notification failed", error);
  }
}

export type PlacedOrder = {
  order_id: number;
  total: number;
  items: { name: string; qty: number; price: number }[];
  low_stock: { name: string; stock: number }[];
};

export function orderMessage(
  order: PlacedOrder,
  customer: { name: string; phone: string; city: string; address: string; note: string },
  deliveryFee = 0,
) {
  const lines = [
    `🛒 <b>ახალი შეკვეთა #${order.order_id}</b>`,
    "",
    `👤 ${escape(customer.name)}`,
    `📞 ${escape(customer.phone)}`,
    `📍 ${escape(customer.city)}, ${escape(customer.address)}`,
    customer.note ? `📝 ${escape(customer.note)}` : "",
    "",
    ...order.items.map((item) => `• ${escape(item.name)} × ${item.qty} = ${formatPrice(item.price * item.qty)}`),
    ...(deliveryFee
      ? [`მიტანა: ${formatPrice(deliveryFee)}`, `<b>სულ: ${formatPrice(order.total + deliveryFee)}</b>`]
      : [`<b>ჯამი: ${formatPrice(order.total)}</b>`]),
  ];
  if (order.low_stock.length > 0) {
    lines.push("", "⚠️ <b>მარაგი იწურება:</b>", ...order.low_stock.map((item) => `• ${escape(item.name)}: დარჩა ${item.stock}`));
  }
  // The admin has its own address in production (ADMIN_HOST); the link goes there.
  const adminBase = process.env.ADMIN_HOST ? `https://${process.env.ADMIN_HOST}` : site.url;
  if (adminBase) lines.push("", `${adminBase}/admin/orders/${order.order_id}`);
  return lines.filter((line, index, all) => line !== "" || all[index - 1] !== "").join("\n");
}
