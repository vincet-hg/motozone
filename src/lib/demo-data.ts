import "server-only";
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { crc32, deflateSync } from "node:zlib";
import type { Category, Order, OrderItem, OrderStatus, Product } from "./types";

// Stands in for the part of the Supabase client this app uses, backed by JSON files in .demo-data/.
// Business rules mirror supabase/schema.sql. Every transaction is synchronous, so requests cannot
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
type Tables = { categories: Category[]; products: DemoProduct[]; orders: Order[]; order_items: DemoOrderItem[] };
type TableName = keyof Tables;
type Row = Record<string, unknown>;

// order_items is written last, so its presence means a seed finished.
const TABLES: TableName[] = ["categories", "products", "orders", "order_items"];

class DbError extends Error {
  constructor(
    message: string,
    readonly details: string | null = null,
  ) {
    super(message);
  }
}

// ---------------------------------------------------------------- seed

const CATEGORIES = [
  ["გათბობადი გრიფსები", "gatbobadi-gripsebi"],
  ["დამტენები", "damtenebi"],
  ["ხელთათმანები", "kheltatmanebi"],
  ["ტელეფონის დამჭერები", "teleponis-damcherebi"],
  ["ხელის დამცავები", "khelis-damtsavebi"],
  ["ჩიხოლები", "chikholebi"],
  ["სხვა აქსესუარები", "skhva-aksesuarebi"],
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
    };
  });
  const categories = CATEGORIES.map(([name, slug], index) => ({ id: seedId(9, index), name, slug, position: index + 1 }));
  save({ categories, products, orders: [], order_items: [] });
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
  return Object.fromEntries(TABLES.map((table) => [table, JSON.parse(fs.readFileSync(tableFile(table), "utf8"))])) as Tables;
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
  return { ...row, price, sale_price: salePrice, final_price: salePrice ?? price, stock };
}

function normalizeCategory(row: Row, db: Tables) {
  if (length(row.name) < 1 || length(row.name) > 80) throw new DbError("categories_name_check");
  checkUniqueSlug(db.categories, row);
  return { ...row, position: integer(row.position) };
}

const NORMALIZE: Partial<Record<TableName, (row: Row, db: Tables) => Row>> = {
  products: normalizeProduct,
  categories: normalizeCategory,
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
  categories: () => ({ id: randomUUID(), position: 0 }),
};

function deleteRows(table: TableName, ids: unknown[], db: Tables) {
  if (table === "categories" && db.products.some((product) => ids.includes(product.category_id))) {
    throw new DbError("products_category_id_fkey");
  }
  if (table === "products") {
    for (const item of db.order_items) if (ids.includes(item.product_id)) item.product_id = null;
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
    if (!normalize) throw new DbError("permission_denied");
    transaction((db) => {
      const rows = db[this.table] as unknown as Row[];
      if (this.action === "insert") {
        rows.push(normalize({ ...DEFAULTS[this.table]!(), ...this.payload }, db));
      } else if (this.action === "update") {
        rows.forEach((row, index) => {
          if (this.matches(row)) rows[index] = normalize({ ...row, ...this.payload }, db);
        });
      } else {
        const ids = rows.filter((row) => this.matches(row)).map((row) => row.id);
        deleteRows(this.table, ids, db);
        (db[this.table] as unknown as Row[]) = rows.filter((row) => !ids.includes(row.id));
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

    const products = db.products.filter((product) => merged.has(product.id)).sort((a, b) => compare(a.id, b.id));
    for (const product of products) {
      const qty = merged.get(product.id) ?? null;
      if (qty !== null && (qty < 1 || qty > 99)) throw new DbError("invalid_items");
      if (!product.active) throw new DbError("product_unavailable", product.name);
      if (qty === null) throw new DbError("not_null_violation");
      if (product.stock < qty) throw new DbError("out_of_stock", product.name);

      db.order_items.push({ id: nextItemId++, order_id: orderId, product_id: product.id, product_name: product.name, price: product.final_price, qty });
      product.stock -= qty;
      total = Math.round((total + product.final_price * qty) * 100) / 100;
    }
    if (products.length !== merged.size) throw new DbError("product_unavailable");

    db.orders.push({ id: orderId, customer_name: name, phone, city, address, note, total, status: "new", created_at: new Date().toISOString() });
    return { order_id: orderId, total };
  });
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
    order.status = status;
    return null;
  });
}

const FUNCTIONS: Record<string, (args: Row) => unknown> = { place_order: placeOrder, set_order_status: setOrderStatus };

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
