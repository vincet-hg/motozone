import "server-only";
import { hash } from "./rate-limit";
import { serviceClient } from "./supabase-service";

// Escalating lockout per account after wrong passwords: 3 -> 6 min, 3 more -> 15 min, 2 more -> 1 hour,
// 2 more -> 24 hours. The steps live in the database (login_failed). Customers and admins are counted apart.
// If the database cannot be reached, sign-in is not blocked: Supabase still limits sign-ins itself.

type Scope = "customer" | "admin";
const key = (scope: Scope, email: string) => `${scope}:${hash(email.trim().toLowerCase())}`;

function lockedMessage(until: string) {
  const minutes = Math.max(1, Math.ceil((new Date(until).getTime() - Date.now()) / 60000));
  const wait = minutes < 60 ? `${minutes} წუთში` : `${Math.ceil(minutes / 60)} საათში`;
  return `ძალიან ბევრი არასწორი მცდელობაა. ანგარიში დროებით დაბლოკილია, სცადე ${wait} ან აღადგინე პაროლი.`;
}

// The message to show when the account is locked now, otherwise null.
export async function lockedError(scope: Scope, email: string) {
  const { data, error } = await serviceClient.rpc("login_locked_until", { p_key: key(scope, email) });
  if (error) console.error("login_locked_until failed", error.message);
  return typeof data === "string" ? lockedMessage(data) : null;
}

// Counts a wrong password. Returns the lock message if this attempt locked the account.
export async function recordFailure(scope: Scope, email: string) {
  const { data, error } = await serviceClient.rpc("login_failed", { p_key: key(scope, email) });
  if (error) console.error("login_failed failed", error.message);
  return typeof data === "string" ? lockedMessage(data) : null;
}

export async function recordSuccess(scope: Scope, email: string) {
  const { error } = await serviceClient.rpc("login_succeeded", { p_key: key(scope, email) });
  if (error) console.error("login_succeeded failed", error.message);
}
