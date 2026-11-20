import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isDemo, isDemoAdmin } from "@/lib/demo";

// Runs on /admin and the customer account pages only, so the rest of the storefront never pays for it.
// It keeps the session cookie fresh (pages cannot write cookies) and guards /admin.
export async function proxy(request: NextRequest) {
  const isAdminPath = request.nextUrl.pathname.startsWith("/admin");
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

export const config = { matcher: ["/admin", "/admin/:path*", "/account", "/account/:path*", "/login", "/cart"] };
