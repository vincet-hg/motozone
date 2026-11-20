import type { Metadata } from "next";
import { ReturnIcon } from "@/components/icons";
import { InfoPage } from "@/components/info-page";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "დაბრუნება და გაცვლა",
  description: `ონლაინ შეძენილი პროდუქტის დაბრუნება ${site.returnDays} დღის განმავლობაში. დაზიანებული ან არასწორი ნივთი გამოიცვლება.`,
  alternates: { canonical: "/returns" },
};

// Draft written around Georgia's consumer protection law (14 days to withdraw from a distance sale).
// Have a lawyer check it before launch, together with the terms page.
export default function ReturnsPage() {
  return (
    <InfoPage
      title="დაბრუნება და გაცვლა"
      icon={<ReturnIcon className="size-5" />}
      lead={`თუ ნივთი არ მოგეწონა ან არ მოერგო, შეგიძლია დააბრუნო მიღებიდან ${site.returnDays} დღის განმავლობაში.`}
    >
      <h2>როგორ დავაბრუნო</h2>
      <ul>
        <li>
          დაგვირეკე <a href={site.phoneHref}>{site.phone}</a> ({site.hours.toLowerCase()}) და გვითხარი შეკვეთის ნომერი.
        </li>
        <li>შევთანხმდებით, როდის და სად ჩაიბარებთ ნივთს, ან მოიტან გატანის მისამართზე: {site.pickup.address}.</li>
        <li>ნივთის შემოწმების შემდეგ გადახდილ თანხას დაგიბრუნებთ.</li>
      </ul>

      <h2>პირობები</h2>
      <ul>
        <li>ნივთი უნდა იყოს გამოუყენებელი, სრული კომპლექტით და, სასურველია, ორიგინალი შეფუთვით.</li>
        <li>დაბრუნების ტრანსპორტირების ხარჯი მყიდველს ეკისრება, თუ ნივთი უწესივრო არ არის.</li>
      </ul>

      <h2>დაზიანებული ან არასწორი ნივთი</h2>
      <p>
        თუ ნივთი დაზიანებული მოვიდა, არ მუშაობს ან სხვა გამოგიგზავნეთ, დაგვირეკე და უფასოდ გამოგიცვლით ან თანხას დაგიბრუნებთ.
        მიღებისას ნივთი კურიერთან ერთად შეამოწმე.
      </p>

      <h2>გარანტია</h2>
      <p>ამ ეტაპზე დამატებით გარანტიას არ ვცემთ. კანონით გათვალისწინებული უფლებები უწესივრო ნივთზე ნებისმიერ შემთხვევაში მოქმედებს.</p>
    </InfoPage>
  );
}
