import Image from "next/image";
import Link from "next/link";

import logo from "@/public/logo.png";

/** The company logo (public/logo.png, cropped from the original artwork). */
export function Logo({ height = 48, linked = true }: { height?: number; linked?: boolean }) {
  const img = (
    <Image
      src={logo}
      alt="MyJobSolution"
      priority
      style={{ height, width: "auto" }}
      sizes={`${Math.round((height * logo.width) / logo.height)}px`}
    />
  );
  if (!linked) return img;
  return (
    <Link href="/" className="flex shrink-0 items-center rounded-md" aria-label="MyJobSolution home">
      {img}
    </Link>
  );
}
