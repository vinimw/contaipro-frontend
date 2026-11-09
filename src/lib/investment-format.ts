import type { InvestmentCategoryId, RankingPeriod } from "@/types/investment";

export const periodOptions: { value: RankingPeriod; label: string }[] = [
  { value: "1m", label: "1 mês" },
  { value: "3m", label: "3 meses" },
  { value: "6m", label: "6 meses" },
  { value: "12m", label: "12 meses" },
];

export const exclusionReasonLabels: Record<string, string> = {
  unadjusted_series: "série sem ajuste",
  fund_methodology_unknown: "fundo sem metodologia comparável",
  insufficient_history: "histórico insuficiente na janela",
  delisted_or_suspended: "sem preço na data final (deslistado ou suspenso)",
  amortization_in_window: "amortização no período",
};

export const emptyReasonLabels: Record<string, string> = {
  no_assets_covered: "Ainda não há ativos desta categoria no universo coberto pelos dados.",
  no_eligible_assets: "Nenhum ativo tem histórico completo para esta janela.",
};

export const categoryHints: Partial<Record<InvestmentCategoryId, string>> = {
  cdb: "CDBs mostram as condições verificadas e vigentes; não há ranking por rentabilidade.",
  other: "Esta categoria lista os produtos disponíveis, sem ranking por rentabilidade.",
};

const percentFormatter = new Intl.NumberFormat("pt-BR", {
  style: "percent",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  signDisplay: "exceptZero",
});

/** Display only: the API sends fractions as decimal strings ("0.15000000" = 15%). No financial calculation here. */
export function formatReturn(fraction: string | null) {
  if (fraction === null) {
    return "—";
  }

  const value = Number(fraction);

  return Number.isFinite(value) ? percentFormatter.format(value) : "—";
}

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });

export function formatDateTimeBR(value: string | null) {
  return value ? dateTimeFormatter.format(new Date(value)) : "—";
}

/** The shared API client reports connection failures as a generic 500 "Network Error"; detect them by message. */
export function isNetworkError(error: unknown) {
  const status = (error as { status?: number }).status;
  const message = error instanceof Error ? error.message : "";

  return status === undefined || status === 0 || /network error|timeout|failed to fetch/i.test(message);
}

export const assumptionLabels: Record<string, string> = {
  rounding: "Arredondamento",
  values: "Valores",
  exit: "Encerramento",
  contribution_schedule: "Calendário de aportes",
  price_track: "Trilha de preço",
  instrument_units: "Cotas",
  annual_return: "Retorno anual assumido (fração)",
  annual_cdi: "CDI anual assumido (fração)",
  horizon: "Horizonte",
  product: "Produto",
  modality: "Modalidade",
  contracted_rate: "Taxa contratada",
  liquidity: "Liquidez",
  grace_period_days: "Carência (dias)",
  minimum_amount: "Aplicação mínima",
  product_terms_evidence: "Evidência das condições",
  product_terms_verified_at: "Condições verificadas em",
  calendar: "Calendário",
  tax_basis: "Base tributária",
};
