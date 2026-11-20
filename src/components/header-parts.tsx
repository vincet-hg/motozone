"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { signOut } from "@/app/(store)/login/actions";
import { setAccountState, useAccount } from "@/lib/account-state";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { CartIcon, HeartIcon, KeyIcon, LoginIcon, LogoutIcon, PackageIcon, UserIcon } from "./icons";
import { iconButton } from "./styles";

export function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === "/search") return ["/search", "/product"].some((prefix) => pathname.startsWith(prefix));
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

// A button that looks active while the current page starts with prefix (the categories menu on a category page).
export function ActiveButton({ prefix, className, activeClassName, children }: {
  prefix: string;
  className: string;
  activeClassName: string;
  children: React.ReactNode;
}) {
  const active = usePathname().startsWith(prefix);
  return (
    <button type="button" aria-haspopup="true" className={`${className} ${active ? activeClassName : ""}`}>
      {children}
    </button>
  );
}

// Renders its children on every page except the homepage.
export function HiddenOnHome({ children }: { children: React.ReactNode }) {
  return usePathname() === "/" ? null : <>{children}</>;
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

const badge = "absolute -top-1.5 -right-1.5 min-w-5 rounded-full bg-accent px-1 text-center text-xs leading-5 font-bold text-white shadow-[0_0_12px_rgba(227,18,11,0.8)]";

export function WishlistLink() {
  const count = useWishlist().length;
  return (
    <Link href="/wishlist" prefetch={false} aria-label={`სურვილები, ${count}`} className={iconButton}>
      <HeartIcon className="size-6" />
      {count > 0 && <span className={badge}>{count}</span>}
    </Link>
  );
}

export function AccountLink({ className = "" }: { className?: string }) {
  return <AccountMenu className={className} />;
}

// Signed out: a clear "შესვლა" button. Signed in: the customer's initial in a red circle, with a menu.
function AccountMenu({ className }: { className: string }) {
  const account = useAccount();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent ? event.key === "Escape" : !ref.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  if (account.status !== "in") {
    const next = pathname.startsWith("/login") || pathname === "/" ? "" : `?next=${encodeURIComponent(pathname)}`;
    return (
      <Link
        href={account.status === "out" ? `/login${next}` : "/account"}
        prefetch={false}
        aria-label="შესვლა ან რეგისტრაცია"
        className={`${iconButton} xl:w-auto xl:gap-2 xl:px-3.5 xl:text-sm xl:font-semibold ${className}`}
      >
        <UserIcon className="size-6 xl:size-5" />
        <span className="hidden xl:inline">შესვლა</span>
      </Link>
    );
  }

  const summary = account.summary;
  const item = "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-fg/90 transition-colors hover:bg-card-hover hover:text-white";
  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`ჩემი ანგარიში${summary?.name ? `: ${summary.name}` : ""}`}
        className={`${iconButton} border-neon/50 bg-accent/15`}
      >
        <Avatar initial={summary?.initial} className="size-7 text-sm lg:size-8" />
        <span aria-hidden className="absolute -right-0.5 -bottom-0.5 size-3 rounded-full border-2 border-bg bg-emerald-400" />
      </button>
      {open && (
        <div role="menu" className="absolute top-full right-0 z-50 mt-2 w-[min(18rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-neon/20 bg-card shadow-[0_30px_60px_-20px_rgba(0,0,0,0.9),0_0_40px_-20px_rgba(227,18,11,0.6)]">
          <div className="h-0.5 bg-gradient-to-r from-accent via-neon to-accent" />
          <div className="flex items-center gap-3 border-b border-line px-4 py-3.5">
            <Avatar initial={summary?.initial} className="size-10 text-base" />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-white">{summary?.name || "ჩემი ანგარიში"}</p>
              <p className="truncate text-xs text-muted">{summary?.label}</p>
            </div>
          </div>
          <div className="p-2">
            <Link role="menuitem" href="/account" prefetch={false} className={item}>
              <PackageIcon className="size-5 text-neon" />
              ჩემი შეკვეთები
            </Link>
            <Link role="menuitem" href="/account/details" prefetch={false} className={item}>
              <UserIcon className="size-5 text-neon" />
              ჩემი მონაცემები
            </Link>
            <Link role="menuitem" href="/wishlist" prefetch={false} className={item}>
              <HeartIcon className="size-5 text-neon" />
              ფავორიტები
            </Link>
            {summary?.canChangePassword && (
              <Link role="menuitem" href="/account/password" prefetch={false} className={item}>
                <KeyIcon className="size-5 text-neon" />
                პაროლის შეცვლა
              </Link>
            )}
          </div>
          <form action={signOut} onSubmit={() => setAccountState({ status: "out" })} className="border-t border-line p-2">
            <button role="menuitem" className={`${item} w-full cursor-pointer text-muted`}>
              <LogoutIcon className="size-5" />
              გასვლა
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export function Avatar({ initial, className = "" }: { initial?: string; className?: string }) {
  return (
    <span aria-hidden className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-hover font-bold text-white ${className}`}>
      {initial || <UserIcon className="size-[60%]" />}
    </span>
  );
}

// The account part of the phone menu.
export function MobileAccountLinks({ linkClassName }: { linkClassName: string }) {
  const account = useAccount();
  if (account.status !== "in") {
    return (
      <div className="mt-3 grid grid-cols-2 gap-2 border-t border-line pt-3">
        <Link href="/login" prefetch={false} className="flex h-11 items-center justify-center gap-2 rounded-xl border border-line bg-card text-sm font-semibold text-fg">
          <LoginIcon className="size-5 text-neon" />
          შესვლა
        </Link>
        <Link href="/login?mode=register" prefetch={false} className="flex h-11 items-center justify-center rounded-xl border border-line bg-card text-sm font-semibold text-fg">
          რეგისტრაცია
        </Link>
      </div>
    );
  }
  const summary = account.summary;
  return (
    <div className="mt-3 border-t border-line pt-3">
      <div className="flex items-center gap-3 px-3 pb-2">
        <Avatar initial={summary?.initial} className="size-9 text-sm" />
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-white">{summary?.name || "ჩემი ანგარიში"}</p>
          <p className="truncate text-xs text-muted">{summary?.label}</p>
        </div>
      </div>
      <Link href="/account" prefetch={false} className={linkClassName}>
        <span className="flex items-center gap-2">
          <PackageIcon className="size-5 text-neon" />
          ჩემი შეკვეთები
        </span>
      </Link>
      <Link href="/account/details" prefetch={false} className={linkClassName}>
        <span className="flex items-center gap-2">
          <UserIcon className="size-5 text-neon" />
          ჩემი მონაცემები
        </span>
      </Link>
      <form action={signOut} onSubmit={() => setAccountState({ status: "out" })}>
        <button className={`${linkClassName} w-full cursor-pointer text-muted`}>
          <span className="flex items-center gap-2">
            <LogoutIcon className="size-5" />
            გასვლა
          </span>
        </button>
      </form>
    </div>
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
