"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { periodOptions } from "@/lib/investment-format";
import type { SimulationDraft } from "@/lib/investment-draft";
import type { AssetDetail, SimulationHorizon, SimulationMode } from "@/types/investment";

const modeOptions: { value: SimulationMode; label: string; hint: string }[] = [
  { value: "historical", label: "Histórico", hint: "Reproduz o passado com preços e datas reais" },
  { value: "projection", label: "Projeção", hint: "Cenário futuro com a taxa que você informar" },
];

function Segment<T extends string | number>({
  legend,
  name,
  value,
  options,
  onChange,
  disabledValues = [],
}: {
  legend: string;
  name: string;
  value: T;
  options: { value: T; label: string; hint?: string }[];
  onChange: (value: T) => void;
  disabledValues?: T[];
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium text-slate-700">{legend}</legend>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="radiogroup">
        {options.map((option) => {
          const selected = value === option.value;
          const disabled = disabledValues.includes(option.value);

          return (
            <label
              key={String(option.value)}
              className={cn(
                "flex min-h-11 flex-col justify-center rounded-[10px] border px-3 py-2 text-sm transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[var(--color-primary)]",
                disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
                selected
                  ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)] text-[#071a3d]"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
              )}
            >
              <input
                checked={selected}
                className="sr-only"
                disabled={disabled}
                name={name}
                type="radio"
                value={String(option.value)}
                onChange={() => onChange(option.value)}
              />
              <span className="font-semibold">{option.label}</span>
              {option.hint ? <span className="text-xs text-slate-500">{option.hint}</span> : null}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export type RateField = "annualReturn" | "annualCdi" | null;

/** Which scenario rate a projection needs for this asset (null when none is needed). */
export function requiredRateField(asset: AssetDetail): RateField {
  if (asset.category !== "cdb") {
    return "annualReturn";
  }

  return asset.cdb_conditions?.some((condition) => condition.modality === "post_fixed_cdi") ? "annualCdi" : null;
}

export function SimulationControls({
  asset,
  draft,
  rankingPeriodLabel,
  horizonDiffersFromRanking,
  rateError,
  isPending,
  canSubmit,
  onChange,
  onSubmit,
}: {
  asset: AssetDetail;
  draft: SimulationDraft;
  rankingPeriodLabel: string;
  horizonDiffersFromRanking: boolean;
  rateError: string | undefined;
  isPending: boolean;
  canSubmit: boolean;
  onChange: (patch: Partial<SimulationDraft>) => void;
  onSubmit: () => void;
}) {
  const isCdb = asset.category === "cdb";
  const rateField = requiredRateField(asset);
  const totalReturnSeries = asset.series_type === "total_return";
  const showReinvest = !isCdb && asset.supports_reinvestment;
  const reinvestBlocked = totalReturnSeries;
  const disabledModes: SimulationMode[] = [
    ...(asset.supports_historical ? [] : (["historical"] as SimulationMode[])),
    ...(asset.supports_projection ? [] : (["projection"] as SimulationMode[])),
  ];

  return (
    <form
      className="space-y-5"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <Segment
        disabledValues={disabledModes}
        legend="Tipo de simulação"
        name="simulation_mode"
        options={modeOptions}
        value={draft.mode}
        onChange={(mode) => onChange({ mode })}
      />

      <div className="space-y-2">
        <Segment<SimulationHorizon>
          legend="Horizonte da simulação"
          name="simulation_months"
          options={periodOptions.map((option) => ({ value: Number(option.value.replace("m", "")) as SimulationHorizon, label: option.label }))}
          value={draft.months}
          onChange={(months) => onChange({ months })}
        />
        <p className="text-xs text-slate-500">
          {draft.mode === "projection" ? "Meses futuros a partir da última data de dados." : "Meses passados, até a última data de dados."}
          {horizonDiffersFromRanking ? ` A janela usada no ranking (${rankingPeriodLabel}) é outra coisa e não foi aplicada aqui.` : ""}
        </p>
      </div>

      {draft.mode === "projection" && rateField ? (
        <div className="space-y-1">
          <Input
            error={rateError}
            inputMode="decimal"
            label={rateField === "annualCdi" ? "CDI anual esperado (% ao ano)" : "Retorno anual esperado (% ao ano)"}
            placeholder="Ex.: 12,5"
            value={rateField === "annualCdi" ? draft.annualCdi : draft.annualReturn}
            onChange={(event) => onChange(rateField === "annualCdi" ? { annualCdi: event.target.value } : { annualReturn: event.target.value })}
          />
          <p className="text-xs text-slate-500">
            {rateField === "annualReturn"
              ? "Opcional. Se deixar em branco, usamos o retorno de 12 meses informado pela análise do Contaipro. É um cenário hipotético e constante, não uma previsão."
              : "Você define a taxa: ela é um cenário hipotético, constante, e não vem do ranking nem é uma previsão."}
          </p>
        </div>
      ) : null}
      {draft.mode === "projection" && isCdb && !rateField ? (
        <p className="text-sm text-slate-600">Este CDB é prefixado: a taxa contratada define o rendimento, sem hipótese adicional.</p>
      ) : null}

      {isCdb ? (
        <p className="text-sm text-slate-600">
          Em CDB os juros já se capitalizam contratualmente; não há distribuições para reinvestir.
        </p>
      ) : showReinvest ? (
        <label className={cn("flex items-start gap-3 text-sm text-slate-700", reinvestBlocked && "opacity-60")}>
          <input
            checked={draft.reinvest && !reinvestBlocked}
            className="mt-1 size-4"
            disabled={reinvestBlocked}
            type="checkbox"
            onChange={(event) => onChange({ reinvest: event.target.checked })}
          />
          <span>
            <span className="font-semibold">Reinvestir distribuições</span>
            <span className="block text-xs text-slate-500">
              {reinvestBlocked
                ? "Indisponível: a série deste ativo já incorpora proventos e não tem trilha de preços e eventos para reinvestir."
                : "Proventos recebidos compram novas cotas inteiras; a sobra fica em caixa."}
            </span>
          </span>
        </label>
      ) : (
        <p className="text-sm text-slate-600">Este ativo não permite reinvestir distribuições.</p>
      )}

      <Button className="w-full sm:w-auto" disabled={!canSubmit || isPending} type="submit">
        {isPending ? "Calculando..." : "Simular"}
      </Button>
    </form>
  );
}
