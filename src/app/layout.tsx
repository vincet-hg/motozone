import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { isLiveSite, site } from "@/lib/site";
import { Toaster } from "@/components/toaster";
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
  metadataBase: new URL(site.url),
  title: { default: `${site.name}: მოპედისა და სკუტერის აქსესუარები თბილისში`, template: `%s | ${site.name}` },
  description: site.description,
  applicationName: site.name,
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "ka_GE",
  },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false },
  // Previews must never show up in Google, even if robots.txt is ignored.
  robots: isLiveSite ? undefined : { index: false, follow: false },
  // Paste the code from Google Search Console > Settings > Ownership verification > HTML tag.
  verification: process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : undefined,
};

export const viewport: Viewport = { themeColor: "#0b0d10" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ka" className={`${inter.variable} ${georgian.variable}`}>
      <body className="flex min-h-dvh flex-col bg-bg font-sans text-fg antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
