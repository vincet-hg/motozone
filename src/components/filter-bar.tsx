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
    <Form action="/search" prefetch={false} className="grid grid-cols-[1fr_1fr_auto] items-center gap-1.5 sm:flex">
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
        className={`${field} w-full min-w-0 sm:w-24`}
      />
      <input
        name="max"
        type="number"
        min="0"
        inputMode="numeric"
        placeholder="მდე ₾"
        aria-label="მაქსიმალური ფასი"
        defaultValue={values.max}
        className={`${field} w-full min-w-0 sm:w-24`}
      />
      <button type="submit" className="h-10 rounded-btn bg-fg px-3 text-sm font-semibold text-bg transition-colors duration-200 hover:bg-white">
        ფილტრი
      </button>
      <SortSelect value={values.sort ?? "newest"} className={`${field} col-span-3 w-full min-w-0 sm:w-auto`} />
    </Form>
  );
}
