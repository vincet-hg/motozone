import type { Metadata } from "next";
import { ErrorView } from "@/components/error-view";

export const metadata: Metadata = { title: "გვერდი ვერ მოიძებნა", robots: { index: false, follow: true } };

export default function NotFound() {
  return (
    <ErrorView
      mark="404"
      title="გვერდი ვერ მოიძებნა"
      text="ეს გვერდი არ არსებობს ან წაიშალა. შეიძლება პროდუქტი აღარ იყიდება. მოძებნე ის, რაც გჭირდება, ან დაბრუნდი მთავარზე."
      search
    />
  );
}
