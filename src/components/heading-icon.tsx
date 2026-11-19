// The tile in front of a section or page title: a neon line icon in a dark square with a blue tint,
// the same look as the current category in the header menu.
export function HeadingIcon({ children }: { children: React.ReactNode }) {
  return (
    <span
      aria-hidden="true"
      className="optical-center flex size-9 shrink-0 items-center justify-center rounded-xl border border-neon/50 bg-accent/20 text-neon shadow-[0_0_18px_-6px_rgba(56,189,248,0.6)] sm:size-10"
    >
      {children}
    </span>
  );
}
