import type { BillPayment } from "@/types/bill-payment";
import type { ExtraIncome } from "@/types/extra-income";
import type { QuickExpense } from "@/types/quick-expense";

export type DashboardSummary = {
  monthly_income_amount: number;
  total_bills_amount: number;
  total_paid_amount: number;
  total_pending_amount: number;
  total_overdue_amount: number;
  quick_expenses_total: number;
  extra_incomes_total: number;
  projected_balance: number;
};

export type DashboardData = {
  month: string;
  summary: DashboardSummary;
  bill_payments: BillPayment[];
  quick_expenses: QuickExpense[];
  extra_incomes: ExtraIncome[];
};

export type DashboardChartPoint = {
  month: string;
  total_bills_amount: number;
  quick_expenses_total: number;
  extra_incomes_total: number;
  projected_balance: number;
};
