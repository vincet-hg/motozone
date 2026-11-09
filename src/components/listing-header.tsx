import { FilterBar, type FilterValues } from "./filter-bar";

export function ListingHeader({ title, filters }: { title: string; filters?: FilterValues }) {
  return (
    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <h1 className="text-lg font-bold">{title}</h1>
      <FilterBar values={filters} />
    </div>
  );
}
