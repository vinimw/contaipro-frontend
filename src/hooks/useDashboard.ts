"use client";

import { useCallback, useEffect, useState } from "react";

import { dashboardService } from "@/services/dashboard.service";
import type { BillPayment } from "@/types/bill-payment";
import type { DashboardChartPoint, DashboardData } from "@/types/dashboard";

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
  const [data, setData] = useState<DashboardData>(emptyDashboard);
  const [chart, setChart] = useState<DashboardChartPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [dashboardData, chartData] = await Promise.all([
        dashboardService.get(month),
        dashboardService.chart(),
      ]);
      setData(dashboardData);
      setChart(chartData);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao carregar dados do dashboard.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [month]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void load();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [load]);

  function updatePayment(updatedPayment: BillPayment) {
    setData((currentData) => {
      const nextData = {
        ...currentData,
        bill_payments: currentData.bill_payments.map((payment) =>
          payment.id === updatedPayment.id ? updatedPayment : payment,
        ),
      };

      return recalculatePaymentSummary(nextData);
    });
  }

  return {
    data,
    chart,
    isLoading,
    error,
    reload: load,
    updatePayment,
  };
}
