export type NotificationPreference = {
  push_enabled: boolean;
  due_today: boolean;
  due_tomorrow: boolean;
  overdue: boolean;
  income_reminder_enabled: boolean;
  timezone: string;
};

export type NotificationPreferenceUpdate = Partial<NotificationPreference>;
