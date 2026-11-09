import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { site } from "@/lib/site";
import "./globals.css";

// Modern Georgian letters only (10 KB). Latin and digits use the system font.
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

export const viewport: Viewport = { themeColor: "#ffffff" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ka" className={georgian.variable}>
      <body className="flex min-h-dvh flex-col bg-white font-sans text-black antialiased">{children}</body>
    </html>
  );
}
