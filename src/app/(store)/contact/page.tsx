import type { Metadata } from "next";
import { ClockIcon, MailIcon, PhoneIcon, PinIcon } from "@/components/icons";
import { InfoCard, InfoPage } from "@/components/info-page";
import { SocialLinks } from "@/components/social-links";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "კონტაქტი",
  description: `დაგვირეკე ${site.phone}, ${site.hours}. შეკვეთის გატანა: ${site.pickup.address}.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <InfoPage title="კონტაქტი" icon={<PhoneIcon className="size-5" />} lead="დაგვირეკე პროდუქტის, შეკვეთის ან მიწოდების შესახებ. ყველაზე სწრაფად ტელეფონით გიპასუხებთ.">
      <a
        href={site.phoneHref}
        className="flex items-center justify-between gap-4 rounded-card border border-neon/40 bg-gradient-to-r from-accent/20 to-card p-5 transition-colors hover:border-neon"
      >
        <span>
          <span className="block text-sm text-muted">ტელეფონი, {site.hours.toLowerCase()}</span>
          <span className="mt-1 block text-[22px] font-extrabold whitespace-nowrap text-fg min-[380px]:text-2xl sm:text-3xl">{site.phone}</span>
        </span>
        <span className="hidden size-12 shrink-0 items-center min-[380px]:flex justify-center rounded-full bg-accent text-white shadow-[0_0_24px_-4px_rgba(227,18,11,0.9)]">
          <PhoneIcon className="size-6" />
        </span>
      </a>

      <div className="grid gap-3 sm:grid-cols-2">
        <InfoCard icon={<PinIcon className="size-5" />} title="შეკვეთის გატანა">
          {site.pickup.address}
          <br />
          ყოველდღე {site.pickup.hours}.{" "}
          <a href={site.pickup.mapUrl} target="_blank" rel="noopener" className="text-neon underline">
            რუკაზე ნახვა ↗
          </a>
        </InfoCard>
        <InfoCard icon={<ClockIcon className="size-5" />} title="სამუშაო საათები">
          შეკვეთები და კონსულტაცია: {site.hours}
          <br />
          გატანა: {site.pickup.hours}
        </InfoCard>
        <InfoCard icon={<MailIcon className="size-5" />} title="ელფოსტა">
          <a href={`mailto:${site.email}`} className="text-neon underline [overflow-wrap:anywhere]">
            {site.email}
          </a>
        </InfoCard>
        <div className="rounded-card border border-line bg-card p-5">
          <h2 className="font-bold text-fg">სოციალური ქსელები</h2>
          <p className="mt-1 text-sm text-muted">სიახლეები და აქციები, მოგვწერე იქაც.</p>
          <SocialLinks className="mt-2 -ml-2" />
        </div>
      </div>
      <p className="text-sm text-muted">მაღაზია ჯერ არ გვაქვს. გატანის მისამართზე მოსვლამდე დაგვირეკე, რომ შეკვეთა მზად დაგახვედროთ.</p>
    </InfoPage>
  );
}
