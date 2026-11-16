// Business details shown across the store. Edit them here.
export const site = {
  name: "Scooter Land",
  // Full address of the live store, without a trailing slash. Set NEXT_PUBLIC_SITE_URL per environment.
  url: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, ""),
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
