import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowIcon, PhoneIcon } from "@/components/icons";
import { getCustomerOrder, requireCustomer } from "@/lib/account";
import { formatPrice, imageUrl } from "@/lib/format";
import { site } from "@/lib/site";
import { formatDate } from "../../../../admin/(panel)/orders/status";
import { OrderProgress, StatusBadge, statusHint } from "../../order-status";

export const metadata: Metadata = { title: "შეკვეთა", robots: { index: false, follow: false } };

export default async function OrderPage({ params }: PageProps<"/account/orders/[id]">) {
  const { id } = await params;
  const customer = await requireCustomer(`/account/orders/${id}`);
  const order = await getCustomerOrder(customer.id, Number(id));
  if (!order) notFound();

  const row = "flex justify-between gap-4 py-1.5";
  return (
    <div className="space-y-4">
      <Link href="/account" prefetch={false} className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg">
        <ArrowIcon className="size-4 rotate-180" />
        ყველა შეკვეთა
      </Link>

      <section className="rounded-card border border-line bg-card p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-extrabold">შეკვეთა #{order.id}</h2>
            <p className="text-sm text-muted">{formatDate(order.created_at)}</p>
          </div>
          <StatusBadge order={order} />
        </div>
        <div className="mt-6">
          <OrderProgress order={order} />
        </div>
        <p className={`mt-5 rounded-btn border px-3.5 py-3 text-sm leading-6 ${order.status === "cancelled" ? "border-line bg-bg text-muted" : "border-neon/30 bg-accent/10 text-fg"}`}>
          {statusHint(order)}
        </p>
      </section>

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <section aria-labelledby="items-title" className="rounded-card border border-line bg-card p-4 sm:p-6">
          <h3 id="items-title" className="font-bold">პროდუქტები</h3>
          <ul className="mt-3 divide-y divide-line">
            {order.items.map((item) => {
              const body = (
                <>
                  <span className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-photo">
                    {item.image && <Image src={imageUrl(item.image)} alt="" fill sizes="64px" className="object-contain p-1.5" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">{item.product_name}</span>
                    <span className="mt-0.5 block text-xs text-muted">
                      {formatPrice(item.price)} × {item.qty}
                    </span>
                  </span>
                  <span className="shrink-0 font-bold">{formatPrice(item.price * item.qty)}</span>
                </>
              );
              return (
                <li key={item.id}>
                  {item.slug ? (
                    <Link href={`/product/${item.slug}`} prefetch={false} className="flex items-center gap-3 py-3 transition-colors hover:text-neon">
                      {body}
                    </Link>
                  ) : (
                    <div className="flex items-center gap-3 py-3">{body}</div>
                  )}
                </li>
              );
            })}
          </ul>
          <dl className="mt-2 border-t border-line pt-3 text-sm">
            <div className={row}>
              <dt className="text-muted">პროდუქტები</dt>
              <dd>{formatPrice(order.total)}</dd>
            </div>
            <div className={row}>
              <dt className="text-muted">{order.pickup ? "გატანა" : "მიტანა"}</dt>
              <dd>{order.pickup ? "უფასო" : formatPrice(order.deliveryFee)}</dd>
            </div>
            <div className={`${row} mt-1 border-t border-line pt-3 text-base font-extrabold`}>
              <dt>სულ</dt>
              <dd className="text-neon">{formatPrice(order.total + order.deliveryFee)}</dd>
            </div>
          </dl>
        </section>

        <aside className="space-y-4">
          <section className="rounded-card border border-line bg-card p-4 text-sm sm:p-5">
            <h3 className="font-bold">{order.pickup ? "გატანა" : "მიტანა"}</h3>
            <dl className="mt-3 space-y-2.5">
              <div>
                <dt className="text-xs text-muted">მიმღები</dt>
                <dd>{order.customer_name} · {order.phone}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">{order.pickup ? "სად" : "მისამართი"}</dt>
                <dd>
                  {order.pickup ? (
                    <>
                      {site.pickup.address}
                      <span className="block text-xs text-muted">{site.pickup.landmark}, {site.pickup.hours}</span>
                    </>
                  ) : (
                    `${order.city}, ${order.address}`
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted">გადახდა</dt>
                <dd>მიღებისას, ნაღდით ან ბარათით</dd>
              </div>
              {order.customerNote && (
                <div>
                  <dt className="text-xs text-muted">შენიშვნა</dt>
                  <dd className="break-words">{order.customerNote}</dd>
                </div>
              )}
            </dl>
          </section>
          <a
            href={site.phoneHref}
            className="flex items-center justify-center gap-2 rounded-card border border-line bg-card p-4 text-sm font-semibold transition-colors hover:border-neon/50"
          >
            <PhoneIcon className="size-5 text-neon" />
            შეკითხვა? {site.phone}
          </a>
        </aside>
      </div>
    </div>
  );
}
