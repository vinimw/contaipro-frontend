import { api, unwrapRequest } from "@/lib/api";
import type {
  BillPayment,
  MonthlyItem,
  MonthlyPaymentsResponse,
} from "@/types/bill-payment";

function paymentToMonthlyItem(payment: BillPayment): MonthlyItem {
  return {
    id: payment.id,
    item_type: "bill_payment",
    name: payment.bill_name ?? "Conta mensal",
    description: payment.bill_description ?? null,
    amount: payment.amount,
    occurrence_date: payment.due_date,
    reference_month: payment.reference_month,
    status: payment.status,
    paid_at: payment.paid_at ?? null,
    bill_id: payment.bill_id,
    bill_type: payment.bill_type ?? null,
    recurrence_type: payment.recurrence_type ?? null,
    due_day: payment.due_day ?? null,
    is_fixed: payment.is_fixed ?? payment.bill_type === "fixed",
    is_single: payment.is_single ?? payment.bill_type === "single",
    can_mark_as_paid: true,
    can_mark_as_pending: true,
  };
}

function normalizeMonthlyResponse(
  month: string,
  response: MonthlyPaymentsResponse | BillPayment[],
): MonthlyPaymentsResponse {
  if (Array.isArray(response)) {
    return {
      month,
      bill_payments: response,
      quick_expenses: [],
      items: response.map(paymentToMonthlyItem),
    };
  }

  return response;
}

export const billPaymentsService = {
  async list(month: string) {
    const response = await unwrapRequest<MonthlyPaymentsResponse | BillPayment[]>(
      api.get("/bill-payments", {
        params: { month },
      }),
    );

    return normalizeMonthlyResponse(month, response);
  },
  markAsPaid(id: string) {
    return unwrapRequest<BillPayment>(
      api.patch(`/bill-payments/${id}/mark-as-paid`),
    );
  },
  markAsPending(id: string) {
    return unwrapRequest<BillPayment>(
      api.patch(`/bill-payments/${id}/mark-as-pending`),
    );
  },
  remove(id: string) {
    return unwrapRequest<void>(api.delete(`/bill-payments/${id}`));
  },
};
