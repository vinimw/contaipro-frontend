"use client";

import { DataInfo } from "@/components/investments/DataInfo";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { useInvestmentAssets } from "@/hooks/useInvestments";
import { categoryHints } from "@/lib/investment-format";
import type { InvestmentAssetItem, InvestmentCategoryId } from "@/types/investment";

/** Catalog for categories without a performance ranking (CDBs, Outros, and Fundos without a comparable method). */
export function CatalogPanel({
  category,
  page,
  onPageChange,
  datasetVersion,
  enabled,
  onSelect,
}: {
  category: InvestmentCategoryId;
  page: number;
  onPageChange: (page: number) => void;
  datasetVersion: string | null;
  enabled: boolean;
  onSelect: (asset: InvestmentAssetItem) => void;
}) {
  const query = useInvestmentAssets(category, page, datasetVersion, enabled);

  if (!enabled || query.isPending) {
    return <div aria-busy="true" aria-label="Carregando produtos" className="h-24 animate-pulse rounded-[10px] bg-slate-100" role="status" />;
  }

  if (query.isError) {
    return (
      <div className="space-y-3">
        <ErrorMessage message="Não foi possível carregar os produtos. Verifique sua conexão e tente novamente." />
        <Button variant="secondary" onClick={() => void query.refetch()}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  const data = query.data;
  const totalPages = Math.max(1, Math.ceil(data.total / data.page_size));

  return (
    <div className="space-y-4">
      {categoryHints[category] ? <p className="text-sm text-slate-600">{categoryHints[category]}</p> : null}
      {data.items.length ? (
        <ul className="space-y-3">
          {data.items.map((asset) => {
            const canSimulate = asset.supports_historical || asset.supports_projection;

            return (
              <li key={asset.id}>
                <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{asset.name}</p>
                    <p className="text-xs text-slate-500">
                      {[asset.ticker, asset.supports_historical ? "histórico" : null, asset.supports_projection ? "projeção" : null]
                        .filter(Boolean)
                        .join(" · ") || "Sem simulação disponível"}
                    </p>
                  </div>
                  <Button
                    disabled={!canSimulate}
                    title={canSimulate ? undefined : "Este produto não tem simulação disponível."}
                    variant="secondary"
                    onClick={() => onSelect(asset)}
                  >
                    Simular com este ativo
                  </Button>
                </Card>
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState
          title="Nenhum produto disponível"
          description="Ainda não há produtos desta categoria no universo coberto pelos dados."
        />
      )}

      {totalPages > 1 ? (
        <nav aria-label="Paginação do catálogo" className="flex items-center justify-between gap-3">
          <Button disabled={page <= 1} variant="ghost" onClick={() => onPageChange(page - 1)}>
            Anterior
          </Button>
          <span className="text-sm text-slate-600">
            Página {page} de {totalPages}
          </span>
          <Button disabled={page >= totalPages} variant="ghost" onClick={() => onPageChange(page + 1)}>
            Próxima
          </Button>
        </nav>
      ) : null}

      <DataInfo
        dataReferenceDate={data.data_reference_date}
        lastSuccessfulUpdateAt={data.last_successful_update_at}
        sources={data.sources}
        warnings={data.warnings}
      />
    </div>
  );
}
