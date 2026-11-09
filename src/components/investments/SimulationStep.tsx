"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";

import { requiredRateField, SimulationControls } from "@/components/investments/SimulationControls";
import { SimulationResult } from "@/components/investments/SimulationResult";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { useAssetDetail, useSimulation } from "@/hooks/useInvestments";
import { getInvestmentDraft, subscribeToInvestmentDraft, updateInvestmentDraft, type SimulationDraft } from "@/lib/investment-draft";
import { isNetworkError, periodOptions } from "@/lib/investment-format";
import { percentToFraction, todayInBrazil } from "@/lib/investment-money";
import { queryKeys } from "@/lib/query-keys";
import { investmentsService } from "@/services/investments.service";
import type { AssetDetail, SimulationRequestBody } from "@/types/investment";

function validateRate(asset: AssetDetail, draft: SimulationDraft): { error?: string; fraction?: string } {
  const field = requiredRateField(asset);

  if (draft.mode !== "projection" || !field) {
    return {};
  }

  const typed = field === "annualCdi" ? draft.annualCdi : draft.annualReturn;
  const fraction = percentToFraction(typed);
  const number = Number(typed.trim().replace(",", "."));

  if (!typed.trim()) {
    return { error: "Informe a taxa do cenário para projetar." };
  }
  if (fraction === null) {
    return { error: "Use um número em % ao ano, por exemplo 12,5." };
  }
  if (field === "annualReturn" && !(number > -100 && number <= 1000)) {
    return { error: "O retorno anual deve ser maior que -100% e no máximo 1000%." };
  }
  if (field === "annualCdi" && !(number >= 0 && number <= 1000)) {
    return { error: "O CDI anual deve estar entre 0% e 1000%." };
  }

  return { fraction };
}

function errorCopy(error: unknown) {
  const status = (error as { status?: number }).status;
  const detail = error instanceof Error ? error.message : "";

  if (isNetworkError(error)) {
    return "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.";
  }
  if (status === 409) {
    return "Os dados foram atualizados enquanto você simulava. Atualizamos a versão: simule novamente para ver o resultado com os dados mais recentes.";
  }
  if (status === 422) {
    return `Esta simulação não pôde ser feita com as opções escolhidas${detail ? `: ${detail}` : "."} Ajuste as opções e tente novamente.`;
  }
  if (status === 503) {
    return "Os dados de mercado estão indisponíveis agora. Tente novamente em instantes; nenhum valor foi estimado.";
  }

  return "Não foi possível calcular a simulação. Tente novamente.";
}

function sameRequest(a: SimulationRequestBody | undefined, b: SimulationRequestBody) {
  // dataset_version and as_of are chosen at submit time; everything the user controls must match.
  return (
    !!a &&
    a.asset_id === b.asset_id &&
    a.amount === b.amount &&
    a.contribution_type === b.contribution_type &&
    a.period_months === b.period_months &&
    a.mode === b.mode &&
    a.reinvest_distributions === b.reinvest_distributions &&
    JSON.stringify(a.projection_assumptions ?? null) === JSON.stringify(b.projection_assumptions ?? null)
  );
}

export function SimulationStep() {
  const draft = useSyncExternalStore(subscribeToInvestmentDraft, getInvestmentDraft, getInvestmentDraft);
  const queryClient = useQueryClient();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const selection = draft.selection;
  const assetQuery = useAssetDetail(selection?.asset_id);
  const asset = assetQuery.data;
  const sim = draft.simulation;
  const simulation = useSimulation(sim.submitted);
  const [rateTouched, setRateTouched] = useState(false);

  const rate = asset ? validateRate(asset, sim) : {};
  const totalReturnSeries = asset?.series_type === "total_return";
  const wantsReinvest = Boolean(asset && asset.category !== "cdb" && asset.supports_reinvestment && !totalReturnSeries && sim.reinvest);

  // The request that the CURRENT controls describe. A result is only shown when it matches this exactly.
  const currentBody: SimulationRequestBody | undefined =
    selection && asset
      ? {
          asset_id: selection.asset_id,
          amount: selection.amount,
          contribution_type: selection.contribution_type,
          period_months: sim.months,
          mode: sim.mode,
          reinvest_distributions: wantsReinvest,
          ...(sim.mode === "projection" && rate.fraction
            ? { projection_assumptions: requiredRateField(asset) === "annualCdi" ? { annual_cdi: rate.fraction } : { annual_return: rate.fraction } }
            : {}),
        }
      : undefined;

  const isCurrent = Boolean(currentBody && sameRequest(sim.submitted, currentBody));
  const result = isCurrent && simulation.isSuccess ? simulation.data : undefined;
  const failed = isCurrent && simulation.isError;
  const pending = isCurrent && simulation.isFetching;
  const stale = Boolean(sim.submitted) && !isCurrent;

  // Move focus to the result (or the error) when it arrives so keyboard and screen reader users follow along.
  const announced = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (result && announced.current !== result.dataset_version + JSON.stringify(sim.submitted)) {
      announced.current = result.dataset_version + JSON.stringify(sim.submitted);
      headingRef.current?.focus();
    }
  }, [result, sim.submitted]);

  function patch(change: Partial<SimulationDraft>) {
    updateInvestmentDraft({ simulation: { ...getInvestmentDraft().simulation, ...change } });
  }

  async function submit() {
    if (rate.error) {
      // Show why nothing happened: projections never run without an explicit scenario rate.
      setRateTouched(true);
      return;
    }
    if (!currentBody) {
      return;
    }

    // Freshest published version at submit time: a 409 from an older version is then resolved by simulating again.
    let datasetVersion: string | undefined;
    try {
      const status = await queryClient.fetchQuery({
        queryKey: queryKeys.investments.dataStatus,
        queryFn: ({ signal }) => investmentsService.dataStatus(signal),
        staleTime: 0,
      });
      datasetVersion = status.dataset_version ?? undefined;
    } catch {
      datasetVersion = undefined;
    }

    patch({
      submitted: {
        ...currentBody,
        ...(currentBody.mode === "historical" ? { as_of: todayInBrazil() } : {}),
        ...(datasetVersion ? { dataset_version: datasetVersion } : {}),
      },
    });
  }

  // A version conflict means our cached status is old: refresh it so the next attempt uses the new version.
  useEffect(() => {
    if (failed && (simulation.error as { status?: number }).status === 409) {
      void queryClient.invalidateQueries({ queryKey: queryKeys.investments.dataStatus });
    }
  }, [failed, simulation.error, queryClient]);

  const rankingPeriodLabel = periodOptions.find((option) => option.value === selection?.ranking_period)?.label ?? "";
  const horizonDiffersFromRanking = Boolean(selection && Number(selection.ranking_period.replace("m", "")) !== sim.months);

  let content;
  if (assetQuery.isPending) {
    content = <div aria-busy="true" aria-label="Carregando ativo" className="h-24 animate-pulse rounded-[10px] bg-slate-100" role="status" />;
  } else if (assetQuery.isError || !asset) {
    content = (
      <div className="space-y-3">
        <ErrorMessage message="Não foi possível carregar os dados do ativo. Tente novamente." />
        <Button variant="secondary" onClick={() => void assetQuery.refetch()}>
          Tentar novamente
        </Button>
      </div>
    );
  } else {
    content = (
      <SimulationControls
        asset={asset}
        canSubmit={asset.supports_historical || asset.supports_projection}
        draft={sim}
        horizonDiffersFromRanking={horizonDiffersFromRanking}
        isPending={pending}
        rankingPeriodLabel={rankingPeriodLabel}
        rateError={sim.mode === "projection" && (rateTouched || sim.annualReturn || sim.annualCdi) ? rate.error : undefined}
        onChange={patch}
        onSubmit={() => void submit()}
      />
    );
  }

  return (
    <div className="space-y-4">
      <Card className="space-y-4">
        <div>
          <p className="text-sm text-slate-500">Ativo escolhido</p>
          <p className="mt-1 text-lg font-bold text-slate-900">{draft.selectedAssetName}</p>
          {asset?.category === "cdb" && asset.cdb_conditions?.length === 0 ? (
            <p className="mt-1 text-sm text-amber-700">Este produto não tem condição verificada e vigente: a simulação não está disponível.</p>
          ) : null}
        </div>
        {content}
      </Card>

      {/* Announces completion or failure without stealing focus on every keystroke. */}
      <div aria-live="polite" className="space-y-3" role="status">
        {pending ? <p className="text-sm text-slate-600">Calculando a simulação...</p> : null}
        {stale && !pending ? (
          <p className="rounded-[10px] bg-slate-50 px-4 py-3 text-sm text-slate-600">
            As opções mudaram. Toque em Simular para ver o resultado atualizado; o resultado anterior foi ocultado.
          </p>
        ) : null}
        {result ? <p className="sr-only">Simulação concluída.</p> : null}
      </div>

      {failed ? (
        <div className="space-y-3" role="alert">
          <ErrorMessage message={errorCopy(simulation.error)} />
          {(simulation.error as { status?: number }).status !== 422 ? (
            <Button variant="secondary" onClick={() => void submit()}>
              Tentar novamente
            </Button>
          ) : null}
        </div>
      ) : null}

      {result && asset ? (
        <SimulationResult
          ref={headingRef}
          assetName={draft.selectedAssetName ?? asset.name}
          horizonDiffersFromRanking={horizonDiffersFromRanking}
          isCdb={asset.category === "cdb"}
          rankingPeriodLabel={rankingPeriodLabel}
          result={result}
        />
      ) : null}

      <Button variant="ghost" onClick={() => updateInvestmentDraft({ step: "explore" })}>
        <ArrowLeft className="mr-2 size-4" />
        Voltar e escolher outro ativo
      </Button>
    </div>
  );
}
