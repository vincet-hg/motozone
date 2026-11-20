"use client";

import Link from "next/link";
import { useActionState } from "react";
import { subscribe, type NewsletterState } from "@/app/(store)/newsletter-action";
import { CheckIcon, MailIcon } from "./icons";

export function Newsletter() {
  const [state, action, pending] = useActionState<NewsletterState, FormData>(subscribe, {});

  return (
    <section aria-labelledby="newsletter-title" className="reveal relative isolate mt-14 overflow-hidden rounded-card border border-line bg-gradient-to-r from-section via-card to-section px-4 py-7 min-[400px]:px-5 min-[400px]:py-8 sm:px-10 sm:py-10">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_100%_0%,rgba(227,18,11,0.3),transparent_55%),radial-gradient(ellipse_at_0%_100%,rgba(255,81,72,0.12),transparent_50%)]" />
      <div className="grid items-center gap-6 lg:grid-cols-2">
        <div className="flex items-start gap-4">
          <span aria-hidden="true" className="hidden size-12 shrink-0 items-center justify-center rounded-2xl bg-accent/15 text-neon sm:flex">
            <MailIcon />
          </span>
          <div>
            <h2 id="newsletter-title" className="text-xl font-extrabold sm:text-2xl">ფასდაკლება არ გამოგრჩეს</h2>
            <p className="mt-1.5 text-sm leading-6 text-muted">დატოვე ელფოსტა და მოკლე წერილს მიიღებ, როცა:</p>
            <ul className="mt-2 space-y-1 text-sm text-fg/85">
              <li className="flex items-center gap-2">
                <CheckIcon className="size-4 shrink-0 text-neon" />
                პროდუქტზე ფასდაკლება დაიწყება
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon className="size-4 shrink-0 text-neon" />
                ახალი პროდუქტი შემოვა
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon className="size-4 shrink-0 text-neon" />
                ამოწურული პროდუქტი მარაგში დაბრუნდება
              </li>
            </ul>
          </div>
        </div>

        {state.ok ? (
          <p role="status" className="flex items-center gap-2 rounded-btn border border-accent/40 bg-accent/10 px-4 py-3 font-semibold">
            <CheckIcon className="size-5 text-neon" />
            გამოწერილია. ახალ აქციებს და პროდუქტებს ელფოსტაზე გამოგიგზავნით.
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
                className="h-12 min-w-0 rounded-full sm:flex-1 border border-line bg-bg/60 px-5 text-base text-fg placeholder:text-muted focus:border-neon/60 focus:outline-none"
              />
              <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
              <button
                type="submit"
                disabled={pending}
                className="h-12 shrink-0 rounded-full bg-gradient-to-r from-accent to-accent-hover px-7 font-bold text-white shadow-[0_10px_30px_-10px_rgba(227,18,11,0.8)] transition-colors duration-200 hover:bg-accent-hover disabled:opacity-60"
              >
                {pending ? "იგზავნება..." : "გაგზავნა"}
              </button>
            </div>
            {state.error && (
              <p role="alert" className="mt-2 text-sm text-neon">
                {state.error}
              </p>
            )}
            <p className="mt-2 text-xs text-muted">
              სპამი არ იქნება. გამოწერის გასაუქმებლად უბრალოდ გვიპასუხე წერილზე.{" "}
              <Link href="/privacy" className="underline hover:text-fg">კონფიდენციალურობა</Link>
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
