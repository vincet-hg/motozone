import Link from "next/link";
import { Avatar } from "@/components/header-parts";
import { LogoutIcon } from "@/components/icons";
import { getProfile, initialOf, requireCustomer } from "@/lib/account";
import { signOut } from "../login/actions";
import { AccountTabs } from "./account-tabs";

// Every account page: who is signed in, the sections, and signing out.
export default async function AccountLayout({ children }: LayoutProps<"/account">) {
  const customer = await requireCustomer("/account");
  const profile = await getProfile(customer.id);
  const label = customer.email ?? customer.phone?.replace(/^\+995(\d{3})(\d{2})(\d{2})(\d{2})$/, "+995 $1 $2 $3 $4") ?? "";
  const name = profile.name.trim();

  return (
    <main className="mx-auto max-w-5xl px-3 py-6 sm:px-4 md:py-10">
      <div className="flex flex-wrap items-center gap-4 rounded-card border border-line bg-card p-4 sm:p-5">
        <Avatar initial={initialOf(name || customer.email || "")} className="size-12 text-lg shadow-[0_0_24px_-6px_rgba(227,18,11,0.9)]" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-emerald-300">● შესული ხარ</p>
          <h1 className="truncate text-xl font-extrabold sm:text-2xl">{name || "ჩემი ანგარიში"}</h1>
          <p className="truncate text-sm text-muted">{label}</p>
        </div>
        <form action={signOut}>
          <button className="flex h-10 cursor-pointer items-center gap-2 rounded-btn border border-line px-4 text-sm text-muted transition-colors hover:border-neon/50 hover:text-fg">
            <LogoutIcon className="size-4" />
            გასვლა
          </button>
        </form>
      </div>

      <AccountTabs canChangePassword={customer.provider === "email"} />

      <div className="mt-6">{children}</div>

      <p className="mt-10 text-center text-sm text-muted">
        კითხვა გაქვს შეკვეთაზე? დაგვირეკე{" "}
        <Link href="/contact" className="text-neon underline">ან მოგვწერე</Link>.
      </p>
    </main>
  );
}
