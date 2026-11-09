// Local preview without Supabase. Limited to `next dev` so a deployment with
// missing environment variables fails loudly instead of selling fake products.
export const isDemo = process.env.NODE_ENV === "development" && !process.env.NEXT_PUBLIC_SUPABASE_URL;

export const DEMO_COOKIE = "motozone-demo-admin";
export const DEMO_SESSION = "signed-in";

export function isDemoAdmin(cookies: { get(name: string): { value: string } | undefined }) {
  return isDemo && cookies.get(DEMO_COOKIE)?.value === DEMO_SESSION;
}
