import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Splash } from "@/components/splash";
import { getCategories } from "@/lib/catalog";
import { isDemo } from "@/lib/demo";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const categories = await getCategories();

  return (
    <>
      <Splash />
      {isDemo && (
        <p className="bg-fg px-3 py-1 text-center text-sm font-medium text-bg">
          დემო რეჟიმი: სატესტო მონაცემები, ინახება მხოლოდ ამ კომპიუტერში
        </p>
      )}
      <SiteHeader categories={categories} />
      <div className="flex-1">{children}</div>
      <SiteFooter categories={categories} />
    </>
  );
}
