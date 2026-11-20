import type { Metadata } from "next";
import Link from "next/link";
import { HeadingIcon } from "@/components/heading-icon";
import { LogoutIcon, UserIcon } from "@/components/icons";
import { getCustomerOrders, getProfile, requireCustomer } from "@/lib/account";
import { formatPrice } from "@/lib/format";
import type { OrderStatus } from "@/lib/types";
import { formatDate, STATUS_LABELS } from "../../admin/(panel)/orders/status";
import { signOut } from "../login/actions";
import { ProfileForm } from "./profile-form";

export const metadata: Metadata = { title: "ჩემი ანგარიში", robots: { index: false, follow: false } };

// New = awaiting the confirmation call; then on its way; delivered; cancelled.
const STATUS_TONES: Record<OrderStatus, string> = {
  new: "border-amber-400/40 bg-amber-400/10 text-amber-200",
  confirmed: "border-sky-400/40 bg-sky-400/10 text-sky-200",
  shipped: "border-sky-400/40 bg-sky-400/10 text-sky-200",
  delivered: "border-emerald-400/40 bg-emerald-400/10 text-emerald-200",
  cancelled: "border-line bg-bg text-muted",
};

const STATUS_HINTS: Partial<Record<OrderStatus, string>> = {
  new: "დასადასტურებლად დაგირეკავთ",
  confirmed: "მზადდება",
  shipped: "კურიერთან არის",
};

export default async function AccountPage() {
  const customer = await requireCustomer("/account");
  const [profile, orders] = await Promise.all([getProfile(customer.id), getCustomerOrders(customer.id)]);
  const signedInAs = customer.email ?? customer.phone?.replace(/^\+995(\d{3})(\d{2})(\d{2})(\d{2})$/, "+995 $1 $2 $3 $4") ?? "";

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="flex items-center gap-3 text-2xl font-extrabold sm:text-[28px]">
          <HeadingIcon>
            <UserIcon className="size-5" />
          </HeadingIcon>
          ჩემი ანგარიში
        </h1>
        <form action={signOut}>
          <button className="flex h-10 cursor-pointer items-center gap-2 rounded-btn border border-line px-4 text-sm text-muted transition-colors hover:border-neon/50 hover:text-fg">
            <LogoutIcon className="size-4" />
            გასვლა
          </button>
        </form>
      </div>
      <p className="mt-2 text-sm text-muted">
        შესული ხარ როგორც <span className="text-fg">{signedInAs}</span>
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <section aria-labelledby="orders-title" className="min-w-0">
          <h2 id="orders-title" className="text-lg font-bold">შეკვეთები</h2>
          {orders.length === 0 ? (
            <div className="mt-3 rounded-card border border-line bg-card p-6 text-center">
              <p className="text-muted">ჯერ შეკვეთა არ გაქვს.</p>
              <Link href="/search" className="mt-3 inline-block font-semibold text-neon underline">
                პროდუქტების ნახვა
              </Link>
            </div>
          ) : (
            <ul className="mt-3 space-y-3">
              {orders.map((order) => {
                const fee = /^\[მიტანა \+(\d+)/.exec(order.note)?.[1];
                return (
                  <li key={order.id} className="rounded-card border border-line bg-card p-4 sm:p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-bold">შეკვეთა #{order.id}</span>
                      <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_TONES[order.status]}`}>{STATUS_LABELS[order.status]}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted">
                      {formatDate(order.created_at)}
                      {STATUS_HINTS[order.status] && <> · {STATUS_HINTS[order.status]}</>}
                    </p>
                    <ul className="mt-3 divide-y divide-line text-sm">
                      {order.items.map((item) => (
                        <li key={item.id} className="flex justify-between gap-3 py-2">
                          <span className="min-w-0">
                            {item.product_name} <span className="text-muted">× {item.qty}</span>
                          </span>
                          <span className="shrink-0">{formatPrice(item.price * item.qty)}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3 text-sm">
                      <span className="text-muted">{order.address}</span>
                      <span className="font-bold text-neon">
                        {formatPrice(order.total + Number(fee ?? 0))}
                        {fee && <span className="ml-1 text-xs font-normal text-muted">(მიტანით)</span>}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <aside className="space-y-6">
          <section aria-labelledby="details-title" className="rounded-card border border-line bg-card p-5">
            <h2 id="details-title" className="font-bold">ჩემი მონაცემები</h2>
            <p className="mt-1 text-sm text-muted">შეკვეთისას თავისით შეივსება.</p>
            <ProfileForm profile={{ ...profile, phone: profile?.phone || (customer.phone?.replace(/^\+?995/, "") ?? "") }} />
          </section>
          {customer.provider === "email" && (
            <Link href="/account/password" className="block rounded-card border border-line bg-card p-5 text-sm transition-colors hover:border-neon/50">
              <span className="font-bold">პაროლის შეცვლა</span>
              <span className="mt-1 block text-muted">ახალი პაროლის დაყენება</span>
            </Link>
          )}
        </aside>
      </div>
    </main>
  );
}
