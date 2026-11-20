"use client";

import { keepValues } from "@/lib/keep-values";
import { useActionState } from "react";
import { authButton, authError, authInfo, authInput } from "@/components/auth-styles";
import { PasswordInput } from "@/components/password-input";
import { type AuthState, updatePassword } from "../../login/actions";

export function PasswordForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(updatePassword, {});
  if (state.info) return <p role="status" className={authInfo}>{state.info}</p>;
  return (
    <form action={action} onSubmit={keepValues(action)} className="space-y-3">
      <label className="block text-sm">
        ახალი პაროლი
        <PasswordInput name="password" required minLength={8} autoComplete="new-password" className={authInput} wrapperClassName="mt-1.5" />
        <span className="mt-1 block text-xs text-muted">მინიმუმ 8 სიმბოლო.</span>
      </label>
      {state.error && <p role="alert" className={authError}>{state.error}</p>}
      <button disabled={pending} className={authButton}>{pending ? "ინახება..." : "პაროლის შეცვლა"}</button>
    </form>
  );
}
