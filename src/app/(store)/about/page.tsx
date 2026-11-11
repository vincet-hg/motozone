import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "შესახებ" };

// Draft text: tell your own story here.
export default function AboutPage() {
  return (
    <main className="mx-auto max-w-2xl px-3 py-10 sm:px-4">
      <h1 className="border-l-4 border-accent pl-3 text-2xl font-extrabold">ჩვენ შესახებ</h1>
      <div className="mt-5 space-y-4 leading-7 text-fg/85">
        <p>Scooter Land არის მოტოციკლისა და მოპედის აქსესუარების მაღაზია საქართველოში.</p>
        <p>ვყიდით იმას, რაც ყოველდღიურ სიარულს უფრო კომფორტულს და უსაფრთხოს ხდის: გათბობად გრიფსებს, დამტენებს, ხელთათმანებს, ტელეფონის დამჭერებს და სხვა აქსესუარებს.</p>
        <p>
          კითხვა თუ გაქვს,{" "}
          <Link href="/contact" className="text-accent underline hover:text-accent-hover">
            დაგვიკავშირდი
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
