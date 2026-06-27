import { api, unwrapRequest } from "@/lib/api";
import type {
  FinancialProfileOverview,
  FinancialProfilePayload,
  FinancialProfilePeriod,
} from "@/types/financial-profile";

type FinancialProfileApiPeriod = Omit<
  FinancialProfilePeriod,
  "monthly_income_amount"
> & {
  monthly_income_amount: number | string;
};

type FinancialProfileApiOverview = {
  current_profile: FinancialProfileApiPeriod | null;
  history: FinancialProfileApiPeriod[];
};

function normalizePeriod(
  period: FinancialProfileApiPeriod,
): FinancialProfilePeriod {
  return {
    ...period,
    monthly_income_amount: Number(period.monthly_income_amount),
  };
}

function normalizeOverview(
  overview: FinancialProfileApiOverview,
): FinancialProfileOverview {
  return {
    current_profile: overview.current_profile
      ? normalizePeriod(overview.current_profile)
      : null,
    history: overview.history.map(normalizePeriod),
  };
}

async function fetchOverview() {
  const overview = await unwrapRequest<FinancialProfileApiOverview>(
    api.get("/financial-profile"),
  );

  return normalizeOverview(overview);
}

export const financialProfileService = {
  get() {
    return fetchOverview();
  },
  async update(input: FinancialProfilePayload) {
    const overview = await unwrapRequest<FinancialProfileApiOverview>(
      api.put("/financial-profile", input),
    );

    return normalizeOverview(overview);
  },
  async updatePeriod(id: string, input: FinancialProfilePayload) {
    await unwrapRequest(api.patch(`/financial-profile/${id}`, input));

    return fetchOverview();
  },
  async removePeriod(id: string) {
    await unwrapRequest(api.delete(`/financial-profile/${id}`));

    return fetchOverview();
  },
};
