"use client";

import { useEffect } from "react";
import { ErrorView } from "@/components/error-view";

// A store page failed (for example the database did not answer). Header and footer stay, so the
// customer can keep shopping; "try again" reloads just this part.
export default function StoreError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => console.error(error), [error]);
  const reference = error instanceof Error && "digest" in error ? String(error.digest) : undefined;
  return (
    <ErrorView
      mark="!"
      title="რაღაც შეფერხდა"
      text="გვერდი ამ წამს ვერ ჩაიტვირთა. ეს ჩვენი მხრიდანაა და შენი კალათა და ანგარიში უსაფრთხოდაა. სცადე თავიდან რამდენიმე წამში."
      retry={retry}
      reference={reference}
    />
  );
}
