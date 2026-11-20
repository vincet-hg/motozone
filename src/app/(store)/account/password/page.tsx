import type { Metadata } from "next";
import Link from "next/link";
import { HeadingIcon } from "@/components/heading-icon";
import { UserIcon } from "@/components/icons";
import { requireCustomer } from "@/lib/account";
import { PasswordForm } from "./password-form";

export const metadata: Metadata = { title: "პაროლის შეცვლა", robots: { index: false, follow: false } };

// Also where the password reset link lands, already signed in by the link.
export default async function PasswordPage() {
  await requireCustomer("/account/password");
  return (
    <main className="mx-auto max-w-md px-4 py-10 sm:py-14">
      <h1 className="flex items-center gap-3 text-2xl font-extrabold">
        <HeadingIcon>
          <UserIcon className="size-5" />
        </HeadingIcon>
        ახალი პაროლი
      </h1>
      <div className="mt-6 rounded-card border border-line bg-card p-5 sm:p-6">
        <PasswordForm />
      </div>
      <Link href="/account" className="mt-5 block text-center text-sm text-neon underline">ანგარიშზე დაბრუნება</Link>
    </main>
  );
}
