import type { Metadata } from "next";
import { PhoneIcon } from "@/components/icons";
import { SocialLinks } from "@/components/social-links";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "კონტაქტი" };

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-2xl px-3 py-10 sm:px-4">
      <h1 className="border-l-4 border-accent pl-3 text-2xl font-extrabold">კონტაქტი</h1>
      <div className="mt-6 rounded-card border border-line bg-card p-6">
        <p className="text-muted">დაგვირეკე პროდუქტის, შეკვეთის ან მიწოდების შესახებ</p>
        <a href={site.phoneHref} className="mt-2 flex items-center gap-3 text-2xl font-bold hover:text-accent-hover">
          <PhoneIcon className="size-7 text-accent" />
          {site.phone}
        </a>
        <p className="mt-6 text-muted">ან მოგვწერე სოციალურ ქსელში</p>
        <SocialLinks className="mt-2 -ml-2" />
      </div>
    </main>
  );
}
