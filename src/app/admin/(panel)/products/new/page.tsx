import { requireAdmin } from "@/lib/supabase-server";
import type { Category } from "@/lib/types";
import { ProductForm } from "../product-form";

export default async function NewProductPage() {
  const supabase = await requireAdmin();
  const { data } = await supabase.from("categories").select("*").order("position");

  return (
    <>
      <h1 className="mb-4 text-xl font-bold">პროდუქტის დამატება</h1>
      <ProductForm categories={(data ?? []) as Category[]} />
    </>
  );
}
