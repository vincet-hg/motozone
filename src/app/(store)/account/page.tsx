import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowIcon, PackageIcon } from "@/components/icons";
import { getCustomerOrders, requireCustomer } from "@/lib/account";
import { formatPrice, imageUrl } from "@/lib/format";
import { formatDate } from "../../admin/(panel)/orders/status";
import { OrderProgress, OrderStatusBadge, statusHint } from "./order-status";

export const metadata: Metadata = {
  title: "ჩემი შეკვეთები",
  robots: { index: false, follow: false },
};

export default async function AccountOrdersPage({
  searchParams,
}: PageProps<"/account">) {
  const customer = await requireCustomer("/account");
  const [orders, params] = await Promise.all([
    getCustomerOrders(customer.id),
    searchParams,
  ]);
  const notice = params.password === "changed" && (
    <p
      role="status"
      className="mb-4 rounded-btn border border-emerald-400/40 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100"
    >
      ✓ პაროლი შეიცვალა და შესული ხარ.
    </p>
  );

  if (orders.length === 0) {
    return (
      <>
        {notice}
        <div className="rounded-card border border-line bg-card px-6 py-12 text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-line bg-section text-neon">
            <PackageIcon className="size-7" />
          </span>
          <h2 className="mt-4 text-lg font-bold">ჯერ შეკვეთა არ გაქვს</h2>
          <p className="mt-1 text-sm text-muted">
            შეკვეთის შემდეგ აქ ნახავ, რა შეუკვეთე და რა ეტაპზეა.
          </p>
          <Link
            href="/search"
            className="mt-5 inline-flex h-11 items-center gap-2 rounded-btn bg-gradient-to-r from-accent to-accent-hover px-5 font-semibold text-white"
          >
            პროდუქტების ნახვა
            <ArrowIcon className="size-4" />
          </Link>
        </div>
      </>
    );
  }

  return (
    <section aria-labelledby="orders-title">
      <h2 id="orders-title" className="sr-only">
        ჩემი შეკვეთები
      </h2>
      {notice}
      <ul className="space-y-3">
        {orders.map((order) => {
          const count = order.items.reduce((sum, item) => sum + item.qty, 0);
          return (
            <li key={order.id}>
              <Link
                href={`/account/orders/${order.id}`}
                prefetch={false}
                className="group block rounded-card border border-line bg-card p-4 transition-all duration-200 hover:border-neon/45 hover:bg-card-hover sm:p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="font-bold">შეკვეთა #{order.id}</span>
                    <span className="ml-2 text-xs text-muted">
                      {formatDate(order.created_at)}
                    </span>
                  </div>
                  <OrderStatusBadge order={order} />
                </div>

                <div className="mt-3 flex items-center gap-3">
                  <div className="flex shrink-0 -space-x-3">
                    {order.items.slice(0, 3).map((item) => (
                      <span
                        key={item.id}
                        className="relative size-12 overflow-hidden rounded-xl border-2 border-card bg-photo"
                      >
                        {item.image && (
                          <Image
                            src={imageUrl(item.image)}
                            alt=""
                            fill
                            sizes="48px"
                            className="object-contain p-1"
                          />
                        )}
                      </span>
                    ))}
                  </div>
                  <p className="min-w-0 flex-1 truncate text-sm text-fg/90">
                    {order.items.map((item) => item.product_name).join(", ")}
                  </p>
                </div>

                <div className="mt-4">
                  <OrderProgress order={order} compact />
                  <p className="mt-2 text-xs leading-5 text-muted">
                    {statusHint(order)}
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-between gap-3 border-t border-line pt-3 text-sm">
                  <span className="text-muted">
                    {count} ნივთი ·{" "}
                    <span className="font-bold text-fg">
                      {formatPrice(order.total + order.deliveryFee)}
                    </span>
                  </span>
                  <span className="flex items-center gap-1.5 font-semibold text-neon">
                    დეტალები
                    <ArrowIcon className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
