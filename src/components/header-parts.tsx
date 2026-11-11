"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { CartIcon, HeartIcon } from "./icons";

export function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === "/search") return ["/search", "/category", "/product"].some((prefix) => pathname.startsWith(prefix));
  return pathname.startsWith(href);
}

export function NavLink({ href, className, activeClassName, children }: {
  href: string;
  className: string;
  activeClassName: string;
  children: React.ReactNode;
}) {
  const active = isActive(usePathname(), href);
  return (
    <Link href={href} prefetch={false} aria-current={active ? "page" : undefined} className={`${className} ${active ? activeClassName : ""}`}>
      {children}
    </Link>
  );
}

// A <details> menu that works without JavaScript and closes itself after navigation.
export function Disclosure({ className, summary, summaryLabel, summaryClassName, children }: {
  className?: string;
  summary: React.ReactNode;
  summaryLabel: string;
  summaryClassName: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDetailsElement>(null);
  const pathname = usePathname();
  useEffect(() => {
    if (ref.current) ref.current.open = false;
  }, [pathname]);

  return (
    <details ref={ref} className={className}>
      <summary aria-label={summaryLabel} className={summaryClassName}>
        {summary}
      </summary>
      {children}
    </details>
  );
}

const iconButton = "relative flex size-10 items-center justify-center rounded-btn transition-colors duration-200 hover:text-accent-hover";
const badge = "absolute top-0.5 right-0 min-w-5 rounded-full bg-accent px-1 text-center text-xs leading-5 font-bold text-white";

export function WishlistLink() {
  const count = useWishlist().length;
  return (
    <Link href="/wishlist" prefetch={false} aria-label={`სურვილები, ${count}`} className={iconButton}>
      <HeartIcon className="size-6" />
      {count > 0 && <span className={badge}>{count}</span>}
    </Link>
  );
}

export function CartLink() {
  const count = useCart().reduce((sum, item) => sum + item.qty, 0);
  return (
    <Link href="/cart" prefetch={false} aria-label={`კალათა, ${count} ნივთი`} className={iconButton}>
      <CartIcon className="size-6" />
      {count > 0 && <span className={badge}>{count}</span>}
    </Link>
  );
}
