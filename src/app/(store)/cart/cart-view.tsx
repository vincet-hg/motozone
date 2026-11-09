"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useEffect, useMemo, useState } from "react";
import { clearCart, setCartQty, useCart } from "@/lib/cart";
import { formatPrice, imageUrl } from "@/lib/format";
import { keepValues } from "@/lib/keep-values";
import type { ProductCard } from "@/lib/types";
import { getCartProducts, placeOrder, type OrderState } from "./actions";

const input = "h-11 w-full rounded border border-neutral-300 bg-white px-3 text-base";

export function CartView() {
  const cart = useCart();
  const [products, setProducts] = useState<ProductCard[] | null>(null);
  const [state, action, pending] = useActionState<OrderState, FormData>(placeOrder, {});

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
      <div className="mt-6 max-w-md rounded border border-neutral-200 p-5">
        <h2 className="text-lg font-bold">შეკვეთა მიღებულია</h2>
        <p className="mt-2">შეკვეთის ნომერი: #{state.orderId}</p>
        <p>ჯამი: {formatPrice(state.total ?? 0)}</p>
        <p className="mt-2 text-sm text-neutral-700">დასადასტურებლად დაგირეკავთ მითითებულ ნომერზე.</p>
        <Link href="/" className="mt-4 inline-block underline">
          პროდუქტებზე დაბრუნება
        </Link>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <p className="mt-6">
        კალათა ცარიელია.{" "}
        <Link href="/" className="underline">
          პროდუქტების ნახვა
        </Link>
      </p>
    );
  }

  if (!products) return <p className="mt-6 text-neutral-700">იტვირთება...</p>;

  const lines = cart.map((item) => ({ item, product: products.find((p) => p.id === item.id) }));
  const unavailable = lines.some(({ product }) => !product || product.stock === 0);
  const total = lines.reduce((sum, { item, product }) => sum + (product ? product.final_price * item.qty : 0), 0);
  const stepper = "flex size-10 items-center justify-center text-lg disabled:text-neutral-400";

  return (
    <div className="mt-4 grid gap-8 md:grid-cols-[1fr_360px]">
      <ul className="divide-y divide-neutral-200">
        {lines.map(({ item, product }) => (
          <li key={item.id} className="flex gap-3 py-3">
            <div className="relative size-20 shrink-0 overflow-hidden rounded border border-neutral-200 bg-white">
              {product?.images[0] && (
                <Image src={imageUrl(product.images[0])} alt="" fill sizes="96px" quality={75} className="object-contain p-1" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              {product ? (
                <Link href={`/product/${product.slug}`} prefetch={false} className="line-clamp-2 text-sm hover:underline">
                  {product.name}
                </Link>
              ) : (
                <p className="text-sm">პროდუქტი აღარ იყიდება</p>
              )}
              {product && product.stock === 0 && <p className="text-sm font-medium">მარაგში აღარ არის</p>}
              <div className="mt-1 flex items-center justify-between gap-2">
                {product && product.stock > 0 ? (
                  <div className="flex items-center rounded border border-neutral-300">
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
                {product && <span className="font-bold">{formatPrice(product.final_price * item.qty)}</span>}
              </div>
              <button type="button" className="mt-1 py-1 text-sm underline" onClick={() => setCartQty(item.id, 0)}>
                წაშლა
              </button>
            </div>
          </li>
        ))}
      </ul>

      <form action={action} onSubmit={keepValues(action)} className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <h2 className="font-bold">ჯამი</h2>
          <span className="text-xl font-bold">{formatPrice(total)}</span>
        </div>
        <input type="hidden" name="items" value={JSON.stringify(cart)} />
        <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
        <label className="text-sm">
          სახელი და გვარი
          <input name="name" required minLength={2} maxLength={100} autoComplete="name" className={`${input} mt-1`} />
        </label>
        <label className="text-sm">
          ტელეფონი
          <input name="phone" type="tel" required autoComplete="tel" inputMode="tel" className={`${input} mt-1`} />
        </label>
        <label className="text-sm">
          ქალაქი
          <input name="city" required minLength={2} maxLength={60} autoComplete="address-level2" className={`${input} mt-1`} />
        </label>
        <label className="text-sm">
          მისამართი
          <input name="address" required minLength={3} maxLength={300} autoComplete="street-address" className={`${input} mt-1`} />
        </label>
        <label className="text-sm">
          შენიშვნა (არასავალდებულო)
          <input name="note" maxLength={500} className={`${input} mt-1`} />
        </label>
        <p className="text-sm text-neutral-700">გადახდა მიტანისას.</p>
        {unavailable && <p className="text-sm font-medium">წაშალე პროდუქტი, რომელიც მარაგში აღარ არის.</p>}
        {state.error && (
          <p role="alert" className="text-sm font-medium text-red-700">
            {state.error}
          </p>
        )}
        <button type="submit" disabled={pending || unavailable} className="h-12 rounded bg-accent font-semibold hover:bg-[#e85f00] disabled:opacity-50">
          {pending ? "იგზავნება..." : "შეკვეთის გაფორმება"}
        </button>
      </form>
    </div>
  );
}
