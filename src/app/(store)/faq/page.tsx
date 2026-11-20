import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { HeadingIcon } from "@/components/heading-icon";
import { ChevronIcon, HeadsetIcon } from "@/components/icons";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "ხშირად დასმული კითხვები",
  description: "შეკვეთა, გადახდა მიღებისას, მიწოდება თბილისში, გატანა და დაბრუნება Scooter Land-ში.",
  alternates: { canonical: "/faq" },
};

const link = "text-neon underline hover:text-neon";

// Edit the answers to match how your shop works. Plain text answers also go to Google (FAQPage).
const QUESTIONS: { question: string; text: string; answer: React.ReactNode }[] = [
  {
    question: "როგორ გავაფორმო შეკვეთა?",
    text: "დაამატე პროდუქტები კალათაში, მიუთითე სახელი და ტელეფონი, აირჩიე მიტანა ან გატანა და დააჭირე „შეკვეთის გაფორმებას“. დასადასტურებლად დაგირეკავთ. ანგარიშის შექმნა საჭირო არ არის.",
    answer: (
      <>
        დაამატე პროდუქტები კალათაში, მიუთითე სახელი და ტელეფონი, აირჩიე მიტანა ან გატანა და დააჭირე „შეკვეთის გაფორმებას“. დასადასტურებლად
        დაგირეკავთ. ანგარიშის შექმნა საჭირო არ არის. შეკვეთა ტელეფონითაც შეგიძლია: <a href={site.phoneHref} className={link}>{site.phone}</a>.
      </>
    ),
  },
  {
    question: "როგორ გადავიხადო?",
    text: "გადახდა ხდება ნივთის მიღებისას, კურიერთან ან გატანისას. წინასწარ არაფერს იხდი.",
    answer: <>გადახდა ხდება ნივთის მიღებისას, კურიერთან ან გატანისას. წინასწარ არაფერს იხდი.</>,
  },
  {
    question: "სად აწვდით და რა ღირს მიწოდება?",
    text: `მიწოდება გვაქვს თბილისის მასშტაბით, ${site.deliveryFee} ₾. დროს შეკვეთის დადასტურებისას შევთანხმდებით. გატანა დიღომიდან უფასოა.`,
    answer: (
      <>
        მიწოდება გვაქვს თბილისის მასშტაბით, {site.deliveryFee} ₾. დროს შეკვეთის დადასტურებისას შევთანხმდებით. გატანა დიღომიდან უფასოა. დეტალები:{" "}
        <Link href="/delivery" className={link}>მიწოდება და გატანა</Link>.
      </>
    ),
  },
  {
    question: "შემიძლია თავად გავიტანო?",
    text: `კი. გატანა შეიძლება მისამართიდან ${site.pickup.address} (${site.pickup.landmark}), ყოველდღე ${site.pickup.hours}. კალათაში აირჩიე „გატანა“ და მოსვლამდე დაგირეკავთ.`,
    answer: (
      <>
        კი. გატანა შეიძლება მისამართიდან {site.pickup.address} ({site.pickup.landmark}), ყოველდღე {site.pickup.hours}. კალათაში აირჩიე „გატანა“ და მოსვლამდე
        დაგირეკავთ. <a href={site.pickup.mapUrl} target="_blank" rel="noopener" className={link}>რუკაზე ნახვა ↗</a>
      </>
    ),
  },
  {
    question: "მოერგება თუ არა აქსესუარი ჩემს მოპედს?",
    text: "დაგვირეკე, გვითხარი მოპედის მოდელი და გეტყვით, რომელი აქსესუარი მოერგება.",
    answer: (
      <>
        დაგვირეკე <a href={site.phoneHref} className={link}>{site.phone}</a>, გვითხარი მოპედის მოდელი და გეტყვით, რომელი აქსესუარი
        მოერგება.
      </>
    ),
  },
  {
    question: "შემიძლია ნივთის დაბრუნება?",
    text: `კი, მიღებიდან ${site.returnDays} დღის განმავლობაში, თუ ნივთი გამოუყენებელია. დაზიანებულ ან არასწორ ნივთს უფასოდ გამოგიცვლით.`,
    answer: (
      <>
        კი, მიღებიდან {site.returnDays} დღის განმავლობაში, თუ ნივთი გამოუყენებელია. დაზიანებულ ან არასწორ ნივთს უფასოდ გამოგიცვლით.
        დეტალები: <Link href="/returns" className={link}>დაბრუნება და გაცვლა</Link>.
      </>
    ),
  },
  {
    question: "პროდუქტებს გარანტია აქვს?",
    text: "ამ ეტაპზე დამატებით გარანტიას არ ვცემთ, მაგრამ თუ ნივთი დაზიანებული მოვიდა ან არ მუშაობს, გამოგიცვლით ან თანხას დაგიბრუნებთ.",
    answer: <>ამ ეტაპზე დამატებით გარანტიას არ ვცემთ, მაგრამ თუ ნივთი დაზიანებული მოვიდა ან არ მუშაობს, გამოგიცვლით ან თანხას დაგიბრუნებთ.</>,
  },
  {
    question: "როგორ გავიგო ჩემი შეკვეთის სტატუსი?",
    text: `დაგვირეკე ${site.hours.toLowerCase()} და შეკვეთის ნომრით გეტყვით, სად არის.`,
    answer: (
      <>
        დაგვირეკე <a href={site.phoneHref} className={link}>{site.phone}</a> ({site.hours.toLowerCase()}) და შეკვეთის ნომრით გეტყვით, სად
        არის.
      </>
    ),
  },
];

export default function FaqPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: QUESTIONS.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: { "@type": "Answer", text: item.text },
          })),
        }}
      />
      <h1 className="flex items-center gap-3 text-2xl font-extrabold sm:text-[28px]">
        <HeadingIcon>
          <HeadsetIcon className="size-5" />
        </HeadingIcon>
        ხშირად დასმული კითხვები
      </h1>
      <p className="mt-4 text-[17px] leading-8 text-fg/85">
        ვერ იპოვე პასუხი? დაგვირეკე <a href={site.phoneHref} className={link}>{site.phone}</a>, {site.hours.toLowerCase()}.
      </p>
      <div className="mt-8 space-y-3">
        {QUESTIONS.map((item) => (
          <details key={item.question} className="group rounded-card border border-line bg-card transition-colors open:border-accent/50">
            <summary className="flex cursor-pointer items-center justify-between gap-4 p-5 font-semibold">
              {item.question}
              <ChevronIcon className="size-5 shrink-0 text-muted transition-transform duration-200 group-open:rotate-180 group-open:text-neon" />
            </summary>
            <p className="-mt-1 px-5 pb-5 leading-7 text-fg/80">{item.answer}</p>
          </details>
        ))}
      </div>
    </main>
  );
}
