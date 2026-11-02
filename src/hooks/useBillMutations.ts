import { useMutation } from "@tanstack/react-query";

import { useFinanceInvalidation } from "@/hooks/useFinanceInvalidation";
import { billsService } from "@/services/bills.service";
import type { BillPayload } from "@/types/bill";

export function useBillMutations() {
  const { invalidateBills } = useFinanceInvalidation();
  const create = useMutation({ mutationFn: billsService.create, onSuccess: invalidateBills });
  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: BillPayload }) => billsService.update(id, payload),
    onSuccess: invalidateBills,
  });
  const remove = useMutation({ mutationFn: billsService.remove, onSuccess: invalidateBills });
  return { create, remove, update };
}
