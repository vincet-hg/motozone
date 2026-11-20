import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Splash } from "@/components/splash";
import { AccountWatcher } from "@/components/account-watcher";
import { getCategories } from "@/lib/catalog";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const categories = await getCategories();

  return (
    <>
      <Splash />
      <AccountWatcher />
      <SiteHeader categories={categories} />
      <div className="flex-1">{children}</div>
      <SiteFooter categories={categories} />
    </>
  );
}
