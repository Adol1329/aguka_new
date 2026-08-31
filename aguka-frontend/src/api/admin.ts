import { apiClient, ApiResponse } from "./client";

export interface KpiSummary {
  totalFarmers: number;
  activeFarms: number;
  sensorsOnline: number;
  sensorsOffline: number;
  alertsToday: number;
  criticalAlerts: number;
  openSupportTickets: number;
  farmerGrowthPct: number;
}

export interface FarmerGrowthPoint {
  date: string;
  count: number;
}

export interface AlertDistribution {
  type: string;
  count: number;
}

export interface SoilDistribution {
  range: string;
  count: number;
}

export interface PendingUser {
  id: string;
  phone: string;
  email?: string;
  role: string;
  createdAt: string;
  farmerProfile?: {
    fullName?: string;
    district?: string;
  };
}

export const adminApi = {
  getKpiSummary: () => apiClient.get<KpiSummary>("/admin/analytics/summary"),

  getFarmerGrowth: () => apiClient.get<FarmerGrowthPoint[]>("/admin/analytics/farmers"),

  getAlertsByType: () => apiClient.get<AlertDistribution[]>("/admin/analytics/alerts"),

  getSoilHealthDistribution: () => apiClient.get<SoilDistribution[]>("/admin/analytics/soil"),

  getSensorStatus: () => apiClient.get<ApiResponse>("/admin/sensors/status"),

  getFarmSoilHistory: (id: string, from?: string, to?: string) => {
    const params: Record<string, string> = {};
    if (from) params.from = from;
    if (to) params.to = to;
    return apiClient.get<ApiResponse>(`/admin/farms/${id}/soil/history`, params);
  },

  getFarmReports: (params?: { cooperativeId?: string; from?: string; to?: string }) => {
    const qs: Record<string, string> = {};
    if (params?.cooperativeId) qs.cooperativeId = params.cooperativeId;
    if (params?.from) qs.from = params.from;
    if (params?.to) qs.to = params.to;
    return apiClient.get<ApiResponse>(
      "/admin/reports/farms",
      Object.keys(qs).length ? qs : undefined,
    );
  },

  getAlerts: (params?: { page?: number; limit?: number; severity?: string }) => {
    const qs: Record<string, string> = {};
    if (params?.page) qs.page = String(params.page);
    if (params?.limit) qs.limit = String(params.limit);
    if (params?.severity) qs.severity = params.severity;
    return apiClient.get<ApiResponse>("/admin/alerts", Object.keys(qs).length ? qs : undefined);
  },

  resolveAlert: (id: string) => apiClient.put<ApiResponse>(`/admin/alerts/${id}/resolve`),

  broadcastSms: (data: { message: string; userIds?: string[]; farmerIds?: string[] }) =>
    apiClient.post<ApiResponse>("/admin/notifications/broadcast", data),

  getSupportTickets: (params?: { page?: number; limit?: number; status?: string }) => {
    const qs: Record<string, string> = {};
    if (params?.page) qs.page = String(params.page);
    if (params?.limit) qs.limit = String(params.limit);
    if (params?.status) qs.status = params.status;
    return apiClient.get<ApiResponse>("/admin/support", Object.keys(qs).length ? qs : undefined);
  },

  getSupportStats: () => apiClient.get<ApiResponse>("/admin/support/stats"),

  replyToTicket: (id: string, reply: string) =>
    apiClient.put<ApiResponse>(`/admin/support/${id}/reply`, { reply }),

  updateTicketStatus: (id: string, status: string) =>
    apiClient.put<ApiResponse>(`/admin/support/${id}/status`, { status }),

  getPendingUsers: () => apiClient.get<PendingUser[]>("/admin/pending-users"),

  approveUser: (id: string) => apiClient.post<ApiResponse>(`/admin/users/${id}/approve`),

  rejectUser: (id: string, reason: string) =>
    apiClient.post<ApiResponse>(`/admin/users/${id}/reject`, { reason }),

  resetUserPassword: (userId: string) =>
    apiClient.patch<ApiResponse>(`/admin/users/${userId}/reset-password`),
};
