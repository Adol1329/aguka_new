import { apiClient } from "./client";

export const pestDiseaseApi = {
  getAlerts: (params?: {
    cooperativeId?: string;
    farmerId?: string;
    severity?: string;
    limit?: number;
  }) => {
    const query: Record<string, string> = {};
    if (params?.severity) query.severity = params.severity;
    if (params?.limit) query.limit = String(params.limit);
    const endpoint = params?.cooperativeId
      ? `/pest-disease/${params.cooperativeId}/alerts`
      : "/pest-disease/alerts";
    return apiClient.get(endpoint, query);
  },

  createAlert: (data: {
    farmerId: string;
    alertType: "pest" | "disease";
    severity: "info" | "warning" | "critical";
    title: string;
    message: string;
    recommendation?: string;
  }) => apiClient.post("/pest-disease/alerts", data),

  updateAlert: (alertId: string, data: { isRead?: boolean }) =>
    apiClient.patch(`/pest-disease/alerts/${alertId}`, data),

  getStats: (cooperativeId: string, params?: { days?: number }) =>
    apiClient.get(
      `/pest-disease/${cooperativeId}/stats`,
      params?.days ? { days: String(params.days) } : undefined,
    ),
};
