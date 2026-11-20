"use client";

import Link from "next/link";
import { keepValues } from "@/lib/keep-values";
import { useActionState, useState } from "react";
import { useFormToast } from "@/components/toaster";
import { authButton, authError, authInfo, authInput, authSecondary } from "@/components/auth-styles";
import { GoogleIcon, MailIcon, PhoneIcon } from "@/components/icons";
import { PasswordInput } from "@/components/password-input";
import { type AuthState, confirmEmail, resendConfirmation, sendPhoneCode, signInWithEmail, signInWithGoogle, signUpWithEmail, verifyPhoneCode } from "./actions";

type Method = "email" | "phone";

// Sign in and registration in one card: Google, then email (sign in or create an account) or a phone code.
export function LoginForms({ next, mode, google, phone }: { next: string; mode: "login" | "register"; google: boolean; phone: boolean }) {
  const [method, setMethod] = useState<Method>("email");
  const register = mode === "register";

  return (
    <div className="space-y-5">
      {google && (
        <form action={signInWithGoogle}>
          <input type="hidden" name="next" value={next} />
          <button className={authSecondary}>
            <GoogleIcon />
            Google-ით {register ? "რეგისტრაცია" : "შესვლა"}
          </button>
        </form>
      )}

      {phone && (
        <div role="tablist" aria-label="შესვლის გზა" className="grid grid-cols-2 gap-1 rounded-btn border border-line bg-bg p-1">
          {(
            [
              ["email", "ელფოსტით", MailIcon],
              ["phone", "ტელეფონით", PhoneIcon],
            ] as const
          ).map(([value, label, Icon]) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={method === value}
              onClick={() => setMethod(value)}
              className={`flex h-10 cursor-pointer items-center justify-center gap-2 rounded-[9px] text-sm font-semibold transition-colors ${
                method === value ? "bg-card text-fg shadow-[0_0_0_1px_rgba(255,255,255,0.08)]" : "text-muted hover:text-fg"
              }`}
            >
              <Icon className="size-4" />
              {label}
            </button>
          ))}
        </div>
      )}

      {method === "email" ? <EmailForm next={next} register={register} /> : <PhoneForm next={next} />}
    </div>
  );
}

function EmailForm({ next, register }: { next: string; register: boolean }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(register ? signUpWithEmail : signInWithEmail, {});
  useFormToast(state);
  const [restart, setRestart] = useState(0);
  if (state.step === "confirm" && state.email && restart === 0) {
    return <ConfirmEmail key={state.email} email={state.email} next={next} intro={state} onBack={() => setRestart((value) => value + 1)} />;
  }

  return (
    <form action={action} onSubmit={keepValues((form) => { setRestart(0); action(form); })} className="space-y-3">
      <input type="hidden" name="next" value={next} />
      <label className="block text-sm">
        ელფოსტა
        <input name="email" type="email" required autoComplete="email" maxLength={254} defaultValue={state.email} className={`${authInput} mt-1.5`} />
      </label>
      <label className="block text-sm">
        <span className="flex items-center justify-between">
          პაროლი
          {!register && (
            <Link href="/forgot-password" className="text-xs font-semibold text-neon underline">
              დაგავიწყდა პაროლი?
            </Link>
          )}
        </span>
        <PasswordInput
          name="password"
          required
          minLength={register ? 8 : 1}
          autoComplete={register ? "new-password" : "current-password"}
          className={authInput}
          wrapperClassName="mt-1.5"
        />
        {register && <span className="mt-1 block text-xs text-muted">მინიმუმ 8 სიმბოლო.</span>}
      </label>
      {state.error && <p role="alert" className={authError}>{state.error}</p>}
      <button disabled={pending} className={authButton}>
        {pending ? "იგზავნება..." : register ? "ანგარიშის შექმნა" : "შესვლა"}
      </button>
    </form>
  );
}

// A new account's email code, with a way to get a new one.
function ConfirmEmail({ email, next, intro, onBack }: { email: string; next: string; intro: AuthState; onBack: () => void }) {
  const [checked, confirmAction, confirming] = useActionState<AuthState, FormData>(confirmEmail, {});
  const [resent, resendAction, resending] = useActionState<AuthState, FormData>(resendConfirmation, {});
  useFormToast(checked);
  useFormToast(resent);
  const info = resent.info ?? intro.info;
  const error = checked.error ?? resent.error ?? (resent.info ? undefined : intro.error);
  return (
    <div className="space-y-3">
      <form action={confirmAction} onSubmit={keepValues(confirmAction)} className="space-y-3">
        <input type="hidden" name="next" value={next} />
        <input type="hidden" name="email" value={email} />
        <p className="text-sm font-bold">დაადასტურე ელფოსტა</p>
        {info && <p role="status" className={authInfo}>{info}</p>}
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
        {error && <p role="alert" className={authError}>{error}</p>}
        <button disabled={confirming} className={authButton}>{confirming ? "მოწმდება..." : "დადასტურება"}</button>
      </form>
      <div className="flex items-center justify-between gap-3 text-sm">
        <button type="button" onClick={onBack} className="cursor-pointer text-muted underline hover:text-fg">
          სხვა ელფოსტა
        </button>
        <form action={resendAction}>
          <input type="hidden" name="email" value={email} />
          <button disabled={resending} className="cursor-pointer text-neon underline disabled:opacity-60">
            {resending ? "იგზავნება..." : "კოდის ხელახლა გაგზავნა"}
          </button>
        </form>
      </div>
    </div>
  );
}

function PhoneForm({ next }: { next: string }) {
  const [sent, sendAction, sending] = useActionState<AuthState, FormData>(sendPhoneCode, {});
  const [checked, verifyAction, verifying] = useActionState<AuthState, FormData>(verifyPhoneCode, {});
  useFormToast(sent);
  useFormToast(checked);
  const [restart, setRestart] = useState(0);
  const step = (checked.step ?? sent.step) === "code" && restart === 0 ? "code" : "phone";
  const phone = checked.phone ?? sent.phone ?? "";

  if (step === "code") {
    return (
      <form action={verifyAction} onSubmit={keepValues(verifyAction)} className="space-y-3">
        <input type="hidden" name="next" value={next} />
        <input type="hidden" name="phone" value={phone} />
        {sent.info && !checked.error && <p role="status" className={authInfo}>{sent.info}</p>}
        <label className="block text-sm">
          კოდი SMS-იდან ({phone})
          <input
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9 ]{6,7}"
            maxLength={7}
            required
            autoFocus
            className={`${authInput} mt-1.5 text-center text-xl tracking-[0.4em]`}
          />
        </label>
        {checked.error && <p role="alert" className={authError}>{checked.error}</p>}
        <button disabled={verifying} className={authButton}>
          {verifying ? "მოწმდება..." : "დადასტურება"}
        </button>
        <button type="button" onClick={() => setRestart((value) => value + 1)} className="w-full text-sm text-muted underline hover:text-fg">
          სხვა ნომერი ან ხელახლა გაგზავნა
        </button>
      </form>
    );
  }

  return (
    <form action={sendAction} onSubmit={keepValues((form) => { setRestart(0); sendAction(form); })} className="space-y-3">
      <label className="block text-sm">
        მობილურის ნომერი
        <span className="mt-1.5 flex">
          <span className="flex items-center rounded-l-btn border border-r-0 border-line bg-card px-3 text-muted">+995</span>
          <input
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            placeholder="5XX XX XX XX"
            required
            defaultValue={phone.replace(/^\+995/, "")}
            className={`${authInput} rounded-l-none`}
          />
        </span>
      </label>
      {sent.error && <p role="alert" className={authError}>{sent.error}</p>}
      <button disabled={sending} className={authButton}>
        {sending ? "იგზავნება..." : "კოდის მიღება"}
      </button>
      <p className="text-xs leading-5 text-muted">ანგარიში ავტომატურად შეიქმნება, თუ ამ ნომრით პირველად შედიხარ.</p>
    </form>
  );
}
