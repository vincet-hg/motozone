import type { Metadata } from "next";
import Link from "next/link";
import { isDemo } from "@/lib/demo";
import { DEMO_EMAIL } from "@/lib/demo-data";
import { requireAdmin } from "@/lib/supabase-server";
import { logout } from "../actions";
import { Icons } from "./_ui/icons";
import { AdminNav, MobileMenu } from "./_ui/nav";

export const metadata: Metadata = { title: "ადმინისტრატორი", robots: { index: false, follow: false } };

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const supabase = await requireAdmin();
  const [{ count }, email] = await Promise.all([
    supabase.from("orders").select("id", { count: "exact" }).eq("status", "new").limit(1),
    isDemo ? DEMO_EMAIL : supabase.auth.getClaims().then(({ data }) => String(data?.claims?.email ?? "")),
  ]);
  const newOrders = Number(count ?? 0);
  const initial = (email || "A").charAt(0).toUpperCase();

  const brand = (
    <Link href="/admin" prefetch={false} className="flex items-center gap-3 px-2">
      <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-a-purple to-a-violet text-lg font-black text-white italic shadow-[0_0_24px_-4px_rgba(139,92,246,0.8)]">
        S
      </span>
      <span className="leading-tight">
        <span className="block font-bold text-a-text">Scooter Land</span>
        <span className="block text-xs text-a-muted">მართვის პანელი</span>
      </span>
    </Link>
  );

  const footerLinks = (
    <div className="space-y-1 border-t border-a-line pt-3">
      <a href="/" target="_blank" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-a-soft transition-colors hover:bg-a-card hover:text-a-text">
        <Icons.store className="size-5 text-a-muted" />
        მაღაზიის ნახვა
      </a>
      <form action={logout}>
        <button className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-a-soft transition-colors hover:bg-a-red/10 hover:text-[#ff8a94]">
          <Icons.logout className="size-5 text-a-muted" />
          გასვლა
        </button>
      </form>
    </div>
  );

  return (
    <div className="admin flex flex-1 bg-a-bg bg-[radial-gradient(ellipse_at_top_right,rgba(101,56,216,0.12),transparent_45%)] text-a-text">
      <aside className="sticky top-0 hidden h-dvh self-start w-64 shrink-0 flex-col gap-6 border-r border-a-line bg-a-panel px-3 py-5 lg:flex">
        {brand}
        <div className="flex-1 overflow-y-auto">
          <p className="mb-2 px-3 text-[11px] font-semibold tracking-wider text-a-muted uppercase">მენიუ</p>
          <AdminNav newOrders={newOrders} />
        </div>
        {footerLinks}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-a-line bg-a-bg/80 backdrop-blur-xl">
          <div className="relative flex h-16 items-center gap-3 px-4 sm:px-6">
            <MobileMenu>
              <AdminNav newOrders={newOrders} />
              <div className="mt-3">{footerLinks}</div>
            </MobileMenu>
            <div className="lg:hidden">{brand}</div>

            <form action="/admin/products" className="relative hidden max-w-md flex-1 md:block">
              <Icons.search className="pointer-events-none absolute top-1/2 left-3.5 size-[18px] -translate-y-1/2 text-a-muted" />
              <input name="q" type="search" placeholder="პროდუქტის ძიება..." aria-label="პროდუქტის ძიება" className="h-10 w-full rounded-xl border pr-4 pl-10 text-sm" />
            </form>

            <div className="ml-auto flex items-center gap-2 sm:gap-3">
              <Link
                href="/admin/orders?status=new"
                prefetch={false}
                aria-label={`ახალი შეკვეთები: ${newOrders}`}
                className="relative flex size-10 items-center justify-center rounded-xl border border-a-line bg-a-card text-a-soft transition-colors hover:border-a-violet/50 hover:text-a-text"
              >
                <Icons.bell className="size-5" />
                {newOrders > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-5 rounded-full bg-a-red px-1 text-center text-[11px] leading-5 font-bold text-white shadow-[0_0_12px_rgba(240,68,82,0.7)]">
                    {newOrders}
                  </span>
                )}
              </Link>
              <div className="flex items-center gap-3 rounded-xl border border-a-line bg-a-card py-1 pr-3 pl-1">
                <span aria-hidden="true" className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-a-blue to-a-violet text-sm font-bold text-white">
                  {initial}
                </span>
                <span className="hidden leading-tight sm:block">
                  <span className="block max-w-[180px] truncate text-sm font-medium">{email || "ადმინი"}</span>
                  <span className="block text-[11px] text-a-muted">ადმინისტრატორი</span>
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
