import { apiClient, ApiResponse } from './client';

export interface Activity {
  id: string;
  farmerId: string;
  cropId?: string;
  activityType: string;
  activityDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActivitiesResponse {
  data: Activity[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const activitiesApi = {
  list: (params?: { page?: number; limit?: number; cropId?: string; startDate?: string; endDate?: string }) =>
    apiClient.get<ActivitiesResponse>('/activities', params as Record<string, string>),

  getByFarmer: (farmerId: string, params?: { page?: number; limit?: number }) =>
    apiClient.get<ActivitiesResponse>(`/farmers/${farmerId}/activities`, params as Record<string, string>),

  create: (data: Partial<Activity>) =>
    apiClient.post<Activity>('/activities', data),

  update: (id: string, data: Partial<Activity>) =>
    apiClient.put<Activity>(`/activities/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse>(`/activities/${id}`),
};
