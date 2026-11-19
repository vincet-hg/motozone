"use client";

import { useState } from "react";
import { ChevronIcon } from "./icons";

// Price sorting only. Until one is picked the list keeps its default order (newest first)
// and the field shows "დალაგება" as a placeholder that cannot be chosen again.
export function SortSelect({ value, className }: { value: string; className: string }) {
  const [selected, setSelected] = useState(value === "price_asc" || value === "price_desc" ? value : "");
  return (
    <span className={`relative block ${className}`}>
      <select
        name="sort"
        defaultValue={selected}
        aria-label="დალაგება ფასით"
        onChange={(event) => {
          setSelected(event.currentTarget.value);
          event.currentTarget.form?.requestSubmit();
        }}
        className={`h-10 w-full cursor-pointer appearance-none rounded-btn border border-line bg-card pr-10 pl-3 text-sm [color-scheme:dark] transition-colors duration-200 hover:border-neon/40 focus:border-neon/60 focus:outline-none ${selected ? "text-fg" : "text-muted"}`}
      >
        <option value="" disabled hidden>
          დალაგება
        </option>
        <option value="price_asc">ფასი: ზრდადობით</option>
        <option value="price_desc">ფასი: კლებადობით</option>
      </select>
      <ChevronIcon aria-hidden="true" className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-neon" />
    </span>
  );
}
