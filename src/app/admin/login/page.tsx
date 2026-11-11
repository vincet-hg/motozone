"use client";

import { useActionState } from "react";
import { keepValues } from "@/lib/keep-values";
import { login, type FormState } from "../actions";

const input = "mt-1 h-11 w-full rounded border border-neutral-300 px-3";

export default function LoginPage() {
  const [state, action, pending] = useActionState<FormState, FormData>(login, {});

  return (
    <main className="flex flex-1 items-center justify-center bg-neutral-100 px-4 text-black">
      <form action={action} onSubmit={keepValues(action)} className="w-full max-w-sm space-y-4 rounded border border-neutral-200 bg-white p-6">
        <h1 className="text-lg font-bold">MotoZone ადმინისტრატორი</h1>
        <label className="block text-sm">
          ელფოსტა
          <input name="email" type="email" required autoComplete="username" className={input} />
        </label>
        <label className="block text-sm">
          პაროლი
          <input name="password" type="password" required autoComplete="current-password" className={input} />
        </label>
        {state.error && (
          <p role="alert" className="text-sm text-red-700">
            {state.error}
          </p>
        )}
        <button disabled={pending} className="h-11 w-full rounded bg-black font-medium text-white disabled:opacity-50">
          {pending ? "შესვლა..." : "შესვლა"}
        </button>
      </form>
    </main>
  );
}
