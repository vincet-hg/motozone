"use client";

import { useActionState } from "react";
import { changeOwnPassword, type FormState } from "../../actions";

const field = "mt-1 h-9 w-full rounded border border-neutral-300 px-2";

export function PasswordForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(changeOwnPassword, {});
  return (
    <form action={action} className="mt-4 max-w-md space-y-3 rounded border border-neutral-200 bg-white p-4">
      <h2 className="font-bold">პაროლის შეცვლა</h2>
      <label className="block text-sm">
        ახალი პაროლი (მინიმუმ 12 სიმბოლო)
        <input name="password" type="password" required minLength={12} autoComplete="new-password" className={field} />
      </label>
      <label className="block text-sm">
        გაიმეორე
        <input name="confirm" type="password" required minLength={12} autoComplete="new-password" className={field} />
      </label>
      {state.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}
      {state.ok && <p role="status" className="text-sm text-green-800">{state.ok}</p>}
      <button disabled={pending} className="h-9 rounded bg-black px-4 text-sm text-white disabled:opacity-60">
        {pending ? "ინახება..." : "შეცვლა"}
      </button>
    </form>
  );
}
