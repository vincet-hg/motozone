import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { site } from "@/lib/site";
import "./globals.css";

// Both fonts are trimmed to the letters the store uses: Inter for Latin and digits (25 KB),
// Noto Sans Georgian for Georgian, including capital Mtavruli for headlines (23 KB).
const inter = localFont({
  src: "./fonts/inter-latin.woff2",
  weight: "100 900",
  variable: "--font-inter",
  display: "swap",
});

const georgian = localFont({
  src: "./fonts/noto-georgian.woff2",
  weight: "100 900",
  variable: "--font-noto-georgian",
  display: "swap",
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  title: { default: `${site.name} - მოტო აქსესუარები`, template: `%s | ${site.name}` },
  description: site.description,
};

export const viewport: Viewport = { themeColor: "#111114" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ka" className={`${inter.variable} ${georgian.variable}`}>
      <body className="flex min-h-dvh flex-col bg-bg font-sans text-fg antialiased">{children}</body>
    </html>
  );
}
