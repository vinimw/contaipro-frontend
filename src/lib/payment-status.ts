import type { BillPaymentStatus } from "@/types/bill-payment";

export const paymentStatus = {
  paid: { label: "Pago", tone: "paid", classes: "bg-emerald-50 text-emerald-700" },
  pending: { label: "Agendado", tone: "pending", classes: "bg-amber-50 text-amber-700" },
  overdue: { label: "Urgente", tone: "overdue", classes: "bg-rose-50 text-rose-700" },
} as const satisfies Record<BillPaymentStatus, { label: string; tone: "paid" | "pending" | "overdue"; classes: string }>;
