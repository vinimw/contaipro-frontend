import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: "paid" | "pending" | "overdue" | "neutral";
};

const toneClasses = {
  paid: "bg-emerald-50 text-emerald-700",
  pending: "bg-amber-50 text-amber-700",
  overdue: "bg-rose-50 text-rose-700",
  neutral: "bg-slate-100 text-slate-700",
};

export function Badge({
  className,
  tone = "neutral",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-[10px] px-3 py-1 text-xs font-semibold",
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  );
}
