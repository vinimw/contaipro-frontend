export type BillType = "single" | "fixed";
export type RecurrenceType =
  | "none"
  | "monthly_forever"
  | "monthly_until_date";

export type Bill = {
  id: string;
  name: string;
  description?: string | null;
  amount: number;
  bill_type: BillType;
  recurrence_type: RecurrenceType;
  due_day: number;
  start_month: string;
  end_date?: string | null;
  auto_pay?: boolean;
  created_at?: string;
  updated_at?: string;
};

export type BillPayload = {
  name: string;
  description?: string | null;
  amount: number;
  due_day: number;
  bill_type: BillType;
  recurrence_type: RecurrenceType;
  start_month: string;
  end_date?: string | null;
  auto_pay: boolean;
};
