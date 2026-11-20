import type { Metadata } from "next";
import { HeadingIcon } from "@/components/heading-icon";
import { MailIcon } from "@/components/icons";
import { ResetForm } from "./reset-form";

export const metadata: Metadata = { title: "პაროლის აღდგენა", robots: { index: false, follow: false } };

export default function ForgotPasswordPage() {
  return (
    <main className="mx-auto max-w-md px-4 py-10 sm:py-14">
      <h1 className="flex items-center gap-3 text-2xl font-extrabold">
        <HeadingIcon>
          <MailIcon className="size-5" />
        </HeadingIcon>
        პაროლის აღდგენა
      </h1>
      <p className="mt-3 leading-7 text-muted">შეიყვანე რეგისტრაციისას მითითებული ელფოსტა და ახალი პაროლის დასაყენებელ ბმულს გამოგიგზავნით.</p>
      <div className="mt-6 rounded-card border border-line bg-card p-5 sm:p-6">
        <ResetForm />
      </div>
    </main>
  );
}
