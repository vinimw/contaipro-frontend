// Contracts of the Invista API (#35, #38). Decimal values stay strings and unknown values stay null.

export type InvestmentCategoryId = "stock" | "fii" | "fund" | "cdb" | "other";
export type RankingCategoryId = "stock" | "fii" | "fund" | "other";
export type RankingPeriod = "1m" | "3m" | "6m" | "12m" | "36m" | "60m";
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

export type CdbCondition = {
  product_identifier: string;
  name: string;
  modality: string;
  index_code: string | null;
  contracted_rate: string | null;
  minimum_amount: string | null;
  grace_period_days: number | null;
  liquidity: string;
  maturity_date: string | null;
  eligibility: string | null;
  effective_from: string;
  effective_to: string | null;
  source_url: string;
  verified_at: string;
};

export type AssetDetail = CatalogMetadata & {
  id: string;
  ticker: string | null;
  name: string;
  category: InvestmentCategoryId;
  currency: string;
  issuer: string | null;
  available: boolean;
  supports_historical: boolean;
  supports_projection: boolean;
  supports_reinvestment: boolean;
  series_type: string | null;
  coverage_start: string | null;
  coverage_end: string | null;
  unit_rule: string | null;
  restrictions: string | null;
  cdb_conditions: CdbCondition[] | null;
};

export type SimulationMode = "historical" | "projection";
export type SimulationHorizon = 1 | 3 | 6 | 12;

/** Body of POST /investments/simulations. Money and rates are decimal strings (fractions for rates). */
export type SimulationRequestBody = {
  asset_id: string;
  amount: string;
  contribution_type: ContributionType;
  period_months: SimulationHorizon;
  mode: SimulationMode;
  reinvest_distributions: boolean;
  as_of?: string;
  projection_assumptions?: { annual_return?: string; annual_cdi?: string };
  dataset_version?: string;
};

export type SimulationLot = {
  contribution_date: string;
  redemption_date: string;
  calendar_days: number;
  principal: string;
  gross_gain: string;
  iof_rate: string | null;
  iof: string | null;
  ir_rate: string | null;
  ir: string | null;
  fees: string | null;
  net_amount: string | null;
  product_terms_version: string;
};

export type SimulationResponse = {
  mode: SimulationMode;
  asset_id: string;
  currency: string;
  amount: string;
  contribution_type: ContributionType;
  period_months: number;
  reinvest_distributions: boolean;
  start_date: string;
  end_date: string;
  effective_start_date: string | null;
  effective_end_date: string;
  total_contributed: string;
  asset_market_value: string;
  cash_balance: string;
  distributions_received: string | null;
  distributions_reinvested: string | null;
  price_gain: string | null;
  gross_final_amount: string;
  gross_profit: string;
  fees: string | null;
  ir: string | null;
  iof: string | null;
  net_profit: string | null;
  final_net_amount: string | null;
  tax_status: "estimated" | "not_calculated" | "not_applicable";
  cost_status: "estimated" | "not_calculated" | "not_applicable";
  contributions: { scheduled_date: string; effective_date: string | null; amount: string }[];
  timeline: {
    date: string;
    type: "contribution" | "distribution" | "reinvestment" | "end";
    amount: string;
    units_delta: string | null;
    units_held: string | null;
    cash_balance: string | null;
    market_value: string | null;
  }[];
  assumptions: Record<string, string | boolean | null>;
  warnings: string[];
  sources: InvestmentSource[];
  data_reference_date: string;
  last_successful_update_at: string | null;
  dataset_version: string;
  methodology_version: string;
  tax_rule_version: string | null;
  lots: SimulationLot[] | null;
};
