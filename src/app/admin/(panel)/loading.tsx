import { PageLoading } from "@/components/navigation-loader";

// While an admin page loads, the menu stays and the site's loading screen comes up after a moment.
export default function Loading() {
  return (
    <div aria-busy="true" aria-label="იტვირთება">
      <PageLoading />
    </div>
  );
}
