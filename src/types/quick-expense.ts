export type QuickExpense = {
  id: string;
  name: string;
  amount: number;
  expense_date?: string;
  created_at?: string;
};

export type QuickExpensePayload = {
  name: string;
  amount: number;
  expense_date?: string | null;
};
