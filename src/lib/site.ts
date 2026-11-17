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
  // Short promises in the bar above the menu and in the homepage banners. Keep them true:
  // write "უფასო მიწოდება" only if delivery really is free, and real working hours below.
  deliveryShort: "მიწოდება მთელ საქართველოში",
  paymentShort: "გადახდა პროდუქტის მიღებისას",
  deliveryBanner: {
    title: "მიწოდება მთელ საქართველოში",
    text: "შეკვეთას დაგირეკავთ დასადასტურებლად და კურიერი პირდაპირ მისამართზე მოგიტანს.",
  },
  // Four short promises under the homepage slider.
  trust: [
    { icon: "truck", title: "მიწოდება", text: "მთელ საქართველოში" },
    { icon: "shield", title: "უსაფრთხო გადახდა", text: "იხდი პროდუქტის მიღებისას" },
    { icon: "badge", title: "ხარისხიანი პროდუქცია", text: "შემოწმებული აქსესუარები" },
    { icon: "headset", title: "კონსულტაცია", text: "დაგეხმარებით არჩევაში" },
  ] as const,
  supportBanner: {
    title: "გჭირდება დახმარება?",
    text: "გვკითხე, რომელი აქსესუარი მოერგება შენს მოპედს. დაგვირეკე ან მოგვწერე სოციალურ ქსელებში.",
  },
  phoneHref: "tel:+995555123456",
  // Leave a link empty ("") to hide its icon.
  facebook: "https://www.facebook.com/",
  instagram: "https://www.instagram.com/",
  tiktok: "",
  youtube: "",
};
