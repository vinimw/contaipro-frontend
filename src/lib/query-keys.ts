export const queryKeys = {
  currentUser: ["current-user"] as const,
  bills: {
    all: ["bills"] as const,
    detail: (id: string) => ["bills", id] as const,
  },
  dashboard: {
    all: ["dashboard"] as const,
    month: (month: string) => ["dashboard", month] as const,
    chart: (monthsBack = 6, monthsForward = 3) =>
      ["dashboard-chart", monthsBack, monthsForward] as const,
  },
  monthlyPayments: {
    all: ["monthly-payments"] as const,
    month: (month: string) => ["monthly-payments", month] as const,
  },
  quickExpenses: {
    all: ["quick-expenses"] as const,
    month: (month: string) => ["quick-expenses", month] as const,
  },
  extraIncomes: {
    all: ["extra-incomes"] as const,
    month: (month: string) => ["extra-incomes", month] as const,
  },
  financialProfile: ["financial-profile"] as const,
};
