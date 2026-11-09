import type { Metadata } from "next";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "დაბრუნების პირობები" };

// Draft text: replace it with your real return policy.
export default function ReturnsPage() {
  return (
    <main className="mx-auto max-w-2xl px-3 py-8 sm:px-4">
      <h1 className="text-xl font-bold">დაბრუნების პირობები</h1>
      <div className="mt-4 space-y-3 leading-7">
        <p>
          პროდუქტის დასაბრუნებლად ან გასაცვლელად დაგვირეკე ნომერზე{" "}
          <a href={site.phoneHref} className="underline">
            {site.phone}
          </a>{" "}
          და გვითხარი შეკვეთის ნომერი.
        </p>
        <p>შეინახე პროდუქტი და მისი შეფუთვა დაბრუნების პროცესის დასრულებამდე.</p>
      </div>
    </main>
  );
}
