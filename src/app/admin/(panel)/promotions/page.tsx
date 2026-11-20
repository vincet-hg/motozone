import { discountPercent, formatPrice } from "@/lib/format";
import { requireAdmin } from "@/lib/supabase-server";
import type { ProductCard, Promotion } from "@/lib/types";
import { deletePromotion, savePromotion } from "../../actions";
import { ConfirmButton } from "../../ui";
import { formatDate } from "../orders/status";

type Search = { saved?: string; error?: string };

const field = "mt-1 h-9 w-full rounded-lg border border-a-line bg-a-card px-2 text-sm";

// The value for <input type="datetime-local">, in Tbilisi time (UTC+4).
const localValue = (iso: string | null) => (iso ? new Date(Date.parse(iso) + 4 * 3600000).toISOString().slice(0, 16) : "");

function status(promotion: Promotion, product: ProductCard | undefined) {
  if (!product) return { label: "პროდუქტი წაშლილია ან დამალულია", tone: "text-[#ff6b77]" };
  if (!promotion.active) return { label: "გამორთულია", tone: "text-a-muted" };
  if (promotion.ends_at && Date.parse(promotion.ends_at) <= Date.now()) return { label: "დასრულდა", tone: "text-a-muted" };
  if (product.images.length === 0) return { label: "პროდუქტს ფოტო არ აქვს, არ ჩანს", tone: "text-[#ff6b77]" };
  return { label: "ჩანს მთავარ გვერდზე", tone: "text-a-green" };
}

function PromotionFields({ promotion, products }: { promotion?: Promotion; products: ProductCard[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="text-sm sm:col-span-2">
        პროდუქტი (ფოტო და ფასი აქედან მოდის)
        <select name="product_id" required defaultValue={promotion?.product_id ?? ""} className={field}>
          <option value="" disabled>აირჩიე პროდუქტი</option>
          {products.map((product) => {
            const discount = discountPercent(product.price, product.sale_price);
            return (
              <option key={product.id} value={product.id}>
                {product.name}, {formatPrice(product.final_price)}{discount > 0 ? ` (-${discount}%)` : ""}
              </option>
            );
          })}
        </select>
      </label>
      <label className="text-sm font-medium text-a-soft">
        სათაური
        <input name="title" required minLength={2} maxLength={80} defaultValue={promotion?.title} placeholder="ზამთრის აქცია" className={field} />
      </label>
      <label className="text-sm font-medium text-a-soft">
        ნიშანი (არასავალდებულო)
        <input name="badge" maxLength={30} defaultValue={promotion?.badge} placeholder="ცხელი შეთავაზება" className={field} />
      </label>
      <label className="text-sm sm:col-span-2">
        მოკლე აღწერა
        <input name="description" maxLength={240} defaultValue={promotion?.description} className={field} />
      </label>
      <label className="text-sm font-medium text-a-soft">
        ღილაკის ტექსტი
        <input name="cta_label" maxLength={30} defaultValue={promotion?.cta_label ?? "ყიდვა"} className={field} />
      </label>
      <label className="text-sm font-medium text-a-soft">
        მთავრდება (თბილისის დროით, ცარიელი = უვადო)
        <input name="ends_at" type="datetime-local" defaultValue={localValue(promotion?.ends_at ?? null)} className={field} />
      </label>
      <label className="text-sm font-medium text-a-soft">
        რიგი
        <input name="position" type="number" defaultValue={promotion?.position ?? 0} className={field} />
      </label>
      <label className="flex items-center gap-2 self-end pb-2 text-sm">
        <input name="active" type="checkbox" defaultChecked={promotion?.active ?? true} className="size-4" />
        ჩართულია
      </label>
    </div>
  );
}

export default async function PromotionsPage({ searchParams }: { searchParams: Promise<Search> }) {
  const notice = await searchParams;
  const supabase = await requireAdmin();
  const [{ data: promotionRows }, { data: productRows }] = await Promise.all([
    supabase.from("promotions").select("*").order("position").order("created_at"),
    supabase.from("products").select("id,slug,name,price,sale_price,final_price,stock,images").eq("active", true).order("name").limit(1000),
  ]);
  const promotions = (promotionRows ?? []) as Promotion[];
  const products = (productRows ?? []) as ProductCard[];

  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight">მთავარი გვერდის სლაიდერი</h1>
      <p className="mt-1 max-w-3xl text-sm text-a-soft">
        თითო სლაიდი ერთ პროდუქტს აჩვენებს: მის ფოტოს, ფასს და ფასდაკლებას. ფასდაკლება პროდუქტის გვერდზე იცვლება. დასრულების დროის შემდეგ სლაიდი
        თავისით ქრება, ტაიმერი კი ზუსტ დროს ითვლის, გვერდის განახლებისას თავიდან არ იწყება.
      </p>
      {notice.saved && <p role="status" className="mt-3 rounded-xl border border-a-green/30 bg-a-green/10 p-3 text-sm text-[#5fe0a0]">{notice.saved}</p>}
      {notice.error && <p role="alert" className="mt-3 rounded-xl border border-a-red/30 bg-a-red/10 p-3 text-sm text-[#ff8a94]">{notice.error}</p>}

      <form action={savePromotion} className="mt-4 max-w-3xl space-y-3 rounded-2xl border border-a-line bg-a-card p-4 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.8)]">
        <h2 className="font-semibold text-a-text">ახალი სლაიდი</h2>
        <PromotionFields products={products} />
        <button className="h-9 rounded-xl bg-gradient-to-r from-a-purple to-a-violet shadow-[0_8px_24px_-10px_rgba(227,18,11,0.9)] transition-all duration-200 hover:-translate-y-px hover:shadow-[0_0_24px_-4px_rgba(255,81,72,0.55)] px-4 text-sm font-semibold text-white">დამატება</button>
      </form>

      <div className="mt-6 max-w-3xl space-y-3">
        {promotions.length === 0 && <p className="text-sm text-a-soft">სლაიდები ჯერ არ არის. მანამდე მთავარ გვერდზე ზოგადი ბანერი ჩანს.</p>}
        {promotions.map((promotion) => {
          const product = products.find((item) => item.id === promotion.product_id);
          const state = status(promotion, product);
          return (
            <details key={promotion.id} className="rounded-2xl border border-a-line bg-a-card shadow-[0_10px_30px_-18px_rgba(0,0,0,0.8)]">
              <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-2 p-3">
                <span className="font-semibold">{promotion.title}</span>
                <span className="text-sm text-a-soft">
                  {product?.name ?? "-"} · {promotion.ends_at ? `მთავრდება ${formatDate(promotion.ends_at)}` : "უვადო"} ·{" "}
                  <span className={state.tone}>{state.label}</span>
                </span>
              </summary>
              <div className="border-t border-a-line p-3">
                <form action={savePromotion} className="space-y-3">
                  <input type="hidden" name="id" value={promotion.id} />
                  <PromotionFields promotion={promotion} products={products} />
                  <button className="h-9 rounded-xl border border-a-line bg-a-hover/70 transition-colors duration-200 hover:border-a-violet/60 hover:bg-a-hover px-3 text-sm text-white">შენახვა</button>
                </form>
                <form action={deletePromotion} className="mt-3">
                  <input type="hidden" name="id" value={promotion.id} />
                  <ConfirmButton message={`წავშალო სლაიდი „${promotion.title}“?`} className="text-sm text-[#ff6b77] underline">
                    წაშლა
                  </ConfirmButton>
                </form>
              </div>
            </details>
          );
        })}
      </div>
    </>
  );
}
