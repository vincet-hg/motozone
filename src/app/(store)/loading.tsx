import { PageLoading } from "@/components/navigation-loader";

// Shown while a store page loads: the same shapes as the content, so nothing jumps when it arrives.
// If it takes longer than a moment, the site's loading screen comes up over it (PageLoading).
export default function Loading() {
  const block = "animate-pulse rounded-card bg-card";
  return (
    <div className="mx-auto max-w-7xl px-3 py-8 sm:px-4" aria-busy="true" aria-label="იტვირთება">
      <PageLoading />
      <div className={`${block} h-64 sm:h-80`} />
      <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 10 }, (_, index) => (
          <div key={index} className="space-y-3 rounded-card border border-line bg-card p-2">
            <div className="aspect-square animate-pulse rounded-xl bg-card-hover" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-card-hover" />
            <div className="h-5 w-1/3 animate-pulse rounded bg-card-hover" />
          </div>
        ))}
      </div>
    </div>
  );
}
