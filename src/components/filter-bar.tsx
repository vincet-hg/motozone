import Form from "next/form";
import { SortSelect } from "./sort-select";

const field = "h-9 rounded border border-neutral-300 bg-white px-2 text-sm";

export type FilterValues = {
  q?: string;
  category?: string;
  min?: number;
  max?: number;
  sort?: string;
};

export function FilterBar({ values = {} }: { values?: FilterValues }) {
  return (
    <Form action="/search" prefetch={false} className="flex items-center gap-1.5">
      {values.q && <input type="hidden" name="q" value={values.q} />}
      {values.category && <input type="hidden" name="category" value={values.category} />}
      <input
        name="min"
        type="number"
        min="0"
        inputMode="numeric"
        placeholder="დან ₾"
        aria-label="მინიმალური ფასი"
        defaultValue={values.min}
        className={`${field} w-16 sm:w-20`}
      />
      <input
        name="max"
        type="number"
        min="0"
        inputMode="numeric"
        placeholder="მდე ₾"
        aria-label="მაქსიმალური ფასი"
        defaultValue={values.max}
        className={`${field} w-16 sm:w-20`}
      />
      <button type="submit" className="h-9 rounded border border-black px-2.5 text-sm font-medium hover:bg-black hover:text-white">
        ფილტრი
      </button>
      <SortSelect value={values.sort ?? "newest"} className={`${field} min-w-0 flex-1 sm:flex-none`} />
    </Form>
  );
}
