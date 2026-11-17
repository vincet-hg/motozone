import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { ChevronIcon } from "@/components/icons";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "ხშირად დასმული კითხვები",
  description: "შეკვეთა, გადახდა, მიწოდება და დაბრუნება Scooter Land-ში.",
  alternates: { canonical: "/faq" },
};

const link = "text-accent-hover underline hover:text-accent";

// Edit the answers to match how your shop works. Plain text answers also go to Google (FAQPage).
const QUESTIONS: { question: string; text: string; answer: React.ReactNode }[] = [
  {
    question: "როგორ გავაფორმო შეკვეთა?",
    text: "დაამატე პროდუქტები კალათაში, შეავსე სახელი, ტელეფონი და მისამართი და დააჭირე „შეკვეთის გაფორმებას“. დასადასტურებლად დაგირეკავთ.",
    answer: (
      <>
        დაამატე პროდუქტები კალათაში, შეავსე სახელი, ტელეფონი და მისამართი და დააჭირე „შეკვეთის გაფორმებას“. დასადასტურებლად დაგირეკავთ. ანგარიშის შექმნა საჭირო
        არ არის.
      </>
    ),
  },
  {
    question: "როგორ გადავიხადო?",
    text: "გადახდა ხდება პროდუქტის მიღებისას.",
    answer: <>გადახდა ხდება პროდუქტის მიღებისას. წინასწარ არაფერს იხდი.</>,
  },
  {
    question: "რამდენ ხანში მოვა შეკვეთა და რა ღირს მიწოდება?",
    text: "ვადები და ფასები მიწოდების გვერდზეა.",
    answer: (
      <>
        ვადები და ფასები იხილე <Link href="/delivery" className={link}>მიწოდების გვერდზე</Link>. ზუსტ დროს შეკვეთის დადასტურებისას გეტყვით.
      </>
    ),
  },
  {
    question: "მოერგება თუ არა აქსესუარი ჩემს მოპედს?",
    text: "თავსებადობა თითოეული პროდუქტის გვერდზეა მითითებული. თუ ეჭვი გაქვს, დაგვირეკე და მოდელის მიხედვით გეტყვით.",
    answer: (
      <>
        თავსებადობა თითოეული პროდუქტის გვერდზეა მითითებული. თუ ეჭვი გაქვს, დაგვირეკე{" "}
        <a href={site.phoneHref} className={link}>{site.phone}</a> და მოდელის მიხედვით გეტყვით.
      </>
    ),
  },
  {
    question: "შემიძლია პროდუქტის დაბრუნება?",
    text: "დაბრუნების პირობები დაბრუნების გვერდზეა.",
    answer: (
      <>
        პირობები იხილე <Link href="/returns" className={link}>დაბრუნების გვერდზე</Link>.
      </>
    ),
  },
  {
    question: "როგორ გავიგო ჩემი შეკვეთის სტატუსი?",
    text: "დაგვირეკე ან მოგვწერე და შეკვეთის ნომრით გეტყვით, სად არის.",
    answer: (
      <>
        დაგვირეკე <a href={site.phoneHref} className={link}>{site.phone}</a> ან მოგვწერე და შეკვეთის ნომრით გეტყვით, სად არის.
      </>
    ),
  },
];

export default function FaqPage() {
  return (
    <main className="mx-auto max-w-3xl px-3 py-10 sm:px-4">
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
      <h1 className="text-3xl font-black tracking-tight">ხშირად დასმული კითხვები</h1>
      <p className="mt-2 text-muted">ვერ იპოვე პასუხი? დაგვიკავშირდი, სიამოვნებით დაგეხმარებით.</p>
      <div className="mt-8 space-y-3">
        {QUESTIONS.map((item) => (
          <details key={item.question} className="group rounded-card border border-line bg-card transition-colors open:border-accent/50">
            <summary className="flex cursor-pointer items-center justify-between gap-4 p-5 font-semibold">
              {item.question}
              <ChevronIcon className="size-5 shrink-0 text-muted transition-transform duration-200 group-open:rotate-180 group-open:text-accent-hover" />
            </summary>
            <p className="-mt-1 px-5 pb-5 leading-7 text-fg/80">{item.answer}</p>
          </details>
        ))}
      </div>
    </main>
  );
}
