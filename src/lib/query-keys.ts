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
      ["dashboard", "chart", monthsBack, monthsForward] as const,
  },
  monthlyPayments: {
    all: ["monthly-payments"] as const,
    month: (month: string) => ["monthly-payments", month] as const,
  },
  overduePayments: ["overdue-payments"] as const,
  notifications: ["notifications"] as const,
  notificationPreferences: ["notification-preferences"] as const,
  quickExpenses: {
    all: ["quick-expenses"] as const,
    month: (month: string) => ["quick-expenses", month] as const,
  },
  extraIncomes: {
    all: ["extra-incomes"] as const,
    month: (month: string) => ["extra-incomes", month] as const,
  },
  financialProfile: ["financial-profile"] as const,
  investments: {
    all: ["investments"] as const,
    categories: ["investments", "categories"] as const,
    dataStatus: ["investments", "data-status"] as const,
    // Keys carry the selection, base date and dataset version so one selection never reuses another's cache.
    assets: (category: string, page: number, datasetVersion: string | null) =>
      ["investments", "assets", category, page, datasetVersion] as const,
    ranking: (category: string, period: string, asOf: string, datasetVersion: string | null) =>
      ["investments", "ranking", category, period, asOf, datasetVersion] as const,
  },
};
