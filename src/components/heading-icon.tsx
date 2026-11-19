// The tile in front of a section or page title: a filled icon in a lit gradient square.
export function HeadingIcon({ children }: { children: React.ReactNode }) {
  return (
    <span
      aria-hidden="true"
      className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-neon to-accent text-white shadow-[0_8px_22px_-8px_rgba(0,110,255,0.95),inset_0_1px_0_rgba(255,255,255,0.3)] sm:size-10"
    >
      {children}
    </span>
  );
}
