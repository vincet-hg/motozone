import type { Metadata } from "next";
import Link from "next/link";
import { BadgeIcon } from "@/components/icons";
import { InfoPage } from "@/components/info-page";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "მომსახურების პირობები", alternates: { canonical: "/terms" } };

const h2 = "mt-6 text-lg font-bold";
const link = "text-neon underline hover:text-neon";

// Draft text. Fill in your delivery times and fees, and have a lawyer review it before launch.
export default function TermsPage() {
  return (
    <InfoPage title="მომსახურების პირობები" icon={<BadgeIcon className="size-5" />}>
        <p>
          საიტს მართავს {site.legalName ? `${site.legalName}${site.taxId ? `, ს/კ ${site.taxId}` : ""}` : site.name}. შეკვეთის გაფორმებით ეთანხმები ამ პირობებს.
        </p>

        <h2 className={h2}>შეკვეთა</h2>
        <p>შეკვეთის შემდეგ დაგირეკავთ დასადასტურებლად. შეკვეთა ძალაშია დადასტურების შემდეგ. თუ პროდუქტი მარაგში აღარ აღმოჩნდა, გაცნობებთ და შეკვეთას გავაუქმებთ ან შემცვლელს შემოგთავაზებთ.</p>

        <h2 className={h2}>ფასი და გადახდა</h2>
        <p>ფასები მითითებულია ლარში და მოიცავს დღგ-ს, თუ ის ვრცელდება. გადახდა ხდება ნივთის მიღებისას, კურიერთან ან გატანისას. მიწოდების საფასურს შეკვეთის დადასტურებისას გეტყვით.</p>

        <h2 className={h2}>მიწოდება</h2>
        <p>
          მიწოდება ხდება თბილისის მასშტაბით. შეკვეთის გატანა შეიძლება მისამართიდან {site.pickup.address}, ყოველდღე {site.pickup.hours}.
          დეტალები: <Link href="/delivery" className={link}>მიწოდება და გატანა</Link>.
        </p>

        <h2 className={h2}>დაბრუნება</h2>
        <p>
          ონლაინ შეძენილ ნივთზე შეგიძლია უარი თქვა მიღებიდან {site.returnDays} დღის განმავლობაში. დეტალები:{" "}
          <Link href="/returns" className={link}>დაბრუნება და გაცვლა</Link>.
        </p>

        <h2 className={h2}>კონტაქტი</h2>
        <p>
          <a href={site.phoneHref} className={link}>{site.phone}</a>, <a href={`mailto:${site.email}`} className={link}>{site.email}</a>
        </p>

        <p className="mt-6 text-sm text-muted">ბოლო განახლება: 2026 წლის ნოემბერი.</p>
    </InfoPage>
  );
}
