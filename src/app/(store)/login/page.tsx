import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { authError } from "@/components/auth-styles";
import { HeadingIcon } from "@/components/heading-icon";
import { UserIcon } from "@/components/icons";
import { getCustomer } from "@/lib/account";
import { site } from "@/lib/site";
import { LoginForms } from "./login-forms";

export const metadata: Metadata = { title: "შესვლა", robots: { index: false, follow: false } };

const ERRORS: Record<string, string> = {
  link: "ბმული არასწორია ან ვადა გაუვიდა. სცადე თავიდან.",
  google: "Google-ით შესვლა ვერ მოხერხდა. სცადე თავიდან ან შედი ელფოსტით.",
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const raw = typeof params.next === "string" ? params.next : "/account";
  const next = raw.startsWith("/") && !raw.startsWith("//") && !raw.startsWith("/admin") ? raw : "/account";
  const mode = params.mode === "register" ? "register" : "login";
  const error = typeof params.error === "string" ? ERRORS[params.error] : undefined;

  if (await getCustomer()) redirect(next);

  const switchHref = `/login?${new URLSearchParams({ ...(mode === "login" ? { mode: "register" } : {}), next }).toString()}`;

  return (
    <main className="mx-auto flex max-w-md flex-col px-4 py-10 sm:py-14">
      <h1 className="flex items-center gap-3 text-2xl font-extrabold">
        <HeadingIcon>
          <UserIcon className="size-5" />
        </HeadingIcon>
        {mode === "register" ? "რეგისტრაცია" : "შესვლა"}
      </h1>
      <p className="mt-3 leading-7 text-muted">
        {next === "/cart"
          ? "შეკვეთის გასაფორმებლად შედი ან შექმენი ანგარიში. კალათა შენახული დაგხვდება."
          : "ანგარიშში ნახავ შეკვეთებს, შენახულ მისამართს და ფავორიტებს ყველა მოწყობილობაზე."}
      </p>

      <div className="mt-6 rounded-card border border-line bg-card p-5 sm:p-6">
        {error && <p role="alert" className={`${authError} mb-5`}>{error}</p>}
        <LoginForms key={mode} next={next} mode={mode} google={site.auth.google} phone={site.auth.phone} />
      </div>

      <p className="mt-5 text-center text-sm text-muted">
        {mode === "login" ? "ჯერ არ გაქვს ანგარიში? " : "უკვე გაქვს ანგარიში? "}
        <Link href={switchHref} className="font-semibold text-neon underline">
          {mode === "login" ? "რეგისტრაცია" : "შესვლა"}
        </Link>
      </p>
      <p className="mt-6 text-center text-xs leading-5 text-muted">
        გაგრძელებით ეთანხმები <Link href="/terms" className="underline hover:text-fg">მომსახურების პირობებს</Link> და{" "}
        <Link href="/privacy" className="underline hover:text-fg">კონფიდენციალურობის პოლიტიკას</Link>.
      </p>
    </main>
  );
}
