import type { Metadata } from "next";
import { WishlistView } from "./wishlist-view";

export const metadata: Metadata = { title: "სურვილები", robots: { index: false } };

export default function WishlistPage() {
  return (
    <main className="mx-auto max-w-7xl px-3 py-6 sm:px-4">
      <h1 className="mb-4 border-l-4 border-accent pl-3 text-2xl font-extrabold">სურვილები</h1>
      <WishlistView />
    </main>
  );
}
