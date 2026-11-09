"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-keys";
import { investmentsService } from "@/services/investments.service";
import type { InvestmentCategoryId, RankingCategoryId, RankingPeriod } from "@/types/investment";

const FIVE_MINUTES = 5 * 60 * 1000;

export function useInvestmentCategories() {
  return useQuery({
    queryKey: queryKeys.investments.categories,
    queryFn: ({ signal }) => investmentsService.categories(signal),
    staleTime: FIVE_MINUTES,
  });
}

export function useDataStatus() {
  return useQuery({
    queryKey: queryKeys.investments.dataStatus,
    queryFn: ({ signal }) => investmentsService.dataStatus(signal),
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true,
  });
}

/**
 * Ranking for one category and window. The key includes the dataset version, so a newly published dataset
 * is fetched fresh and an older response is never shown for the current selection.
 */
export function useInvestmentRanking(
  category: RankingCategoryId,
  period: RankingPeriod,
  datasetVersion: string | null,
  enabled: boolean,
) {
  return useQuery({
    // No explicit base date: the server uses the latest available ("latest").
    queryKey: queryKeys.investments.ranking(category, period, "latest", datasetVersion),
    queryFn: ({ signal }) => investmentsService.rankings({ category, period }, signal),
    enabled,
    staleTime: FIVE_MINUTES,
    retry: (failureCount, error) => {
      const status = (error as { status?: number }).status;
      return failureCount < 1 && (status === undefined || status >= 500) && status !== 503;
    },
  });
}

export function useInvestmentAssets(
  category: InvestmentCategoryId,
  page: number,
  datasetVersion: string | null,
  enabled: boolean,
) {
  return useQuery({
    queryKey: queryKeys.investments.assets(category, page, datasetVersion),
    queryFn: ({ signal }) => investmentsService.assets({ category, page }, signal),
    enabled,
    staleTime: FIVE_MINUTES,
  });
}
