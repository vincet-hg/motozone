"use client";

import { useActionState } from "react";
import { Logo } from "@/components/logo";
import { PasswordInput } from "@/components/password-input";
import { keepValues } from "@/lib/keep-values";
import { login, type FormState } from "../actions";

const field = "h-11 w-full rounded-xl border px-3.5 font-normal";
const input = `mt-1.5 ${field}`;

export default function LoginPage() {
  const [state, action, pending] = useActionState<FormState, FormData>(login, {});

  return (
    <main className="admin flex flex-1 items-center justify-center bg-a-bg bg-[radial-gradient(ellipse_at_50%_20%,rgba(227,18,11,0.25),transparent_55%)] px-4 py-10 text-a-text">
      <form action={action} onSubmit={keepValues(action)} className="w-full max-w-sm space-y-4 rounded-3xl border border-a-line bg-a-card/90 p-7 backdrop-blur shadow-[0_10px_30px_-18px_rgba(0,0,0,0.8)]">
        <div className="mb-2 flex flex-col items-center text-center">
          <Logo className="h-16 w-auto drop-shadow-[0_0_18px_rgba(227,18,11,0.4)]" sizes="164px" preload />
          <h1 className="mt-4 text-xl font-bold">ადმინ პანელი</h1>
          <p className="mt-1 text-sm text-a-muted">მართვის პანელში შესვლა</p>
        </div>
        <label className="block text-sm font-medium text-a-soft">
          ელფოსტა
          <input name="email" type="email" required autoComplete="username" className={input} />
        </label>
        <label className="block text-sm font-medium text-a-soft">
          პაროლი
          <PasswordInput name="password" required autoComplete="current-password" className={field} wrapperClassName="mt-1.5" />
        </label>
        {state.error && (
          <p role="alert" className="text-sm text-[#ff6b77]">
            {state.error}
          </p>
        )}
        <button disabled={pending} className="h-11 w-full rounded-xl bg-gradient-to-r from-a-purple to-a-violet shadow-[0_8px_24px_-10px_rgba(227,18,11,0.9)] transition-all duration-200 hover:-translate-y-px hover:shadow-[0_0_24px_-4px_rgba(255,81,72,0.55)] font-semibold text-white disabled:opacity-50">
          {pending ? "შესვლა..." : "შესვლა"}
        </button>
      </form>
    </main>
  );
}
