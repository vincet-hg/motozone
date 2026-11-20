// Line icons for the admin panel (24 px grid, currentColor).
type Icon = (props: { className?: string }) => React.ReactElement;

const svg = (paths: React.ReactNode): Icon =>
  function NavIcon({ className = "size-5" }) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
        {paths}
      </svg>
    );
  };

export const Icons = {
  dashboard: svg(<><rect x="3" y="3" width="7" height="9" rx="2" /><rect x="14" y="3" width="7" height="5" rx="2" /><rect x="14" y="12" width="7" height="9" rx="2" /><rect x="3" y="16" width="7" height="5" rx="2" /></>),
  orders: svg(<><path d="M6 3h12a1 1 0 0 1 1 1v17l-3-2-3 2-3-2-3 2-2-2V4a1 1 0 0 1 1-1Z" /><path d="M9 8h6M9 12h6" /></>),
  products: svg(<><path d="m21 8-9-5-9 5 9 5 9-5Z" /><path d="M3 8v8l9 5 9-5V8" /><path d="M12 13v8" /></>),
  categories: svg(<><path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9-9-9Z" /><circle cx="8" cy="8" r="1.5" /></>),
  slider: svg(<><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 16 5-5 4 4 3-3 6 6" /><circle cx="16" cy="9" r="1.5" /></>),
  reports: svg(<><path d="M3 3v18h18" /><path d="m7 15 4-4 3 3 6-6" /></>),
  subscribers: svg(<><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>),
  users: svg(<><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" /><path d="M16 4.5a3.5 3.5 0 0 1 0 7" /><path d="M18 14.5a6.5 6.5 0 0 1 3.5 5.5" /></>),
  audit: svg(<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>),
  store: svg(<><path d="M14 4h6v6" /><path d="M20 4 10 14" /><path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" /></>),
  logout: svg(<><path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4" /><path d="M10 17l-5-5 5-5" /><path d="M5 12h11" /></>),
  bell: svg(<><path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8" /><path d="M10 20a2 2 0 0 0 4 0" /></>),
  search: svg(<><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>),
  menu: svg(<path d="M4 7h16M4 12h16M4 17h16" />),
  plus: svg(<path d="M12 5v14M5 12h14" />),
  box: svg(<><path d="m21 8-9-5-9 5 9 5 9-5Z" /><path d="M3 8v8l9 5 9-5V8" /></>),
  wallet: svg(<><rect x="3" y="6" width="18" height="14" rx="2" /><path d="M3 10h18" /><path d="M16 15h2" /></>),
  trend: svg(<><path d="m3 17 6-6 4 4 8-8" /><path d="M15 7h6v6" /></>),
  alert: svg(<><path d="M12 3 2 20h20L12 3Z" /><path d="M12 10v4M12 17h.01" /></>),
};
