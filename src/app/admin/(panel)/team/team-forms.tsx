"use client";

import { useActionState } from "react";
import { addAdmin, resetAdminAccess, type TeamState } from "../../actions";

// The temporary password is shown once, here, and never stored or sent anywhere else.
function OneTimePassword({ state }: { state: TeamState }) {
  if (!state.password) return null;
  return (
    <div className="mt-3 rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">
      <p className="font-semibold">დროებითი პაროლი ({state.email}):</p>
      <code className="mt-1 block rounded bg-white p-2 font-mono text-base select-all">{state.password}</code>
      <p className="mt-2">
        გადაეცი პირადად ან უსაფრთხო გზით და ახლავე შეინახე: ამ გვერდის დატოვების შემდეგ აღარ გამოჩნდება. პირველ შესვლაზე ავთენტიკატორს დააყენებს, მერე „ჩემი
        ანგარიშის“ გვერდზე პაროლს შეცვლის.
      </p>
    </div>
  );
}

export function AddAdminForm() {
  const [state, action, pending] = useActionState<TeamState, FormData>(addAdmin, {});
  return (
    <div className="mt-4 max-w-3xl rounded border border-neutral-200 bg-white p-4">
      <form action={action} className="flex flex-wrap items-end gap-2">
        <label className="min-w-64 flex-1 text-sm">
          ახალი ადმინის ელფოსტა
          <input name="email" type="email" required maxLength={254} className="mt-1 h-9 w-full rounded border border-neutral-300 px-2" />
        </label>
        <button disabled={pending} className="h-9 rounded bg-accent px-4 text-sm font-semibold text-white disabled:opacity-60">
          {pending ? "ემატება..." : "ადმინად დამატება"}
        </button>
      </form>
      {state.error && <p role="alert" className="mt-2 text-sm text-red-700">{state.error}</p>}
      {state.saved && <p role="status" className="mt-2 text-sm text-green-800">{state.saved}</p>}
      <OneTimePassword state={state} />
    </div>
  );
}

export function ResetAccessButton({ userId, email }: { userId: string; email: string }) {
  const [state, action, pending] = useActionState<TeamState, FormData>(resetAdminAccess, {});
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!confirm(`${email}: ახალი დროებითი პაროლი და ავთენტიკატორის თავიდან დაყენება?`)) event.preventDefault();
      }}
      className="basis-full sm:basis-auto"
    >
      <input type="hidden" name="user_id" value={userId} />
      <button disabled={pending} className="text-neutral-800 underline">
        წვდომის აღდგენა
      </button>
      {state.error && <p role="alert" className="mt-1 text-red-700">{state.error}</p>}
      <OneTimePassword state={state} />
    </form>
  );
}
