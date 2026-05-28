import { apiClient, ApiResponse } from "./client";

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  status: "pending" | "read" | "archived";
  type: string;
  channel: string;
  createdAt: string;
  metadata?: any;
}

export interface NotificationRule {
  id: string;
  userId: string;
  name: string;
  description?: string;
  type: string;
  enabled: boolean;
  channels: string[];
  conditions: any;
  createdAt: string;
}

export const notificationsApi = {
  getNotifications: async (params?: { page?: number; limit?: number; isRead?: boolean; type?: string }) => {
    // request<T> returns ApiResponse<T>
    // We want T to be Notification[]
    return apiClient.get<Notification[]>("/notifications", params as any);
  },

  // Alias for backward compatibility
  list: async (params?: { page?: number; limit?: number; isRead?: boolean; type?: string }) => {
    return apiClient.get<Notification[]>("/notifications", params as any);
  },

  getUnreadCount: async () => {
    return apiClient.get<{ count: number }>("/notifications/unread-count");
  },

  markAsRead: async (notificationIds: string[]) => {
    return apiClient.post<{ message: string }>("/notifications/mark-read", {
      notificationIds,
    });
  },

  // Alias for backward compatibility
  markRead: async (notificationIds: string[] = []) => {
    return apiClient.post<{ message: string }>("/notifications/mark-read", {
      notificationIds,
    });
  },

  // Notification Rules
  getRules: async () => {
    return apiClient.get<NotificationRule[]>("/notification-rules");
  },

  createRule: async (data: Partial<NotificationRule>) => {
    return apiClient.post<NotificationRule>("/notification-rules", data);
  },

  updateRule: async (id: string, data: Partial<NotificationRule>) => {
    return apiClient.put<NotificationRule>(`/notification-rules/${id}`, data);
  },

  deleteRule: async (id: string) => {
    return apiClient.delete<{ message: string }>(`/notification-rules/${id}`);
  },
};

// Also export as singular for newer code
export const notificationApi = notificationsApi;
