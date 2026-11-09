import type { Metadata } from "next";

export const metadata: Metadata = { title: "მიწოდება" };

// Draft text: replace it with your real delivery terms, prices and timing.
export default function DeliveryPage() {
  return (
    <main className="mx-auto max-w-2xl px-3 py-8 sm:px-4">
      <h1 className="text-xl font-bold">მიწოდება</h1>
      <div className="mt-4 space-y-3 leading-7">
        <p>შეკვეთის გაფორმების შემდეგ დაგირეკავთ მითითებულ ნომერზე და დავადასტურებთ დეტალებს.</p>
        <p>მიწოდების ვადასა და ღირებულებას შეკვეთის დადასტურებისას გეტყვით.</p>
        <p>გადახდა ხდება პროდუქტის მიტანისას.</p>
      </div>
    </main>
  );
}
