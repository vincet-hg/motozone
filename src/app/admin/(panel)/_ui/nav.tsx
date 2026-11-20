"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icons } from "./icons";

export const LINKS = [
  { href: "/admin", label: "მიმოხილვა", icon: Icons.dashboard },
  { href: "/admin/orders", label: "შეკვეთები", icon: Icons.orders },
  { href: "/admin/products", label: "პროდუქტები", icon: Icons.products },
  { href: "/admin/categories", label: "კატეგორიები", icon: Icons.categories },
  { href: "/admin/promotions", label: "სლაიდერი", icon: Icons.slider },
  { href: "/admin/reports", label: "ანგარიშები", icon: Icons.reports },
  { href: "/admin/users", label: "მომხმარებლები", icon: Icons.users },
  { href: "/admin/subscribers", label: "გამომწერები", icon: Icons.subscribers },
  { href: "/admin/audit", label: "ისტორია", icon: Icons.audit },
];

export function AdminNav({ newOrders }: { newOrders: number }) {
  const pathname = usePathname();
  return (
    <nav aria-label="ადმინის მენიუ" className="space-y-1">
      {LINKS.map(({ href, label, icon: Icon }) => {
        const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            prefetch={false}
            aria-current={active ? "page" : undefined}
            className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
              active
                ? "bg-gradient-to-r from-a-purple to-a-violet/80 text-white shadow-[0_8px_24px_-10px_rgba(227,18,11,0.9)]"
                : "text-a-soft hover:bg-a-card hover:text-a-text"
            }`}
          >
            <Icon className={`size-5 shrink-0 ${active ? "text-white" : "text-a-muted transition-colors group-hover:text-a-violet"}`} />
            {label}
            {href === "/admin/orders" && newOrders > 0 && (
              <span className={`ml-auto rounded-full px-2 py-0.5 text-xs font-bold ${active ? "bg-white/20 text-white" : "bg-a-violet/20 text-[#ffaaa3]"}`}>{newOrders}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

// The phone menu closes itself after a link is chosen.
export function MobileMenu({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <details key={pathname} className="lg:hidden">
      <summary aria-label="მენიუ" className="flex size-10 cursor-pointer items-center justify-center rounded-xl border border-a-line bg-a-card text-a-soft transition-colors hover:text-a-text">
        <Icons.menu />
      </summary>
      <div className="absolute inset-x-0 top-full z-40 border-b border-a-line bg-a-panel p-3 shadow-[0_24px_48px_-16px_rgba(0,0,0,0.9)]">{children}</div>
    </details>
  );
}
