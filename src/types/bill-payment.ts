export type BillPaymentStatus = "pending" | "paid" | "overdue";

export type BillPayment = {
  id: string;
  bill_id: string;
  user_id?: string;
  bill_name?: string;
  bill_description?: string | null;
  bill_type?: "single" | "fixed";
  recurrence_type?: "none" | "monthly_forever" | "monthly_until_date";
  due_day?: number;
  is_fixed?: boolean;
  is_single?: boolean;
  reference_month: string;
  due_date: string;
  amount: number;
  status: BillPaymentStatus;
  paid_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type MonthlyItemType = "bill_payment" | "quick_expense";

export type MonthlyItem = {
  id: string;
  item_type: MonthlyItemType;
  name: string;
  description?: string | null;
  amount: number;
  occurrence_date: string;
  reference_month: string;
  status: BillPaymentStatus | null;
  paid_at?: string | null;
  bill_id?: string | null;
  bill_type?: "single" | "fixed" | null;
  recurrence_type?: "none" | "monthly_forever" | "monthly_until_date" | null;
  due_day?: number | null;
  is_fixed: boolean;
  is_single: boolean;
  can_mark_as_paid: boolean;
  can_mark_as_pending: boolean;
};

export type MonthlyPaymentsResponse = {
  month: string;
  bill_payments: BillPayment[];
  quick_expenses: import("@/types/quick-expense").QuickExpense[];
  items: MonthlyItem[];
};
