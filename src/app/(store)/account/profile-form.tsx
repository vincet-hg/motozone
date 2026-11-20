"use client";

import { keepValues } from "@/lib/keep-values";
import { useActionState, useEffect } from "react";
import { refreshAccount } from "@/lib/account-state";
import { authButton, authError, authInfo, authInput } from "@/components/auth-styles";
import type { Profile } from "@/lib/types";
import type { AuthState } from "../login/actions";
import { updateProfile } from "./actions";

export function ProfileForm({ profile }: { profile: Profile }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(updateProfile, {});
  // The header shows the name, so it looks again after a save.
  useEffect(() => {
    if (state.info) refreshAccount();
  }, [state]);
  return (
    <form action={action} onSubmit={keepValues(action)} className="mt-4 space-y-3">
      <label className="block text-sm">
        სახელი და გვარი
        <input name="name" defaultValue={profile.name} maxLength={100} autoComplete="name" className={`${authInput} mt-1.5`} />
      </label>
      <label className="block text-sm">
        ტელეფონი
        <input name="phone" type="tel" defaultValue={profile.phone} autoComplete="tel" inputMode="tel" placeholder="5XX XX XX XX" className={`${authInput} mt-1.5`} />
      </label>
      <label className="block text-sm">
        მისამართი თბილისში
        <input name="address" defaultValue={profile.address} maxLength={300} autoComplete="street-address" placeholder="ქუჩა, ნომერი, ბინა" className={`${authInput} mt-1.5`} />
      </label>
      {state.error && <p role="alert" className={authError}>{state.error}</p>}
      {state.info && <p role="status" className={authInfo}>✓ {state.info}</p>}
      <button disabled={pending} className={authButton}>
        {pending ? "ინახება..." : "შენახვა"}
      </button>
    </form>
  );
}
