import { useMutation } from "@tanstack/react-query";

import { useFinanceInvalidation } from "@/hooks/useFinanceInvalidation";
import { billPaymentsService } from "@/services/bill-payments.service";

export function usePaymentMutations(month: string) {
  const { invalidateMonth } = useFinanceInvalidation();
  const afterChange = () => invalidateMonth(month, { notifications: true });
  return {
    markAsPaid: useMutation({ mutationFn: billPaymentsService.markAsPaid, onSuccess: afterChange }),
    markAsPending: useMutation({ mutationFn: billPaymentsService.markAsPending, onSuccess: afterChange }),
    remove: useMutation({ mutationFn: billPaymentsService.remove, onSuccess: afterChange }),
  };
}

export function useOverduePaymentMutation() {
  const { invalidateMonth } = useFinanceInvalidation();
  return useMutation({
    mutationFn: ({ id }: { id: string; month: string }) => billPaymentsService.markAsPaid(id),
    onSuccess: (_, variables) => invalidateMonth(variables.month, { notifications: true }),
  });
}
