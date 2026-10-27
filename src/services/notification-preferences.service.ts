import { api, unwrapRequest } from "@/lib/api";
import type {
  NotificationPreference,
  NotificationPreferenceUpdate,
} from "@/types/notification-preference";

export const notificationPreferencesService = {
  get() {
    return unwrapRequest<NotificationPreference>(
      api.get("/notification-preferences"),
    );
  },
  update(input: NotificationPreferenceUpdate) {
    return unwrapRequest<NotificationPreference>(
      api.patch("/notification-preferences", input),
    );
  },
};
