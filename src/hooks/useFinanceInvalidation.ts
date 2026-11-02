import { useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-keys";

export function useFinanceInvalidation() {
  const queryClient = useQueryClient();

  async function invalidateMonth(
    month: string,
    options: { expenses?: boolean; incomes?: boolean; notifications?: boolean } = {},
  ) {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.monthlyPayments.month(month) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.overduePayments }),
      options.expenses
        ? queryClient.invalidateQueries({ queryKey: queryKeys.quickExpenses.month(month) })
        : Promise.resolve(),
      options.incomes
        ? queryClient.invalidateQueries({ queryKey: queryKeys.extraIncomes.month(month) })
        : Promise.resolve(),
      options.notifications
        ? queryClient.invalidateQueries({ queryKey: queryKeys.notifications })
        : Promise.resolve(),
    ]);
  }

  async function invalidateBills() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.bills.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.monthlyPayments.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all }),
    ]);
  }

  return { invalidateBills, invalidateMonth };
}
