import { api, unwrapRequest } from "@/lib/api";
import type { Bill, BillPayload } from "@/types/bill";

export const billsService = {
  list() {
    return unwrapRequest<Bill[]>(api.get("/bills"));
  },
  getById(id: string) {
    return unwrapRequest<Bill>(api.get(`/bills/${id}`));
  },
  create(input: BillPayload) {
    return unwrapRequest<Bill>(api.post("/bills", input));
  },
  update(id: string, input: BillPayload) {
    return unwrapRequest<Bill>(api.patch(`/bills/${id}`, input));
  },
  remove(id: string) {
    return unwrapRequest(api.delete(`/bills/${id}`));
  },
};
