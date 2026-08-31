import { apiClient, ApiResponse } from "./client";

export interface CooperativeMember {
  id: string;
  userId: string;
  cooperativeId: string;
  role: string;
  status: string;
  joinedAt: string;
  user: {
    phone: string;
    fullName?: string;
  };
}

export interface CooperativeResource {
  id: string;
  name: string;
  description?: string;
  category?: string;
  resourceType: "inputs" | "equipment";
  quantity?: number;
  availableQuantity?: number;
  minStockLevel?: number;
  unit?: string;
  condition?: string;
  location?: string;
  expiryDate?: string;
  status: string;
  isAvailable: boolean;
}

export interface ResourceDistribution {
  id: string;
  resourceId: string;
  farmerId: string;
  assignedById: string;
  quantity?: number;
  unit?: string;
  location?: string;
  status: string;
  notes?: string;
  distributedAt: string;
  resource: CooperativeResource;
  farmer: {
    fullName: string;
    phone: string;
  };
}

export interface CooperativeActivity {
  id: string;
  title: string;
  description?: string;
  activityType: string;
  status: string;
  scheduledAt: string;
  location?: string;
  expectedParticipants: number;
  actualParticipants?: number;
}

export const cooperativeApi = {
  getMy: () => apiClient.get<ApiResponse>("/cooperatives/me"),

  listCooperatives: (params?: { districtId?: string; district?: string }) =>
    apiClient.get<any[]>("/cooperatives", params),

  createCooperative: (data: {
    name: string;
    district: string;
    sector: string;
    contactPhone?: string;
    description?: string;
  }) => apiClient.post<ApiResponse>("/cooperatives", data),

  assignManager: (id: string, data: { userId: string }) =>
    apiClient.put<ApiResponse>(`/cooperatives/${id}/assign-manager`, data),

  getStats: (id: string) => apiClient.get<ApiResponse>(`/cooperatives/${id}/stats`),

  getMembers: (id: string) => apiClient.get<CooperativeMember[]>(`/cooperatives/${id}/members`),

  getResources: (id: string, params?: { type?: string; status?: string }) =>
    apiClient.get<CooperativeResource[]>(`/cooperatives/${id}/resources`, params as any),

  getActivities: (id: string) =>
    apiClient.get<CooperativeActivity[]>(`/cooperatives/${id}/activities`),

  createActivity: (
    id: string,
    data: { title: string; activityType: string; scheduledAt: string; description?: string },
  ) => apiClient.post<CooperativeActivity>(`/cooperatives/${id}/activities`, data),

  updateActivity: (coopId: string, activityId: string, data: Partial<CooperativeActivity>) =>
    apiClient.patch<CooperativeActivity>(`/cooperatives/${coopId}/activities/${activityId}`, data),

  deleteActivity: (coopId: string, activityId: string) =>
    apiClient.delete<ApiResponse>(`/cooperatives/${coopId}/activities/${activityId}`),

  updateCooperative: (
    id: string,
    data: { name?: string; description?: string; district?: string; sector?: string; contactPhone?: string },
  ) => apiClient.patch<ApiResponse>(`/cooperatives/${id}`, data),

  getMarketplace: (id: string) => apiClient.get<ApiResponse>(`/cooperatives/${id}/marketplace`),

  getAnnouncements: (id: string) => apiClient.get<ApiResponse>(`/cooperatives/${id}/announcements`),

  addResource: (
    id: string,
    data: {
      name: string;
      resourceType: string;
      quantity?: number;
      unit?: string;
      category?: string;
      location?: string;
      minStockLevel?: number;
      expiryDate?: string;
      description?: string;
    },
  ) => apiClient.post<CooperativeResource>(`/cooperatives/${id}/resources`, data),

  addMember: (id: string, data: { userId: string; role?: string }) =>
    apiClient.post<ApiResponse>(`/cooperatives/${id}/members`, data),

  updateMemberStatus: (coopId: string, memberId: string, status: string) =>
    apiClient.patch<ApiResponse>(`/cooperatives/${coopId}/members/${memberId}/status`, { status }),

  removeMember: (coopId: string, memberId: string) =>
    apiClient.delete<ApiResponse>(`/cooperatives/${coopId}/members/${memberId}`),

  distributeResource: (
    coopId: string,
    resourceId: string,
    data: { farmerId: string; quantity?: number; notes?: string },
  ) =>
    apiClient.post<ResourceDistribution>(
      `/cooperatives/${coopId}/resources/${resourceId}/distribute`,
      data,
    ),

  getDistributions: (id: string, params?: { status?: string; farmerId?: string }) =>
    apiClient.get<ResourceDistribution[]>(`/cooperatives/${id}/distributions`, params as any),

  updateResource: (coopId: string, resourceId: string, data: Partial<CooperativeResource>) =>
    apiClient.patch<CooperativeResource>(`/cooperatives/${coopId}/resources/${resourceId}`, data),

  deleteResource: (coopId: string, resourceId: string) =>
    apiClient.delete<ApiResponse>(`/cooperatives/${coopId}/resources/${resourceId}`),

  getPerformance: (id: string) => apiClient.get<ApiResponse>(`/cooperatives/${id}/performance`),

  getReports: (id: string) => apiClient.get<any[]>(`/cooperatives/${id}/reports`),

  generateReport: (id: string, data: any) =>
    apiClient.post<any>(`/cooperatives/${id}/reports`, data),

  getAnalytics: (id: string) => apiClient.get<any>(`/cooperatives/${id}/analytics`),

  getFarmerDetail: (coopId: string, farmerId: string) =>
    apiClient.get<any>(`/cooperatives/${coopId}/farmers/${farmerId}`),

  downloadFarmerImportTemplate: (coopId: string) =>
    apiClient.download(
      `/cooperatives/${coopId}/farmers/import-template`,
      undefined,
      "farmer_import_template.xlsx",
    ),

  importFarmers: (coopId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post<{
      imported: number;
      farmers: {
        id: string;
        fullName: string;
        phone: string;
        tempPassword: string;
        smsSent: boolean;
        smsError?: string;
      }[];
      smsConfigured: boolean;
      smsSandbox: boolean;
    }>(`/cooperatives/${coopId}/farmers/import`, formData);
  },

  getJoinRequests: (id: string) => apiClient.get<any[]>(`/cooperatives/${id}/join-requests`),

  approveJoinRequest: (coopId: string, requestId: string) =>
    apiClient.patch<any>(`/cooperatives/${coopId}/join-requests/${requestId}/approve`),

  rejectJoinRequest: (coopId: string, requestId: string) =>
    apiClient.patch<any>(`/cooperatives/${coopId}/join-requests/${requestId}/reject`),

  submitJoinRequest: (id: string) => apiClient.post<ApiResponse>(`/cooperatives/${id}/join-request`, {}),

  getMyJoinRequest: () => apiClient.get<ApiResponse>("/cooperatives/join-requests/mine"),

  getEventAttendees: (coopId: string, activityId: string) =>
    apiClient.get<any>(`/cooperatives/${coopId}/activities/${activityId}/attendees`),

  markAttendance: (coopId: string, activityId: string, data: { userId: string; status: string }) =>
    apiClient.post<any>(`/cooperatives/${coopId}/activities/${activityId}/attendees`, data),

  removeAttendee: (coopId: string, activityId: string, attendeeId: string) =>
    apiClient.delete<any>(
      `/cooperatives/${coopId}/activities/${activityId}/attendees/${attendeeId}`,
    ),

  updateBookingDelivery: (
    coopId: string,
    bookingId: string,
    data: { deliveryStatus: string; deliveryDate?: string },
  ) =>
    apiClient.patch<any>(`/cooperatives/${coopId}/resource-bookings/${bookingId}/delivery`, data),

  getDues: (id: string) => apiClient.get<any[]>(`/cooperatives/${id}/dues`),

  createDue: (
    id: string,
    data: { userId: string; amount: number; period: string; dueDate: string; notes?: string },
  ) => apiClient.post<any>(`/cooperatives/${id}/dues`, data),

  updateDue: (
    coopId: string,
    dueId: string,
    data: { status?: string; notes?: string; paidAt?: string },
  ) => apiClient.patch<any>(`/cooperatives/${coopId}/dues/${dueId}`, data),

  deleteDue: (coopId: string, dueId: string) =>
    apiClient.delete<any>(`/cooperatives/${coopId}/dues/${dueId}`),

  getExpenses: (id: string) => apiClient.get<any[]>(`/cooperatives/${id}/expenses`),

  createExpense: (
    id: string,
    data: {
      category: string;
      amount: number;
      description: string;
      expenseDate: string;
      receiptUrl?: string;
    },
  ) => apiClient.post<any>(`/cooperatives/${id}/expenses`, data),

  deleteExpense: (coopId: string, expenseId: string) =>
    apiClient.delete<any>(`/cooperatives/${coopId}/expenses/${expenseId}`),

  sendEventReminder: (coopId: string, activityId: string) =>
    apiClient.post<any>(`/cooperatives/${coopId}/activities/${activityId}/remind`, {}),
};
