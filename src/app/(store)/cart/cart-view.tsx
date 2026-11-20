"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useEffect, useMemo, useState } from "react";
import { CheckIcon } from "@/components/icons";
import { clearCart, setCartQty, useCart } from "@/lib/cart";
import { formatPrice, imageUrl } from "@/lib/format";
import { keepValues } from "@/lib/keep-values";
import { site } from "@/lib/site";
import type { ProductCard, Profile } from "@/lib/types";
import { getCartProducts, placeOrder, type OrderState } from "./actions";

const input = "h-11 w-full rounded-btn border border-line bg-bg px-3 text-base text-fg focus:border-accent focus:outline-none";

export function CartView({ signedIn, profile }: { signedIn: boolean; profile: Profile | null }) {
  const cart = useCart();
  const [products, setProducts] = useState<ProductCard[] | null>(null);
  const [state, action, pending] = useActionState<OrderState, FormData>(placeOrder, {});
  const [method, setMethod] = useState<"delivery" | "pickup">("delivery");

  const idKey = useMemo(() => cart.map((item) => item.id).sort().join(","), [cart]);

  useEffect(() => {
    let current = true;
    getCartProducts(idKey ? idKey.split(",") : []).then((result) => {
      if (current) setProducts(result);
    });
    return () => {
      current = false;
    };
  }, [idKey, state.error]);

  useEffect(() => {
    if (state.orderId) clearCart();
  }, [state.orderId]);

  // Keep quantities within what is actually in stock.
  useEffect(() => {
    if (!products) return;
    for (const item of cart) {
      const product = products.find((p) => p.id === item.id);
      if (product && product.stock > 0 && item.qty > product.stock) setCartQty(item.id, product.stock);
    }
  }, [products, cart]);

  if (state.orderId) {
    return (
      <div className="mx-auto mt-6 max-w-lg rounded-card border border-neon/30 bg-card p-6 text-center shadow-[0_0_60px_-30px_rgba(227,18,11,0.9)] sm:p-8">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-hover text-white shadow-[0_0_30px_-6px_rgba(227,18,11,0.9)]">
          <CheckIcon className="size-7" />
        </span>
        <h2 className="mt-4 text-2xl font-extrabold">შეკვეთა მიღებულია!</h2>
        <p className="mt-1 text-muted">
          შეკვეთა <span className="font-bold text-fg">#{state.orderId}</span> · სულ{" "}
          <span className="font-bold text-neon">{formatPrice(state.total ?? 0)}</span>
        </p>
        <p className="mt-4 rounded-btn border border-line bg-bg px-4 py-3 text-sm leading-6 text-fg/90">
          დასადასტურებლად დაგირეკავთ. შეკვეთის ეტაპს ნებისმიერ დროს ნახავ ანგარიშში, „ჩემი შეკვეთები“-ში.
        </p>
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <Link
            href={`/account/orders/${state.orderId}`}
            className="flex h-12 items-center justify-center gap-2 rounded-btn bg-gradient-to-r from-accent to-accent-hover font-bold text-white"
          >
            შეკვეთის ნახვა
          </Link>
          <Link href="/" className="flex h-12 items-center justify-center rounded-btn border border-line font-semibold text-fg hover:border-neon/50">
            მთავარზე დაბრუნება
          </Link>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <p className="mt-6">
        კალათა ცარიელია.{" "}
        <Link href="/" className="text-neon underline">
          პროდუქტების ნახვა
        </Link>
      </p>
    );
  }

  if (!products) return <p className="mt-6 text-muted">იტვირთება...</p>;

  const lines = cart.map((item) => ({ item, product: products.find((p) => p.id === item.id) }));
  const unavailable = lines.some(({ product }) => !product || product.stock === 0);
  const total = lines.reduce((sum, { item, product }) => sum + (product ? product.final_price * item.qty : 0), 0);
  const stepper = "flex size-10 items-center justify-center text-lg disabled:text-line";

  return (
    <div className="mt-4 grid gap-8 md:grid-cols-[1fr_360px]">
      <ul className="h-fit divide-y divide-line rounded-card border border-line bg-card px-3 sm:px-4">
        {lines.map(({ item, product }) => (
          <li key={item.id} className="flex gap-3 py-3">
            <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-photo">
              {product?.images[0] && (
                <Image src={imageUrl(product.images[0])} alt="" fill sizes="96px" quality={75} className="object-contain p-1" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              {product ? (
                <Link href={`/product/${product.slug}`} prefetch={false} className="line-clamp-2 text-sm font-semibold hover:text-neon">
                  {product.name}
                </Link>
              ) : (
                <p className="text-sm">პროდუქტი აღარ იყიდება</p>
              )}
              {product && product.stock === 0 && <p className="text-sm font-medium">მარაგში აღარ არის</p>}
              <div className="mt-1 flex items-center justify-between gap-2">
                {product && product.stock > 0 ? (
                  <div className="flex items-center rounded-btn border border-line">
                    <button type="button" aria-label="შემცირება" className={stepper} onClick={() => setCartQty(item.id, item.qty - 1)}>
                      −
                    </button>
                    <span className="w-6 text-center text-sm">{item.qty}</span>
                    <button
                      type="button"
                      aria-label="გაზრდა"
                      className={stepper}
                      disabled={item.qty >= product.stock}
                      onClick={() => setCartQty(item.id, item.qty + 1)}
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <span />
                )}
                {product && <span className="font-bold text-neon">{formatPrice(product.final_price * item.qty)}</span>}
              </div>
              <button type="button" className="mt-1 py-1 text-sm text-muted underline hover:text-fg" onClick={() => setCartQty(item.id, 0)}>
                წაშლა
              </button>
            </div>
          </li>
        ))}
      </ul>

      {signedIn ? (
        <form action={action} onSubmit={keepValues(action)} className="flex h-fit flex-col gap-3 rounded-card border border-line bg-card p-4 sm:p-5">
          <dl className="space-y-1.5 text-sm">
            <div className="flex justify-between text-muted">
              <dt>პროდუქტები</dt>
              <dd className="text-fg">{formatPrice(total)}</dd>
            </div>
            <div className="flex justify-between text-muted">
              <dt>{method === "delivery" ? "მიტანა თბილისში" : "გატანა დიღომიდან"}</dt>
              <dd className="text-fg">{method === "delivery" ? formatPrice(site.deliveryFee) : "უფასო"}</dd>
            </div>
            <div className="flex items-baseline justify-between border-t border-line pt-2">
              <dt className="text-base font-bold text-fg">სულ</dt>
              <dd className="text-2xl font-bold text-neon">{formatPrice(total + (method === "delivery" ? site.deliveryFee : 0))}</dd>
            </div>
          </dl>
          <input type="hidden" name="items" value={JSON.stringify(cart)} />
          <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
          <label className="text-sm">
            სახელი და გვარი
            <input name="name" required minLength={2} maxLength={100} autoComplete="name" defaultValue={profile?.name} className={`${input} mt-1`} />
          </label>
          <label className="text-sm">
            ტელეფონი
            <input name="phone" type="tel" required autoComplete="tel" inputMode="tel" defaultValue={profile?.phone} className={`${input} mt-1`} />
          </label>
          <fieldset className="text-sm">
            <legend>მიღების გზა</legend>
            <div className="mt-1 grid grid-cols-2 gap-2">
              {(
                [
                  ["delivery", "მიტანა", `თბილისში, ${site.deliveryFee} ₾`],
                  ["pickup", "გატანა", `დიღომი, უფასოდ`],
                ] as const
              ).map(([value, title, hint]) => (
                <label
                  key={value}
                  className="cursor-pointer rounded-btn border border-line bg-bg px-3 py-2.5 transition-colors has-checked:border-neon/60 has-checked:bg-accent/10"
                >
                  <input type="radio" name="method" value={value} checked={method === value} onChange={() => setMethod(value)} className="sr-only" />
                  <span className="block font-semibold">{title}</span>
                  <span className="block text-xs text-muted">{hint}</span>
                </label>
              ))}
            </div>
          </fieldset>
          {method === "delivery" ? (
            <label className="text-sm">
              მისამართი თბილისში
              <input name="address" required minLength={3} maxLength={300} autoComplete="street-address" defaultValue={profile?.address} placeholder="ქუჩა, ნომერი, ბინა" className={`${input} mt-1 placeholder:text-muted/70`} />
            </label>
          ) : (
            <p className="rounded-btn border border-line bg-bg p-3 text-sm leading-6 text-muted">
              გაიტანე მისამართიდან: <span className="text-fg">{site.pickup.address}</span> ({site.pickup.landmark}), ყოველდღე {site.pickup.hours}. მოსვლამდე დაგირეკავთ, როცა შეკვეთა მზად იქნება.
            </p>
          )}
          <label className="text-sm">
            შენიშვნა (არასავალდებულო)
            <input name="note" maxLength={500} className={`${input} mt-1`} />
          </label>
          <p className="text-sm text-muted">{method === "delivery" ? "გადახდა მიტანისას, კურიერთან." : "გადახდა გატანისას."}</p>
          {unavailable && <p className="text-sm font-medium">წაშალე პროდუქტი, რომელიც მარაგში აღარ არის.</p>}
          {state.error && (
            <p role="alert" className="rounded-lg border border-accent/50 bg-accent/10 p-2 text-sm font-medium text-fg">
              {state.error}
            </p>
          )}
          <button type="submit" disabled={pending || unavailable} className="h-13 rounded-btn bg-accent font-bold text-white shadow-[0_8px_30px_-8px_rgba(227,18,11,0.7)] transition-colors duration-200 hover:bg-accent-hover disabled:opacity-50">
            {pending ? "იგზავნება..." : "შეკვეთის გაფორმება"}
          </button>
          <p className="text-xs leading-5 text-muted">
            შეკვეთით ეთანხმები{" "}
            <Link href="/terms" className="underline hover:text-fg">მომსახურების პირობებს</Link> და{" "}
            <Link href="/privacy" className="underline hover:text-fg">კონფიდენციალურობის პოლიტიკას</Link>.
          </p>
        </form>
      ) : (
        <div className="flex h-fit flex-col gap-3 rounded-card border border-line bg-card p-4 sm:p-5">
          <div className="flex items-baseline justify-between">
            <h2 className="font-bold">პროდუქტები</h2>
            <span className="text-2xl font-bold text-neon">{formatPrice(total)}</span>
          </div>
          <p className="text-sm leading-6 text-muted">
            შეკვეთის გასაფორმებლად შედი ანგარიშში. ერთხელ შეიყვან მონაცემებს და შემდეგ შეკვეთებზე თავისით შეივსება. კალათა შენახული დაგხვდება.
          </p>
          <Link href="/login?next=/cart" className="flex h-12 items-center justify-center rounded-btn bg-accent font-bold text-white transition-colors hover:bg-accent-hover">
            შესვლა და შეკვეთა
          </Link>
          <Link href="/login?mode=register&next=/cart" className="flex h-12 items-center justify-center rounded-btn border border-line font-semibold transition-colors hover:border-neon/50">
            ანგარიშის შექმნა
          </Link>
          <p className="text-xs text-muted">
            ან შეუკვეთე ტელეფონით: <a href={site.phoneHref} className="text-neon underline">{site.phone}</a>
          </p>
        </div>
      )}
    </div>
  );
}
