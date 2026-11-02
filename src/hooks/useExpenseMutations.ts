import { useMutation } from "@tanstack/react-query";

import { useFinanceInvalidation } from "@/hooks/useFinanceInvalidation";
import { quickExpensesService } from "@/services/quick-expenses.service";
import type { QuickExpensePayload } from "@/types/quick-expense";

type ExpenseVariables = { month: string; payload: QuickExpensePayload };

export function useExpenseMutations() {
  const { invalidateMonth } = useFinanceInvalidation();
  return {
    create: useMutation({
      mutationFn: ({ payload }: ExpenseVariables) => quickExpensesService.create(payload),
      onSuccess: (_, variables) => invalidateMonth(variables.month, { expenses: true }),
    }),
    update: useMutation({
      mutationFn: ({ id, payload }: ExpenseVariables & { id: string }) => quickExpensesService.update(id, payload),
      onSuccess: (_, variables) => invalidateMonth(variables.month, { expenses: true }),
    }),
    remove: useMutation({
      mutationFn: ({ id }: { id: string; month: string }) => quickExpensesService.remove(id),
      onSuccess: (_, variables) => invalidateMonth(variables.month, { expenses: true }),
    }),
  };
}
