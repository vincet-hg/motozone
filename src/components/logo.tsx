import Image from "next/image";
import logo from "../app/logo.webp";

// The red edition uses the original red logo. To change it, replace src/app/logo.webp
// (transparent background, about 720 px wide).
export function Logo({ className, sizes = "160px", preload }: { className?: string; sizes?: string; preload?: boolean }) {
  return <Image src={logo} alt="Scooter Land" sizes={sizes} quality={75} preload={preload} className={className} />;
}
