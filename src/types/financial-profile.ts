export type FinancialProfilePeriod = {
  id: string;
  monthly_income_amount: number;
  start_month: string;
  end_month: string | null;
};

export type FinancialProfileOverview = {
  current_profile: FinancialProfilePeriod | null;
  history: FinancialProfilePeriod[];
};

export type FinancialProfilePayload = {
  monthly_income_amount: number;
  start_month: string;
};
