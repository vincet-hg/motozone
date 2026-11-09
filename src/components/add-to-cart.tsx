"use client";

import { useEffect, useState } from "react";
import { addToCart } from "@/lib/cart";
import { CartIcon, CheckIcon } from "./icons";

export function AddToCart({ id, stock, large = false }: { id: string; stock: number; large?: boolean }) {
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!added) return;
    const timer = setTimeout(() => setAdded(false), 1200);
    return () => clearTimeout(timer);
  }, [added]);

  function add() {
    addToCart(id, stock);
    setAdded(true);
  }

  const Icon = added ? CheckIcon : CartIcon;

  if (large) {
    return (
      <button
        type="button"
        onClick={add}
        className="flex h-12 w-full items-center justify-center gap-2 rounded bg-accent font-semibold hover:bg-[#e85f00] sm:w-72"
      >
        <Icon />
        {added ? "დამატებულია" : "კალათაში დამატება"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={add}
      aria-label={added ? "დამატებულია" : "კალათაში დამატება"}
      className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent hover:bg-[#e85f00]"
    >
      <Icon />
    </button>
  );
}
