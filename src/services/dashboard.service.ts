import { api, unwrapRequest } from "@/lib/api";
import type { DashboardChartPoint, DashboardData } from "@/types/dashboard";

type DashboardApiResponse = {
  month: string;
  monthly_income_amount: number;
  extra_income_total: number;
  bills_total: number;
  quick_expenses_total: number;
  paid_total: number;
  pending_total: number;
  overdue_total: number;
  forecast_balance: number;
  bill_payments: DashboardData["bill_payments"];
  quick_expenses: DashboardData["quick_expenses"];
  extra_incomes: DashboardData["extra_incomes"];
};

type DashboardChartApiItem = {
  month: string;
  bills_total: number;
  quick_expenses_total: number;
  extra_income_total: number;
  forecast_balance: number;
};

type DashboardChartApiResponse = {
  items: DashboardChartApiItem[];
};

function normalizeDashboard(data: DashboardApiResponse): DashboardData {
  return {
    month: data.month,
    summary: {
      monthly_income_amount: data.monthly_income_amount,
      total_bills_amount: data.bills_total,
      total_paid_amount: data.paid_total,
      total_pending_amount: data.pending_total,
      total_overdue_amount: data.overdue_total,
      quick_expenses_total: data.quick_expenses_total,
      extra_incomes_total: data.extra_income_total,
      projected_balance: data.forecast_balance,
    },
    bill_payments: data.bill_payments,
    quick_expenses: data.quick_expenses,
    extra_incomes: data.extra_incomes,
  };
}

function normalizeChart(data: DashboardChartApiResponse): DashboardChartPoint[] {
  return data.items.map((item) => ({
    month: item.month,
    total_bills_amount: item.bills_total,
    quick_expenses_total: item.quick_expenses_total,
    extra_incomes_total: item.extra_income_total,
    projected_balance: item.forecast_balance,
  }));
}

export const dashboardService = {
  async get(month: string) {
    const data = await unwrapRequest<DashboardApiResponse>(
      api.get("/dashboard", {
        params: { month },
      }),
    );

    return normalizeDashboard(data);
  },
  async chart(monthsBack = 6, monthsForward = 3) {
    const data = await unwrapRequest<DashboardChartApiResponse>(
      api.get("/dashboard/chart", {
        params: {
          months_back: monthsBack,
          months_forward: monthsForward,
        },
      }),
    );

    return normalizeChart(data);
  },
};
