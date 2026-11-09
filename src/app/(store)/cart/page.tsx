import type { Metadata } from "next";
import { CartView } from "./cart-view";

export const metadata: Metadata = { title: "კალათა", robots: { index: false } };

export default function CartPage() {
  return (
    <main className="mx-auto max-w-5xl px-3 py-4 sm:px-4 md:py-8">
      <h1 className="text-xl font-bold">კალათა</h1>
      <CartView />
    </main>
  );
}
