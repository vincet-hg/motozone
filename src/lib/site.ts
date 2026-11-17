const vercelAddress = (host: string | undefined) => (host ? `https://${host}` : "http://localhost:3000");

// Search engines index only the live store: the domain is set and this is not a Vercel preview.
export const isLiveSite =
  Boolean(process.env.NEXT_PUBLIC_SITE_URL) &&
  !["preview", "development"].includes(process.env.VERCEL_ENV ?? "") &&
  process.env.NEXT_PUBLIC_ALLOW_INDEXING !== "false";

// Business details shown across the store. Edit them here.
export const site = {
  name: "Scooter Land",
  // Full address of the store, without a trailing slash. Production sets NEXT_PUBLIC_SITE_URL to the domain.
  // Vercel previews fall back to their own address, so links and the sitemap point at the preview.
  url: (
    process.env.NEXT_PUBLIC_SITE_URL ||
    vercelAddress(process.env.NEXT_PUBLIC_VERCEL_BRANCH_URL || process.env.VERCEL_BRANCH_URL || process.env.VERCEL_URL)
  ).replace(/\/+$/, ""),
  email: "info@scooterland.ge",
  // Shown on the privacy and terms pages. Fill in your registered details.
  legalName: "ი/მ ...",
  taxId: "...",
  address: "თბილისი, საქართველო",
  description: "მოტოციკლისა და მოპედის აქსესუარები საქართველოში: გრიფსები, დამტენები, ხელთათმანები და სხვა.",
  phone: "+995 555 123 456",
  phoneHref: "tel:+995555123456",
  // Leave a link empty ("") to hide its icon.
  facebook: "https://www.facebook.com/",
  instagram: "https://www.instagram.com/",
  tiktok: "",
  youtube: "",
};

// The four promises under the homepage banner. Keep them true for your shop.
export const benefits = [
  { icon: "truck", title: "მიწოდება", text: "მთელ საქართველოში", href: "/delivery" },
  { icon: "cash", title: "გადახდა მიტანისას", text: "იხდი პროდუქტის მიღებისას", href: "/delivery" },
  { icon: "phone", title: "კონსულტაცია", text: site.phone, href: site.phoneHref },
  { icon: "return", title: "დაბრუნება", text: "დაბრუნების პირობები", href: "/returns" },
] as const;
