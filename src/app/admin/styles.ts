// Shared class names for the admin panel, so every page looks the same.
export const card = "rounded-2xl border border-a-line bg-a-card shadow-[0_10px_30px_-18px_rgba(0,0,0,0.8)]";
export const tableWrap = `${card} overflow-x-auto`;

export const primaryButton =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-a-purple to-a-violet font-semibold text-white shadow-[0_8px_24px_-10px_rgba(0,110,255,0.9)] transition-all duration-200 hover:-translate-y-px hover:shadow-[0_0_24px_-4px_rgba(56,189,248,0.55)] disabled:translate-y-0 disabled:opacity-50";
export const secondaryButton =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-a-line bg-a-panel font-medium text-a-text transition-colors duration-200 hover:border-a-violet/60 hover:bg-a-hover/60";

export const tab = (selected: boolean) =>
  `shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
    selected
      ? "border-a-violet/60 bg-a-purple/25 text-white shadow-[0_0_18px_-6px_rgba(0,110,255,0.9)]"
      : "border-a-line bg-a-panel text-a-soft hover:border-a-violet/40 hover:text-a-text"
  }`;

export const alertError = "rounded-xl border border-a-red/30 bg-a-red/10 p-3 text-sm text-[#ff8a94]";
export const alertOk = "rounded-xl border border-a-green/30 bg-a-green/10 p-3 text-sm text-[#5fe0a0]";
export const alertWarn = "rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-200";

export const pageTitle = "text-2xl font-bold tracking-tight text-a-text";
export const sectionTitle = "text-base font-semibold text-a-text";
