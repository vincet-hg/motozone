"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { CATALOG_TAG } from "@/lib/catalog";
import { slugify } from "@/lib/format";
import { createAdminClient, requireAdmin } from "@/lib/supabase-server";
import type { Spec } from "@/lib/types";

export type FormState = { error?: string };

const BUCKET = "product-images";

function text(form: FormData, key: string) {
  return String(form.get(key) ?? "").trim();
}

function parsePrices(form: FormData) {
  const price = Number(text(form, "price"));
  const saleText = text(form, "sale_price");
  const sale_price = saleText === "" ? null : Number(saleText);
  const stock = Number(text(form, "stock"));
  if (text(form, "price") === "" || !Number.isFinite(price) || price < 0) return { error: "შეიყვანე სწორი ფასი." };
  if (sale_price !== null && (!Number.isFinite(sale_price) || sale_price < 0 || sale_price >= price)) {
    return { error: "ფასდაკლებული ფასი ძველ ფასზე ნაკლები უნდა იყოს." };
  }
  if (text(form, "stock") === "" || !Number.isInteger(stock) || stock < 0) return { error: "მარაგი უნდა იყოს მთელი რიცხვი." };
  return { price, sale_price, stock };
}

// One "name: value" pair per line.
function parseSpecs(raw: string): Spec[] {
  return raw
    .split("\n")
    .map((line) => {
      const separator = line.indexOf(":");
      return separator === -1
        ? null
        : { label: line.slice(0, separator).trim(), value: line.slice(separator + 1).trim() };
    })
    .filter((spec): spec is Spec => spec !== null && spec.label !== "" && spec.value !== "");
}

function parseImages(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((p) => typeof p === "string" && /^[\w-]+\.(webp|jpg)$/.test(p)) : [];
  } catch {
    return [];
  }
}

type Admin = Awaited<ReturnType<typeof requireAdmin>>;

async function uniqueSlug(supabase: Admin, table: "products" | "categories", name: string) {
  const base = slugify(name);
  const { data } = await supabase.from(table).select("id").eq("slug", base).maybeSingle();
  return data ? `${base}-${crypto.randomUUID().slice(0, 4)}` : base;
}

export async function login(_previous: FormState, form: FormData): Promise<FormState> {
  const supabase = await createAdminClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: text(form, "email"),
    password: String(form.get("password") ?? ""),
  });
  if (error) return { error: "ელფოსტა ან პაროლი არასწორია." };

  const { data: admin } = await supabase.from("admins").select("user_id").eq("user_id", data.user.id).maybeSingle();
  if (!admin) {
    await supabase.auth.signOut();
    return { error: "ამ ანგარიშს ადმინისტრატორის უფლება არ აქვს." };
  }
  redirect("/admin/orders");
}

export async function logout() {
  const supabase = await createAdminClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function saveProduct(_previous: FormState, form: FormData): Promise<FormState> {
  const supabase = await requireAdmin();
  const id = text(form, "id");
  const name = text(form, "name");
  if (!name) return { error: "შეიყვანე პროდუქტის სახელი." };

  const prices = parsePrices(form);
  if ("error" in prices) return { error: prices.error };

  const images = parseImages(text(form, "images"));
  const fields = {
    name,
    category_id: text(form, "category_id") || null,
    description: text(form, "description"),
    compatibility: text(form, "compatibility"),
    specs: parseSpecs(text(form, "specs")),
    images,
    active: form.get("active") === "on",
    ...prices,
  };

  if (id) {
    const { data: existing } = await supabase.from("products").select("images").eq("id", id).single();
    const { error } = await supabase.from("products").update(fields).eq("id", id);
    if (error) return { error: "პროდუქტი ვერ შეინახა. სცადე თავიდან." };
    const removed = (existing?.images ?? []).filter((path: string) => !images.includes(path));
    if (removed.length > 0) await supabase.storage.from(BUCKET).remove(removed);
  } else {
    const slug = await uniqueSlug(supabase, "products", name);
    const { error } = await supabase.from("products").insert({ ...fields, slug });
    if (error) return { error: "პროდუქტი ვერ შეინახა. სცადე თავიდან." };
  }

  updateTag(CATALOG_TAG);
  redirect("/admin/products");
}

export async function quickUpdateProduct(form: FormData) {
  const supabase = await requireAdmin();
  const prices = parsePrices(form);
  if ("error" in prices) redirect(`/admin/products?error=${encodeURIComponent(prices.error ?? "")}`);

  const { error } = await supabase.from("products").update(prices).eq("id", text(form, "id"));
  if (error) redirect(`/admin/products?error=${encodeURIComponent("ცვლილება ვერ შეინახა.")}`);
  updateTag(CATALOG_TAG);
  redirect("/admin/products?saved=1");
}

export async function deleteProduct(form: FormData) {
  const supabase = await requireAdmin();
  const id = text(form, "id");
  const { data } = await supabase.from("products").select("images").eq("id", id).single();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) redirect(`/admin/products?error=${encodeURIComponent("პროდუქტი ვერ წაიშალა.")}`);
  if (data?.images.length) await supabase.storage.from(BUCKET).remove(data.images);
  updateTag(CATALOG_TAG);
  redirect("/admin/products");
}

export async function addCategory(form: FormData) {
  const supabase = await requireAdmin();
  const name = text(form, "name");
  if (!name) redirect(`/admin/categories?error=${encodeURIComponent("შეიყვანე კატეგორიის სახელი.")}`);
  const slug = await uniqueSlug(supabase, "categories", name);
  const { error } = await supabase
    .from("categories")
    .insert({ name, slug, position: Number(text(form, "position")) || 0 });
  if (error) redirect(`/admin/categories?error=${encodeURIComponent("კატეგორია ვერ დაემატა.")}`);
  updateTag(CATALOG_TAG);
  redirect("/admin/categories");
}

export async function updateCategory(form: FormData) {
  const supabase = await requireAdmin();
  const name = text(form, "name");
  if (!name) redirect(`/admin/categories?error=${encodeURIComponent("შეიყვანე კატეგორიის სახელი.")}`);
  const { error } = await supabase
    .from("categories")
    .update({ name, position: Number(text(form, "position")) || 0 })
    .eq("id", text(form, "id"));
  if (error) redirect(`/admin/categories?error=${encodeURIComponent("ცვლილება ვერ შეინახა.")}`);
  updateTag(CATALOG_TAG);
  redirect("/admin/categories");
}

export async function deleteCategory(form: FormData) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("categories").delete().eq("id", text(form, "id"));
  if (error) {
    redirect(`/admin/categories?error=${encodeURIComponent("ამ კატეგორიაში პროდუქტებია. ჯერ გადაიტანე ან წაშალე ისინი.")}`);
  }
  updateTag(CATALOG_TAG);
  redirect("/admin/categories");
}

export async function changeOrderStatus(form: FormData) {
  const supabase = await requireAdmin();
  const id = text(form, "id");
  const { error } = await supabase.rpc("set_order_status", {
    p_order_id: Number(id),
    p_status: text(form, "status"),
  });
  if (error) {
    const message = error.message === "order_cancelled" ? "გაუქმებული შეკვეთის შეცვლა შეუძლებელია." : "სტატუსი ვერ შეიცვალა.";
    redirect(`/admin/orders/${id}?error=${encodeURIComponent(message)}`);
  }
  // Cancelling returns items to stock, so the storefront must refresh too.
  updateTag(CATALOG_TAG);
  redirect(`/admin/orders/${id}`);
}
