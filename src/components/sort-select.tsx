"use client";

export function SortSelect({ value, className }: { value: string; className: string }) {
  return (
    <select
      name="sort"
      defaultValue={value}
      aria-label="დალაგება"
      onChange={(event) => event.currentTarget.form?.requestSubmit()}
      className={className}
    >
      <option value="newest">უახლესი</option>
      <option value="price_asc">ფასი: დაბალი</option>
      <option value="price_desc">ფასი: მაღალი</option>
    </select>
  );
}
