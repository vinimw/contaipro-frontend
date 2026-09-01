"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import { dashboardService } from "@/services/dashboard.service";
import type { BillPayment } from "@/types/bill-payment";
import type { DashboardChartPoint, DashboardData } from "@/types/dashboard";
import { queryKeys } from "@/lib/query-keys";

const emptyDashboard: DashboardData = {
  month: "",
  summary: {
    monthly_income_amount: 0,
    total_bills_amount: 0,
    total_paid_amount: 0,
    total_pending_amount: 0,
    total_overdue_amount: 0,
    quick_expenses_total: 0,
    extra_incomes_total: 0,
    projected_balance: 0,
  },
  bill_payments: [],
  quick_expenses: [],
  extra_incomes: [],
};

function recalculatePaymentSummary(data: DashboardData): DashboardData {
  const totalPaidAmount = data.bill_payments
    .filter((item) => item.status === "paid")
    .reduce((total, item) => total + item.amount, 0);
  const totalPendingAmount = data.bill_payments
    .filter((item) => item.status === "pending")
    .reduce((total, item) => total + item.amount, 0);
  const totalOverdueAmount = data.bill_payments
    .filter((item) => item.status === "overdue")
    .reduce((total, item) => total + item.amount, 0);

  return {
    ...data,
    summary: {
      ...data.summary,
      total_paid_amount: totalPaidAmount,
      total_pending_amount: totalPendingAmount,
      total_overdue_amount: totalOverdueAmount,
    },
  };
}

export function useDashboard(month: string) {
  const queryClient = useQueryClient();
  const dashboardQuery = useQuery({
    queryKey: queryKeys.dashboard.month(month),
    queryFn: () => dashboardService.get(month),
  });
  const chartQuery = useQuery({
    queryKey: queryKeys.dashboard.chart(),
    queryFn: () => dashboardService.chart(),
    staleTime: 5 * 60_000,
  });

  const data = dashboardQuery.data ?? emptyDashboard;
  const chart: DashboardChartPoint[] = chartQuery.data ?? [];

  function updatePayment(updatedPayment: BillPayment) {
    queryClient.setQueryData<DashboardData>(queryKeys.dashboard.month(month), (currentData) => {
      if (!currentData) return currentData;
      const nextData = {
        ...currentData,
        bill_payments: currentData.bill_payments.map((payment) =>
          payment.id === updatedPayment.id ? updatedPayment : payment,
        ),
      };

      return recalculatePaymentSummary(nextData);
    });
    void queryClient.invalidateQueries({ queryKey: queryKeys.monthlyPayments.month(month) });
    void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.chart() });
  }

  return {
    data,
    chart,
    isLoading: dashboardQuery.isPending || chartQuery.isPending,
    error:
      dashboardQuery.error?.message ??
      chartQuery.error?.message ??
      null,
    reload: async () => {
      await Promise.all([dashboardQuery.refetch(), chartQuery.refetch()]);
    },
    updatePayment,
  };
}
