import type { Metadata } from "next";
import Link from "next/link";
import { adminRole, requireAdmin } from "@/lib/supabase-server";
import { logout } from "../actions";

export const metadata: Metadata = { title: "ადმინისტრატორი", robots: { index: false, follow: false } };

const links = [
  { href: "/admin/orders", label: "შეკვეთები" },
  { href: "/admin/products", label: "პროდუქტები" },
  { href: "/admin/categories", label: "კატეგორიები" },
  { href: "/admin/reports", label: "ანგარიშები" },
  { href: "/admin/audit", label: "ისტორია" },
];

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const supabase = await requireAdmin();
  const owner = (await adminRole(supabase)) === "owner";

  return (
    <div className="flex-1 bg-neutral-100 text-black">
      <header className="bg-black text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-5 px-4 py-2 text-sm">
          <span className="font-bold">Scooter Land ადმინი</span>
          {links.map((link) => (
            <Link key={link.href} href={link.href} prefetch={false} className="py-2 hover:underline">
              {link.label}
            </Link>
          ))}
          {owner && (
            <Link href="/admin/team" prefetch={false} className="py-2 hover:underline">
              გუნდი
            </Link>
          )}
          <div className="ml-auto flex items-center gap-4">
            <Link href="/admin/account" prefetch={false} className="py-2 hover:underline">
              ჩემი ანგარიში
            </Link>
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
