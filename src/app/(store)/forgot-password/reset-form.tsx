"use client";

import Link from "next/link";
import { useActionState } from "react";
import { authButton, authError, authInfo, authInput } from "@/components/auth-styles";
import { type AuthState, sendPasswordReset } from "../login/actions";

export function ResetForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(sendPasswordReset, {});
  if (state.info) {
    return (
      <div className="space-y-4">
        <p role="status" className={authInfo}>{state.info}</p>
        <Link href="/login" className="block text-center text-sm text-neon underline">შესვლაზე დაბრუნება</Link>
      </div>
    );
  }
  return (
    <form action={action} className="space-y-3">
      <label className="block text-sm">
        ელფოსტა
        <input name="email" type="email" required autoComplete="email" className={`${authInput} mt-1.5`} />
      </label>
      {state.error && <p role="alert" className={authError}>{state.error}</p>}
      <button disabled={pending} className={authButton}>{pending ? "იგზავნება..." : "ბმულის გაგზავნა"}</button>
    </form>
  );
}
