// Line icons for product categories and for sales (24 px grid, drawn in currentColor).
// A category gets its icon by a word in its slug, so new categories added in the admin
// still get a fitting icon, or the generic one when nothing matches.

type Props = { className?: string };

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

// Heated grips: two handlebar grips with heat rising from them.
export function GripsIcon({ className = "size-5" }: Props) {
  return (
    <svg {...base} className={className}>
      <rect x="2.5" y="13" width="8" height="4" rx="2" />
      <rect x="13.5" y="13" width="8" height="4" rx="2" />
      <path d="M10.5 15h3" />
      <path d="M6 10c-.8-.9-.8-1.9 0-2.8s.8-1.9 0-2.7" />
      <path d="M12 10c-.8-.9-.8-1.9 0-2.8s.8-1.9 0-2.7" />
      <path d="M18 10c-.8-.9-.8-1.9 0-2.8s.8-1.9 0-2.7" />
    </svg>
  );
}

// Chargers: a plug with a charging bolt.
export function ChargerIcon({ className = "size-5" }: Props) {
  return (
    <svg {...base} className={className}>
      <path d="M9 2.5v4M15 2.5v4" />
      <path d="M6.5 6.5h11v4a5.5 5.5 0 0 1-11 0z" />
      <path d="M12.6 8.5 11 11.2h2l-1.6 2.7" />
      <path d="M12 16v5.5" />
    </svg>
  );
}

// Gloves: an open glove with a cuff.
export function GloveIcon({ className = "size-5" }: Props) {
  return (
    <svg {...base} className={className}>
      <path d="M7.5 21.5v-3.2L5 14.8a2 2 0 0 1 .3-2.7 2 2 0 0 1 2.7.2l.8.9V5a1.5 1.5 0 0 1 3 0v5V3.8a1.5 1.5 0 0 1 3 0V10V5.2a1.5 1.5 0 0 1 3 0V11V7.6a1.5 1.5 0 0 1 3 0v6.9a6 6 0 0 1-2 4.5v2.5" />
      <path d="M7.5 18.5h11" />
    </svg>
  );
}

// Phone mounts: a phone held by a clamp on a handlebar.
export function PhoneMountIcon({ className = "size-5" }: Props) {
  return (
    <svg {...base} className={className}>
      <rect x="7.5" y="2.5" width="9" height="14" rx="1.8" />
      <path d="M11 13.8h2" />
      <path d="M5 6v6M19 6v6" />
      <path d="M12 16.5v2.5" />
      <path d="M3 20.5h18" />
      <path d="M9.5 19h5" />
    </svg>
  );
}

// Hand guards: a curved guard in front of a handlebar end.
export function HandGuardIcon({ className = "size-5" }: Props) {
  return (
    <svg {...base} className={className}>
      <path d="M2.5 15h9" />
      <rect x="11.5" y="13" width="6" height="4" rx="2" />
      <path d="M8 15c0-6 3.5-10.5 9-11.5 3 .4 4.5 2.6 4.5 5.5 0 4.2-1.6 7.3-4 9" />
    </svg>
  );
}

// Covers: a scooter under a draped cover.
export function CoverIcon({ className = "size-5" }: Props) {
  return (
    <svg {...base} className={className}>
      <path d="M2.5 17.5c.5-4 2.5-7.5 6-8.8L11 6.2c1.5-1.2 3.5-1.2 5 0 2.6 2 4.5 5.5 5 9.3" />
      <path d="M2.5 17.5h4M17.5 17.5h4M10.5 17.5h3" />
      <circle cx="8.5" cy="18" r="2" />
      <circle cx="15.5" cy="18" r="2" />
      <path d="M9 9.5c1.5 1.2 4 1.4 6 .3" />
    </svg>
  );
}

// Anything else: a box of accessories.
export function AccessoriesIcon({ className = "size-5" }: Props) {
  return (
    <svg {...base} className={className}>
      <rect x="3" y="3" width="7.5" height="7.5" rx="2" />
      <rect x="13.5" y="3" width="7.5" height="7.5" rx="2" />
      <rect x="3" y="13.5" width="7.5" height="7.5" rx="2" />
      <path d="M17.25 13.5v7.5M13.5 17.25H21" />
    </svg>
  );
}

// Sales: a price tag with a percent sign.
export function SaleIcon({ className = "size-5" }: Props) {
  return (
    <svg {...base} className={className}>
      <path d="M3 12.6V4.5A1.5 1.5 0 0 1 4.5 3h8.1a1.5 1.5 0 0 1 1.06.44l7 7a1.5 1.5 0 0 1 0 2.12l-8.1 8.1a1.5 1.5 0 0 1-2.12 0l-7-7A1.5 1.5 0 0 1 3 12.6Z" />
      <path d="m9.5 15.5 5-5" />
      <circle cx="9.8" cy="10.8" r="1" />
      <circle cx="14.2" cy="15.2" r="1" />
    </svg>
  );
}

const BY_SLUG: [RegExp, (props: Props) => React.ReactElement][] = [
  [/grip|gripseb/, GripsIcon],
  [/damten|charg|usb/, ChargerIcon],
  [/kheltatman|glove/, GloveIcon],
  [/damcher|mount|telepon|telefon/, PhoneMountIcon],
  [/damtsav|guard/, HandGuardIcon],
  [/chikhol|cover/, CoverIcon],
];

export function CategoryIcon({ slug, className }: { slug: string; className?: string }) {
  const Icon = BY_SLUG.find(([pattern]) => pattern.test(slug))?.[1] ?? AccessoriesIcon;
  return <Icon className={className} />;
}
