import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-md flex-1 px-4 py-20 text-center">
      <h1 className="text-2xl font-extrabold">გვერდი ვერ მოიძებნა</h1>
      <Link href="/" className="mt-4 inline-block text-accent underline">
        პროდუქტებზე დაბრუნება
      </Link>
    </main>
  );
}
