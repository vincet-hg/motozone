"use client";

import { useEffect, useRef, useState } from "react";

// Short pop-up messages in the corner: green for something that worked, red for an error.
// Any client component can call toast(); <Toaster /> in the root layout shows them.

export type ToastKind = "success" | "warning" | "error";
type Toast = { id: number; kind: ToastKind; message: string };

const EVENT = "scooterland-toast";
let nextId = 1;

export function toast(message: string, kind: ToastKind = "success") {
  if (typeof window === "undefined" || !message) return;
  window.dispatchEvent(new CustomEvent<Toast>(EVENT, { detail: { id: nextId++, kind, message } }));
}

// For forms with useActionState: a new result with an error or an info message shows a toast once.
export function useFormToast(state: { error?: string; info?: string } | undefined) {
  const last = useRef(state);
  useEffect(() => {
    if (!state || state === last.current) return;
    last.current = state;
    if (state.error) toast(state.error, "error");
    else if (state.info) toast(state.info, "success");
  }, [state]);
}

const STYLES: Record<ToastKind, { box: string; icon: string }> = {
  success: { box: "border-emerald-400/40 shadow-[0_12px_40px_-12px_rgba(34,197,94,0.55)]", icon: "bg-emerald-500 text-white" },
  warning: { box: "border-amber-400/50 shadow-[0_12px_40px_-12px_rgba(245,158,11,0.55)]", icon: "bg-amber-500 text-black" },
  error: { box: "border-red-400/50 shadow-[0_12px_40px_-12px_rgba(239,68,68,0.6)]", icon: "bg-red-500 text-white" },
};

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const add = (event: Event) => {
      const item = (event as CustomEvent<Toast>).detail;
      setToasts((list) => [...list.filter((shown) => shown.message !== item.message).slice(-3), item]);
      window.setTimeout(() => setToasts((list) => list.filter((shown) => shown.id !== item.id)), item.kind === "success" ? 4500 : 7000);
    };
    window.addEventListener(EVENT, add);
    return () => window.removeEventListener(EVENT, add);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:right-4 sm:items-end">
      {toasts.map((item) => (
        <div
          key={item.id}
          role={item.kind === "error" ? "alert" : "status"}
          className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border bg-[#171a20]/95 p-3.5 text-sm text-[#f5f5f5] backdrop-blur ${STYLES[item.kind].box}`}
        >
          <span aria-hidden className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${STYLES[item.kind].icon}`}>
            {item.kind === "success" ? "✓" : "!"}
          </span>
          <p className="min-w-0 flex-1 leading-5">{item.message}</p>
          <button
            type="button"
            aria-label="დახურვა"
            onClick={() => setToasts((list) => list.filter((shown) => shown.id !== item.id))}
            className="-mt-1 -mr-1 shrink-0 cursor-pointer rounded-lg px-2 py-1 text-[#a1a1aa] transition-colors hover:text-white"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
