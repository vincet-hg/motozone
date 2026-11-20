import "server-only";
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { crc32, deflateSync } from "node:zlib";
import type { AuditEntry, Category, Order, OrderItem, OrderStatus, Product, ProductCost, Promotion, Purchase, StockAdjustment, Subscriber } from "./types";

// Stands in for the part of the Supabase client this app uses, backed by JSON files in .demo-data/.
// Business rules mirror supabase/migrations. Every transaction is synchronous, so requests cannot
// interleave, and nothing is cached in memory because each Next.js route gets its own module copy.

// A personal login belongs in .env.local, which stays out of git.
export const DEMO_EMAIL = process.env.DEMO_ADMIN_EMAIL || "admin@demo.local";
export const DEMO_PASSWORD = process.env.DEMO_ADMIN_PASSWORD || "demo1234";
export const DEMO_LOGIN_IS_DEFAULT = !process.env.DEMO_ADMIN_PASSWORD;

const ROOT = path.join(process.cwd(), ".demo-data");
const IMAGES = path.join(ROOT, "images");
const IMAGE_NAME = /^[\w-]+\.(webp|jpg|png)$/;
const IMAGE_TYPES: Record<string, string> = { webp: "image/webp", jpg: "image/jpeg", png: "image/png" };
const MAX_IMAGE_BYTES = 5242880;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const INT_MAX = 2147483647;
const STATUSES: OrderStatus[] = ["new", "confirmed", "shipped", "delivered", "cancelled"];

type DemoProduct = Product & { created_at: string };
type DemoOrderItem = OrderItem & { order_id: number; product_id: string | null };
type Tables = {
  categories: Category[];
  products: DemoProduct[];
  product_costs: ProductCost[];
  purchases: Purchase[];
  stock_adjustments: StockAdjustment[];
  audit_log: AuditEntry[];
  promotions: Promotion[];
  newsletter_subscribers: Subscriber[];
  orders: Order[];
  order_items: DemoOrderItem[];
};
type TableName = keyof Tables;
type Row = Record<string, unknown>;

// order_items is written last, so its presence means a seed finished.
const TABLES: TableName[] = [
  "categories",
  "products",
  "product_costs",
  "purchases",
  "stock_adjustments",
  "audit_log",
  "promotions",
  "newsletter_subscribers",
  "orders",
  "order_items",
];

// Columns the admin may write directly, as granted in the migrations. Stock changes only through functions.
const WRITABLE: Partial<Record<TableName, { insert?: string[]; update?: string[]; delete?: boolean }>> = {
  products: {
    insert: ["category_id", "name", "slug", "description", "specs", "compatibility", "price", "sale_price", "images", "active"],
    update: ["category_id", "name", "description", "specs", "compatibility", "price", "sale_price", "images", "active"],
    delete: true,
  },
  categories: { insert: ["name", "slug", "position", "description"], update: ["name", "slug", "position", "description"], delete: true },
  product_costs: { update: ["low_stock_at"] },
  promotions: {
    insert: ["product_id", "title", "description", "badge", "cta_label", "ends_at", "active", "position"],
    update: ["product_id", "title", "description", "badge", "cta_label", "ends_at", "active", "position"],
    delete: true,
  },
  newsletter_subscribers: { delete: true },
};

class DbError extends Error {
  constructor(
    message: string,
    readonly details: string | null = null,
  ) {
    super(message);
  }
}

// ---------------------------------------------------------------- seed

// Name, slug and the short description shown on the category page (and to Google).
const CATEGORIES = [
  ["გათბობადი გრიფსები", "gatbobadi-gripsebi", "გათბობადი გრიფსები მოპედისა და სკუტერისთვის: თბილი ხელები ზამთრის მგზავრობისას, რამდენიმე სითბოს რეჟიმით."],
  ["დამტენები", "damtenebi", "USB და USB-C დამტენები მოპედისთვის: დატენე ტელეფონი და ნავიგაცია გზაში."],
  ["ხელთათმანები", "kheltatmanebi", "მოტო ხელთათმანები ზაფხულისა და ზამთრისთვის: დაცვა, კომფორტი და კარგი ჩაჭიდება საჭეზე."],
  ["ტელეფონის დამჭერები", "teleponis-damcherebi", "ტელეფონის დამჭერები და წყალგაუმტარი ჩანთები საჭეზე: ნავიგაცია ყოველთვის თვალწინ."],
  ["ხელის დამცავები", "khelis-damtsavebi", "ხელის დამცავები და ზამთრის ხელის საფარები: დაცვა ქარისგან, წვიმისგან და სიცივისგან."],
  ["ჩიხოლები", "chikholebi", "წყალგაუმტარი ჩიხოლები მოპედისთვის: დაიცავი სკუტერი წვიმისგან, მზისგან და მტვრისგან."],
  ["სხვა აქსესუარები", "skhva-aksesuarebi", "სხვა სასარგებლო აქსესუარები მოპედისა და სკუტერისთვის ყოველდღიური მგზავრობისთვის."],
];

// Placeholder art in the brand palette: light gray photo background, black or red shape.
const COLORS = [
  [[244, 244, 246], [21, 21, 25]],
  [[244, 244, 246], [229, 9, 32]],
  [[244, 244, 246], [21, 21, 25]],
  [[244, 244, 246], [229, 9, 32]],
  [[244, 244, 246], [21, 21, 25]],
  [[244, 244, 246], [229, 9, 32]],
  [[244, 244, 246], [21, 21, 25]],
];

const SEED: [number, string, string, number, number | null, number, string, [string, string][], string][] = [
  [0, "gripsebi-pro", "გათბობადი გრიფსები Pro", 189, 159, 8, "ხუთსაფეხურიანი გათბობა ცივ ამინდში კომფორტული მართვისთვის.", [["ძაბვა", "12V"], ["რეჟიმები", "5"], ["დიამეტრი", "22 მმ"]], "22 მმ საჭე, 12V სისტემა"],
  [0, "gripsebi-basic", "გათბობადი გრიფსები Basic", 119, null, 3, "მარტივი გათბობადი გრიფსები ყოველდღიური სიარულისთვის.", [["ძაბვა", "12V"], ["რეჟიმები", "3"]], "22 მმ საჭე, სკუტერები და მოტოციკლები"],
  [1, "usb-damteni", "USB დამტენი საჭეზე", 45, null, 20, "წყალგამძლე USB დამტენი საჭეზე დასამაგრებლად.", [["სიმძლავრე", "18W"], ["დაცვა", "IP65"]], "ნებისმიერი 12V მოტოციკლი"],
  [1, "usb-c-damteni", "ორმაგი USB-C დამტენი", 69, 55, 12, "ორი USB-C პორტი სწრაფი დამუხტვით.", [["სიმძლავრე", "36W"], ["პორტები", "2"]], "ნებისმიერი 12V მოტოციკლი"],
  [2, "zapkhulis-kheltatmanebi", "საზაფხულო ხელთათმანები", 79, null, 15, "სუნთქვადი ტყავის ხელთათმანები დამცავი ჩანართებით.", [["ზომა", "M, L, XL"], ["მასალა", "ტყავი"]], "უნივერსალური"],
  [4, "khelis-safarebi", "ზამთრის ხელის საფარები", 79, 59, 0, "თბილი და წყალგაუმტარი საფარები საჭეზე, ცივი სეზონისთვის.", [["მასალა", "ნეილონი, ფლისი"], ["საფარი", "წყალგაუმტარი"]], "სკუტერები და მოტოციკლები"],
  [3, "telefonis-damcheri", "ალუმინის ტელეფონის დამჭერი", 59, null, 25, "მყარი ალუმინის დამჭერი ვიბრაციის შემცირებით.", [["ეკრანი", "4.7-7 ინჩი"], ["მასალა", "ალუმინი"]], "საჭე 22-32 მმ"],
  [3, "damcheri-damtenit", "დამჭერი უსადენო დამუხტვით", 129, 99, 6, "ტელეფონის დამჭერი ჩაშენებული უსადენო დამტენით.", [["სიმძლავრე", "15W"], ["ეკრანი", "4.7-6.8 ინჩი"]], "Qi დამუხტვის მქონე ტელეფონები"],
  [4, "khelis-damtsavi", "ხელის დამცავები", 95, null, 10, "იცავს ხელებს ქარისა და ქვებისგან.", [["მასალა", "პლასტიკი"], ["ფერი", "შავი"]], "საჭე 22 მმ"],
  [5, "chikholi", "მოპედის წყალგაუმტარი ჩიხოლი", 75, 59, 4, "იცავს მოპედს წვიმის, მტვრისა და მზისგან.", [["ზომა", "XL"], ["მასალა", "პოლიესტერი"]], "სკუტერები და მოპედები"],
  [6, "tsqalgamdzle-chanta", "წყალგამძლე ტელეფონის ჩანთა", 35, 29, 15, "ტელეფონი მშრალად დარჩება წვიმაშიც, ეკრანი კი ხელმისაწვდომია.", [["ეკრანი", "7 ინჩამდე"], ["დაცვა", "IPX8"]], "ნებისმიერი ტელეფონი"],
  [6, "chafkhuti", "დახურული ჩაფხუტი", 139, 119, 6, "მსუბუქი დახურული ჩაფხუტი გამჭვირვალე სათვალით.", [["ზომა", "M, L, XL"], ["სტანდარტი", "ECE 22.06"]], "უნივერსალური"],
];

// Sample photos for the demo (demo-assets/), in the same order as SEED. Delete .demo-data to reseed.
const PHOTOS: string[][] = [
  ["grips2", "grips"], ["grips"], ["charger2"], ["charger"], ["gloves"], ["muffs"],
  ["mount"], ["mount2"], ["guards"], ["cover", "ccover"], ["bag2"], ["helmet2", "helmet"],
];
const ASSETS = path.join(process.cwd(), "demo-assets");

const seedId = (group: number, index: number) => `00000000-0000-4000-${group}000-${String(index + 1).padStart(12, "0")}`;

function pngChunk(type: string, data: Buffer) {
  const body = Buffer.concat([Buffer.from(type), data]);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, checksum]);
}

// A simple motorcycle shape, drawn here so the demo needs no external image.
function placeholderPng(background: number[], shape: number[]) {
  const size = 400;
  const wheel = (x: number, y: number, center: number) => {
    const distance = Math.hypot(x - center, y - 265);
    return distance >= 38 && distance <= 56;
  };
  const stride = size * 3 + 1;
  const raw = Buffer.alloc(stride * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const inFrame = y >= 190 && y <= 212 && x >= 115 && x <= 285;
      const inFork = x >= 262 && x <= 284 && y >= 130 && y <= 265;
      const inBars = y >= 122 && y <= 138 && x >= 235 && x <= 310;
      const color = wheel(x, y, 115) || wheel(x, y, 285) || inFrame || inFork || inBars ? shape : background;
      raw.set(color, y * stride + 1 + x * 3);
    }
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header.set([8, 2, 0, 0, 0], 8);
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk("IHDR", header),
    pngChunk("IDAT", deflateSync(raw)),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

function seed() {
  fs.mkdirSync(IMAGES, { recursive: true });
  const now = Date.now();
  const products = SEED.map(([category, slug, name, price, sale_price, stock, description, specs, compatibility], index): DemoProduct => {
    const [background, shape] = COLORS[category];
    const photos = (PHOTOS[index] ?? []).filter((name) => fs.existsSync(path.join(ASSETS, `${name}.webp`)));
    const images = photos.map((name, n) => `${slug}-${name}-${n + 1}.webp`);
    photos.forEach((name, n) => fs.copyFileSync(path.join(ASSETS, `${name}.webp`), path.join(IMAGES, images[n])));
    if (images.length === 0) {
      images.push(`${slug}-p1.png`);
      fs.writeFileSync(path.join(IMAGES, images[0]), placeholderPng(background, shape));
    }
    if (images.length === 1 && index % 3 === 0 && photos.length === 0) {
      images.push(`${slug}-p2.png`);
      fs.writeFileSync(path.join(IMAGES, images[1]), placeholderPng(background, shape[0] === 229 ? [21, 21, 25] : [229, 9, 32]));
    }
    return {
      id: seedId(8, index),
      slug,
      name,
      price,
      sale_price,
      final_price: sale_price ?? price,
      stock,
      images,
      category_id: seedId(9, category),
      description,
      specs: specs.map(([label, value]) => ({ label, value })),
      compatibility,
      active: true,
      created_at: new Date(now - index * 3600000).toISOString(),
      updated_at: new Date(now - index * 3600000).toISOString(),
    };
  });
  const categories = CATEGORIES.map(([name, slug, description], index) => ({ id: seedId(9, index), name, slug, position: index + 1, description }));

  // Sample purchase costs around 55% of the price, and a few past orders so the reports have numbers.
  const product_costs = products.map((product) => ({
    product_id: product.id,
    avg_cost: Math.round(product.price * 0.55),
    last_cost: Math.round(product.price * 0.55),
    low_stock_at: 3,
  }));
  const purchases = products
    .filter((product) => product.stock > 0)
    .map((product, index) => ({
      id: index + 1,
      product_id: product.id,
      qty: product.stock,
      unit_cost: Math.round(product.price * 0.55),
      supplier: "სატესტო მომწოდებელი",
      note: "",
      created_at: new Date(now - 90 * 86400000).toISOString(),
    }));
  const orders: Order[] = [];
  const order_items: DemoOrderItem[] = [];
  for (let n = 0; n < 9; n++) {
    const id = 1001 + n;
    const lines = [products[n % products.length], products[(n * 5 + 3) % products.length]];
    lines.forEach((product, line) =>
      order_items.push({
        id: order_items.length + 1,
        order_id: id,
        product_id: product.id,
        product_name: product.name,
        price: product.final_price,
        qty: line + 1,
        unit_cost: Math.round(product.price * 0.55),
      }),
    );
    const total = lines.reduce((sum, product, line) => sum + product.final_price * (line + 1), 0);
    orders.push({
      id,
      customer_name: ["ნიკა ბერიძე", "ანა კაპანაძე", "გიორგი მელაძე"][n % 3],
      phone: `55512345${n}`,
      city: "თბილისი",
      address: "სატესტო ქუჩა 1",
      note: "",
      total,
      status: n === 0 ? "new" : n === 4 ? "cancelled" : "delivered",
      created_at: new Date(now - n * 11 * 86400000).toISOString(),
    });
  }
  // Two sample slides for the homepage slider, ending in a few days.
  const onSale = products.filter((product) => product.sale_price !== null);
  const promotions: Promotion[] = onSale.slice(0, 2).map((product, index) => ({
    id: seedId(8, index),
    product_id: product.id,
    title: index === 0 ? "ზამთრის აქცია" : "კვირის შეთავაზება",
    description: index === 0 ? "ცივ ამინდში მართვა ბევრად კომფორტული იქნება." : "შეზღუდული რაოდენობა, სანამ მარაგია.",
    badge: index === 0 ? "ცხელი შეთავაზება" : "",
    cta_label: "ყიდვა",
    ends_at: new Date(now + (index === 0 ? 3 : 9) * 86400000).toISOString(),
    active: true,
    position: index,
  }));
  save({ categories, products, product_costs, purchases, stock_adjustments: [], audit_log: [], promotions, newsletter_subscribers: [], orders, order_items });
}

// ---------------------------------------------------------------- storage

const tableFile = (table: TableName) => path.join(ROOT, `${table}.json`);

function save(db: Tables) {
  for (const table of TABLES) {
    const temporary = `${tableFile(table)}.tmp`;
    fs.writeFileSync(temporary, JSON.stringify(db[table], null, 2));
    fs.renameSync(temporary, tableFile(table));
  }
}

function load() {
  if (!fs.existsSync(tableFile("order_items"))) seed();
  const db = Object.fromEntries(
    TABLES.map((table) => [table, fs.existsSync(tableFile(table)) ? JSON.parse(fs.readFileSync(tableFile(table), "utf8")) : []]),
  ) as Tables;
  // Demo folders made before purchase costs existed: fill in what the migration adds.
  for (const category of db.categories) category.description ??= "";
  for (const product of db.products) {
    product.updated_at ??= product.created_at;
    if (!db.product_costs.some((cost) => cost.product_id === product.id)) {
      db.product_costs.push({ product_id: product.id, avg_cost: 0, last_cost: null, low_stock_at: 3 });
    }
  }
  for (const item of db.order_items) item.unit_cost ??= 0;
  return db;
}

function audit(db: Tables, action: AuditEntry["action"], entity: string, entityId: string | null, details: Record<string, unknown>) {
  const id = Math.max(0, ...db.audit_log.map((entry) => entry.id)) + 1;
  // Every audited change in demo mode is made by the demo admin.
  db.audit_log.push({ id, at: new Date().toISOString(), actor: "demo-admin", action, entity, entity_id: entityId, details });
}

function diff(before: Row, after: Row) {
  const changes: Record<string, unknown> = {};
  for (const key of Object.keys(after)) {
    if (["stock", "updated_at", "final_price", "total"].includes(key)) continue;
    if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) changes[key] = { from: before[key], to: after[key] };
  }
  return changes;
}

// A failed transaction throws before saving, which rolls it back.
function transaction<T>(work: (db: Tables) => T) {
  const db = load();
  const result = work(db);
  save(db);
  return result;
}

function attempt<T>(work: () => T) {
  try {
    return { data: work(), error: null };
  } catch (error) {
    if (error instanceof DbError) return { data: null, error: { message: error.message, details: error.details } };
    throw error;
  }
}

export function readDemoImage(name: string) {
  const file = path.join(IMAGES, name);
  if (!IMAGE_NAME.test(name) || !fs.existsSync(file)) return null;
  return { body: fs.readFileSync(file), type: IMAGE_TYPES[name.split(".")[1]] };
}

// Same limits as the product-images bucket. Returns an HTTP status.
export function saveDemoImage(name: string, type: string | null, body: Buffer) {
  if (!/^[\w-]+\.(webp|jpg)$/.test(name) || type !== IMAGE_TYPES[name.split(".")[1]]) return 400;
  if (body.length > MAX_IMAGE_BYTES) return 413;
  load();
  const file = path.join(IMAGES, name);
  if (fs.existsSync(file)) return 409;
  fs.writeFileSync(file, body);
  return 200;
}

// ---------------------------------------------------------------- table rules

const length = (value: unknown) => [...String(value ?? "")].length;

function numeric(value: unknown) {
  const rounded = Math.round(Number(value) * 100) / 100;
  if (value === null || !Number.isFinite(rounded) || Math.abs(rounded) >= 1e8) throw new DbError("numeric_field_overflow");
  return rounded;
}

function integer(value: unknown) {
  if (!Number.isInteger(value) || Math.abs(value as number) > INT_MAX) throw new DbError("invalid_integer");
  return value as number;
}

function checkUniqueSlug(rows: Row[], row: Row) {
  if (rows.some((other) => other.slug === row.slug && other.id !== row.id)) throw new DbError("duplicate_slug");
}

function normalizeProduct(row: Row, db: Tables) {
  if (length(row.name) < 1 || length(row.name) > 200) throw new DbError("products_name_check");
  const price = numeric(row.price);
  const salePrice = row.sale_price === null ? null : numeric(row.sale_price);
  if (price < 0) throw new DbError("products_price_check");
  if (salePrice !== null && (salePrice < 0 || salePrice >= price)) throw new DbError("products_sale_price_check");
  const stock = integer(row.stock);
  if (stock < 0) throw new DbError("products_stock_check");
  if (row.category_id !== null && !db.categories.some((category) => category.id === row.category_id)) {
    throw new DbError("products_category_id_fkey");
  }
  checkUniqueSlug(db.products, row);
  return { ...row, price, sale_price: salePrice, final_price: salePrice ?? price, stock, updated_at: new Date().toISOString() };
}

function normalizeCategory(row: Row, db: Tables) {
  if (length(row.name) < 1 || length(row.name) > 80) throw new DbError("categories_name_check");
  if (length(row.description) > 2000) throw new DbError("categories_description_check");
  checkUniqueSlug(db.categories, row);
  return { ...row, description: String(row.description ?? ""), position: integer(row.position) };
}

function normalizeCost(row: Row) {
  const lowStockAt = integer(row.low_stock_at);
  if (lowStockAt < 0 || lowStockAt > 100000) throw new DbError("product_costs_low_stock_at_check");
  return { ...row, low_stock_at: lowStockAt };
}

function normalizePromotion(row: Row, db: Tables) {
  if (!db.products.some((product) => product.id === row.product_id)) throw new DbError("promotions_product_id_fkey");
  if (length(row.title) < 2 || length(row.title) > 80) throw new DbError("promotions_title_check");
  if (length(row.description) > 240 || length(row.badge) > 30) throw new DbError("promotions_check");
  if (length(row.cta_label) < 2 || length(row.cta_label) > 30) throw new DbError("promotions_cta_label_check");
  return { ...row, position: integer(row.position), active: row.active !== false };
}

const NORMALIZE: Partial<Record<TableName, (row: Row, db: Tables) => Row>> = {
  products: normalizeProduct,
  categories: normalizeCategory,
  product_costs: normalizeCost,
  promotions: normalizePromotion,
  newsletter_subscribers: (row) => row,
};

const DEFAULTS: Partial<Record<TableName, () => Row>> = {
  products: () => ({
    id: randomUUID(),
    category_id: null,
    description: "",
    specs: [],
    compatibility: "",
    sale_price: null,
    stock: 0,
    images: [],
    active: true,
    created_at: new Date().toISOString(),
  }),
  categories: () => ({ id: randomUUID(), position: 0, description: "" }),
  promotions: () => ({
    id: randomUUID(),
    description: "",
    badge: "",
    cta_label: "ყიდვა",
    ends_at: null,
    active: true,
    position: 0,
    created_at: new Date().toISOString(),
  }),
};

function deleteRows(table: TableName, ids: unknown[], db: Tables) {
  if (table === "categories" && db.products.some((product) => ids.includes(product.category_id))) {
    throw new DbError("products_category_id_fkey");
  }
  if (table === "products") {
    for (const item of db.order_items) if (ids.includes(item.product_id)) item.product_id = null;
    db.product_costs = db.product_costs.filter((row) => !ids.includes(row.product_id));
    db.purchases = db.purchases.filter((row) => !ids.includes(row.product_id));
    db.stock_adjustments = db.stock_adjustments.filter((row) => !ids.includes(row.product_id));
    db.promotions = db.promotions.filter((row) => !ids.includes(row.product_id));
  }
}

// ---------------------------------------------------------------- query builder

function likeToRegExp(pattern: string) {
  let source = "";
  for (let index = 0; index < pattern.length; index++) {
    const char = pattern[index];
    if (char === "%") source += ".*";
    else if (char === "_") source += ".";
    else source += (char === "\\" ? pattern[++index] ?? "\\" : char).replace(/[\\^$.*+?()[\]{}|]/g, "\\$&");
  }
  return new RegExp(`^${source}$`, "isu");
}

function compare(a: unknown, b: unknown) {
  return (a as number) < (b as number) ? -1 : (a as number) > (b as number) ? 1 : 0;
}

class DemoQuery {
  private action: "select" | "insert" | "update" | "delete" = "select";
  private columns = "*";
  private payload: Row = {};
  private wantsCount = false;
  private filters: ((row: Row) => boolean)[] = [];
  private sorts: { column: string; ascending: boolean }[] = [];
  private window: [number, number] | null = null;
  private cardinality: "many" | "single" | "maybeSingle" = "many";

  constructor(private table: TableName) {}

  select(columns = "*", options?: { count?: string }) {
    this.columns = columns;
    this.wantsCount = options?.count === "exact";
    return this;
  }
  insert(row: Row) {
    this.action = "insert";
    this.payload = row;
    return this;
  }
  update(fields: Row) {
    this.action = "update";
    this.payload = fields;
    return this;
  }
  delete() {
    this.action = "delete";
    return this;
  }
  eq(column: string, value: unknown) {
    this.filters.push((row) => String(row[column]) === String(value));
    return this;
  }
  not(column: string, operator: "is", value: null) {
    this.filters.push((row) => row[column] !== value);
    return this;
  }
  in(column: string, values: unknown[]) {
    this.filters.push((row) => values.includes(row[column]));
    return this;
  }
  gte(column: string, value: number) {
    this.filters.push((row) => Number(row[column]) >= value);
    return this;
  }
  lte(column: string, value: number) {
    this.filters.push((row) => Number(row[column]) <= value);
    return this;
  }
  ilike(column: string, pattern: string) {
    const regExp = likeToRegExp(pattern);
    this.filters.push((row) => regExp.test(String(row[column])));
    return this;
  }
  order(column: string, options?: { ascending?: boolean }) {
    this.sorts.push({ column, ascending: options?.ascending ?? true });
    return this;
  }
  limit(count: number) {
    this.window = [0, count - 1];
    return this;
  }
  range(from: number, to: number) {
    this.window = [from, to];
    return this;
  }
  single() {
    this.cardinality = "single";
    return this;
  }
  maybeSingle() {
    this.cardinality = "maybeSingle";
    return this;
  }

  private matches(row: Row) {
    return this.filters.every((filter) => filter(row));
  }

  private read() {
    const rows = (load()[this.table] as unknown as Row[]).filter((row) => this.matches(row));
    rows.sort((a, b) => {
      for (const { column, ascending } of this.sorts) {
        const order = compare(a[column], b[column]);
        if (order !== 0) return ascending ? order : -order;
      }
      return 0;
    });
    const count = rows.length;
    const page = this.window ? rows.slice(this.window[0], this.window[1] + 1) : rows;
    const columns = this.columns.split(",").map((column) => column.trim());
    const data = this.columns === "*" ? page : page.map((row) => Object.fromEntries(columns.map((column) => [column, row[column]])));
    return { data, count };
  }

  private write() {
    const normalize = NORMALIZE[this.table];
    const allowed = WRITABLE[this.table];
    const columns = this.action === "insert" ? allowed?.insert : this.action === "update" ? allowed?.update : undefined;
    if (!normalize || (this.action === "delete" ? !allowed?.delete : Object.keys(this.payload).some((key) => !columns?.includes(key)))) {
      throw new DbError("permission_denied");
    }
    const entity = this.table;
    transaction((db) => {
      const rows = db[this.table] as unknown as Row[];
      if (this.action === "insert") {
        const row = normalize({ ...DEFAULTS[this.table]!(), ...this.payload }, db);
        rows.push(row);
        if (this.table === "products") db.product_costs.push({ product_id: row.id as string, avg_cost: 0, last_cost: null, low_stock_at: 3 });
        audit(db, "insert", entity, row.id as string, row);
      } else if (this.action === "update") {
        rows.forEach((row, index) => {
          if (!this.matches(row)) return;
          rows[index] = normalize({ ...row, ...this.payload }, db);
          const changes = diff(row, rows[index]);
          if (Object.keys(changes).length > 0) audit(db, "update", entity, String(row.id ?? row.product_id), changes);
        });
      } else {
        const removed = rows.filter((row) => this.matches(row));
        const ids = removed.map((row) => row.id);
        deleteRows(this.table, ids, db);
        (db[this.table] as unknown as Row[]) = rows.filter((row) => !ids.includes(row.id));
        for (const row of removed) audit(db, "delete", entity, String(row.id), row);
      }
    });
    return null;
  }

  private execute() {
    if (this.action !== "select") return attempt(() => this.write());
    let count = 0;
    const result = attempt(() => {
      const { data, count: total } = this.read();
      count = total;
      if (this.cardinality === "many") return data;
      if (data.length > 1 || (data.length === 0 && this.cardinality === "single")) throw new DbError("not_a_single_row");
      return data[0] ?? null;
    });
    return this.wantsCount ? { ...result, count } : result;
  }

  // Awaiting the builder runs the query, as with supabase-js.
  then<A, B>(resolve: (value: ReturnType<DemoQuery["execute"]>) => A, reject?: (reason: unknown) => B) {
    return new Promise<ReturnType<DemoQuery["execute"]>>((done) => done(this.execute())).then(resolve, reject);
  }
}

// ---------------------------------------------------------------- database functions

const btrim = (value: unknown) => String(value ?? "").replace(/^ +| +$/g, "");

function castQty(value: unknown) {
  if (value === null || value === undefined) return null;
  if (typeof value === "boolean" || !/^[+-]?\d+$/.test(String(value)) || Math.abs(Number(value)) > INT_MAX) {
    throw new DbError("invalid_input_syntax");
  }
  return Number(value);
}

function mergeItems(items: unknown[]) {
  const merged = new Map<string, number | null>();
  for (const element of items) {
    const entry = (typeof element === "object" && element !== null ? element : {}) as Row;
    const qty = castQty(entry.qty);
    if (entry.id === null || entry.id === undefined) continue;
    if (typeof entry.id !== "string" || !UUID.test(entry.id)) throw new DbError("invalid_input_syntax");
    const id = entry.id.toLowerCase();
    const current = merged.get(id) ?? null;
    merged.set(id, current === null ? qty : qty === null ? current : current + qty);
  }
  return merged;
}

function placeOrder(args: Row) {
  return transaction((db) => {
    const name = btrim(args.p_name);
    const city = btrim(args.p_city);
    const address = btrim(args.p_address);
    const note = btrim(args.p_note);
    let phone = String(args.p_phone ?? "").replace(/[^0-9]/g, "");
    if (/^995[0-9]{9}$/.test(phone)) phone = phone.slice(3);
    if (!/^[0-9]{9}$/.test(phone)) throw new DbError("invalid_phone");
    if (length(name) < 2 || length(name) > 100 || length(city) < 2 || length(city) > 60 || length(address) < 3 || length(address) > 300 || length(note) > 500) {
      throw new DbError("invalid_customer");
    }
    const items = args.p_items;
    if (!Array.isArray(items) || items.length < 1 || items.length > 50) throw new DbError("invalid_items");

    const hourAgo = Date.now() - 3600000;
    const recent = db.orders.filter((order) => order.phone === phone && order.status === "new" && Date.parse(order.created_at) > hourAgo);
    if (recent.length >= 5) throw new DbError("too_many_orders");

    const merged = mergeItems(items);
    const orderId = Math.max(1000, ...db.orders.map((order) => order.id)) + 1;
    let nextItemId = Math.max(0, ...db.order_items.map((item) => item.id)) + 1;
    let total = 0;

    const lines: { name: string; qty: number; price: number }[] = [];
    const lowStock: { name: string; stock: number }[] = [];
    const products = db.products.filter((product) => merged.has(product.id)).sort((a, b) => compare(a.id, b.id));
    for (const product of products) {
      const qty = merged.get(product.id) ?? null;
      if (qty !== null && (qty < 1 || qty > 99)) throw new DbError("invalid_items");
      if (!product.active) throw new DbError("product_unavailable", product.name);
      if (qty === null) throw new DbError("not_null_violation");
      if (product.stock < qty) throw new DbError("out_of_stock", product.name);

      const cost = db.product_costs.find((row) => row.product_id === product.id);
      db.order_items.push({
        id: nextItemId++,
        order_id: orderId,
        product_id: product.id,
        product_name: product.name,
        price: product.final_price,
        qty,
        unit_cost: cost?.avg_cost ?? 0,
      });
      product.stock -= qty;
      total = Math.round((total + product.final_price * qty) * 100) / 100;
      lines.push({ name: product.name, qty, price: product.final_price });
      if (product.stock <= (cost?.low_stock_at ?? 3)) lowStock.push({ name: product.name, stock: product.stock });
    }
    if (products.length !== merged.size) throw new DbError("product_unavailable");

    db.orders.push({ id: orderId, customer_name: name, phone, city, address, note, total, status: "new", created_at: new Date().toISOString() });
    return { order_id: orderId, total, items: lines, low_stock: lowStock };
  });
}

// Same as place_order, for a signed-in customer (see place_customer_order in the migrations).
function placeCustomerOrder(args: Row) {
  if (typeof args.p_user_id !== "string" || !args.p_user_id) throw new DbError("not_signed_in");
  const result = placeOrder(args);
  transaction((db) => {
    const order = db.orders.find((item) => item.id === result.order_id);
    if (order) order.user_id = String(args.p_user_id);
  });
  return result;
}

function setOrderStatus(args: Row) {
  return transaction((db) => {
    const status = args.p_status as OrderStatus;
    if (!STATUSES.includes(status)) throw new DbError("invalid_status");
    const order = db.orders.find((item) => item.id === args.p_order_id);
    if (!order) throw new DbError("order_not_found");
    if (order.status === status) return null;
    if (order.status === "cancelled") throw new DbError("order_cancelled");

    if (status === "cancelled") {
      for (const item of db.order_items.filter((line) => line.order_id === order.id)) {
        const product = db.products.find((candidate) => candidate.id === item.product_id);
        if (product) product.stock += item.qty;
      }
    }
    audit(db, "update", "orders", String(order.id), { status: { from: order.status, to: status } });
    order.status = status;
    return null;
  });
}

const round2 = (value: number) => Math.round(value * 100) / 100;

function findProduct(db: Tables, id: unknown) {
  const product = db.products.find((item) => item.id === id);
  if (!product) throw new DbError("product_not_found");
  let cost = db.product_costs.find((row) => row.product_id === product.id);
  if (!cost) {
    cost = { product_id: product.id, avg_cost: 0, last_cost: null, low_stock_at: 3 };
    db.product_costs.push(cost);
  }
  return { product, cost };
}

function receiveStock(args: Row) {
  return transaction((db) => {
    const qty = args.p_qty as number;
    const unitCost = Number(args.p_unit_cost);
    if (!Number.isInteger(qty) || qty < 1 || qty > 100000) throw new DbError("invalid_qty");
    if (args.p_unit_cost === null || !Number.isFinite(unitCost) || unitCost < 0 || unitCost >= 1e8) throw new DbError("invalid_cost");
    const supplier = btrim(args.p_supplier);
    const note = btrim(args.p_note);
    if (length(supplier) > 120 || length(note) > 500) throw new DbError("purchases_check");
    const { product, cost } = findProduct(db, args.p_product_id);

    const old = cost.avg_cost;
    const next = product.stock <= 0 || old === 0 ? unitCost : (product.stock * old + qty * unitCost) / (product.stock + qty);
    const id = Math.max(0, ...db.purchases.map((row) => row.id)) + 1;
    const purchase = { id, product_id: product.id, qty, unit_cost: round2(unitCost), supplier, note, created_at: new Date().toISOString() };
    db.purchases.push(purchase);
    audit(db, "insert", "purchases", String(id), purchase);
    audit(db, "update", "product_costs", product.id, { avg_cost: { from: old, to: Math.round(next * 10000) / 10000 } });
    product.stock += qty;
    cost.avg_cost = Math.round(next * 10000) / 10000;
    cost.last_cost = round2(unitCost);
    return { stock: product.stock, old_avg: round2(old), avg_cost: round2(next), price: product.final_price };
  });
}

function adjustStock(args: Row) {
  return transaction((db) => {
    const delta = args.p_delta as number;
    const reason = btrim(args.p_reason);
    if (!Number.isInteger(delta) || delta === 0 || Math.abs(delta) > 100000) throw new DbError("invalid_qty");
    if (length(reason) < 2 || length(reason) > 300) throw new DbError("invalid_reason");
    const { product } = findProduct(db, args.p_product_id);
    if (product.stock + delta < 0) throw new DbError("out_of_stock");
    product.stock += delta;
    const id = Math.max(0, ...db.stock_adjustments.map((row) => row.id)) + 1;
    const row = { id, product_id: product.id, delta, reason, created_at: new Date().toISOString() };
    db.stock_adjustments.push(row);
    audit(db, "insert", "stock_adjustments", String(id), row);
    return product.stock;
  });
}

function setProductCost(args: Row) {
  return transaction((db) => {
    const value = Number(args.p_avg_cost);
    if (args.p_avg_cost === null || !Number.isFinite(value) || value < 0 || value >= 1e8) throw new DbError("invalid_cost");
    const { product, cost } = findProduct(db, args.p_product_id);
    audit(db, "update", "product_costs", product.id, { avg_cost: { from: cost.avg_cost, to: value } });
    cost.avg_cost = value;
    return null;
  });
}

// Tbilisi is UTC+4 all year.
const TBILISI_MS = 4 * 3600000;
const localDay = (iso: string) => new Date(Date.parse(iso) + TBILISI_MS).toISOString().slice(0, 10);

function soldLines(args: Row) {
  const db = load();
  const from = String(args.p_from);
  const to = String(args.p_to);
  const orders = new Map(
    db.orders.filter((order) => order.status !== "cancelled" && localDay(order.created_at) >= from && localDay(order.created_at) <= to).map((order) => [order.id, order]),
  );
  return db.order_items.filter((item) => orders.has(item.order_id)).map((item) => ({ item, order: orders.get(item.order_id)! }));
}

function salesReport(args: Row) {
  const months = new Map<string, { month: string; orders: Set<number>; units: number; revenue: number; cost: number }>();
  for (const { item, order } of soldLines(args)) {
    const month = `${localDay(order.created_at).slice(0, 7)}-01`;
    const row = months.get(month) ?? { month, orders: new Set(), units: 0, revenue: 0, cost: 0 };
    row.orders.add(order.id);
    row.units += item.qty;
    row.revenue += item.price * item.qty;
    row.cost += item.unit_cost * item.qty;
    months.set(month, row);
  }
  return [...months.values()]
    .sort((a, b) => compare(b.month, a.month))
    .map((row) => ({ month: row.month, orders: row.orders.size, units: row.units, revenue: round2(row.revenue), cost: round2(row.cost), profit: round2(row.revenue - row.cost) }));
}

function topProducts(args: Row) {
  const products = new Map<string, { product_name: string; units: number; revenue: number; profit: number }>();
  for (const { item } of soldLines(args)) {
    const row = products.get(item.product_name) ?? { product_name: item.product_name, units: 0, revenue: 0, profit: 0 };
    row.units += item.qty;
    row.revenue += item.price * item.qty;
    row.profit += (item.price - item.unit_cost) * item.qty;
    products.set(item.product_name, row);
  }
  const limit = Math.min(Math.max(Number(args.p_limit) || 10, 1), 100);
  return [...products.values()]
    .sort((a, b) => b.profit - a.profit || b.units - a.units)
    .slice(0, limit)
    .map((row) => ({ ...row, revenue: round2(row.revenue), profit: round2(row.profit) }));
}

function newsletterSubscribe(args: Row) {
  return transaction((db) => {
    const email = btrim(args.p_email).toLowerCase();
    if (email.length > 254 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new DbError("invalid_email");
    if (!db.newsletter_subscribers.some((row) => row.email === email)) {
      const id = Math.max(0, ...db.newsletter_subscribers.map((row) => row.id)) + 1;
      db.newsletter_subscribers.push({ id, email, created_at: new Date().toISOString() });
    }
    return null;
  });
}

function popularProductIds(args: Row) {
  const db = load();
  const since = Date.now() - 90 * 86400000;
  const orders = new Set(db.orders.filter((order) => order.status !== "cancelled" && Date.parse(order.created_at) > since).map((order) => order.id));
  const active = new Set(db.products.filter((product) => product.active).map((product) => product.id));
  const units = new Map<string, number>();
  for (const item of db.order_items) {
    if (item.product_id && orders.has(item.order_id) && active.has(item.product_id)) {
      units.set(item.product_id, (units.get(item.product_id) ?? 0) + item.qty);
    }
  }
  const limit = Math.min(Math.max(Number(args.p_limit) || 10, 1), 50);
  return [...units.entries()]
    .sort((a, b) => b[1] - a[1] || compare(a[0], b[0]))
    .slice(0, limit)
    .map(([id]) => id);
}

const FUNCTIONS: Record<string, (args: Row) => unknown> = {
  place_order: placeOrder,
  place_customer_order: placeCustomerOrder,
  set_order_status: setOrderStatus,
  receive_stock: receiveStock,
  adjust_stock: adjustStock,
  set_product_cost: setProductCost,
  sales_report: salesReport,
  top_products: topProducts,
  // Demo mode has one local visitor, so nothing is limited.
  rate_limit_hit: () => true,
  newsletter_subscribe: newsletterSubscribe,
  popular_product_ids: popularProductIds,
};

export const demoClient = {
  from: (table: TableName) => new DemoQuery(table),
  rpc: async (name: string, args: Row) => attempt(() => FUNCTIONS[name](args)),
  storage: {
    from: () => ({
      remove: async (names: string[]) => {
        for (const name of names) {
          if (IMAGE_NAME.test(name)) fs.rmSync(path.join(IMAGES, name), { force: true });
        }
        return { data: names, error: null };
      },
    }),
  },
};
