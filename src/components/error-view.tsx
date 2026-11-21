import Link from "next/link";
import { site } from "@/lib/site";
import { PhoneIcon, SearchIcon } from "./icons";

// One calm look for every store error: a big mark, a plain explanation and the ways forward.
// Used by the 404 page and by the error boundaries; the reference code helps find the server log.

export function ErrorView({
  mark,
  title,
  text,
  retry,
  reference,
  search = false,
}: {
  mark: string;
  title: string;
  text: string;
  retry?: () => void;
  reference?: string;
  search?: boolean;
}) {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-4 py-16 text-center sm:py-24">
      <div aria-hidden className="relative">
        <span className="block bg-gradient-to-b from-fg to-fg/20 bg-clip-text text-[96px] leading-none font-black tracking-tight text-transparent sm:text-[128px]">
          {mark}
        </span>
        <span className="absolute inset-x-6 -bottom-2 h-px bg-gradient-to-r from-transparent via-neon/50 to-transparent" />
      </div>
      <h1 className="mt-8 text-2xl font-extrabold sm:text-3xl">{title}</h1>
      <p className="mt-3 max-w-md leading-7 text-muted">{text}</p>

      {search && (
        <form action="/search" className="mt-6 flex w-full max-w-sm items-center rounded-btn border border-line bg-card pr-1 focus-within:border-neon/60">
          <SearchIcon className="ml-3 size-5 shrink-0 text-muted" />
          <input name="q" type="search" placeholder="რას ეძებ?" aria-label="პროდუქტის ძიება" className="h-11 min-w-0 flex-1 bg-transparent px-3 text-fg outline-none placeholder:text-muted/70" />
          <button className="h-9 cursor-pointer rounded-lg bg-accent px-3 text-sm font-semibold text-white hover:bg-accent-hover">ძებნა</button>
        </form>
      )}

      <div className="mt-6 flex w-full max-w-sm flex-col gap-2.5 sm:flex-row">
        {retry && (
          <button
            type="button"
            onClick={retry}
            className="flex h-12 flex-1 cursor-pointer items-center justify-center rounded-btn bg-gradient-to-r from-accent to-accent-hover font-bold text-white"
          >
            თავიდან ცდა
          </button>
        )}
        <Link
          href="/"
          className={`flex h-12 flex-1 items-center justify-center rounded-btn font-semibold ${retry ? "border border-line text-fg hover:border-neon/50" : "bg-gradient-to-r from-accent to-accent-hover font-bold text-white"}`}
        >
          მთავარ გვერდზე
        </Link>
      </div>

      <a href={site.phoneHref} className="mt-6 inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-fg">
        <PhoneIcon className="size-4 text-neon" />
        დახმარება გჭირდება? დაგვირეკე: <span className="font-semibold text-fg">{site.phone}</span>
      </a>
      {reference && <p className="mt-3 font-mono text-xs text-muted/70">შეცდომის კოდი: {reference}</p>}
    </main>
  );
}
