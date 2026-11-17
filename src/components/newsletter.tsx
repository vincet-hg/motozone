"use client";

import Link from "next/link";
import { useActionState } from "react";
import { subscribe, type NewsletterState } from "@/app/(store)/newsletter-action";
import { CheckIcon, MailIcon } from "./icons";

export function Newsletter() {
  const [state, action, pending] = useActionState<NewsletterState, FormData>(subscribe, {});

  return (
    <section aria-labelledby="newsletter-title" className="relative isolate mt-14 overflow-hidden rounded-card border border-line bg-section px-5 py-8 sm:px-10 sm:py-10">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_100%_0%,rgba(225,29,72,0.25),transparent_55%)]" />
      <div className="grid items-center gap-6 lg:grid-cols-2">
        <div className="flex items-start gap-4">
          <span aria-hidden="true" className="hidden size-12 shrink-0 items-center justify-center rounded-2xl bg-accent/15 text-accent-hover sm:flex">
            <MailIcon />
          </span>
          <div>
            <h2 id="newsletter-title" className="text-xl font-extrabold sm:text-2xl">პირველმა გაიგე აქციების შესახებ</h2>
            <p className="mt-1.5 text-sm leading-6 text-muted">ახალი პროდუქტები და ფასდაკლებები პირდაპირ ელფოსტაზე. სპამის გარეშე, გაუქმება ნებისმიერ დროს.</p>
          </div>
        </div>

        {state.ok ? (
          <p role="status" className="flex items-center gap-2 rounded-btn border border-accent/40 bg-accent/10 px-4 py-3 font-semibold">
            <CheckIcon className="size-5 text-accent-hover" />
            გმადლობთ! გამოწერა დადასტურდა.
          </p>
        ) : (
          <form action={action} className="w-full">
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                name="email"
                type="email"
                required
                maxLength={254}
                autoComplete="email"
                placeholder="შენი ელფოსტა"
                aria-label="ელფოსტა"
                className="h-12 min-w-0 flex-1 rounded-btn border border-line bg-card px-4 text-base text-fg placeholder:text-muted focus:border-accent focus:outline-none"
              />
              <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
              <button
                type="submit"
                disabled={pending}
                className="h-12 shrink-0 rounded-btn bg-accent px-6 font-bold text-white shadow-[0_10px_30px_-10px_rgba(225,29,72,0.8)] transition-colors duration-200 hover:bg-accent-hover disabled:opacity-60"
              >
                {pending ? "იგზავნება..." : "გამოწერა"}
              </button>
            </div>
            {state.error && (
              <p role="alert" className="mt-2 text-sm text-accent-hover">
                {state.error}
              </p>
            )}
            <p className="mt-2 text-xs text-muted">
              გამოწერით ეთანხმები <Link href="/privacy" className="underline hover:text-fg">კონფიდენციალურობის პოლიტიკას</Link>.
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
