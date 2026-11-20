import type { Metadata } from "next";
import Link from "next/link";
import { CashIcon, PinIcon, TruckIcon } from "@/components/icons";
import { InfoCard, InfoPage } from "@/components/info-page";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "მიწოდება და გატანა",
  description: `მიწოდება თბილისის მასშტაბით ${site.deliveryFee} ₾-ად ან უფასო გატანა დიღომიდან (${site.pickup.address}). გადახდა მიღებისას.`,
  alternates: { canonical: "/delivery" },
};

// Delivery price and time are told on the confirmation call; add them here once they are fixed.
export default function DeliveryPage() {
  return (
    <InfoPage
      title="მიწოდება და გატანა"
      icon={<TruckIcon className="size-5" />}
      lead={`შეკვეთას მოგიტანთ თბილისის ნებისმიერ მისამართზე ${site.deliveryFee} ₾-ად, ან უფასოდ გაიტან დიღომიდან. ორივე შემთხვევაში იხდი მხოლოდ მიღებისას.`}
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <InfoCard icon={<TruckIcon className="size-5" />} title="მიტანა">
          {site.deliveryFee} ₾, თბილისის ნებისმიერ მისამართზე, კურიერით.
        </InfoCard>
        <InfoCard icon={<PinIcon className="size-5" />} title="გატანა">
          უფასოდ, {site.pickup.address}, ყოველდღე {site.pickup.hours}.
        </InfoCard>
        <InfoCard icon={<CashIcon className="size-5" />} title="გადახდა">
          მიღებისას. წინასწარ არაფერს იხდი.
        </InfoCard>
      </div>

      <h2>როგორ მუშაობს</h2>
      <ul>
        <li>
          აირჩიე პროდუქტები, კალათაში მიუთითე სახელი და ტელეფონი და აირჩიე: <b className="text-fg">მიტანა</b> ან{" "}
          <b className="text-fg">გატანა</b>.
        </li>
        <li>დაგირეკავთ შეკვეთის დასადასტურებლად ({site.hours.toLowerCase()}). ამ ზარში შევთანხმდებით მიტანის დროზე.</li>
        <li>კურიერი შეკვეთას მისამართზე მოგიტანს, ან გატანისას შეკვეთა მზად დაგხვდება.</li>
        <li>ნივთს ნახავ, შეამოწმებ და მერე გადაიხდი.</li>
      </ul>

      <h2>მიწოდება თბილისის გარეთ</h2>
      <p>
        ამ ეტაპზე მიწოდება მხოლოდ თბილისში გვაქვს. თუ სხვა ქალაქში ხარ, დაგვირეკე <a href={site.phoneHref}>{site.phone}</a> და
        ვეცდებით, გამოსავალი ვიპოვოთ.
      </p>

      <p>
        კითხვები? ნახე <Link href="/faq">ხშირი კითხვები</Link> ან <Link href="/contact">დაგვიკავშირდი</Link>.
      </p>
    </InfoPage>
  );
}
