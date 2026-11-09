"use client";

import { useState, useSyncExternalStore } from "react";
import { ArrowLeft } from "lucide-react";

import { CatalogPanel } from "@/components/investments/CatalogPanel";
import { CategoryTabs, investmentPanelId, tabId } from "@/components/investments/CategoryTabs";
import { DataStatusBanner } from "@/components/investments/DataInfo";
import { PeriodSelector } from "@/components/investments/PeriodSelector";
import { RankingPanel } from "@/components/investments/RankingPanel";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { useDataStatus, useInvestmentCategories } from "@/hooks/useInvestments";
import {
  getInvestmentDraft,
  subscribeToInvestmentDraft,
  toCanonicalAmount,
  updateInvestmentDraft,
} from "@/lib/investment-draft";
import type { InvestmentAssetItem, InvestmentCategoryId, RankingCategoryId, RankingItem } from "@/types/investment";

export function InvestmentExplorer() {
  const draft = useSyncExternalStore(subscribeToInvestmentDraft, getInvestmentDraft, getInvestmentDraft);
  const [catalogPage, setCatalogPage] = useState(1);
  const categories = useInvestmentCategories();
  const status = useDataStatus();

  // Queries wait until the data status settles, so keys carry the right dataset version from the start.
  const ready = status.isSuccess || status.isError;
  const datasetVersion = status.data?.dataset_version ?? null;
  const category = categories.data?.items.find((item) => item.id === draft.category) ?? categories.data?.items[0];

  function select(assetId: string, name: string) {
    if (draft.amount === undefined) {
      updateInvestmentDraft({ step: "entry" });
      return;
    }

    // The handoff carries only choices. The monetary result comes from the simulation API in the next step.
    updateInvestmentDraft({
      step: "result",
      selectedAssetName: name,
      selection: {
        asset_id: assetId,
        ranking_period: draft.period,
        amount: toCanonicalAmount(draft.amount),
        contribution_type: draft.contributionType,
      },
    });
  }

  function changeCategory(id: InvestmentCategoryId) {
    setCatalogPage(1);
    updateInvestmentDraft({ category: id });
  }

  let content;
  if (categories.isPending) {
    content = <div aria-busy="true" aria-label="Carregando categorias" className="h-14 animate-pulse rounded-[10px] bg-slate-100" role="status" />;
  } else if (categories.isError || !category) {
    content = (
      <div className="space-y-3">
        <ErrorMessage message="Não foi possível carregar as categorias de investimento." />
        <Button variant="secondary" onClick={() => void categories.refetch()}>
          Tentar novamente
        </Button>
      </div>
    );
  } else {
    content = (
      <>
        <CategoryTabs categories={categories.data.items} value={category.id} onChange={changeCategory} />
        <div aria-labelledby={tabId(category.id)} className="space-y-4" id={investmentPanelId} role="tabpanel" tabIndex={0}>
          {category.available_asset_count === 0 ? (
            <EmptyState
              title={`Nenhum ativo em ${category.label}`}
              description="Ainda não há ativos desta categoria no universo coberto pelos dados. Você pode voltar e ajustar o aporte ou escolher outra categoria."
            />
          ) : category.supports_ranking ? (
            <>
              <PeriodSelector value={draft.period} onChange={(period) => updateInvestmentDraft({ period })} />
              <RankingPanel
                category={category.id as RankingCategoryId}
                datasetVersion={datasetVersion}
                enabled={ready}
                period={draft.period}
                onSelect={(item: RankingItem) => select(item.asset_id, item.name)}
              />
            </>
          ) : (
            <CatalogPanel
              category={category.id}
              datasetVersion={datasetVersion}
              enabled={ready}
              page={catalogPage}
              onPageChange={setCatalogPage}
              onSelect={(asset: InvestmentAssetItem) => select(asset.id, asset.name)}
            />
          )}
        </div>
      </>
    );
  }

  return (
    <div className="space-y-4">
      <DataStatusBanner status={status.data} />
      <Card className="space-y-4">{content}</Card>
      <Button variant="ghost" onClick={() => updateInvestmentDraft({ step: "entry" })}>
        <ArrowLeft className="mr-2 size-4" />
        Voltar e editar aporte
      </Button>
    </div>
  );
}
