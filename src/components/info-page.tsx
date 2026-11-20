import { HeadingIcon } from "./heading-icon";

// Shared frame for the text pages (about, delivery, returns, contact, legal): a title with an icon tile,
// an optional lead paragraph, then the content in readable measure.
export function InfoPage({ title, icon, lead, children, wide = false }: {
  title: string;
  icon: React.ReactNode;
  lead?: React.ReactNode;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <main className={`mx-auto px-4 py-10 ${wide ? "max-w-4xl" : "max-w-3xl"}`}>
      <h1 className="flex items-center gap-3 text-xl font-extrabold min-[400px]:text-2xl sm:text-[28px]">
        <HeadingIcon>{icon}</HeadingIcon>
        <span className="min-w-0 [overflow-wrap:anywhere]">{title}</span>
      </h1>
      {lead && <p className="mt-4 text-[17px] leading-8 text-fg/85">{lead}</p>}
      <div className="info-prose mt-6">{children}</div>
    </main>
  );
}

// A highlighted fact box (price, hours, address) used inside text pages.
export function InfoCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4 rounded-card border border-line bg-card p-5">
      <span className="optical-center flex size-10 shrink-0 items-center justify-center rounded-xl border border-line bg-section text-neon">{icon}</span>
      <div className="min-w-0">
        <h2 className="font-bold text-fg">{title}</h2>
        <div className="mt-1 text-sm leading-6 text-muted">{children}</div>
      </div>
    </div>
  );
}
