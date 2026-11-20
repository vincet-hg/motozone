"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { KeyIcon, PackageIcon, UserIcon } from "@/components/icons";

export function AccountTabs({ canChangePassword }: { canChangePassword: boolean }) {
  const pathname = usePathname();
  const tabs = [
    { href: "/account", label: "შეკვეთები", Icon: PackageIcon, active: pathname === "/account" || pathname.startsWith("/account/orders") },
    { href: "/account/details", label: "მონაცემები", Icon: UserIcon, active: pathname === "/account/details" },
    ...(canChangePassword ? [{ href: "/account/password", label: "პაროლი", Icon: KeyIcon, active: pathname === "/account/password" }] : []),
  ];
  return (
    <nav aria-label="ანგარიში" className="mt-4 grid auto-cols-fr grid-flow-col gap-1 rounded-btn border border-line bg-card p-1">
      {tabs.map(({ href, label, Icon, active }) => (
        <Link
          key={href}
          href={href}
          prefetch={false}
          aria-current={active ? "page" : undefined}
          className={`flex h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-[9px] px-1 text-xs font-semibold whitespace-nowrap transition-colors sm:h-11 sm:flex-row sm:gap-2 sm:px-3 sm:text-sm ${
            active ? "bg-accent/20 text-white shadow-[inset_0_0_0_1px_rgba(255,81,72,0.45)]" : "text-muted hover:bg-card-hover hover:text-fg"
          }`}
        >
          <Icon className={`size-[18px] ${active ? "text-neon" : ""}`} />
          {label}
        </Link>
      ))}
    </nav>
  );
}
