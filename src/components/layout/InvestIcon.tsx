import { DollarSign, Plus } from "lucide-react";

import { cn } from "@/lib/utils";

/** "$+" icon used by the Invista navigation item. Decorative: the label carries the meaning. */
export function InvestIcon({ className }: { className?: string }) {
  return (
    <span aria-hidden="true" className="relative inline-flex">
      <DollarSign className={cn("size-5", className)} />
      <Plus className="absolute -right-1.5 -top-1 size-2.5 stroke-[3]" />
    </span>
  );
}
