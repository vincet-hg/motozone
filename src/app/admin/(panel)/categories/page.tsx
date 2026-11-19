import { requireAdmin } from "@/lib/supabase-server";
import type { Category } from "@/lib/types";
import { addCategory, deleteCategory, updateCategory } from "../../actions";
import { ConfirmButton } from "../../ui";

const field = "h-9 rounded-lg border border-a-line bg-a-card px-2 text-sm";

export default async function AdminCategoriesPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const supabase = await requireAdmin();
  const { data } = await supabase.from("categories").select("*").order("position");
  const categories = (data ?? []) as Category[];

  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight">კატეგორიები</h1>
      {error && <p role="alert" className="mt-3 rounded-xl border border-a-red/30 bg-a-red/10 p-3 text-sm text-[#ff8a94]">{error}</p>}

      <form action={addCategory} className="mt-4 flex flex-wrap gap-2">
        <input name="name" required maxLength={80} placeholder="ახალი კატეგორია" className={`${field} flex-1 sm:max-w-xs`} />
        <input name="position" type="number" placeholder="რიგი" aria-label="რიგი" defaultValue={categories.length + 1} className={`${field} w-20`} />
        <input name="description" maxLength={2000} placeholder="მოკლე აღწერა (Google-ისთვის)" aria-label="აღწერა" className={`${field} w-full sm:flex-1`} />
        <button className="h-9 rounded-xl bg-gradient-to-r from-a-purple to-a-violet shadow-[0_8px_24px_-10px_rgba(139,92,246,0.9)] transition-all duration-200 hover:-translate-y-px hover:shadow-[0_0_24px_-4px_rgba(139,92,246,0.8)] px-4 text-sm font-semibold text-white">დამატება</button>
      </form>

      <ul className="mt-4 divide-y divide-a-line/60 rounded-2xl border border-a-line bg-a-card shadow-[0_10px_30px_-18px_rgba(0,0,0,0.8)]">
        {categories.map((category) => (
          <li key={category.id} className="flex flex-wrap items-center gap-2 p-2">
            <form action={updateCategory} className="flex flex-1 flex-wrap items-center gap-2">
              <input type="hidden" name="id" value={category.id} />
              <input name="name" required maxLength={80} defaultValue={category.name} aria-label="სახელი" className={`${field} flex-1 sm:max-w-xs`} />
              <input name="position" type="number" defaultValue={category.position} aria-label="რიგი" className={`${field} w-20`} />
              <textarea
                name="description"
                maxLength={2000}
                rows={2}
                defaultValue={category.description}
                placeholder="აღწერა: ჩანს კატეგორიის გვერდზე და Google-ში"
                aria-label="აღწერა"
                className="w-full rounded-lg border border-a-line bg-a-card px-2 py-1 text-sm"
              />
              <button className="h-9 rounded-xl border border-a-line bg-a-hover/70 transition-colors duration-200 hover:border-a-violet/60 hover:bg-a-hover px-3 text-sm text-white">შენახვა</button>
            </form>
            <form action={deleteCategory}>
              <input type="hidden" name="id" value={category.id} />
              <ConfirmButton message={`წავშალო „${category.name}“?`} className="text-sm text-[#ff6b77] underline">
                წაშლა
              </ConfirmButton>
            </form>
          </li>
        ))}
      </ul>
    </>
  );
}
