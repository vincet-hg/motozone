import { PageLoadingScreen } from "@/components/navigation-loader";

// While an admin page loads, the menu stays and the site's loading screen comes up after a moment.
export default function AdminLoading() {
  return (
    <div className="min-h-[60dvh]" aria-busy="true" aria-label="იტვირთება">
      <PageLoadingScreen />
    </div>
  );
}
