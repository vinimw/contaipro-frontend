import { api, unwrapRequest } from "@/lib/api";
import type {
  AssetsResponse,
  CategoriesResponse,
  DataStatus,
  InvestmentCategoryId,
  RankingCategoryId,
  RankingPeriod,
  RankingResponse,
} from "@/types/investment";

// All calls are read-only: browsing never triggers a data refresh.
export const investmentsService = {
  categories(signal?: AbortSignal) {
    return unwrapRequest<CategoriesResponse>(api.get("/investments/categories", { signal }));
  },
  dataStatus(signal?: AbortSignal) {
    return unwrapRequest<DataStatus>(api.get("/investments/data-status", { signal }));
  },
  assets(params: { category: InvestmentCategoryId; page: number; pageSize?: number }, signal?: AbortSignal) {
    return unwrapRequest<AssetsResponse>(
      api.get("/investments/assets", {
        params: { category: params.category, page: params.page, page_size: params.pageSize ?? 20 },
        signal,
      }),
    );
  },
  rankings(params: { category: RankingCategoryId; period: RankingPeriod }, signal?: AbortSignal) {
    return unwrapRequest<RankingResponse>(
      api.get("/investments/rankings", {
        params: { category: params.category, period: params.period, limit: 5 },
        signal,
      }),
    );
  },
};
