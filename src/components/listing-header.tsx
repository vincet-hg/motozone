import { FilterBar, type FilterValues } from "./filter-bar";
import { HeadingIcon } from "./heading-icon";

export function ListingHeader({
  title,
  filters,
  heading: Heading = "h1",
  icon,
}: {
  title: string;
  filters?: FilterValues;
  heading?: "h1" | "h2";
  icon?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      {icon ? (
        <Heading className="flex items-center gap-3 text-xl leading-7 font-extrabold sm:text-2xl">
          <HeadingIcon>{icon}</HeadingIcon>
          {title}
        </Heading>
      ) : (
        <Heading className="border-l-4 border-accent pl-3 text-xl leading-7 font-extrabold sm:text-2xl">{title}</Heading>
      )}
      <FilterBar values={filters} />
    </div>
  );
}
