"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { DataInfo } from "@/components/investments/DataInfo";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { useInvestmentRanking } from "@/hooks/useInvestments";
import { formatDateBR } from "@/lib/dates";
import { emptyReasonLabels, exclusionReasonLabels, formatReturn, isNetworkError, periodLabel } from "@/lib/investment-format";
import { queryKeys } from "@/lib/query-keys";
import type { RankingCategoryId, RankingItem, RankingPeriod } from "@/types/investment";

function errorCopy(error: unknown) {
  const status = (error as { status?: number }).status;

  if (isNetworkError(error)) {
    return "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.";
  }
  if (status === 503) {
    return "Os dados de mercado ainda não estão disponíveis. Tente novamente mais tarde.";
  }
  if (status === 422) {
    return "Não foi possível montar o ranking para esta seleção.";
  }

  return "Não foi possível carregar o ranking. Tente novamente.";
}

function RankingSkeleton() {
  return (
    <div aria-busy="true" aria-label="Carregando ranking" className="space-y-3" role="status">
      {[0, 1, 2].map((item) => (
        <div key={item} className="h-20 animate-pulse rounded-[10px] bg-slate-100" />
      ))}
    </div>
  );
}

export function RankingPanel({
  category,
  period,
  datasetVersion,
  enabled,
  onSelect,
}: {
  category: RankingCategoryId;
  period: RankingPeriod;
  datasetVersion: string | null;
  enabled: boolean;
  onSelect: (item: RankingItem) => void;
}) {
  const queryClient = useQueryClient();
  const query = useInvestmentRanking(category, period, datasetVersion, enabled);
  const data = query.data;
  // Defensive: only ever show a response that matches the current selection.
  const current = data && data.category === category && data.period === period ? data : undefined;

  // A newer published dataset than the one we keyed on: refresh the status so the key (and data) follow it.
  useEffect(() => {
    if (current && datasetVersion && current.dataset_version !== datasetVersion) {
      void queryClient.invalidateQueries({ queryKey: queryKeys.investments.dataStatus });
    }
  }, [current, datasetVersion, queryClient]);

  if (!enabled || query.isPending) {
    return <RankingSkeleton />;
  }

  if (query.isError) {
    return (
      <div className="space-y-3">
        <ErrorMessage message={errorCopy(query.error)} />
        <Button variant="secondary" onClick={() => void query.refetch()}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  if (!current) {
    return <RankingSkeleton />;
  }

  const period_label = periodLabel(current.period);
  const exclusions = Object.entries(current.exclusion_reasons);
  const isAi = current.methodology_version.startsWith("ranking-lite");

  return (
    <div className="space-y-4">
      {current.items.length ? (
        <ol className="space-y-3">
          {current.items.map((item) => (
            <li key={item.asset_id}>
              <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <span aria-label={`Posição ${item.rank}`} className="inline-flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-[var(--color-primary-soft)] text-sm font-extrabold text-[#071a3d]">
                    {item.rank}º
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900">{item.name}</p>
                    {item.ticker ? <p className="text-xs text-slate-500">{item.ticker}</p> : null}
                  </div>
                </div>
                <div className="sm:text-right">
                  <p className="text-lg font-extrabold text-slate-900">{formatReturn(item.total_return)}</p>
                  <p className="text-xs text-slate-500">{isAi ? "retorno informado pela análise" : "retorno histórico bruto"} · {period_label}</p>
                  {item.price_return !== null && item.distribution_return !== null ? (
                    <p className="text-xs text-slate-500">
                      preço {formatReturn(item.price_return)} · proventos {formatReturn(item.distribution_return)}
                    </p>
                  ) : null}
                </div>
                <Button className="sm:ml-2" variant="secondary" onClick={() => onSelect(item)}>
                  Simular com este ativo
                </Button>
              </Card>
            </li>
          ))}
        </ol>
      ) : (
        <EmptyState
          title="Nenhum ativo no ranking"
          description={(current.empty_reason && emptyReasonLabels[current.empty_reason]) || "Não há ativos elegíveis para esta janela."}
        />
      )}

      <div className="space-y-2 text-xs leading-5 text-slate-600">
        <p>
          Janela de {period_label}
          {isAi
            ? ": retornos informados pela análise do Contaipro, sem cálculo próprio."
            : current.effective_start_date && current.effective_end_date
              ? `: de ${formatDateBR(current.effective_start_date)} a ${formatDateBR(current.effective_end_date)} (últimos pregões disponíveis).`
              : " sem histórico suficiente para definir as datas."}{" "}
          {current.eligible_count} de {current.universe_size} ativos do universo coberto {current.eligible_count === 1 ? "é elegível" : "são elegíveis"}
          {current.excluded_count ? `; ${current.excluded_count} ${current.excluded_count === 1 ? "foi excluído" : "foram excluídos"}` : ""}. Metodologia {current.methodology_version}.
        </p>
        {exclusions.length ? (
          <ul className="list-disc pl-5">
            {exclusions.map(([reason, count]) => (
              <li key={reason}>
                {count} · {exclusionReasonLabels[reason] ?? reason}
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <DataInfo
        dataReferenceDate={current.data_reference_date}
        lastSuccessfulUpdateAt={current.last_successful_update_at}
        sources={current.sources}
        warnings={current.warnings}
      />
    </div>
  );
}
