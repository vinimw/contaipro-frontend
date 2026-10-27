export type NotificationType = "overdue_bills" | "missing_income";

export type AppNotification = {
  type: NotificationType;
  title: string;
  quantity: number;
  amount: number;
};

export type NotificationsResponse = {
  items: AppNotification[];
  total_count: number;
};
