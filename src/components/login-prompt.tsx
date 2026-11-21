"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { signInWithGoogle } from "@/app/(store)/login/actions";
import { getAccountState, hasSessionCookie, useAccount } from "@/lib/account-state";
import { addToCart } from "@/lib/cart";
import { site } from "@/lib/site";
import { addToWishlist } from "@/lib/wishlist";
import { authButton, authSecondary } from "./auth-styles";
import { GoogleIcon, HeartIcon, CartIcon } from "./icons";
import { toast } from "./toaster";

// Adding to the cart or the wishlist needs an account. A visitor gets a sign-in window first; what they
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
  const account = useAccount();
  const router = useRouter();
  const pathname = usePathname();
  const dialog = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const show = (event: Event) => setOpen((event as CustomEvent<Saved>).detail);
    window.addEventListener(EVENT, show);
    return () => window.removeEventListener(EVENT, show);
  }, []);

  // Close on Escape and keep keyboard focus inside the window.
  useEffect(() => {
    if (!open) return;
    dialog.current?.querySelector<HTMLElement>("a, button")?.focus();
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

  // Signed in now: finish what they wanted.
  useEffect(() => {
    if (account.status !== "in") return;
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
  const query = (mode?: string) => `/login?${new URLSearchParams({ ...(mode ? { mode } : {}), next: open.next }).toString()}`;

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/70 p-3 backdrop-blur-sm sm:items-center" onClick={dismiss}>
      <div
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-prompt-title"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-sm rounded-card border border-line bg-card p-6 text-center shadow-[0_24px_60px_-20px_rgba(0,0,0,0.9)]"
      >
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-accent/15 text-neon">
          {cart ? <CartIcon className="size-6" /> : <HeartIcon className="size-6" />}
        </span>
        <h2 id="login-prompt-title" className="mt-3 text-xl font-extrabold">
          შედი ანგარიშში
        </h2>
        <p className="mt-1.5 text-sm leading-6 text-muted">
          {cart
            ? "შეკვეთისთვის შედი ან დარეგისტრირდი. შესვლის მერე პროდუქტი კალათაში დაემატება და შეკვეთის გაფორმებაზე გადახვალ."
            : "ფავორიტების შესანახად შედი ან დარეგისტრირდი. შესვლის მერე ეს პროდუქტი ფავორიტებში დაემატება."}
        </p>
        <div className="mt-5 space-y-2.5">
          {site.auth.google && (
            <form action={signInWithGoogle}>
              <input type="hidden" name="next" value={open.next} />
              <button className={authSecondary}>
                <GoogleIcon />
                Google-ით შესვლა
              </button>
            </form>
          )}
          <Link href={query()} className={authButton}>
            ელფოსტით შესვლა
          </Link>
          <Link href={query("register")} className="block py-1 text-sm font-semibold text-fg underline underline-offset-4 hover:text-neon">
            ანგარიში არ გაქვს? რეგისტრაცია
          </Link>
        </div>
        <button type="button" onClick={dismiss} className="mt-3 cursor-pointer text-sm text-muted hover:text-fg">
          ახლა არა
        </button>
      </div>
    </div>
  );
}
