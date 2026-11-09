import { FilterBar, type FilterValues } from "./filter-bar";

export function ListingHeader({
  title,
  filters,
  heading: Heading = "h1",
}: {
  title: string;
  filters?: FilterValues;
  heading?: "h1" | "h2";
}) {
  return (
    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <Heading className="border-l-4 border-accent pl-2 text-lg leading-6 font-bold">{title}</Heading>
      <FilterBar values={filters} />
    </div>
  );
}
