import { apiClient, ApiResponse } from './client';

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
  resourceType: string;
  quantity?: number;
  availableQuantity?: number;
  isAvailable: boolean;
  condition?: string;
  location?: string;
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
  getMy: () =>
    apiClient.get<ApiResponse>('/cooperatives/me'),

  getStats: (id: string) =>
    apiClient.get<ApiResponse>(`/cooperatives/${id}/stats`),

  getMembers: (id: string) =>
    apiClient.get<CooperativeMember[]>(`/cooperatives/${id}/members`),

  getResources: (id: string) =>
    apiClient.get<CooperativeResource[]>(`/cooperatives/${id}/resources`),

  getActivities: (id: string) =>
    apiClient.get<CooperativeActivity[]>(`/cooperatives/${id}/activities`),

  createActivity: (id: string, data: { title: string; activityType: string; scheduledAt: string; description?: string }) =>
    apiClient.post<CooperativeActivity>(`/cooperatives/${id}/activities`, data),

  getMarketplace: (id: string) =>
    apiClient.get<ApiResponse>(`/cooperatives/${id}/marketplace`),

  getAnnouncements: (id: string) =>
    apiClient.get<ApiResponse>(`/cooperatives/${id}/announcements`),

  addResource: (id: string, data: { name: string; resourceType: string; quantity: number; description?: string }) =>
    apiClient.post<CooperativeResource>(`/cooperatives/${id}/resources`, data),

  addMember: (id: string, data: { userId: string; role?: string }) =>
    apiClient.post<ApiResponse>(`/cooperatives/${id}/members`, data),

  bookResource: (coopId: string, resourceId: string, data: { quantity: number; startDate: string; endDate: string; notes?: string }) =>
    apiClient.post<ApiResponse>(`/cooperatives/${coopId}/resources/${resourceId}/book`, data),

  updateResource: (coopId: string, resourceId: string, data: Partial<CooperativeResource>) =>
    apiClient.patch<CooperativeResource>(`/cooperatives/${coopId}/resources/${resourceId}`),

  deleteResource: (coopId: string, resourceId: string) =>
    apiClient.delete<ApiResponse>(`/cooperatives/${coopId}/resources/${resourceId}`),

  getPerformance: (id: string) =>
    apiClient.get<ApiResponse>(`/cooperatives/${id}/performance`),
};
