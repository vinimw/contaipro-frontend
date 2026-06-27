import { api, unwrapRequest } from "@/lib/api";
import type { ExtraIncome, ExtraIncomePayload } from "@/types/extra-income";

export const extraIncomesService = {
  list(month: string) {
    return unwrapRequest<ExtraIncome[]>(
      api.get("/extra-incomes", {
        params: { month },
      }),
    );
  },
  create(input: ExtraIncomePayload) {
    return unwrapRequest<ExtraIncome>(api.post("/extra-incomes", input));
  },
  update(id: string, input: ExtraIncomePayload) {
    return unwrapRequest<ExtraIncome>(api.patch(`/extra-incomes/${id}`, input));
  },
  remove(id: string) {
    return unwrapRequest(api.delete(`/extra-incomes/${id}`));
  },
};
