"use client";

import { cn } from "@/lib/utils";
import { rankingPeriodOptions } from "@/lib/investment-format";
import type { RankingPeriod } from "@/types/investment";

export function PeriodSelector({ value, onChange }: { value: RankingPeriod; onChange: (period: RankingPeriod) => void }) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium text-slate-700">Janela do retorno exibido</legend>
      <div className="grid grid-cols-3 gap-2" role="radiogroup">
        {rankingPeriodOptions.map((option) => {
          const selected = value === option.value;

          return (
            <label
              key={option.value}
              className={cn(
                "flex min-h-11 cursor-pointer items-center justify-center rounded-[10px] border px-2 text-center text-sm font-semibold transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[var(--color-primary)]",
                selected
                  ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)] text-[#071a3d]"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
              )}
            >
              <input
                checked={selected}
                className="sr-only"
                name="ranking_period"
                type="radio"
                value={option.value}
                onChange={() => onChange(option.value)}
              />
              {option.label}
            </label>
          );
        })}
      </div>
      <p className="text-xs text-slate-500">
        Esta janela só define o período do retorno exibido no ranking; ela não é o prazo do seu investimento.
      </p>
    </fieldset>
  );
}
