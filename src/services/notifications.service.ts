import { api, unwrapRequest } from "@/lib/api";
import type {
  AppNotification,
  NotificationsResponse,
} from "@/types/notification";

type ApiNotification = Omit<AppNotification, "amount"> & {
  amount: number | string;
};

type ApiNotificationsResponse = {
  items: ApiNotification[];
  total_count: number;
};

export const notificationsService = {
  async list(): Promise<NotificationsResponse> {
    const response = await unwrapRequest<ApiNotificationsResponse>(
      api.get("/notifications"),
    );

    return {
      ...response,
      items: response.items.map((item) => ({
        ...item,
        amount: Number(item.amount),
      })),
    };
  },
};
