import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/supabase-server";
import { logout } from "../actions";

export const metadata: Metadata = { title: "ადმინისტრატორი", robots: { index: false } };

const links = [
  { href: "/admin/orders", label: "შეკვეთები" },
  { href: "/admin/products", label: "პროდუქტები" },
  { href: "/admin/categories", label: "კატეგორიები" },
];

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="flex-1 bg-neutral-100">
      <header className="bg-black text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-5 px-4 py-2 text-sm">
          <span className="font-bold">MotoZone ადმინი</span>
          {links.map((link) => (
            <Link key={link.href} href={link.href} prefetch={false} className="py-2 hover:underline">
              {link.label}
            </Link>
          ))}
          <div className="ml-auto flex items-center gap-4">
            <a href="/" target="_blank" className="py-2 hover:underline">
              მაღაზია
            </a>
            <form action={logout}>
              <button className="py-2 hover:underline">გასვლა</button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
