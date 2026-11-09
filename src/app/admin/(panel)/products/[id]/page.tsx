import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/supabase-server";
import type { Category, Product } from "@/lib/types";
import { ProductForm } from "../product-form";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await requireAdmin();
  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).maybeSingle(),
    supabase.from("categories").select("*").order("position"),
  ]);
  if (!product) notFound();

  return (
    <>
      <h1 className="mb-4 text-xl font-bold">პროდუქტის რედაქტირება</h1>
      <ProductForm product={product as Product} categories={(categories ?? []) as Category[]} />
    </>
  );
}
