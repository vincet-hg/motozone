// Category and sale icons from Tabler Icons (MIT license, https://tabler.io/icons), 24 px grid in currentColor.
// Also the section icons (best sellers, new arrivals, all products, search results).
// "outline" is for small spots (buttons, pills), "filled" for larger tiles. A category gets its icon by a
// word in its slug, so categories added later in the admin still get a fitting icon, or the generic one.

type Variant = "outline" | "filled";
type Props = { className?: string; variant?: Variant };

const outline = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};
const filled = {
  viewBox: "0 0 24 24",
  fill: "currentColor",
  "aria-hidden": true,
};

export function GripsIcon({
  className = "size-5",
  variant = "outline",
}: Props) {
  return variant === "filled" ? (
    <svg {...filled} className={className}>
      <path d="M10 2c0 -.88 1.056 -1.331 1.692 -.722c1.958 1.876 3.096 5.995 1.75 9.12l-.08 .174l.012 .003c.625 .133 1.203 -.43 2.303 -2.173l.14 -.224a1 1 0 0 1 1.582 -.153c1.334 1.435 2.601 4.377 2.601 6.27c0 4.265 -3.591 7.705 -8 7.705s-8 -3.44 -8 -7.706c0 -2.252 1.022 -4.716 2.632 -6.301l.605 -.589c.241 -.236 .434 -.43 .618 -.624c1.43 -1.512 2.145 -2.924 2.145 -4.78" />
    </svg>
  ) : (
    <svg {...outline} className={className}>
      <path d="M12 10.941c2.333 -3.308 .167 -7.823 -1 -8.941c0 3.395 -2.235 5.299 -3.667 6.706c-1.43 1.408 -2.333 3.294 -2.333 5.588c0 3.704 3.134 6.706 7 6.706c3.866 0 7 -3.002 7 -6.706c0 -1.712 -1.232 -4.403 -2.333 -5.588c-2.084 3.353 -3.257 3.353 -4.667 2.235" />
    </svg>
  );
}

export function ChargerIcon({
  className = "size-5",
  variant = "outline",
}: Props) {
  return variant === "filled" ? (
    <svg {...outline} strokeWidth={2} className={className}>
      <path d="M7 12l5 5l-1.5 1.5a3.536 3.536 0 1 1 -5 -5l1.5 -1.5" />{" "}
      <path d="M17 12l-5 -5l1.5 -1.5a3.536 3.536 0 1 1 5 5l-1.5 1.5" />{" "}
      <path d="M3 21l2.5 -2.5" /> <path d="M18.5 5.5l2.5 -2.5" />{" "}
      <path d="M10 11l-2 2" /> <path d="M13 14l-2 2" />
    </svg>
  ) : (
    <svg {...outline} className={className}>
      <path d="M7 12l5 5l-1.5 1.5a3.536 3.536 0 1 1 -5 -5l1.5 -1.5" />{" "}
      <path d="M17 12l-5 -5l1.5 -1.5a3.536 3.536 0 1 1 5 5l-1.5 1.5" />{" "}
      <path d="M3 21l2.5 -2.5" /> <path d="M18.5 5.5l2.5 -2.5" />{" "}
      <path d="M10 11l-2 2" /> <path d="M13 14l-2 2" />
    </svg>
  );
}

export function GloveIcon({
  className = "size-5",
  variant = "outline",
}: Props) {
  return variant === "filled" ? (
    <svg {...outline} strokeWidth={2} className={className}>
      <path d="M8 13v-7.5a1.5 1.5 0 0 1 3 0v6.5" />{" "}
      <path d="M11 5.5v-2a1.5 1.5 0 1 1 3 0v8.5" />{" "}
      <path d="M14 5.5a1.5 1.5 0 0 1 3 0v6.5" />{" "}
      <path d="M17 7.5a1.5 1.5 0 0 1 3 0v8.5a6 6 0 0 1 -6 6h-2h.208a6 6 0 0 1 -5.012 -2.7a69.74 69.74 0 0 1 -.196 -.3c-.312 -.479 -1.407 -2.388 -3.286 -5.728a1.5 1.5 0 0 1 .536 -2.022a1.867 1.867 0 0 1 2.28 .28l1.47 1.47" />
    </svg>
  ) : (
    <svg {...outline} className={className}>
      <path d="M8 13v-7.5a1.5 1.5 0 0 1 3 0v6.5" />{" "}
      <path d="M11 5.5v-2a1.5 1.5 0 1 1 3 0v8.5" />{" "}
      <path d="M14 5.5a1.5 1.5 0 0 1 3 0v6.5" />{" "}
      <path d="M17 7.5a1.5 1.5 0 0 1 3 0v8.5a6 6 0 0 1 -6 6h-2h.208a6 6 0 0 1 -5.012 -2.7a69.74 69.74 0 0 1 -.196 -.3c-.312 -.479 -1.407 -2.388 -3.286 -5.728a1.5 1.5 0 0 1 .536 -2.022a1.867 1.867 0 0 1 2.28 .28l1.47 1.47" />
    </svg>
  );
}

export function PhoneMountIcon({
  className = "size-5",
  variant = "outline",
}: Props) {
  return variant === "filled" ? (
    <svg {...filled} className={className}>
      <path d="M16 2a3 3 0 0 1 2.995 2.824l.005 .176v14a3 3 0 0 1 -2.824 2.995l-.176 .005h-8a3 3 0 0 1 -2.995 -2.824l-.005 -.176v-14a3 3 0 0 1 2.824 -2.995l.176 -.005h8zm-4 14a1 1 0 0 0 -.993 .883l-.007 .117l.007 .127a1 1 0 0 0 1.986 0l.007 -.117l-.007 -.127a1 1 0 0 0 -.993 -.883zm1 -12h-2l-.117 .007a1 1 0 0 0 0 1.986l.117 .007h2l.117 -.007a1 1 0 0 0 0 -1.986l-.117 -.007z" />
    </svg>
  ) : (
    <svg {...outline} className={className}>
      <path d="M6 5a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2v-14" />{" "}
      <path d="M11 4h2" /> <path d="M12 17v.01" />
    </svg>
  );
}

export function HandGuardIcon({
  className = "size-5",
  variant = "outline",
}: Props) {
  return variant === "filled" ? (
    <svg {...filled} className={className}>
      <path d="M11.998 2l.032 .002l.086 .005a1 1 0 0 1 .342 .104l.105 .062l.097 .076l.016 .015l.247 .21a11 11 0 0 0 7.189 2.537l.342 -.01a1 1 0 0 1 1.005 .717a13 13 0 0 1 -9.208 16.25a1 1 0 0 1 -.502 0a13 13 0 0 1 -9.209 -16.25a1 1 0 0 1 1.005 -.717a11 11 0 0 0 7.791 -2.75l.046 -.036l.053 -.041a1 1 0 0 1 .217 -.112l.075 -.023l.036 -.01a1 1 0 0 1 .12 -.022l.086 -.005zm.002 2.296l-.176 .135a13 13 0 0 1 -7.288 2.572l-.264 .006l-.064 .31a11 11 0 0 0 1.064 7.175l.17 .314a11 11 0 0 0 6.49 5.136l.068 .019z" />
    </svg>
  ) : (
    <svg {...outline} className={className}>
      <path d="M12 3a12 12 0 0 0 8.5 3a12 12 0 0 1 -8.5 15a12 12 0 0 1 -8.5 -15a12 12 0 0 0 8.5 -3" />{" "}
      <path d="M12 3v18" />
    </svg>
  );
}

export function CoverIcon({
  className = "size-5",
  variant = "outline",
}: Props) {
  return variant === "filled" ? (
    <svg {...filled} className={className}>
      <path d="M12 3a9 9 0 0 1 9 9a1 1 0 0 1 -.883 .993l-.117 .007h-7v5a1 1 0 0 0 1.993 .117l.007 -.117a1 1 0 0 1 2 0a3 3 0 0 1 -5.995 .176l-.005 -.176v-5h-7a1 1 0 0 1 -.993 -.883l-.007 -.117a9 9 0 0 1 9 -9z" />
    </svg>
  ) : (
    <svg {...outline} className={className}>
      <path d="M4 12a8 8 0 0 1 16 0l-16 0" />{" "}
      <path d="M12 12v6a2 2 0 0 0 4 0" />
    </svg>
  );
}

export function HelmetIcon({
  className = "size-5",
  variant = "outline",
}: Props) {
  return variant === "filled" ? (
    <svg {...outline} strokeWidth={2} className={className}>
      <path d="M12 4a9 9 0 0 1 5.656 16h-11.312a9 9 0 0 1 5.656 -16" />{" "}
      <path d="M20 9h-8.8a1 1 0 0 0 -.968 1.246c.507 2 1.596 3.418 3.268 4.254c2 1 4.333 1.5 7 1.5" />
    </svg>
  ) : (
    <svg {...outline} className={className}>
      <path d="M12 4a9 9 0 0 1 5.656 16h-11.312a9 9 0 0 1 5.656 -16" />{" "}
      <path d="M20 9h-8.8a1 1 0 0 0 -.968 1.246c.507 2 1.596 3.418 3.268 4.254c2 1 4.333 1.5 7 1.5" />
    </svg>
  );
}

export function ScooterIcon({
  className = "size-5",
  variant = "outline",
}: Props) {
  return variant === "filled" ? (
    <svg {...outline} strokeWidth={2} className={className}>
      <path d="M16 17a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />{" "}
      <path d="M4 17a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />{" "}
      <path d="M8 17h5a6 6 0 0 1 5 -5v-5a2 2 0 0 0 -2 -2h-1" />
    </svg>
  ) : (
    <svg {...outline} className={className}>
      <path d="M16 17a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />{" "}
      <path d="M4 17a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />{" "}
      <path d="M8 17h5a6 6 0 0 1 5 -5v-5a2 2 0 0 0 -2 -2h-1" />
    </svg>
  );
}

export function AccessoriesIcon({
  className = "size-5",
  variant = "outline",
}: Props) {
  return variant === "filled" ? (
    <svg {...filled} className={className}>
      <path d="M10 3h-6a1 1 0 0 0 -1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1 -1v-6a1 1 0 0 0 -1 -1z" />{" "}
      <path d="M20 3h-6a1 1 0 0 0 -1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1 -1v-6a1 1 0 0 0 -1 -1z" />{" "}
      <path d="M10 13h-6a1 1 0 0 0 -1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1 -1v-6a1 1 0 0 0 -1 -1z" />{" "}
      <path d="M17 13a4 4 0 1 1 -3.995 4.2l-.005 -.2l.005 -.2a4 4 0 0 1 3.995 -3.8z" />
    </svg>
  ) : (
    <svg {...outline} className={className}>
      <path d="M4 4h6v6h-6l0 -6" /> <path d="M14 4h6v6h-6l0 -6" />{" "}
      <path d="M4 14h6v6h-6l0 -6" />{" "}
      <path d="M14 17a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
    </svg>
  );
}

export function SaleIcon({ className = "size-5", variant = "outline" }: Props) {
  return variant === "filled" ? (
    <svg {...filled} className={className}>
      <path d="M12.01 2.011c.852 0 1.668 .34 2.267 .942l.698 .698a1.2 1.2 0 0 0 .845 .349h1a3.2 3.2 0 0 1 3.2 3.2v1c0 .316 .126 .62 .347 .843l.698 .698a3.2 3.2 0 0 1 .002 4.536l-.698 .698a1.2 1.2 0 0 0 -.349 .845v1a3.2 3.2 0 0 1 -3.2 3.2h-1a1.2 1.2 0 0 0 -.843 .347l-.698 .698a3.2 3.2 0 0 1 -4.536 .002l-.698 -.698a1.2 1.2 0 0 0 -.845 -.349h-1a3.2 3.2 0 0 1 -3.2 -3.2v-1a1.2 1.2 0 0 0 -.347 -.843l-.698 -.698a3.2 3.2 0 0 1 -.002 -4.536l.698 -.698a1.2 1.2 0 0 0 .349 -.845v-1l.005 -.182a3.2 3.2 0 0 1 3.195 -3.018h1a1.2 1.2 0 0 0 .843 -.347l.698 -.698a3.2 3.2 0 0 1 2.269 -.944m2.49 10.989a1.5 1.5 0 1 0 0 3a1.5 1.5 0 0 0 0 -3m1.207 -4.707a1 1 0 0 0 -1.414 0l-6 6a1 1 0 0 0 1.414 1.414l6 -6a1 1 0 0 0 0 -1.414m-6.207 -.293a1.5 1.5 0 1 0 0 3a1.5 1.5 0 0 0 0 -3" />
    </svg>
  ) : (
    <svg {...outline} className={className}>
      <path d="M9 15l6 -6" />{" "}
      <path d="M9 9.5a.5 .5 0 1 0 1 0a.5 .5 0 1 0 -1 0" fill="currentColor" />{" "}
      <path d="M14 14.5a.5 .5 0 1 0 1 0a.5 .5 0 1 0 -1 0" fill="currentColor" />{" "}
      <path d="M5 7.2a2.2 2.2 0 0 1 2.2 -2.2h1a2.2 2.2 0 0 0 1.55 -.64l.7 -.7a2.2 2.2 0 0 1 3.12 0l.7 .7a2.2 2.2 0 0 0 1.55 .64h1a2.2 2.2 0 0 1 2.2 2.2v1a2.2 2.2 0 0 0 .64 1.55l.7 .7a2.2 2.2 0 0 1 0 3.12l-.7 .7a2.2 2.2 0 0 0 -.64 1.55v1a2.2 2.2 0 0 1 -2.2 2.2h-1a2.2 2.2 0 0 0 -1.55 .64l-.7 .7a2.2 2.2 0 0 1 -3.12 0l-.7 -.7a2.2 2.2 0 0 0 -1.55 -.64h-1a2.2 2.2 0 0 1 -2.2 -2.2v-1a2.2 2.2 0 0 0 -.64 -1.55l-.7 -.7a2.2 2.2 0 0 1 0 -3.12l.7 -.7a2.2 2.2 0 0 0 .64 -1.55v-1" />
    </svg>
  );
}

export function StarIcon({ className = "size-5", variant = "outline" }: Props) {
  return variant === "filled" ? (
    <svg {...filled} className={className}>
      <path d="M8.243 7.34l-6.38 .925l-.113 .023a1 1 0 0 0 -.44 1.684l4.622 4.499l-1.09 6.355l-.013 .11a1 1 0 0 0 1.464 .944l5.706 -3l5.693 3l.1 .046a1 1 0 0 0 1.352 -1.1l-1.091 -6.355l4.624 -4.5l.078 -.085a1 1 0 0 0 -.633 -1.62l-6.38 -.926l-2.852 -5.78a1 1 0 0 0 -1.794 0l-2.853 5.78z" />
    </svg>
  ) : (
    <svg {...outline} className={className}>
      <path d="M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873l-6.158 -3.245" />
    </svg>
  );
}

export function SparklesIcon({
  className = "size-5",
  variant = "outline",
}: Props) {
  return variant === "filled" ? (
    <svg {...filled} className={className}>
      <path d="M16 19a1 1 0 0 1 0 -2a1 1 0 0 0 1 -1c0 -1.333 2 -1.333 2 0a1 1 0 0 0 1 1c1.333 0 1.333 2 0 2a1 1 0 0 0 -1 1c0 1.333 -2 1.333 -2 0a1 1 0 0 0 -1 -1" />{" "}
      <path d="M3 11a5 5 0 0 0 5 -5c0 -1.333 2 -1.333 2 0a5 5 0 0 0 5 5c1.333 0 1.333 2 0 2a5 5 0 0 0 -5 5a1 1 0 0 1 -2 0a5 5 0 0 0 -5 -5c-1.333 0 -1.333 -2 0 -2" />{" "}
      <path d="M16 7a1 1 0 0 1 0 -2a1 1 0 0 0 1 -1c0 -1.333 2 -1.333 2 0a1 1 0 0 0 1 1c1.333 0 1.333 2 0 2a1 1 0 0 0 -1 1c0 1.333 -2 1.333 -2 0a1 1 0 0 0 -1 -1" />
    </svg>
  ) : (
    <svg {...outline} className={className}>
      <path d="M16 18a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2m0 -12a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2m-7 12a6 6 0 0 1 6 -6a6 6 0 0 1 -6 -6a6 6 0 0 1 -6 6a6 6 0 0 1 6 6" />
    </svg>
  );
}

export function GridIcon({ className = "size-5", variant = "outline" }: Props) {
  return variant === "filled" ? (
    <svg {...filled} className={className}>
      <path d="M9 3a2 2 0 0 1 2 2v4a2 2 0 0 1 -2 2h-4a2 2 0 0 1 -2 -2v-4a2 2 0 0 1 2 -2z" />{" "}
      <path d="M19 3a2 2 0 0 1 2 2v4a2 2 0 0 1 -2 2h-4a2 2 0 0 1 -2 -2v-4a2 2 0 0 1 2 -2z" />{" "}
      <path d="M9 13a2 2 0 0 1 2 2v4a2 2 0 0 1 -2 2h-4a2 2 0 0 1 -2 -2v-4a2 2 0 0 1 2 -2z" />{" "}
      <path d="M19 13a2 2 0 0 1 2 2v4a2 2 0 0 1 -2 2h-4a2 2 0 0 1 -2 -2v-4a2 2 0 0 1 2 -2z" />
    </svg>
  ) : (
    <svg {...outline} className={className}>
      <path d="M4 5a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -4" />{" "}
      <path d="M14 5a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -4" />{" "}
      <path d="M4 15a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -4" />{" "}
      <path d="M14 15a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -4" />
    </svg>
  );
}

export function SearchIcon({
  className = "size-5",
  variant = "outline",
}: Props) {
  return variant === "filled" ? (
    <svg {...filled} className={className}>
      <path d="M14 3.072a8 8 0 0 1 2.32 11.834l5.387 5.387a1 1 0 0 1 -1.414 1.414l-5.388 -5.387a8 8 0 1 1 -.905 -13.249" />
    </svg>
  ) : (
    <svg {...outline} className={className}>
      <path d="M3 10a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />{" "}
      <path d="M21 21l-6 -6" />
    </svg>
  );
}

const BY_SLUG: [RegExp, (props: Props) => React.ReactElement][] = [
  [/grip|gripseb|gatbob|heat/, GripsIcon],
  [/damten|charg|usb/, ChargerIcon],
  [/kheltatman|glove/, GloveIcon],
  [/damcher|mount|telepon|telefon|phone/, PhoneMountIcon],
  [/damtsav|guard/, HandGuardIcon],
  [/chikhol|cover/, CoverIcon],
  [/chafkhut|helmet/, HelmetIcon],
  [/moped|scooter|skuter/, ScooterIcon],
];

export function CategoryIcon({
  slug,
  className,
  variant,
}: {
  slug: string;
  className?: string;
  variant?: Variant;
}) {
  const Icon =
    BY_SLUG.find(([pattern]) => pattern.test(slug))?.[1] ?? AccessoriesIcon;
  return <Icon className={className} variant={variant} />;
}
