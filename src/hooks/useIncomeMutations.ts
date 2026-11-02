import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useFinanceInvalidation } from "@/hooks/useFinanceInvalidation";
import { queryKeys } from "@/lib/query-keys";
import { extraIncomesService } from "@/services/extra-incomes.service";
import { financialProfileService } from "@/services/financial-profile.service";
import type { ExtraIncomePayload } from "@/types/extra-income";
import type { FinancialProfilePayload } from "@/types/financial-profile";

export function useIncomeMutations() {
  const queryClient = useQueryClient();
  const { invalidateMonth } = useFinanceInvalidation();
  const afterProfile = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.financialProfile }),
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications }),
    ]);
  };
  return {
    createExtra: useMutation({
      mutationFn: ({ payload }: { month: string; payload: ExtraIncomePayload }) => extraIncomesService.create(payload),
      onSuccess: (_, variables) => invalidateMonth(variables.month, { incomes: true, notifications: true }),
    }),
    updateExtra: useMutation({
      mutationFn: ({ id, payload }: { id: string; month: string; payload: ExtraIncomePayload }) => extraIncomesService.update(id, payload),
      onSuccess: (_, variables) => invalidateMonth(variables.month, { incomes: true, notifications: true }),
    }),
    removeExtra: useMutation({
      mutationFn: ({ id }: { id: string; month: string }) => extraIncomesService.remove(id),
      onSuccess: (_, variables) => invalidateMonth(variables.month, { incomes: true, notifications: true }),
    }),
    updateProfile: useMutation({ mutationFn: financialProfileService.update, onSuccess: afterProfile }),
    updateProfilePeriod: useMutation({
      mutationFn: ({ id, payload }: { id: string; payload: FinancialProfilePayload }) => financialProfileService.updatePeriod(id, payload),
      onSuccess: afterProfile,
    }),
    removeProfilePeriod: useMutation({ mutationFn: financialProfileService.removePeriod, onSuccess: afterProfile }),
  };
}
