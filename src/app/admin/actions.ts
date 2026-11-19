"use server";

import { updateTag } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CATALOG_TAG } from "@/lib/catalog";
import { DEMO_COOKIE, DEMO_SESSION, isDemo } from "@/lib/demo";
import { DEMO_EMAIL, DEMO_PASSWORD } from "@/lib/demo-data";
import { slugify } from "@/lib/format";
import { costChangeNotice } from "@/lib/margin";
import { allow, clientIp } from "@/lib/request-guard";
import { createAdminClient, requireAdmin, requirePasswordSession } from "@/lib/supabase-server";
import type { Spec } from "@/lib/types";

export type FormState = { error?: string };

const BUCKET = "product-images";
// Seeded demo photos are generated as PNG.
const IMAGE_NAME = isDemo ? /^[\w-]+\.(webp|jpg|png)$/ : /^[\w-]+\.(webp|jpg)$/;

function text(form: FormData, key: string) {
  return String(form.get(key) ?? "").trim();
}

function parsePrices(form: FormData) {
  const price = Number(text(form, "price"));
  const saleText = text(form, "sale_price");
  const sale_price = saleText === "" ? null : Number(saleText);
  if (text(form, "price") === "" || !Number.isFinite(price) || price < 0) return { error: "შეიყვანე სწორი ფასი." };
  if (sale_price !== null && (!Number.isFinite(sale_price) || sale_price < 0 || sale_price >= price)) {
    return { error: "ფასდაკლებული ფასი ძველ ფასზე ნაკლები უნდა იყოს." };
  }
  return { price, sale_price };
}

// Optional number field. Undefined when empty, NaN when not a valid number.
function optionalNumber(form: FormData, key: string) {
  const raw = text(form, key).replace(",", ".");
  return raw === "" ? undefined : Number(raw);
}

const productPage = (id: string, params: Record<string, string>) =>
  `/admin/products/${encodeURIComponent(id)}?${new URLSearchParams(params)}#stock`;

const STOCK_ERRORS: Record<string, string> = {
  invalid_qty: "რაოდენობა უნდა იყოს დადებითი მთელი რიცხვი.",
  invalid_cost: "შეიყვანე სწორი ფასი.",
  invalid_reason: "მიუთითე მიზეზი (მინიმუმ 2 სიმბოლო).",
  out_of_stock: "მარაგი ნულზე ნაკლები ვერ იქნება.",
  product_not_found: "პროდუქტი ვერ მოიძებნა.",
};

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
    return Array.isArray(parsed) ? parsed.filter((p) => typeof p === "string" && IMAGE_NAME.test(p)) : [];
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
  // Supabase limits sign-ins too. This stops password guessing earlier, per address and per account.
  const ip = await clientIp();
  if (!isDemo && (!(await allow("login-ip", ip, 20, 900)) || !(await allow("login-email", text(form, "email"), 8, 900)))) {
    return { error: "ძალიან ბევრი მცდელობაა. სცადე 15 წუთში." };
  }

  if (isDemo) {
    if (text(form, "email") !== DEMO_EMAIL || form.get("password") !== DEMO_PASSWORD) {
      return { error: "ელფოსტა ან პაროლი არასწორია." };
    }
    (await cookies()).set(DEMO_COOKIE, DEMO_SESSION, { httpOnly: true, sameSite: "lax", path: "/" });
    redirect("/admin");
  }

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
  // The password is the first step. The authenticator code is the second.
  redirect("/admin/mfa");
}

export type MfaSetup = { factorId?: string; qr?: string; secret?: string; error?: string };

// Creates a new authenticator for an admin who has none yet. Unfinished earlier attempts are removed first.
export async function startMfaSetup(): Promise<MfaSetup> {
  const { supabase } = await requirePasswordSession();
  const { data: factors } = await supabase.auth.mfa.listFactors();
  if (factors?.totp.some((factor) => factor.status === "verified")) return { error: "ავთენტიკატორი უკვე დაყენებულია." };
  for (const factor of factors?.all ?? []) {
    if (factor.status !== "verified") await supabase.auth.mfa.unenroll({ factorId: factor.id });
  }
  const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: `Scooter Land ${Date.now()}` });
  if (error || !data) return { error: "ავთენტიკატორი ვერ შეიქმნა. სცადე თავიდან." };
  return { factorId: data.id, qr: data.totp.qr_code, secret: data.totp.secret };
}

export async function verifyMfa(_previous: FormState, form: FormData): Promise<FormState> {
  const { supabase, user } = await requirePasswordSession();
  if (!(await allow("mfa", user.id, 10, 900))) return { error: "ძალიან ბევრი მცდელობაა. სცადე 15 წუთში." };

  const code = text(form, "code").replace(/\s/g, "");
  if (!/^\d{6}$/.test(code)) return { error: "შეიყვანე 6-ნიშნა კოდი." };

  const { data: factors } = await supabase.auth.mfa.listFactors();
  const requested = text(form, "factor_id");
  const factor = factors?.all.find((item) => item.id === requested) ?? factors?.totp.find((item) => item.status === "verified");
  if (!factor) return { error: "ავთენტიკატორი ვერ მოიძებნა. განაახლე გვერდი." };

  const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: factor.id, code });
  if (error) return { error: "კოდი არასწორია ან ვადა გაუვიდა." };
  redirect("/admin");
}

export async function logout() {
  if (isDemo) {
    (await cookies()).delete(DEMO_COOKIE);
    redirect("/admin/login");
  }

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

  const opening = { qty: optionalNumber(form, "opening_qty"), cost: optionalNumber(form, "opening_cost") };
  if (!id && opening.qty !== undefined && (!Number.isInteger(opening.qty) || opening.qty < 0 || opening.qty > 100000)) {
    return { error: "საწყისი მარაგი უნდა იყოს მთელი რიცხვი." };
  }
  if (!id && opening.qty && (opening.cost === undefined || !Number.isFinite(opening.cost) || opening.cost < 0)) {
    return { error: "საწყისი მარაგისთვის მიუთითე შესყიდვის ფასი." };
  }

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
    if (opening.qty) {
      const { data: created } = await supabase.from("products").select("id").eq("slug", slug).single();
      const { error: stockError } = await supabase.rpc("receive_stock", {
        p_product_id: created?.id,
        p_qty: opening.qty,
        p_unit_cost: opening.cost,
        p_supplier: "",
        p_note: "საწყისი მარაგი",
      });
      if (stockError) {
        updateTag(CATALOG_TAG);
        redirect(productPage(created?.id ?? "", { error: "პროდუქტი შეინახა, მაგრამ მარაგი ვერ დაემატა. დაამატე ქვემოთ." }));
      }
    }
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
    .insert({ name, slug, position: Number(text(form, "position")) || 0, description: text(form, "description").slice(0, 2000) });
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
    .update({ name, position: Number(text(form, "position")) || 0, description: text(form, "description").slice(0, 2000) })
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

export async function receiveStock(form: FormData) {
  const supabase = await requireAdmin();
  const id = text(form, "id");
  const qty = optionalNumber(form, "qty");
  const cost = optionalNumber(form, "unit_cost");
  const { data, error } = await supabase.rpc("receive_stock", {
    p_product_id: id,
    p_qty: qty ?? null,
    p_unit_cost: cost ?? null,
    p_supplier: text(form, "supplier").slice(0, 120),
    p_note: text(form, "note").slice(0, 500),
  });
  if (error) redirect(productPage(id, { error: STOCK_ERRORS[error.message] ?? "მარაგი ვერ დაემატა." }));

  const result = data as { stock: number; old_avg: number; avg_cost: number; price: number };
  const notice = costChangeNotice(result.price, result.old_avg, result.avg_cost);
  updateTag(CATALOG_TAG);
  redirect(productPage(id, { [notice.warning ? "warning" : "saved"]: `დაემატა ${qty} ცალი. მარაგი: ${result.stock}. ${notice.text}` }));
}

export async function adjustStock(form: FormData) {
  const supabase = await requireAdmin();
  const id = text(form, "id");
  const delta = optionalNumber(form, "delta");
  const { data, error } = await supabase.rpc("adjust_stock", {
    p_product_id: id,
    p_delta: delta ?? null,
    p_reason: text(form, "reason").slice(0, 300),
  });
  if (error) redirect(productPage(id, { error: STOCK_ERRORS[error.message] ?? "მარაგი ვერ შეიცვალა." }));
  updateTag(CATALOG_TAG);
  redirect(productPage(id, { saved: `მარაგი შესწორდა. ახლა: ${data}.` }));
}

export async function setProductCost(form: FormData) {
  const supabase = await requireAdmin();
  const id = text(form, "id");
  const cost = optionalNumber(form, "avg_cost");
  const { error } = await supabase.rpc("set_product_cost", { p_product_id: id, p_avg_cost: cost ?? null });
  if (error) redirect(productPage(id, { error: STOCK_ERRORS[error.message] ?? "თვითღირებულება ვერ შეინახა." }));
  redirect(productPage(id, { saved: "თვითღირებულება შეინახა." }));
}

export async function setLowStock(form: FormData) {
  const supabase = await requireAdmin();
  const id = text(form, "id");
  const value = optionalNumber(form, "low_stock_at");
  if (value === undefined || !Number.isInteger(value) || value < 0 || value > 100000) {
    redirect(productPage(id, { error: "ზღვარი უნდა იყოს მთელი რიცხვი." }));
  }
  const { error } = await supabase.from("product_costs").update({ low_stock_at: value }).eq("product_id", id);
  if (error) redirect(productPage(id, { error: "ზღვარი ვერ შეინახა." }));
  redirect(productPage(id, { saved: "გაფრთხილების ზღვარი შეინახა." }));
}

// ---------------------------------------------------------------- homepage slider

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// <input type="datetime-local"> sends Tbilisi time without a zone. Tbilisi is UTC+4 all year.
function tbilisiTime(value: string) {
  if (!value) return null;
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return undefined;
  const date = new Date(`${value}:00+04:00`);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function promotionFields(form: FormData) {
  const productId = text(form, "product_id");
  const title = text(form, "title");
  const endsAt = tbilisiTime(text(form, "ends_at"));
  if (!UUID.test(productId)) return { error: "აირჩიე პროდუქტი." };
  if (title.length < 2 || title.length > 80) return { error: "სათაური უნდა იყოს 2-80 სიმბოლო." };
  if (endsAt === undefined) return { error: "დასრულების თარიღი არასწორია." };
  return {
    fields: {
      product_id: productId,
      title,
      description: text(form, "description").slice(0, 240),
      badge: text(form, "badge").slice(0, 30),
      cta_label: text(form, "cta_label").slice(0, 30) || "ყიდვა",
      ends_at: endsAt,
      active: form.get("active") === "on",
      position: Number(text(form, "position")) || 0,
    },
  };
}

const promotionsPage = (params: Record<string, string>) => `/admin/promotions?${new URLSearchParams(params)}`;

export async function savePromotion(form: FormData) {
  const supabase = await requireAdmin();
  const parsed = promotionFields(form);
  if ("error" in parsed) redirect(promotionsPage({ error: parsed.error! }));
  const id = text(form, "id");
  const { error } = id
    ? await supabase.from("promotions").update(parsed.fields!).eq("id", id)
    : await supabase.from("promotions").insert(parsed.fields!);
  if (error) redirect(promotionsPage({ error: "სლაიდი ვერ შეინახა." }));
  updateTag(CATALOG_TAG);
  redirect(promotionsPage({ saved: id ? "სლაიდი შეინახა." : "სლაიდი დაემატა." }));
}

export async function deletePromotion(form: FormData) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("promotions").delete().eq("id", text(form, "id"));
  if (error) redirect(promotionsPage({ error: "სლაიდი ვერ წაიშალა." }));
  updateTag(CATALOG_TAG);
  redirect(promotionsPage({ saved: "სლაიდი წაიშალა." }));
}

export async function deleteSubscriber(form: FormData) {
  const supabase = await requireAdmin();
  await supabase.from("newsletter_subscribers").delete().eq("id", Number(text(form, "id")));
  redirect("/admin/subscribers");
}
