import { PageLoading } from "@/components/navigation-loader";

// Shown while a store page loads. No placeholder cards: the area stays empty (tall enough that the
// footer does not jump up) and the site's loading screen comes up over it after a moment (PageLoading).
export default function Loading() {
  return (
    <div className="min-h-[70dvh]" aria-busy="true" aria-label="იტვირთება">
      <PageLoading />
    </div>
  );
}
