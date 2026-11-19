import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Splash } from "@/components/splash";
import { getCategories } from "@/lib/catalog";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const categories = await getCategories();

  return (
    <>
      <Splash />
      <SiteHeader categories={categories} />
      <div className="flex-1">{children}</div>
      <SiteFooter categories={categories} />
    </>
  );
}
