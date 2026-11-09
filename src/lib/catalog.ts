import { createClient } from "@supabase/supabase-js";
import { isDemo } from "./demo";
import { demoClient } from "./demo-data";
import type { Category, Product, ProductCard } from "./types";

export const CATALOG_TAG = "catalog";
export const PAGE_SIZE = 40;

const CARD_COLUMNS = "id,slug,name,price,sale_price,final_price,stock,images";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const auth = { persistSession: false, autoRefreshToken: false };

// Reads are cached and refreshed the moment the admin saves a change (see CATALOG_TAG).
// The one-hour limit also picks up edits made directly in the Supabase dashboard.
// `as never` keeps the real client as the only type, so normal queries stay fully checked.
const cached = isDemo
  ? (demoClient as never)
  : createClient(url, anonKey, {
      auth,
      global: {
        fetch: (input, init) => fetch(input, { ...init, next: { tags: [CATALOG_TAG], revalidate: 3600 } }),
      },
    });

// For free-text search and checkout, which must not fill the cache or show old stock.
export const live = isDemo ? (demoClient as never) : createClient(url, anonKey, { auth });

export type Sort = "newest" | "price_asc" | "price_desc";

export type ProductQuery = {
  categoryId?: string;
  q?: string;
  min?: number;
  max?: number;
  sort?: Sort;
  page?: number;
};

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await cached.from("categories").select("id,name,slug,position").order("position");
  if (error) throw new Error(error.message);
  return data;
}

export async function getProducts(query: ProductQuery = {}): Promise<{ products: ProductCard[]; total: number }> {
  const page = query.page ?? 1;
  const client = query.q ? live : cached;
  let request = client.from("products").select(CARD_COLUMNS, { count: "exact" }).eq("active", true);

  if (query.categoryId) request = request.eq("category_id", query.categoryId);
  if (query.q) request = request.ilike("name", `%${query.q.replace(/[\\%_]/g, "\\$&")}%`);
  if (query.min !== undefined) request = request.gte("final_price", query.min);
  if (query.max !== undefined) request = request.lte("final_price", query.max);

  if (query.sort === "price_asc") request = request.order("final_price", { ascending: true });
  else if (query.sort === "price_desc") request = request.order("final_price", { ascending: false });
  else request = request.order("created_at", { ascending: false });

  const { data, count, error } = await request
    .order("id")
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  if (error) throw new Error(error.message);
  return { products: data as ProductCard[], total: count ?? 0 };
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!/^[a-z0-9-]{1,100}$/.test(slug)) return null;
  const { data, error } = await cached.from("products").select("*").eq("slug", slug).eq("active", true).maybeSingle();
  if (error) throw new Error(error.message);
  return data as Product | null;
}

export async function getProductSlugs(): Promise<string[]> {
  const { data, error } = await cached.from("products").select("slug").eq("active", true).limit(1000);
  if (error) throw new Error(error.message);
  return data.map((row) => row.slug);
}

export async function getProductsByIds(ids: string[]): Promise<ProductCard[]> {
  if (ids.length === 0) return [];
  const { data, error } = await live.from("products").select(CARD_COLUMNS).in("id", ids).eq("active", true);
  if (error) throw new Error(error.message);
  return data as ProductCard[];
}
