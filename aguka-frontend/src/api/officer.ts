import { apiClient } from "./client";

export const officerApi = {
  getAdvisories: () => apiClient.get<any[]>("/officer/advisories"),

  createAdvisory: (data: {
    title: string;
    message: string;
    severity?: string;
    farmerIds?: string[];
  }) => apiClient.post("/officer/advisories", data),

  getRisks: () => apiClient.get<any[]>("/officer/risks"),

  getAnalysis: () => apiClient.get<any>("/officer/analysis"),

  getFieldWork: () => apiClient.get<any[]>("/officer/field-work"),

  getFarmerAnalysis: (farmerId: string) =>
    apiClient.get<any>(`/officer/analysis/farmer/${farmerId}`),

  getPerformanceAnalysis: (options?: { startDate?: string; endDate?: string; limit?: number }) => {
    const params = new URLSearchParams();
    if (options?.startDate) params.append("startDate", options.startDate);
    if (options?.endDate) params.append("endDate", options.endDate);
    if (options?.limit) params.append("limit", options.limit.toString());

    return apiClient.get<any>(`/officer/analysis/performance?${params.toString()}`);
  },

  getTemplates: () => apiClient.get("/officer/templates"),

  createTemplate: (data: {
    title: string;
    message: string;
    recommendation?: string;
    severity?: string;
  }) => apiClient.post("/officer/templates", data),

  updateTemplate: (
    id: string,
    data: { title?: string; message?: string; recommendation?: string; severity?: string },
  ) => apiClient.patch(`/officer/templates/${id}`, data),

  deleteTemplate: (id: string) => apiClient.delete(`/officer/templates/${id}`),

  getAdvisoryStats: () => apiClient.get("/officer/advisories/stats"),

  getFarmerNotes: (farmerId: string) => apiClient.get(`/officer/farmers/${farmerId}/notes`),

  createFarmerNote: (
    farmerId: string,
    data: {
      visitDate?: string;
      notes: string;
      actionItems?: string;
      followUpDate?: string;
      status?: string;
    },
  ) => apiClient.post(`/officer/farmers/${farmerId}/notes`, data),

  updateFarmerNote: (
    farmerId: string,
    noteId: string,
    data: { notes?: string; actionItems?: string; followUpDate?: string; status?: string },
  ) => apiClient.patch(`/officer/farmers/${farmerId}/notes/${noteId}`, data),

  deleteFarmerNote: (farmerId: string, noteId: string) =>
    apiClient.delete(`/officer/farmers/${farmerId}/notes/${noteId}`),
};
