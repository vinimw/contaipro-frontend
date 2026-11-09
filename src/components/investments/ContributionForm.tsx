"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useForm, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/Button";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { cn } from "@/lib/utils";
import {
  getInvestmentDraft,
  subscribeToInvestmentDraft,
  toCanonicalAmount,
  updateInvestmentDraft,
  validateContributionAmount,
  type ContributionType,
  type InvestmentHandoff,
} from "@/lib/investment-draft";

type FormValues = { amount: number | undefined };

const contributionOptions: { value: ContributionType; label: string; hint: string }[] = [
  { value: "single", label: "Aporte único", hint: "Um único aporte no início" },
  { value: "monthly", label: "Aporte mensal", hint: "O mesmo valor todo mês" },
];

export function ContributionForm({ onContinue }: { onContinue: (handoff: InvestmentHandoff) => void }) {
  const draft = useSyncExternalStore(subscribeToInvestmentDraft, getInvestmentDraft, getInvestmentDraft);
  const {
    control,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: { amount: draft.amount } });
  const isMonthly = draft.contributionType === "monthly";

  const amount = useWatch({ control, name: "amount" });

  // Keeps the entry across back/edit and across the remount caused by hiding/showing values.
  useEffect(() => {
    updateInvestmentDraft({ amount });
    clearErrors("amount");
  }, [amount, clearErrors]);

  function submit(values: FormValues) {
    const message = validateContributionAmount(values.amount);

    if (message || values.amount === undefined) {
      setError("amount", { type: "validate", message });
      return;
    }

    onContinue({ amount: toCanonicalAmount(values.amount), contribution_type: draft.contributionType });
  }

  return (
    <form className="space-y-6" noValidate onSubmit={handleSubmit(submit)}>
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-slate-700">Tipo de aporte</legend>
        <div className="grid grid-cols-2 gap-2" role="radiogroup">
          {contributionOptions.map((option) => {
            const selected = draft.contributionType === option.value;

            return (
              <label
                key={option.value}
                className={cn(
                  "flex min-h-14 cursor-pointer flex-col justify-center rounded-[10px] border px-3 py-2 text-sm transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[var(--color-primary)]",
                  selected
                    ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)] text-[#071a3d]"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                )}
              >
                <input
                  checked={selected}
                  className="sr-only"
                  name="contribution_type"
                  type="radio"
                  value={option.value}
                  onChange={() => updateInvestmentDraft({ contributionType: option.value })}
                />
                <span className="font-semibold">{option.label}</span>
                <span className="text-xs text-slate-500">{option.hint}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <CurrencyInput
        aria-describedby="contribution-help"
        autoComplete="off"
        control={control}
        error={errors.amount?.message}
        label={isMonthly ? "Valor por mês" : "Valor do aporte"}
        name="amount"
      />

      <p className="text-sm leading-6 text-slate-600" id="contribution-help">
        {isMonthly
          ? "Por exemplo, R$ 100 por mês durante 3 meses significa R$ 300 aportados, sem rendimento incluído."
          : "Este é o valor aportado de uma só vez, sem rendimento incluído."}{" "}
        O limite é de R$ 1.000.000,00 por aporte.
      </p>

      <Button className="w-full sm:w-auto" type="submit">
        Continuar
      </Button>
    </form>
  );
}
