"use client";

import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";
import { useActionState, useState } from "react";
import { imageUrl } from "@/lib/format";
import { keepValues } from "@/lib/keep-values";
import type { Category, Product } from "@/lib/types";
import { saveProduct, type FormState } from "../../actions";

const field = "mt-1 w-full rounded border border-neutral-300 bg-white px-3 py-2";
const MAX_IMAGES = 8;
const MAX_SIDE = 1600;

// Large phone photos are shrunk in the browser before upload.
async function prepareImage(file: File) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const context = canvas.getContext("2d")!;
  context.fillStyle = "#fff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const encode = (type: string, quality: number) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));

  const webp = await encode("image/webp", 0.85);
  if (webp?.type === "image/webp") return { blob: webp, extension: "webp", type: "image/webp" };
  const jpeg = await encode("image/jpeg", 0.85);
  if (!jpeg) throw new Error("encode failed");
  return { blob: jpeg, extension: "jpg", type: "image/jpeg" };
}

function ImageManager({ initial }: { initial: string[] }) {
  const [images, setImages] = useState(initial);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function upload(event: React.ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const files = [...(input.files ?? [])].slice(0, MAX_IMAGES - images.length);
    if (files.length === 0) return;
    setUploading(true);
    setError("");
    const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

    for (const file of files) {
      try {
        const { blob, extension, type } = await prepareImage(file);
        const path = `${crypto.randomUUID()}.${extension}`;
        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(path, blob, { contentType: type, cacheControl: "31536000" });
        if (uploadError) throw uploadError;
        setImages((current) => [...current, path]);
      } catch {
        setError(`ფოტო ვერ აიტვირთა: ${file.name}`);
      }
    }
    setUploading(false);
    input.value = "";
  }

  return (
    <div>
      <p className="text-sm">ფოტოები (პირველი ფოტო მთავარია)</p>
      <input type="hidden" name="images" value={JSON.stringify(images)} />
      <div className="mt-1 flex flex-wrap gap-2">
        {images.map((path, index) => (
          <div key={path} className="w-24">
            {/* Admin-only preview of a just-uploaded file. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl(path)} alt="" className={`size-24 rounded border-2 object-contain bg-white ${index === 0 ? "border-accent" : "border-neutral-200"}`} />
            <div className="mt-1 flex justify-between text-xs">
              {index > 0 ? (
                <button type="button" className="underline" onClick={() => setImages([path, ...images.filter((p) => p !== path)])}>
                  მთავარი
                </button>
              ) : (
                <span />
              )}
              <button type="button" className="text-red-700 underline" onClick={() => setImages(images.filter((p) => p !== path))}>
                წაშლა
              </button>
            </div>
          </div>
        ))}
      </div>
      {images.length < MAX_IMAGES && (
        <label className="mt-2 inline-block cursor-pointer rounded border border-black px-3 py-2 text-sm">
          {uploading ? "იტვირთება..." : "ფოტოს ატვირთვა"}
          <input type="file" accept="image/*" multiple disabled={uploading} onChange={upload} className="sr-only" />
        </label>
      )}
      {error && <p role="alert" className="mt-1 text-sm text-red-700">{error}</p>}
    </div>
  );
}

export function ProductForm({ product, categories }: { product?: Product; categories: Category[] }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveProduct, {});

  return (
    <form action={action} onSubmit={keepValues(action)} className="max-w-3xl space-y-4 rounded border border-neutral-200 bg-white p-4">
      {product && <input type="hidden" name="id" value={product.id} />}
      <label className="block text-sm">
        სახელი
        <input name="name" required maxLength={200} defaultValue={product?.name} className={field} />
      </label>
      <label className="block text-sm">
        კატეგორია
        <select name="category_id" defaultValue={product?.category_id ?? ""} className={field}>
          <option value="">კატეგორიის გარეშე</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>
      <div className="grid grid-cols-3 gap-3">
        <label className="text-sm">
          ფასი (₾)
          <input name="price" type="number" min="0" step="0.01" required defaultValue={product?.price} className={field} />
        </label>
        <label className="text-sm">
          ფასდაკლებით (₾)
          <input name="sale_price" type="number" min="0" step="0.01" defaultValue={product?.sale_price ?? ""} className={field} />
        </label>
        <label className="text-sm">
          მარაგი
          <input name="stock" type="number" min="0" step="1" required defaultValue={product?.stock ?? 0} className={field} />
        </label>
      </div>
      <ImageManager initial={product?.images ?? []} />
      <label className="block text-sm">
        აღწერა
        <textarea name="description" rows={5} defaultValue={product?.description} className={field} />
      </label>
      <label className="block text-sm">
        მახასიათებლები (თითო ხაზზე: სახელი: მნიშვნელობა)
        <textarea
          name="specs"
          rows={4}
          placeholder={"ძაბვა: 12V\nდიამეტრი: 22 მმ"}
          defaultValue={product?.specs.map((spec) => `${spec.label}: ${spec.value}`).join("\n")}
          className={field}
        />
      </label>
      <label className="block text-sm">
        თავსებადობა
        <textarea name="compatibility" rows={2} defaultValue={product?.compatibility} className={field} />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input name="active" type="checkbox" defaultChecked={product?.active ?? true} className="size-4" />
        ჩანს მაღაზიაში
      </label>
      {state.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}
      <div className="flex items-center gap-4">
        <button disabled={pending} className="h-11 rounded bg-accent px-6 font-semibold disabled:opacity-50">
          {pending ? "ინახება..." : "პროდუქტის შენახვა"}
        </button>
        <Link href="/admin/products" className="text-sm underline">
          გაუქმება
        </Link>
      </div>
    </form>
  );
}
