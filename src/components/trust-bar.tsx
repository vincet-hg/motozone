import { site } from "@/lib/site";
import { BadgeIcon, HeadsetIcon, ShieldIcon, TruckIcon } from "./icons";

const ICONS = { truck: TruckIcon, shield: ShieldIcon, badge: BadgeIcon, headset: HeadsetIcon };

// Four short service promises. Their text lives in src/lib/site.ts.
export function TrustBar() {
  return (
    <ul className="relative z-10 grid grid-cols-2 gap-px overflow-hidden rounded-card border border-line bg-line lg:-mt-8 xl:grid-cols-4">
      {site.trust.map((item) => {
        const Icon = ICONS[item.icon];
        return (
          <li key={item.title} className="flex flex-col items-start gap-2.5 bg-card/95 p-3.5 backdrop-blur min-[420px]:flex-row min-[420px]:items-center min-[420px]:gap-3 sm:p-5">
            <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-neon/25 bg-accent/10 text-neon sm:size-12">
              <Icon className="size-5 sm:size-6" />
            </span>
            <span className="min-w-0">
              <span className="block text-[13px] leading-5 font-bold sm:text-[15px]">{item.title}</span>
              <span className="block text-xs text-muted sm:text-sm">{item.text}</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
