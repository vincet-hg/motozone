import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "მომსახურების პირობები", alternates: { canonical: "/terms" } };

const h2 = "mt-6 text-lg font-bold";
const link = "text-neon underline hover:text-neon";

// Draft text. Fill in your delivery times and fees, and have a lawyer review it before launch.
export default function TermsPage() {
  return (
    <main className="mx-auto max-w-2xl px-3 py-8 sm:px-4">
      <h1 className="text-2xl font-extrabold">მომსახურების პირობები</h1>
      <div className="mt-4 space-y-3 leading-7 text-fg/85">
        <p>
          საიტს მართავს {site.legalName} (ს/კ {site.taxId}, {site.address}). შეკვეთის გაფორმებით ეთანხმები ამ პირობებს.
        </p>

        <h2 className={h2}>შეკვეთა</h2>
        <p>შეკვეთის შემდეგ დაგირეკავთ დასადასტურებლად. შეკვეთა ძალაშია დადასტურების შემდეგ. თუ პროდუქტი მარაგში აღარ აღმოჩნდა, გაცნობებთ და შეკვეთას გავაუქმებთ ან შემცვლელს შემოგთავაზებთ.</p>

        <h2 className={h2}>ფასი და გადახდა</h2>
        <p>ფასები მითითებულია ლარში და მოიცავს დღგ-ს, თუ ის ვრცელდება. გადახდა ხდება პროდუქტის მიღებისას. მიწოდების საფასური ცალკე ჩანს შეკვეთის დადასტურებისას.</p>

        <h2 className={h2}>მიწოდება</h2>
        <p>
          ვადები და ფასები იხილე <Link href="/delivery" className={link}>მიწოდების გვერდზე</Link>.
        </p>

        <h2 className={h2}>დაბრუნება</h2>
        <p>
          პირობები იხილე <Link href="/returns" className={link}>დაბრუნების გვერდზე</Link>.
        </p>

        <h2 className={h2}>კონტაქტი</h2>
        <p>
          <a href={site.phoneHref} className={link}>{site.phone}</a>, <a href={`mailto:${site.email}`} className={link}>{site.email}</a>
        </p>

        <p className="mt-6 text-sm text-muted">ბოლო განახლება: 2026 წლის ნოემბერი.</p>
      </div>
    </main>
  );
}
