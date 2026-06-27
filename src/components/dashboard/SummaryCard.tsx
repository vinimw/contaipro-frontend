import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { formatCurrencyBRL } from "@/lib/currency";

type SummaryCardProps = {
  label: string;
  value: number;
  icon: LucideIcon;
  accentClassName?: string;
  iconClassName?: string;
};

export function SummaryCard({
  label,
  value,
  icon: Icon,
  accentClassName = "bg-[var(--color-primary)]",
  iconClassName = "bg-[var(--color-primary-soft)] text-[#071a3d]",
}: SummaryCardProps) {
  return (
    <Card className="relative min-h-[104px] overflow-hidden rounded-[10px] px-5 py-5 shadow-[0_12px_22px_rgba(15,23,42,0.04)]">
      <div className={`absolute inset-x-0 top-0 h-1 ${accentClassName}`} />
      <div className="flex h-full items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-600">{label}</p>
          <p className="mt-3 text-xl font-extrabold text-slate-900 md:text-lg xl:text-xl">
            {formatCurrencyBRL(value)}
          </p>
        </div>
        <span className={`hidden size-9 shrink-0 items-center justify-center rounded-[10px] md:inline-flex ${iconClassName}`}>
          <Icon className="size-4.5" />
        </span>
      </div>
    </Card>
  );
}
