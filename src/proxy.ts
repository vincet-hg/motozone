import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isDemo, isDemoAdmin } from "@/lib/demo";

// Runs on /admin and the customer account pages only, so the rest of the storefront never pays for it.
// It keeps the session cookie fresh (pages cannot write cookies) and guards /admin.
//
// ADMIN_HOST (production only, e.g. admin.scooterland.ge) gives the admin its own address: that address
// opens the admin, and on every other address /admin does not exist (the 404 page). Without it, as in
// previews and on localhost, the admin stays at /admin.
export async function proxy(request: NextRequest) {
  const isAdminPath = request.nextUrl.pathname.startsWith("/admin");
  const adminHost = process.env.ADMIN_HOST;
  if (adminHost && !isDemo) {
    const host = (request.headers.get("host") ?? "").split(":")[0];
    if (host === adminHost && request.nextUrl.pathname === "/") return NextResponse.redirect(new URL("/admin", request.url));
    if (host !== adminHost && isAdminPath) return NextResponse.rewrite(new URL("/admin-is-elsewhere", request.url));
  }
  if (isDemo) {
    return !isAdminPath || isDemoAdmin(request.cookies) || request.nextUrl.pathname === "/admin/login"
      ? NextResponse.next({ request })
      : NextResponse.redirect(new URL("/admin/login", request.url));
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "", process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "", {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // Verifies the session token locally with Supabase's public signing key and refreshes it when
  // it expires, so most requests need no round trip to the Auth server.
  const { data } = await supabase.auth.getClaims();

  if (isAdminPath && !data?.claims?.sub && request.nextUrl.pathname !== "/admin/login") {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  return response;
}

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/account",
    "/account/:path*",
    "/login",
    "/cart",
    // The admin address's home page, so it can open the admin. The store's home page is not matched.
    { source: "/", has: [{ type: "host", value: "admin\\..*" }] },
  ],
};
