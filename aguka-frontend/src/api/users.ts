import { apiClient, ApiResponse } from './client';

export interface ApiUser {
  id: string;
  phone: string;
  email?: string;
  role: string;
  language: string;
  status: string;
  isActive: boolean;
  isOnboarded: boolean;
  createdAt: string;
  updatedAt: string;
}

function toQueryParams(obj: Record<string, unknown>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val !== undefined && val !== null) {
      result[key] = String(val);
    }
  }
  return result;
}

export const usersApi = {
  list: (params?: { page?: number; limit?: number; search?: string; role?: string; excludeRole?: string }) =>
    apiClient.get<{ data: ApiUser[]; pagination: any }>(`/users`, params ? toQueryParams(params) : undefined),

  getById: (id: string) =>
    apiClient.get<ApiResponse>(`/users/${id}`),

  update: (id: string, data: Partial<ApiUser>) =>
    apiClient.patch<ApiResponse>(`/users/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse>(`/users/${id}`),

  updateStatus: (id: string, status: string, isActive?: boolean) =>
    apiClient.patch<ApiResponse>(`/users/${id}/status`, { status, isActive }),

  approveUser: (id: string) =>
    apiClient.post<ApiResponse>(`/admin/users/${id}/approve`),

  rejectUser: (id: string, reason: string) =>
    apiClient.post<ApiResponse>(`/admin/users/${id}/reject`, { reason }),

  createUser: (data: {
    phone: string;
    email?: string;
    password: string;
    role: string;
    fullName: string;
    provinceCode?: string;
    districtCode?: string;
    sectorCode?: string;
    cellCode?: string;
    villageCode?: string;
    farmName?: string;
    farmSizeHectares?: number;
  }) =>
    apiClient.post<ApiResponse>('/auth/register', data),
};
