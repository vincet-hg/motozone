import { site } from "@/lib/site";
import { FacebookIcon, InstagramIcon, TiktokIcon, YoutubeIcon } from "./icons";

const links = [
  { href: site.facebook, label: "Facebook", Icon: FacebookIcon },
  { href: site.instagram, label: "Instagram", Icon: InstagramIcon },
  { href: site.tiktok, label: "TikTok", Icon: TiktokIcon },
  { href: site.youtube, label: "YouTube", Icon: YoutubeIcon },
].filter((link) => link.href);

export function SocialLinks({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {links.map(({ href, label, Icon }) => (
        <a
          key={label}
          href={href}
          rel="noopener"
          aria-label={label}
          className="flex size-9 items-center justify-center rounded-btn text-fg transition-colors duration-200 hover:text-accent-hover"
        >
          <Icon />
        </a>
      ))}
    </div>
  );
}
