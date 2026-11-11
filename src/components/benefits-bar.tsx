import { benefits } from "@/lib/site";
import { CashIcon, PhoneIcon, ReturnIcon, TruckIcon } from "./icons";

const ICONS = { truck: TruckIcon, cash: CashIcon, phone: PhoneIcon, return: ReturnIcon };

export function BenefitsBar() {
  return (
    <div className="relative z-10 mx-auto max-w-7xl px-3 sm:px-4">
      <ul className="mt-3 grid grid-cols-2 overflow-hidden rounded-card border border-line bg-card lg:-mt-6 lg:grid-cols-4">
        {benefits.map((item, index) => {
          const Icon = ICONS[item.icon];
          return (
            <li key={item.title} className={`border-line ${index % 2 ? "border-l" : ""} ${index > 1 ? "border-t lg:border-t-0" : ""} lg:border-l lg:first:border-l-0`}>
              <a href={item.href} className="flex h-full items-center gap-3 p-3 transition-colors duration-200 hover:bg-line/40 sm:p-5">
                <Icon className="size-6 shrink-0 text-accent sm:size-9 sm:text-fg" />
                <span className="min-w-0">
                  <span className="block text-[13px] leading-5 font-bold sm:text-base">{item.title}</span>
                  <span className="block text-xs text-muted sm:text-sm">{item.text}</span>
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
