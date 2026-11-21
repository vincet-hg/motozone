"use client";

import { useEffect } from "react";
import { ErrorView } from "@/components/error-view";

// Fallback for pages outside the store layout (the store has its own error page with header and footer).
export default function ErrorPage({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => console.error(error), [error]);
  const reference = error instanceof Error && "digest" in error ? String(error.digest) : undefined;
  return (
    <ErrorView
      mark="!"
      title="რაღაც შეფერხდა"
      text="გვერდი ამ წამს ვერ ჩაიტვირთა. სცადე თავიდან რამდენიმე წამში."
      retry={retry}
      reference={reference}
    />
  );
}
