import type { Metadata } from "next";
import { ShieldIcon } from "@/components/icons";
import { InfoPage } from "@/components/info-page";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "კონფიდენციალურობის პოლიტიკა", alternates: { canonical: "/privacy" } };

const h2 = "mt-6 text-lg font-bold";

// Draft text written for this store's actual data flows. Have a lawyer review it before launch.
export default function PrivacyPage() {
  return (
    <InfoPage title="კონფიდენციალურობის პოლიტიკა" icon={<ShieldIcon className="size-5" />}>
        <p>
          ეს პოლიტიკა აღწერს, რა მონაცემებს აგროვებს {site.name}{site.legalName ? ` (${site.legalName}${site.taxId ? `, ს/კ ${site.taxId}` : ""})` : ""} და როგორ იყენებს მათ.
        </p>

        <h2 className={h2}>რა მონაცემებს ვაგროვებთ</h2>
        <p>შეკვეთის გაფორმებისას: სახელს, ტელეფონის ნომერს, მიწოდების მისამართს (თუ მიტანას აირჩევ) და შენიშვნას, თუ მას დაწერ. ანგარიშის შექმნა საჭირო არ არის.</p>
        <p>კალათა და სურვილების სია ინახება მხოლოდ შენს ბრაუზერში და ჩვენთან არ იგზავნება შეკვეთის გაფორმებამდე.</p>
        <p>უსაფრთხოებისთვის დროებით ვინახავთ IP მისამართის შიფრირებულ (hash) ფორმას, რომ ავტომატური სპამი შევაჩეროთ. ის 1 დღეში იშლება.</p>

        <h2 className={h2}>რისთვის ვიყენებთ</h2>
        <p>მხოლოდ შეკვეთის დასადასტურებლად, მისატანად, დაბრუნების დასამუშავებლად და კანონით მოთხოვნილი აღრიცხვისთვის. მონაცემებს არ ვყიდით და სარეკლამოდ არ ვაზიარებთ.</p>

        <h2 className={h2}>ვის გადაეცემა</h2>
        <p>
          მონაცემები ინახება ჩვენი ტექნიკური პარტნიორების სერვერებზე: Supabase (მონაცემთა ბაზა) და Vercel (საიტის ჰოსტინგი). შეკვეთის
          შეტყობინება იგზავნება მაღაზიის Telegram-ში. მიტანისას მისამართი და ტელეფონი გადაეცემა კურიერს, რომელიც შეკვეთას მოგიტანს.
        </p>

        <h2 className={h2}>რამდენ ხანს ვინახავთ</h2>
        <p>შეკვეთის მონაცემებს ვინახავთ იმდენ ხანს, რამდენიც საჭიროა ბუღალტრული და საგადასახადო ვალდებულებებისთვის.</p>

        <h2 className={h2}>შენი უფლებები</h2>
        <p>
          საქართველოს კანონის „პერსონალურ მონაცემთა დაცვის შესახებ“ თანახმად, შეგიძლია მოითხოვო შენი მონაცემების ნახვა, გასწორება ან
          წაშლა, თუ მათი შენახვა კანონით აღარ არის სავალდებულო. მოგვწერე{" "}
          <a href={`mailto:${site.email}`} className="text-neon underline hover:text-neon">{site.email}</a> ან დაგვირეკე{" "}
          <a href={site.phoneHref} className="text-neon underline hover:text-neon">{site.phone}</a>.
        </p>

        <p className="mt-6 text-sm text-muted">ბოლო განახლება: 2026 წლის ნოემბერი.</p>
    </InfoPage>
  );
}
