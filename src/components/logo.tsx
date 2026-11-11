import Image from "next/image";
import logo from "../app/logo.webp";

// To change the logo, replace src/app/logo.webp (transparent background, about 720 px wide).
export function Logo({ className, sizes = "160px" }: { className?: string; sizes?: string }) {
  return <Image src={logo} alt="Scooter Land" sizes={sizes} quality={75} className={className} />;
}
