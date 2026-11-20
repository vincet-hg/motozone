"use server";

import { allow, clientIp } from "@/lib/request-guard";
import { service } from "@/lib/supabase-service";

export type NewsletterState = { ok?: boolean; error?: string };

export async function subscribe(_previous: NewsletterState, form: FormData): Promise<NewsletterState> {
  // Bots fill every field; people never see this one.
  if (String(form.get("website") ?? "")) return { ok: true };

  const email = String(form.get("email") ?? "").trim().slice(0, 254);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { error: "შეიყვანე სწორი ელფოსტა." };
  if (!(await allow("newsletter", await clientIp(), 5, 3600))) return { error: "ძალიან ბევრი მცდელობაა. სცადე მოგვიანებით." };

  const { error } = await service.rpc("newsletter_subscribe", { p_email: email });
  if (error) {
    if (error.message.includes("invalid_email")) return { error: "შეიყვანე სწორი ელფოსტა." };
    console.error("newsletter_subscribe failed", error.message);
    return { error: "გამოწერა ვერ მოხერხდა. სცადე თავიდან." };
  }
  return { ok: true };
}
