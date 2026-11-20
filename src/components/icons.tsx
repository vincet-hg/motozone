type Props = { className?: string };

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export function CartIcon({ className = "size-5" }: Props) {
  return (
    <svg {...base} className={className}>
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="18" cy="20" r="1.5" />
      <path d="M2 3h3l2.6 12.5h11.2L21 7H6" />
    </svg>
  );
}

export function CheckIcon({ className = "size-5" }: Props) {
  return (
    <svg {...base} className={className}>
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

export function SearchIcon({ className = "size-5" }: Props) {
  return (
    <svg {...base} className={className}>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  );
}

export function HeartIcon({ className = "size-5", filled = false }: Props & { filled?: boolean }) {
  return (
    <svg {...base} fill={filled ? "currentColor" : "none"} className={className}>
      <path d="M12 20s-7.5-4.6-9.3-9.2C1.5 7.6 3.6 4.5 7 4.5c2 0 3.5 1.1 5 3 1.5-1.9 3-3 5-3 3.4 0 5.5 3.1 4.3 6.3C19.5 15.4 12 20 12 20z" />
    </svg>
  );
}

export function ChevronIcon({ className = "size-4" }: Props) {
  return (
    <svg {...base} className={className}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export function ArrowIcon({ className = "size-4" }: Props) {
  return (
    <svg {...base} className={className}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function MenuIcon({ className = "size-6" }: Props) {
  return (
    <svg {...base} className={className}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function FlameIcon({ className = "size-4" }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12 2c1 3.5 5 6 5 11a5 5 0 0 1-10 0c0-2.4 1.2-4.1 2.5-5.3-.1 1.6.5 2.8 1.5 3.3C11 8 12.2 5.2 12 2z" />
    </svg>
  );
}

export function TruckIcon({ className = "size-6" }: Props) {
  return (
    <svg {...base} className={className}>
      <path d="M2 6h12v11H2zM14 10h4l4 4v3h-8z" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="18" cy="18" r="2" />
    </svg>
  );
}

export function CashIcon({ className = "size-6" }: Props) {
  return (
    <svg {...base} className={className}>
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M6 10v4M18 10v4" />
    </svg>
  );
}

export function PhoneIcon({ className = "size-6" }: Props) {
  return (
    <svg {...base} className={className}>
      <path d="M5 3h4l2 5-2.5 1.5a12 12 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z" />
    </svg>
  );
}

export function ReturnIcon({ className = "size-6" }: Props) {
  return (
    <svg {...base} className={className}>
      <path d="M4 9h11a5 5 0 0 1 0 10H8" />
      <path d="M8 5L4 9l4 4" />
    </svg>
  );
}

export function ShieldIcon({ className = "size-6" }: Props) {
  return (
    <svg {...base} className={className}>
      <path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z" />
      <path d="M8.5 12l2.5 2.5 4.5-5" />
    </svg>
  );
}

export function BadgeIcon({ className = "size-6" }: Props) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="9" r="6" />
      <path d="M8.5 14L7 22l5-3 5 3-1.5-8" />
    </svg>
  );
}

export function HeadsetIcon({ className = "size-6" }: Props) {
  return (
    <svg {...base} className={className}>
      <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
      <rect x="3" y="13" width="4" height="6" rx="1.5" />
      <rect x="17" y="13" width="4" height="6" rx="1.5" />
      <path d="M19 19a3 3 0 0 1-3 3h-3" />
    </svg>
  );
}

export function MailIcon({ className = "size-6" }: Props) {
  return (
    <svg {...base} className={className}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  );
}

export function PinIcon({ className = "size-6" }: Props) {
  return (
    <svg {...base} className={className}>
      <path d="M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

export function ClockIcon({ className = "size-6" }: Props) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

export function UserIcon({ className = "size-6" }: Props) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  );
}

export function LogoutIcon({ className = "size-5" }: Props) {
  return (
    <svg {...base} className={className}>
      <path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4" />
      <path d="M10 17l-5-5 5-5" />
      <path d="M5 12h11" />
    </svg>
  );
}

export function LoginIcon({ className = "size-5" }: Props) {
  return (
    <svg {...base} className={className}>
      <path d="M9 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4" />
      <path d="M14 7l5 5-5 5" />
      <path d="M19 12H8" />
    </svg>
  );
}

// Tabler "package" (MIT).
export function PackageIcon({ className = "size-5" }: Props) {
  return (
    <svg {...base} className={className}>
      <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3" />
      <path d="M12 12l8-4.5" />
      <path d="M12 12v9" />
      <path d="M12 12L4 7.5" />
      <path d="M16 5.25l-8 4.5" />
    </svg>
  );
}

export function KeyIcon({ className = "size-5" }: Props) {
  return (
    <svg {...base} className={className}>
      <circle cx="8" cy="15" r="4" />
      <path d="M10.85 12.15L19 4" />
      <path d="M18 5l2 2" />
      <path d="M15 8l2 2" />
    </svg>
  );
}

export function GoogleIcon({ className = "size-5" }: Props) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path fill="#4285F4" d="M22.6 12.2c0-.8-.1-1.5-.2-2.2H12v4.2h5.9a5 5 0 0 1-2.2 3.3v2.7h3.6c2-1.9 3.3-4.7 3.3-8z" />
      <path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.8c-1 .7-2.2 1.1-3.7 1.1-2.9 0-5.3-1.9-6.2-4.5H2.1v2.9A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.8 14.1a6.6 6.6 0 0 1 0-4.2V7H2.1a11 11 0 0 0 0 10z" />
      <path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.2-3.2A11 11 0 0 0 2.1 7l3.7 2.9C6.7 7.3 9.1 5.4 12 5.4z" />
    </svg>
  );
}

// Brand marks, simplified.
export function FacebookIcon({ className = "size-5" }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.8v3h2.6V21z" />
    </svg>
  );
}

export function InstagramIcon({ className = "size-5" }: Props) {
  return (
    <svg {...base} className={className}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
    </svg>
  );
}

export function TiktokIcon({ className = "size-5" }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M16.5 3c.4 2.2 1.8 3.6 4 3.8v3c-1.5 0-2.9-.5-4-1.2v6.6a5.8 5.8 0 1 1-5.8-5.8c.3 0 .6 0 .9.1v3.1a2.8 2.8 0 1 0 1.9 2.6V3z" />
    </svg>
  );
}

export function YoutubeIcon({ className = "size-5" }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M22 8.2a3 3 0 0 0-2.1-2.1C18 5.6 12 5.6 12 5.6s-6 0-7.9.5A3 3 0 0 0 2 8.2 31 31 0 0 0 1.6 12 31 31 0 0 0 2 15.8a3 3 0 0 0 2.1 2.1c1.9.5 7.9.5 7.9.5s6 0 7.9-.5a3 3 0 0 0 2.1-2.1c.3-1.2.4-2.5.4-3.8s-.1-2.6-.4-3.8zM10 15V9l5.2 3z" />
    </svg>
  );
}
