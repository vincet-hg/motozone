import "server-only";
import { createClient } from "@supabase/supabase-js";
import { isDemo } from "./demo";
import { demoClient } from "./demo-data";
import { env } from "./env";
import type { Category, Product, ProductCard, PromotionSlide } from "./types";

export const CATALOG_TAG = "catalog";
export const PAGE_SIZE = 40;

const CARD_COLUMNS = "id,slug,name,price,sale_price,final_price,stock,images";

const url = env.supabaseUrl;
const anonKey = env.anonKey;
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

// For free-text search and the cart, which must not fill the cache or show old stock.
export const live = isDemo ? (demoClient as never) : createClient(url, anonKey, { auth });

export type Sort = "newest" | "price_asc" | "price_desc";

export type ProductQuery = {
  categoryId?: string;
  q?: string;
  min?: number;
  max?: number;
  sort?: Sort;
  page?: number;
  sale?: boolean;
};

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await cached.from("categories").select("id,name,slug,position,description").order("position");
  if (error) throw new Error(error.message);
  return data;
}

export async function getProducts(query: ProductQuery = {}): Promise<{ products: ProductCard[]; total: number }> {
  const page = query.page ?? 1;
  const client = query.q ? live : cached;
  let request = client.from("products").select(CARD_COLUMNS, { count: "exact" }).eq("active", true);

  if (query.sale) request = request.not("sale_price", "is", null);
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

export type SitemapProduct = { slug: string; updated_at: string; images: string[]; category_id: string | null };

export async function getSitemapProducts(): Promise<SitemapProduct[]> {
  const { data, error } = await cached
    .from("products")
    .select("slug,updated_at,images,category_id")
    .eq("active", true)
    .order("updated_at", { ascending: false })
    .limit(5000);
  if (error) throw new Error(error.message);
  return data as SitemapProduct[];
}

// ---------------------------------------------------------------- homepage

const DAY = 86400000;

// Running homepage slides with their products. The database already hides ended slides;
// the slider hides one that ends while the page is open.
export async function getPromotionSlides(): Promise<PromotionSlide[]> {
  const { data, error } = await cached
    .from("promotions")
    .select("id,product_id,title,description,badge,cta_label,ends_at,active,position")
    .eq("active", true)
    .order("position")
    .limit(10);
  // The slider is optional: if it fails, the homepage shows the general banner instead of an error.
  if (error) {
    console.error("promotions", error.message);
    return [];
  }
  const now = Date.now();
  const promotions = (data as Omit<PromotionSlide, "product">[]).filter((row) => !row.ends_at || Date.parse(row.ends_at) > now);
  const products = await getCachedProductsByIds(promotions.map((row) => row.product_id));
  return promotions.flatMap((row) => {
    const product = products.find((item) => item.id === row.product_id);
    return product && product.images.length > 0 ? [{ ...row, product }] : [];
  });
}

async function getCachedProductsByIds(ids: string[]): Promise<ProductCard[]> {
  if (ids.length === 0) return [];
  const { data, error } = await cached.from("products").select(CARD_COLUMNS).in("id", ids).eq("active", true);
  if (error) throw new Error(error.message);
  return data as ProductCard[];
}

// Best sellers of the last 90 days, topped up with the newest products while sales are few.
export async function getPopularProducts(limit: number): Promise<{ products: ProductCard[]; popularIds: Set<string> }> {
  const { data, error } = await cached.rpc("popular_product_ids", { p_limit: limit });
  if (error) console.error("popular_product_ids", error.message);
  const ids = (error ? [] : (data ?? [])) as string[];
  const sold = await getCachedProductsByIds(ids);
  const ordered = ids.flatMap((id) => sold.filter((product) => product.id === id));
  if (ordered.length < limit) {
    const { products: newest } = await getProducts();
    ordered.push(...newest.filter((product) => !ids.includes(product.id)).slice(0, limit - ordered.length));
  }
  return { products: ordered, popularIds: new Set(ids) };
}

// Ids of products added in the last 21 days, for the "new" badge.
export async function getNewProductIds(): Promise<Set<string>> {
  const { data, error } = await cached
    .from("products")
    .select("id,created_at")
    .eq("active", true)
    .order("created_at", { ascending: false })
    .limit(40);
  if (error) throw new Error(error.message);
  const since = Date.now() - 21 * DAY;
  return new Set((data as { id: string; created_at: string }[]).filter((row) => Date.parse(row.created_at) > since).map((row) => row.id));
}

export type CategoryCover = { image: string | null; count: number };

// Per category: the newest product's first photo and how many products are on sale.
export async function getCategoryCovers(): Promise<Map<string, CategoryCover>> {
  const { data, error } = await cached
    .from("products")
    .select("category_id,images")
    .eq("active", true)
    .order("created_at", { ascending: false })
    .limit(1000);
  if (error) throw new Error(error.message);
  const covers = new Map<string, CategoryCover>();
  for (const row of data as { category_id: string | null; images: string[] }[]) {
    if (!row.category_id) continue;
    const cover = covers.get(row.category_id) ?? { image: null, count: 0 };
    cover.count += 1;
    cover.image ??= row.images[0] ?? null;
    covers.set(row.category_id, cover);
  }
  return covers;
}
