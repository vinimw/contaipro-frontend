export type ExtraIncome = {
  id: string;
  name: string;
  amount: number;
  income_date?: string;
  created_at?: string;
};

export type ExtraIncomePayload = {
  name: string;
  amount: number;
  income_date?: string | null;
};
