import type {
  ContributionType,
  InvestmentCategoryId,
  InvestmentSelection,
  RankingPeriod,
  SimulationHorizon,
  SimulationMode,
  SimulationRequestBody,
} from "@/types/investment";

export type { ContributionType };
export type InvestmentStep = "entry" | "explore" | "result";

/** Simulation controls. Kept in the draft so they survive the remount caused by hiding/showing values. */
export type SimulationDraft = {
  mode: SimulationMode;
  months: SimulationHorizon;
  reinvest: boolean;
  // Percentages exactly as typed (e.g. "12,5"); converted to decimal fractions only when building the request.
  annualReturn: string;
  annualCdi: string;
  submitted: SimulationRequestBody | undefined;
};

export const defaultSimulation: SimulationDraft = {
  mode: "historical",
  months: 3,
  reinvest: false,
  annualReturn: "",
  annualCdi: "",
  submitted: undefined,
};

export type InvestmentDraft = {
  amount: number | undefined;
  contributionType: ContributionType;
  step: InvestmentStep;
  // Exploration state lives here too, so it survives the remount caused by hiding/showing values.
  category: InvestmentCategoryId;
  period: RankingPeriod;
  selection: InvestmentSelection | undefined;
  selectedAssetName: string | undefined;
  simulation: SimulationDraft;
};

/** Handoff contract for the next step (#65). `amount` is a canonical decimal string with two places. */
export type InvestmentHandoff = {
  amount: string;
  contribution_type: ContributionType;
};

export const maxContributionAmount = 1_000_000;

const initialDraft: InvestmentDraft = {
  amount: undefined,
  contributionType: "single",
  step: "entry",
  category: "stock",
  period: "12m",
  selection: undefined,
  selectedAssetName: undefined,
  simulation: defaultSimulation,
};

// Lives in module memory on purpose: it survives the AppShell remount that happens when values are
// hidden/shown, but it is never written to the URL, localStorage or analytics.
let draft: InvestmentDraft = initialDraft;
const listeners = new Set<() => void>();

export function getInvestmentDraft() {
  return draft;
}

export function updateInvestmentDraft(patch: Partial<InvestmentDraft>) {
  draft = { ...draft, ...patch };
  listeners.forEach((listener) => listener());
}

export function subscribeToInvestmentDraft(listener: () => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

/** Canonical decimal string ("1234.50") built from integer cents, so no floating point drift reaches the API. */
export function toCanonicalAmount(value: number) {
  const cents = Math.round(value * 100);

  return `${Math.floor(cents / 100)}.${String(cents % 100).padStart(2, "0")}`;
}

export function validateContributionAmount(value: number | undefined): string | undefined {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return "Informe o valor do aporte.";
  }

  if (!Number.isFinite(value) || value <= 0) {
    return "Informe um valor maior que zero.";
  }

  if (value > maxContributionAmount) {
    return "O valor máximo por aporte é R$ 1.000.000,00.";
  }

  return undefined;
}
