"use client";

import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";
import { useActionState, useState } from "react";
import { isDemo } from "@/lib/demo";
import { imageUrl } from "@/lib/format";
import { keepValues } from "@/lib/keep-values";
import type { Category, Product } from "@/lib/types";
import { saveProduct, type FormState } from "../../actions";

const field = "mt-1.5 w-full rounded-xl border px-3.5 py-2.5 font-normal";
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
    const storage = isDemo ? null : createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!).storage;

    for (const file of files) {
      try {
        const { blob, extension, type } = await prepareImage(file);
        const path = `${crypto.randomUUID()}.${extension}`;
        if (storage) {
          const { error: uploadError } = await storage
            .from("product-images")
            .upload(path, blob, { contentType: type, cacheControl: "31536000" });
          if (uploadError) throw uploadError;
        } else {
          const response = await fetch(imageUrl(path), { method: "PUT", body: blob, headers: { "Content-Type": type } });
          if (!response.ok) throw new Error("upload failed");
        }
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
      <p className="text-sm font-medium text-a-soft">ფოტოები (პირველი ფოტო მთავარია)</p>
      <input type="hidden" name="images" value={JSON.stringify(images)} />
      <div className="mt-1 flex flex-wrap gap-2">
        {images.map((path, index) => (
          <div key={path} className="w-24">
            {/* Admin-only preview of a just-uploaded file. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl(path)} alt="" className={`size-24 rounded-lg border-2 object-contain bg-white ${index === 0 ? "border-a-violet" : "border-a-line"}`} />
            <div className="mt-1 flex justify-between text-xs">
              {index > 0 ? (
                <button type="button" className="underline" onClick={() => setImages([path, ...images.filter((p) => p !== path)])}>
                  მთავარი
                </button>
              ) : (
                <span />
              )}
              <button type="button" className="text-[#ff6b77] underline" onClick={() => setImages(images.filter((p) => p !== path))}>
                წაშლა
              </button>
            </div>
          </div>
        ))}
      </div>
      {images.length < MAX_IMAGES && (
        <label className="mt-2 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-a-violet/50 bg-a-purple/10 px-4 py-3 text-sm font-medium text-[#c4b0ff] transition-colors hover:border-a-violet hover:bg-a-purple/20">
          {uploading ? "იტვირთება..." : "ფოტოს ატვირთვა"}
          <input type="file" accept="image/*" multiple disabled={uploading} onChange={upload} className="sr-only" />
        </label>
      )}
      {error && <p role="alert" className="mt-1 text-sm text-[#ff6b77]">{error}</p>}
    </div>
  );
}

export function ProductForm({ product, categories }: { product?: Product; categories: Category[] }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveProduct, {});

  return (
    <form action={action} onSubmit={keepValues(action)} className="max-w-3xl space-y-4 rounded-2xl border border-a-line bg-a-card p-4 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.8)]">
      {product && <input type="hidden" name="id" value={product.id} />}
      <label className="block text-sm font-medium text-a-soft">
        სახელი
        <input name="name" required maxLength={200} defaultValue={product?.name} className={field} />
      </label>
      <label className="block text-sm font-medium text-a-soft">
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
        <label className="text-sm font-medium text-a-soft">
          ფასი (₾)
          <input name="price" type="number" min="0" step="0.01" required defaultValue={product?.price} className={field} />
        </label>
        <label className="text-sm font-medium text-a-soft">
          ფასდაკლებით (₾)
          <input name="sale_price" type="number" min="0" step="0.01" defaultValue={product?.sale_price ?? ""} className={field} />
        </label>
        {product ? (
          <div className="text-sm">
            მარაგი
            <p className="mt-1 py-2">
              <b>{product.stock}</b>{" "}
              <a href="#stock" className="text-a-soft underline">
                შესყიდვით ან კორექციით
              </a>
            </p>
          </div>
        ) : (
          <span />
        )}
      </div>
      {!product && (
        <fieldset className="grid grid-cols-2 gap-3 rounded-xl border border-a-line bg-a-panel/60 p-3">
          <legend className="px-1 text-sm font-medium">საწყისი მარაგი (არასავალდებულო)</legend>
          <label className="text-sm font-medium text-a-soft">
            რაოდენობა
            <input name="opening_qty" type="number" min="0" step="1" className={field} />
          </label>
          <label className="text-sm font-medium text-a-soft">
            შესყიდვის ფასი ცალზე (₾)
            <input name="opening_cost" type="number" min="0" step="0.01" className={field} />
          </label>
          <p className="col-span-2 text-xs text-a-muted">შემდეგი პარტიები პროდუქტის გვერდზე, „შესყიდვის დამატებით“ შეგყავს. ასე თვითღირებულება და მოგება ზუსტად ითვლება.</p>
        </fieldset>
      )}
      <ImageManager initial={product?.images ?? []} />
      <label className="block text-sm font-medium text-a-soft">
        აღწერა
        <textarea name="description" rows={5} defaultValue={product?.description} className={field} />
      </label>
      <label className="block text-sm font-medium text-a-soft">
        მახასიათებლები (თითო ხაზზე: სახელი: მნიშვნელობა)
        <textarea
          name="specs"
          rows={4}
          placeholder={"ძაბვა: 12V\nდიამეტრი: 22 მმ"}
          defaultValue={product?.specs.map((spec) => `${spec.label}: ${spec.value}`).join("\n")}
          className={field}
        />
      </label>
      <label className="block text-sm font-medium text-a-soft">
        თავსებადობა
        <textarea name="compatibility" rows={2} defaultValue={product?.compatibility} className={field} />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input name="active" type="checkbox" defaultChecked={product?.active ?? true} className="size-4" />
        ჩანს მაღაზიაში
      </label>
      {state.error && <p role="alert" className="text-sm text-[#ff6b77]">{state.error}</p>}
      <div className="flex items-center gap-4">
        <button disabled={pending} className="h-11 rounded-xl bg-gradient-to-r from-a-purple to-a-violet shadow-[0_8px_24px_-10px_rgba(139,92,246,0.9)] transition-all duration-200 hover:-translate-y-px hover:shadow-[0_0_24px_-4px_rgba(139,92,246,0.8)] px-6 font-semibold text-white disabled:opacity-50">
          {pending ? "ინახება..." : "პროდუქტის შენახვა"}
        </button>
        <Link href="/admin/products" className="text-sm underline">
          გაუქმება
        </Link>
      </div>
    </form>
  );
}
