import Image from "next/image";

import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  full?: boolean;
};

export function BrandLogo({ className, full = false }: BrandLogoProps) {
  return (
    <Image
      alt="Contaí Pro"
      className={cn("block h-auto object-contain", className)}
      height={46}
      priority={full}
      src="/brand/contai-pro-logo.svg"
      unoptimized
      width={225}
    />
  );
}
