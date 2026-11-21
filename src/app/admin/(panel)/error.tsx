"use client";

import Link from "next/link";
import { useEffect } from "react";

// An admin page failed. The menu stays; the message says what to do and gives the code for the logs.
export default function AdminError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => console.error(error), [error]);
  const reference = error instanceof Error && "digest" in error ? String(error.digest) : undefined;
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center py-16 text-center">
      <span aria-hidden className="flex size-14 items-center justify-center rounded-2xl border border-a-red/40 bg-a-red/10 text-2xl font-black text-[#ff8a94]">!</span>
      <h1 className="mt-5 text-2xl font-bold">ეს გვერდი ვერ ჩაიტვირთა</h1>
      <p className="mt-2 text-sm leading-6 text-a-soft">
        შენახული მონაცემები არ დაკარგულა. სცადე თავიდან. თუ ისევ არ გამოვიდა, შესაძლოა ბაზა ან ინტერნეტი შეფერხდა.
      </p>
      <div className="mt-6 flex gap-2.5">
        <button
          type="button"
          onClick={retry}
          className="h-11 cursor-pointer rounded-xl bg-gradient-to-r from-a-purple to-a-violet px-5 font-semibold text-white"
        >
          თავიდან ცდა
        </button>
        <Link href="/admin" className="flex h-11 items-center rounded-xl border border-a-line bg-a-panel px-5 font-medium hover:border-a-violet/60">
          მიმოხილვა
        </Link>
      </div>
      {reference && <p className="mt-5 font-mono text-xs text-a-muted">შეცდომის კოდი: {reference}</p>}
    </div>
  );
}
