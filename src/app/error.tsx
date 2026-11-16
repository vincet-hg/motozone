"use client";

// Shown when a page fails to load, for example while the database is unreachable.
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center px-4 py-20 text-center">
      <h1 className="text-2xl font-extrabold">რაღაც შეფერხდა</h1>
      <p className="mt-2 text-muted">გვერდი ვერ ჩაიტვირთა. სცადე თავიდან რამდენიმე წამში.</p>
      <button onClick={reset} className="mt-6 h-11 rounded-btn bg-accent px-6 font-bold text-white hover:bg-accent-hover">
        თავიდან ცდა
      </button>
    </main>
  );
}
