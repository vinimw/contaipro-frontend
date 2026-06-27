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
      height={full ? 274 : 136}
      priority={full}
      src={full ? "/brand/contai-pro-full.png" : "/brand/contai-pro-wordmark.png"}
      width={full ? 1200 : 900}
    />
  );
}
