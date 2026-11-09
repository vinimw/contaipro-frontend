// Contracts of the Invista API (#35, #38). Decimal values stay strings and unknown values stay null.

export type InvestmentCategoryId = "stock" | "fii" | "fund" | "cdb" | "other";
export type RankingCategoryId = "stock" | "fii" | "fund";
export type RankingPeriod = "1m" | "3m" | "6m" | "12m";
export type ContributionType = "single" | "monthly";

export type InvestmentSource = {
  code: string;
  name: string;
  source_url: string | null;
};

export type CatalogMetadata = {
  dataset_version: string | null;
  data_reference_date: string | null;
  last_successful_update_at: string | null;
  sources: InvestmentSource[];
  warnings: string[];
};

export type InvestmentCategory = {
  id: InvestmentCategoryId;
  label: string;
  available_asset_count: number;
  supports_ranking: boolean;
  supports_historical: boolean;
  supports_projection: boolean;
};

export type CategoriesResponse = CatalogMetadata & { items: InvestmentCategory[] };

export type InvestmentAssetItem = {
  id: string;
  ticker: string | null;
  name: string;
  category: InvestmentCategoryId;
  currency: string;
  available: boolean;
  supports_historical: boolean;
  supports_projection: boolean;
  supports_reinvestment: boolean;
};

export type AssetsResponse = CatalogMetadata & {
  items: InvestmentAssetItem[];
  page: number;
  page_size: number;
  total: number;
};

export type DataStatusValue = "fresh" | "stale" | "partial" | "unavailable";

export type DataStatus = {
  status: DataStatusValue;
  dataset_version: string | null;
  data_reference_date: string | null;
  last_successful_update_at: string | null;
  next_expected_update_at: string | null;
  sources: {
    name: string;
    source_url: string | null;
    status: "fresh" | "stale" | "unavailable";
    data_reference_date: string | null;
    last_successful_update_at: string | null;
    coverage_start: string | null;
    coverage_end: string | null;
  }[];
  warnings: string[];
};

export type RankingItem = {
  asset_id: string;
  ticker: string | null;
  name: string;
  rank: number;
  total_return: string;
  price_return: string | null;
  distribution_return: string | null;
  coverage_status: "complete";
};

export type RankingResponse = {
  category: RankingCategoryId;
  period: RankingPeriod;
  requested_as_of: string;
  effective_start_date: string | null;
  effective_end_date: string | null;
  universe_size: number;
  eligible_count: number;
  excluded_count: number;
  exclusion_reasons: Record<string, number>;
  empty_reason: string | null;
  items: RankingItem[];
  methodology_version: string;
  dataset_version: string;
  sources: InvestmentSource[];
  data_reference_date: string | null;
  last_successful_update_at: string | null;
  warnings: string[];
};

/** Handoff to the result step (#66). The ranking window is NOT the future horizon. */
export type InvestmentSelection = {
  asset_id: string;
  ranking_period: RankingPeriod;
  amount: string;
  contribution_type: ContributionType;
};
