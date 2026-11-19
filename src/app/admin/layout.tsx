import { Splash } from "@/components/splash";

// Same loading screen as the store on a full page load; it stays mounted while moving between admin pages.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Splash />
      {children}
    </>
  );
}
