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
        className="flex h-13 w-full items-center justify-center gap-2 rounded-btn bg-accent font-bold text-white shadow-[0_8px_30px_-8px_rgba(229,9,32,0.7)] transition-colors duration-200 hover:bg-accent-hover sm:w-80"
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
      className="flex size-11 shrink-0 items-center justify-center rounded-btn bg-accent text-white transition-all duration-200 hover:scale-105 hover:bg-accent-hover"
    >
      <Icon />
    </button>
  );
}
