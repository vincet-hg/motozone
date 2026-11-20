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
    address: "თბილისი, დიღომი, აღმაშენებლის 67",
    hours: "11:00–17:00",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=%E1%83%90%E1%83%A6%E1%83%9B%E1%83%90%E1%83%A8%E1%83%94%E1%83%9C%E1%83%94%E1%83%91%E1%83%9A%E1%83%98%E1%83%A1+%E1%83%AE%E1%83%94%E1%83%98%E1%83%95%E1%83%90%E1%83%9C%E1%83%98+67%2C+%E1%83%93%E1%83%98%E1%83%A6%E1%83%9D%E1%83%9B%E1%83%98%2C+%E1%83%97%E1%83%91%E1%83%98%E1%83%9A%E1%83%98%E1%83%A1%E1%83%98",
  },
  address: "თბილისი, დიღომი, აღმაშენებლის 67",
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
