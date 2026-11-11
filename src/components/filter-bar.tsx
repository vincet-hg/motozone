import Form from "next/form";
import { SortSelect } from "./sort-select";

const field = "h-10 rounded-btn border border-line bg-card px-3 text-sm text-fg placeholder:text-muted";

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
      <button type="submit" className="h-10 rounded-btn bg-fg px-3 text-sm font-semibold text-bg transition-colors duration-200 hover:bg-white">
        ფილტრი
      </button>
      <SortSelect value={values.sort ?? "newest"} className={`${field} min-w-0 flex-1 sm:flex-none`} />
    </Form>
  );
}
