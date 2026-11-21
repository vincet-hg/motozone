"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LoginForms } from "@/app/(store)/login/login-forms";
import { getAccountState, hasSessionCookie, refreshAccount, useAccount } from "@/lib/account-state";
import { addToCart } from "@/lib/cart";
import { site } from "@/lib/site";
import { addToWishlist } from "@/lib/wishlist";
import { HeartIcon, CartIcon } from "./icons";
import { toast } from "./toaster";

// Adding to the cart or the wishlist needs an account. A visitor gets a sign-in window (the real sign-in and
// register forms, switching in place) first; what they
// wanted to do is remembered here and finished right after they sign in or register (cart → the checkout).

type Intent = { type: "cart"; id: string; stock: number } | { type: "favorite"; id: string };
type Saved = Intent & { at: number; next: string };

const KEY = "scooterland-pending";
const EVENT = "scooterland-login-prompt";
const HOUR = 3600000;

function signedIn() {
  const state = getAccountState();
  return state.status === "in" || (state.status === "unknown" && hasSessionCookie());
}

// True when the customer is signed in and can go ahead; otherwise opens the sign-in window and returns false.
export function requireSignIn(intent: Intent) {
  if (signedIn()) return true;
  const next = intent.type === "cart" ? "/cart" : `${window.location.pathname}${window.location.search}`;
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...intent, at: Date.now(), next } satisfies Saved));
  } catch {
    // Private mode without storage: the window still opens, the action is just not finished afterwards.
  }
  window.dispatchEvent(new CustomEvent<Saved>(EVENT, { detail: { ...intent, at: Date.now(), next } }));
  return false;
}

function takePending(): Saved | null {
  try {
    const raw = localStorage.getItem(KEY);
    localStorage.removeItem(KEY);
    const saved = raw ? (JSON.parse(raw) as Saved) : null;
    return saved && Date.now() - saved.at < HOUR ? saved : null;
  } catch {
    return null;
  }
}

export function LoginPrompt() {
  const [open, setOpen] = useState<Saved | null>(null);
  // The window starts with sign-in; "register" switches it to the registration form in place.
  const [mode, setMode] = useState<"login" | "register">("login");
  const account = useAccount();
  const router = useRouter();
  const pathname = usePathname();
  const dialog = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const show = (event: Event) => {
      setMode("login");
      setOpen((event as CustomEvent<Saved>).detail);
    };
    window.addEventListener(EVENT, show);
    return () => window.removeEventListener(EVENT, show);
  }, []);

  // Close on Escape and keep keyboard focus inside the window.
  useEffect(() => {
    if (!open) return;
    dialog.current?.querySelector<HTMLElement>("input[name=email], a, button")?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      takePending();
      setOpen(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // A new page means the visitor went to sign in or elsewhere; the window is not needed any more.
  useEffect(() => setOpen(null), [pathname]);

  // "Not now": forget what they wanted, so a later sign-in does not add it by surprise.
  const dismiss = () => {
    takePending();
    setOpen(null);
  };

  // Signing in on the same page (a favourite) does not change the path, so watch for the session cookie
  // and ask the header to look again; that marks the visitor as signed in.
  useEffect(() => {
    if (!open || account.status === "in") return;
    const timer = window.setInterval(() => {
      if (hasSessionCookie()) refreshAccount();
    }, 800);
    return () => window.clearInterval(timer);
  }, [open, account.status]);

  // Signed in now: close the window and finish what they wanted.
  useEffect(() => {
    if (account.status !== "in") return;
    setOpen(null);
    const pending = takePending();
    if (!pending) return;
    if (pending.type === "favorite") {
      addToWishlist(pending.id);
      toast("დაემატა ფავორიტებში.");
      return;
    }
    const result = addToCart(pending.id, pending.stock);
    toast(result === "none" ? "ეს პროდუქტი ამჟამად მარაგში არ არის." : "პროდუქტი დაემატა კალათაში. დაასრულე შეკვეთა.", result === "none" ? "error" : "success");
    if (pathname !== "/cart") router.push("/cart");
  }, [account.status, pathname, router]);

  if (!open) return null;

  const cart = open.type === "cart";
  const register = mode === "register";

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center overflow-y-auto bg-black/70 p-3 backdrop-blur-sm sm:items-center" onClick={dismiss}>
      <div
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-prompt-title"
        onClick={(event) => event.stopPropagation()}
        className="relative my-auto w-full max-w-md rounded-card border border-line bg-card p-5 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.9)] sm:p-7"
      >
        <button
          type="button"
          onClick={dismiss}
          aria-label="დახურვა"
          className="absolute top-3 right-3 flex size-9 cursor-pointer items-center justify-center rounded-full text-xl text-muted transition-colors hover:bg-bg hover:text-fg"
        >
          ×
        </button>
        <div className="text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-accent/15 text-neon">
            {cart ? <CartIcon className="size-6" /> : <HeartIcon className="size-6" />}
          </span>
          <h2 id="login-prompt-title" className="mt-3 text-xl font-extrabold">
            {register ? "რეგისტრაცია" : "შესვლა"}
          </h2>
          <p className="mt-1.5 text-sm leading-6 text-muted">
            {cart
              ? `${register ? "დარეგისტრირდი" : "შედი ანგარიშში"} და პროდუქტი კალათაში დაემატება, მერე შეკვეთის გაფორმებაზე გადახვალ.`
              : `${register ? "დარეგისტრირდი" : "შედი ანგარიშში"} და ეს პროდუქტი ფავორიტებში დაემატება.`}
          </p>
        </div>

        <div className="mt-5">
          <LoginForms key={mode} next={open.next} mode={mode} google={site.auth.google} phone={site.auth.phone} />
        </div>

        <p className="mt-5 text-center text-sm text-muted">
          {register ? "უკვე გაქვს ანგარიში?" : "ანგარიში არ გაქვს?"}{" "}
          <button
            type="button"
            onClick={() => setMode(register ? "login" : "register")}
            className="cursor-pointer font-semibold text-fg underline underline-offset-4 hover:text-neon"
          >
            {register ? "შესვლა" : "რეგისტრაცია"}
          </button>
        </p>
      </div>
    </div>
  );
}
