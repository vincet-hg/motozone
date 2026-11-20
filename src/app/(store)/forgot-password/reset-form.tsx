"use client";

import Link from "next/link";
import { keepValues } from "@/lib/keep-values";
import { useActionState, useState } from "react";
import { useFormToast } from "@/components/toaster";
import { authButton, authError, authInfo, authInput } from "@/components/auth-styles";
import { PasswordInput } from "@/components/password-input";
import { type AuthState, resetPasswordWithCode, sendPasswordReset } from "../login/actions";

// Two steps on one page: the email, then the code from the email with the new password.
export function ResetForm() {
  const [sent, sendAction, sending] = useActionState<AuthState, FormData>(sendPasswordReset, {});
  const [reset, resetAction, resetting] = useActionState<AuthState, FormData>(resetPasswordWithCode, {});
  useFormToast(sent);
  useFormToast(reset);
  const [restart, setRestart] = useState(0);
  const email = reset.email ?? sent.email ?? "";
  const step = (reset.step ?? sent.step) === "code" && restart === 0 ? "code" : "email";

  if (step === "code") {
    return (
      <form action={resetAction} onSubmit={keepValues(resetAction)} className="space-y-3">
        <input type="hidden" name="email" value={email} />
        {sent.info && !reset.error && <p role="status" className={authInfo}>{sent.info}</p>}
        <label className="block text-sm">
          კოდი წერილიდან
          <input
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9 ]{6,11}"
            maxLength={11}
            required
            autoFocus
            className={`${authInput} mt-1.5 text-center text-xl tracking-[0.4em]`}
          />
        </label>
        <label className="block text-sm">
          ახალი პაროლი
          <PasswordInput name="password" required minLength={8} autoComplete="new-password" className={authInput} wrapperClassName="mt-1.5" />
          <span className="mt-1 block text-xs text-muted">მინიმუმ 8 სიმბოლო.</span>
        </label>
        <label className="block text-sm">
          გაიმეორე პაროლი
          <PasswordInput name="password2" required minLength={8} autoComplete="new-password" className={authInput} wrapperClassName="mt-1.5" />
        </label>
        {reset.error && <p role="alert" className={authError}>{reset.error}</p>}
        <button disabled={resetting} className={authButton}>{resetting ? "ინახება..." : "პაროლის შეცვლა და შესვლა"}</button>
        <button type="button" onClick={() => setRestart((value) => value + 1)} className="w-full text-sm text-muted underline hover:text-fg">
          სხვა ელფოსტა ან ხელახლა გაგზავნა
        </button>
      </form>
    );
  }

  return (
    <form action={sendAction} onSubmit={keepValues((form) => { setRestart(0); sendAction(form); })} className="space-y-3">
      <label className="block text-sm">
        ელფოსტა
        <input name="email" type="email" required autoComplete="email" defaultValue={email} className={`${authInput} mt-1.5`} />
      </label>
      {sent.error && <p role="alert" className={authError}>{sent.error}</p>}
      <button disabled={sending} className={authButton}>{sending ? "იგზავნება..." : "კოდის მიღება"}</button>
      <Link href="/login" className="block text-center text-sm text-muted underline hover:text-fg">შესვლაზე დაბრუნება</Link>
    </form>
  );
}
