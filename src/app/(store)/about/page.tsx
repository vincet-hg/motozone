import type { Metadata } from "next";
import Link from "next/link";
import { BadgeIcon, CashIcon, HeadsetIcon, TruckIcon } from "@/components/icons";
import { InfoCard, InfoPage } from "@/components/info-page";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "ჩვენ შესახებ",
  description: "Scooter Land: მოპედისა და სკუტერის აქსესუარების ონლაინ მაღაზია თბილისში. მიწოდება თბილისში, გადახდა მიღებისას.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <InfoPage
      title="ჩვენ შესახებ"
      icon={<BadgeIcon className="size-5" />}
      lead="Scooter Land მოპედისა და სკუტერის აქსესუარების ონლაინ მაღაზიაა თბილისში. ვარჩევთ იმას, რაც ყოველდღიურ მგზავრობას უფრო თბილს, კომფორტულს და უსაფრთხოს ხდის."
    >
      <p>
        ზამთარში გათბობადი გრიფსები და ხელის საფარები, წვიმაში წყალგაუმტარი ჩიხოლი და ტელეფონის ჩანთა, ყოველდღე კი საიმედო დამჭერი
        ნავიგაციისთვის და დამტენი, რომ ტელეფონი გზაში არ დაგიჯდეს. ყველაფერი ერთ ადგილას, კურიერებისა და ყოველდღიური მძღოლებისთვის.
      </p>
      <p>
        ჯერ მაღაზია არ გვაქვს, ამიტომ შეკვეთას კურიერით მოგიტანთ ან თავად გაიტან დიღომიდან. ფულს იხდი მხოლოდ მაშინ, როცა ნივთს ხელში
        აიღებ.
      </p>

      <div className="grid gap-3 pt-2 sm:grid-cols-3">
        <InfoCard icon={<TruckIcon className="size-5" />} title="მიწოდება თბილისში">
          კურიერი მისამართზე მოგიტანს. <Link href="/delivery" className="text-neon underline">დეტალები</Link>
        </InfoCard>
        <InfoCard icon={<CashIcon className="size-5" />} title="გადახდა მიღებისას">
          წინასწარ არაფერს იხდი.
        </InfoCard>
        <InfoCard icon={<HeadsetIcon className="size-5" />} title="რჩევა არჩევაში">
          დაგვირეკე, {site.hours.toLowerCase()}.
        </InfoCard>
      </div>

      <p>
        არ იცი, რომელი აქსესუარი მოერგება შენს მოპედს? დაგვირეკე <a href={site.phoneHref}>{site.phone}</a>, გვითხარი მოდელი და
        გეტყვით.
      </p>
    </InfoPage>
  );
}
