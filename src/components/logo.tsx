import Image from "next/image";
import logo from "../app/logo-blue.webp";

// The Space Blue site uses a blue recolour of the original red logo (src/app/logo.webp).
// To change the logo, replace src/app/logo-blue.webp (transparent background, about 720 px wide).
export function Logo({ className, sizes = "160px", preload }: { className?: string; sizes?: string; preload?: boolean }) {
  return <Image src={logo} alt="Scooter Land" sizes={sizes} quality={75} preload={preload} className={className} />;
}
