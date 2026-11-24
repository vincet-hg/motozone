import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { FirstLoadScreen } from "@/components/loading-screen";
import { AccountWatcher } from "@/components/account-watcher";
import { LoginPrompt } from "@/components/login-prompt";
import { PageTransition } from "@/components/page-transition";
import { getCategories } from "@/lib/catalog";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const categories = await getCategories();

  return (
    <>
      <FirstLoadScreen />
      <AccountWatcher />
      <LoginPrompt />
      <SiteHeader categories={categories} />
      <div className="flex-1">
        <PageTransition>{children}</PageTransition>
      </div>
      <SiteFooter categories={categories} />
    </>
  );
}
