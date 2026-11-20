import "server-only";
import { randomUUID, scryptSync, timingSafeEqual, randomBytes } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import type { Profile } from "./types";

// Local demo mode only: customer accounts, details and wishlists in .demo-data/accounts.json,
// standing in for Supabase Auth and the profiles and wishlist_items tables.

export const DEMO_CUSTOMER_COOKIE = "motozone-demo-customer";
// The one code the demo accepts for SMS and email codes; a real project sends a fresh one each time.
export const DEMO_PHONE_CODE = "123456";

// confirmed: false until the email code is entered (accounts from before this field count as confirmed).
type DemoUser = { id: string; email: string | null; phone: string | null; password: string | null; created_at: string; confirmed?: boolean };
type Accounts = { users: DemoUser[]; profiles: (Profile & { user_id: string })[]; wishlist: { user_id: string; product_id: string }[] };

const FILE = path.join(process.cwd(), ".demo-data", "accounts.json");

function read(): Accounts {
  try {
    return JSON.parse(fs.readFileSync(FILE, "utf8")) as Accounts;
  } catch {
    return { users: [], profiles: [], wishlist: [] };
  }
}

function write(data: Accounts) {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

function hash(password: string) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(password, salt, 32).toString("hex")}`;
}

function matches(password: string, stored: string | null) {
  if (!stored) return false;
  const [salt, key] = stored.split(":");
  const candidate = scryptSync(password, salt, 32);
  return timingSafeEqual(candidate, Buffer.from(key, "hex"));
}

export function demoUser(id: string | undefined) {
  if (!id) return null;
  return read().users.find((user) => user.id === id) ?? null;
}

export function demoSignUp(email: string, password: string) {
  const data = read();
  if (data.users.some((user) => user.email === email)) return { error: "user_already_exists" as const };
  const user: DemoUser = { id: randomUUID(), email, phone: null, password: hash(password), created_at: new Date().toISOString(), confirmed: false };
  data.users.push(user);
  write(data);
  return { user };
}

export function demoSignIn(email: string, password: string) {
  const user = read().users.find((item) => item.email === email);
  return user && matches(password, user.password) ? user : null;
}

export function demoUserByEmail(email: string) {
  return read().users.find((item) => item.email === email) ?? null;
}

export function demoConfirm(email: string) {
  const data = read();
  const user = data.users.find((item) => item.email === email);
  if (user) user.confirmed = true;
  write(data);
  return user ?? null;
}

// Signs in by phone, creating the account on first use, as Supabase does.
export function demoPhoneSignIn(phone: string) {
  const data = read();
  let user = data.users.find((item) => item.phone === phone);
  if (!user) {
    user = { id: randomUUID(), email: null, phone, password: null, created_at: new Date().toISOString() };
    data.users.push(user);
    write(data);
  }
  return user;
}

export function demoSetPassword(id: string, password: string) {
  const data = read();
  const user = data.users.find((item) => item.id === id);
  if (user) user.password = hash(password);
  write(data);
}

export function demoProfile(id: string): Profile | null {
  const row = read().profiles.find((item) => item.user_id === id);
  return row ? { name: row.name, phone: row.phone, address: row.address } : null;
}

export function demoSaveProfile(id: string, profile: Profile) {
  const data = read();
  data.profiles = [...data.profiles.filter((item) => item.user_id !== id), { user_id: id, ...profile }];
  write(data);
}

export function demoWishlist(id: string) {
  return read().wishlist.filter((item) => item.user_id === id).map((item) => item.product_id);
}

export function demoSetWishlist(id: string, productIds: string[]) {
  const data = read();
  data.wishlist = [...data.wishlist.filter((item) => item.user_id !== id), ...productIds.map((product_id) => ({ user_id: id, product_id }))];
  write(data);
}
