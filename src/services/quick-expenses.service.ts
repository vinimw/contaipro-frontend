import { api, unwrapRequest } from "@/lib/api";
import type { QuickExpense, QuickExpensePayload } from "@/types/quick-expense";

export const quickExpensesService = {
  list(month: string) {
    return unwrapRequest<QuickExpense[]>(
      api.get("/quick-expenses", {
        params: { month },
      }),
    );
  },
  create(input: QuickExpensePayload) {
    return unwrapRequest<QuickExpense>(api.post("/quick-expenses", input));
  },
  update(id: string, input: QuickExpensePayload) {
    return unwrapRequest<QuickExpense>(api.patch(`/quick-expenses/${id}`, input));
  },
  remove(id: string) {
    return unwrapRequest(api.delete(`/quick-expenses/${id}`));
  },
};
