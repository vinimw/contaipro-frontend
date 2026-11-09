"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { Info } from "lucide-react";

import { ContributionForm } from "@/components/investments/ContributionForm";
import { InvestmentExplorer } from "@/components/investments/InvestmentExplorer";
import { SimulationStep } from "@/components/investments/SimulationStep";
import { Card } from "@/components/ui/Card";
import { formatCurrencyBRL } from "@/lib/currency";
import {
  getInvestmentDraft,
  subscribeToInvestmentDraft,
  updateInvestmentDraft,
} from "@/lib/investment-draft";

export default function InvestmentsPage() {
  const draft = useSyncExternalStore(subscribeToInvestmentDraft, getInvestmentDraft, getInvestmentDraft);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const isFirstRender = useRef(true);

  // Moves focus to the new step heading so keyboard and screen reader users keep their place.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    headingRef.current?.focus();
  }, [draft.step]);

  const titles = {
    entry: "Simule aportes em investimentos",
    explore: "Escolha o investimento",
    result: "Simulação",
  } as const;
  const summary = (
    <dl className="grid gap-3 sm:grid-cols-2">
      <div>
        <dt className="text-sm text-slate-500">{draft.contributionType === "monthly" ? "Valor por mês" : "Valor do aporte"}</dt>
        <dd className="mt-1 text-xl font-extrabold text-slate-900">{formatCurrencyBRL(draft.amount)}</dd>
      </div>
      <div>
        <dt className="text-sm text-slate-500">Tipo de aporte</dt>
        <dd className="mt-1 text-xl font-extrabold text-slate-900">{draft.contributionType === "monthly" ? "Mensal" : "Único"}</dd>
      </div>
    </dl>
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--color-primary)]">Invista</p>
        <h1
          ref={headingRef}
          className="mt-3 font-display text-3xl font-semibold text-slate-950 outline-none"
          tabIndex={-1}
        >
          {titles[draft.step]}
        </h1>
      </div>

      {draft.step === "entry" ? (
        <>
          <Card className="flex gap-3">
            <Info aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[var(--color-primary-strong)]" />
            <p className="text-sm leading-6 text-slate-600">
              Informe quanto deseja investir e compare simulações por tipo de investimento. Os resultados são
              estimativas não garantidas; retornos passados não garantem ganhos futuros e podem ocorrer perdas.
            </p>
          </Card>
          <Card>
            <ContributionForm onContinue={() => updateInvestmentDraft({ step: "explore" })} />
          </Card>
        </>
      ) : null}

      {draft.step === "explore" ? (
        <>
          <Card>{summary}</Card>
          <InvestmentExplorer />
        </>
      ) : null}

      {draft.step === "result" ? (
        <>
          <Card>{summary}</Card>
          <SimulationStep />
        </>
      ) : null}
    </div>
  );
}
