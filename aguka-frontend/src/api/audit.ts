import { apiClient, ApiResponse } from './client';

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  module: string;
  entity: string;
  entityId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export const auditApi = {
  list: (params?: { page?: number; limit?: number; search?: string }) => {
    const qs: Record<string, string> = {};
    if (params?.page) qs.page = String(params.page);
    if (params?.limit) qs.limit = String(params.limit);
    if (params?.search) qs.search = params.search;
    return apiClient.get<{ data: AuditLog[]; pagination: any }>('/audit', Object.keys(qs).length ? qs : undefined);
  },

  recent: () =>
    apiClient.get<AuditLog[]>('/audit/recent'),
};
