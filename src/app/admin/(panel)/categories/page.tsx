import { requireAdmin } from "@/lib/supabase-server";
import type { Category } from "@/lib/types";
import { addCategory, deleteCategory, updateCategory } from "../../actions";
import { ConfirmButton } from "../../ui";

const field = "h-9 rounded border border-neutral-300 bg-white px-2 text-sm";

export default async function AdminCategoriesPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const supabase = await requireAdmin();
  const { data } = await supabase.from("categories").select("*").order("position");
  const categories = (data ?? []) as Category[];

  return (
    <>
      <h1 className="text-xl font-bold">კატეგორიები</h1>
      {error && <p role="alert" className="mt-3 rounded bg-red-100 p-2 text-sm text-red-800">{error}</p>}

      <form action={addCategory} className="mt-4 flex flex-wrap gap-2">
        <input name="name" required maxLength={80} placeholder="ახალი კატეგორია" className={`${field} flex-1 sm:max-w-xs`} />
        <input name="position" type="number" placeholder="რიგი" aria-label="რიგი" defaultValue={categories.length + 1} className={`${field} w-20`} />
        <button className="h-9 rounded bg-accent px-4 text-sm font-semibold">დამატება</button>
      </form>

      <ul className="mt-4 divide-y divide-neutral-100 rounded border border-neutral-200 bg-white">
        {categories.map((category) => (
          <li key={category.id} className="flex flex-wrap items-center gap-2 p-2">
            <form action={updateCategory} className="flex flex-1 flex-wrap items-center gap-2">
              <input type="hidden" name="id" value={category.id} />
              <input name="name" required maxLength={80} defaultValue={category.name} aria-label="სახელი" className={`${field} flex-1 sm:max-w-xs`} />
              <input name="position" type="number" defaultValue={category.position} aria-label="რიგი" className={`${field} w-20`} />
              <button className="h-9 rounded bg-black px-3 text-sm text-white">შენახვა</button>
            </form>
            <form action={deleteCategory}>
              <input type="hidden" name="id" value={category.id} />
              <ConfirmButton message={`წავშალო „${category.name}“?`} className="text-sm text-red-700 underline">
                წაშლა
              </ConfirmButton>
            </form>
          </li>
        ))}
      </ul>
    </>
  );
}
