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
  // Shown on the privacy and terms pages and in the footer. Fill in your registered details;
  // while legalName is empty the pages name the shop instead.
  legalName: "",
  taxId: "",
  description: "მოპედისა და სკუტერის აქსესუარები თბილისში: გათბობადი გრიფსები, დამტენები, ხელთათმანები, ტელეფონის დამჭერები და სხვა. მიწოდება თბილისში, გადახდა მიღებისას.",
  phone: "+995 599 03 33 72",
  phoneHref: "tel:+995599033372",
  // When orders are taken by phone and couriers run.
  hours: "ყოველდღე 10:00–22:00",
  // There is no shop yet; buyers can pick an order up here.
  pickup: {
    address: "დავით აღმაშენებლის ხეივანი 190",
    // Shown under the address so a first-time visitor finds the entrance.
    landmark: "„არქის“ კორპუსები, პორშე ცენტრის მოპირდაპირედ",
    hours: "11:00–17:00",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=David+Aghmashenebeli+Alley+190%2C+Tbilisi",
  },
  address: "თბილისი, დავით აღმაშენებლის ხეივანი 190",
  // Courier delivery anywhere in Tbilisi, in lari. Pickup is free.
  deliveryFee: 7,
  // Days a buyer has to return an order bought online (the consumer protection law gives 14).
  returnDays: 14,
  // Short promises in the bar above the menu and in the homepage banners. Keep them true.
  deliveryShort: "მიწოდება თბილისში",
  paymentShort: "გადახდა მიღებისას",
  pickupShort: "გატანა დიღომიდან",
  deliveryBanner: {
    title: "მიწოდება თბილისის მასშტაბით",
    text: "კურიერი შეკვეთას პირდაპირ მისამართზე მოგიტანს 7 ₾-ად. გადაიხდი მიღებისას, გატანა დიღომიდან უფასოა.",
  },
  supportBanner: {
    title: "გჭირდება რჩევა?",
    text: "გვითხარი შენი მოპედის მოდელი და გეტყვით, რომელი აქსესუარი მოერგება. ვპასუხობთ ყოველდღე, 10:00-დან 22:00-მდე.",
  },
  // Leave a link empty ("") to hide its icon.
  facebook: "https://www.facebook.com/scooterland.ge",
  instagram: "https://www.instagram.com/scooterland.ge",
  tiktok: "",
  youtube: "",
};
