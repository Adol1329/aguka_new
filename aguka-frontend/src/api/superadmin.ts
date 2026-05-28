import { apiClient, ApiResponse } from "./client";

export interface SuperAdminDashboardStats {
  totalUsers: number;
  totalFarmers: number;
  totalCoops: number;
  totalSensors: number;
  activeSensors: number;
  sensorUptime: number;
  totalCrops: number;
  recentUsers: Array<{ id: string; phone: string; role: string; createdAt: string }>;
}

export interface SuperAdminUser {
  id: string;
  phone: string;
  email?: string;
  role: string;
  language: string;
  status: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  farmerProfile?: { fullName: string; district: string };
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  action: string;
  module: string;
  resourceId?: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  createdAt: string;
  user?: { phone: string };
}

export interface BackupEntry {
  id: string;
  name: string;
  type: string;
  status: string;
  sizeBytes: number;
  filePath?: string;
  createdAt: string;
  completedAt?: string;
  restoredAt?: string;
}

export interface SystemHealth {
  api: { status: string; uptime: string };
  database: { status: string; provider: string };
  sensors: { total: number; active: number; health: number };
  memory: { usage: string };
  platform: { version: string; environment: string };
}

export interface RoleInfo {
  role: string;
  label: string;
  description: string;
  userCount: number;
  permissions: string[];
}

export interface CooperativeOption {
  id: string;
  name: string;
  district?: string;
  sector?: string;
}

export interface ApiPagination {
  currentPage?: number;
  pageSize?: number;
  totalItems?: number;
  totalPages?: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
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

export const superAdminApi = {
  getDashboard: () => apiClient.get<SuperAdminDashboardStats>("/superadmin/dashboard"),

  getUsers: (params?: {
    page?: number;
    limit?: number;
    role?: string;
    search?: string;
    status?: string;
  }) =>
    apiClient.get<{ data: SuperAdminUser[]; pagination: ApiPagination }>(
      "/superadmin/users",
      params ? toQueryParams(params) : undefined,
    ),

  createUser: (data: {
    phone: string;
    email?: string;
    password?: string;
    role: string;
    fullName: string;
    district: string;
    sector: string;
  }) => apiClient.post<SuperAdminUser>("/superadmin/users", data),

  updateUser: (id: string, data: { role?: string; isActive?: boolean; language?: string }) =>
    apiClient.patch<SuperAdminUser>(`/superadmin/users/${id}`, data),

  deleteUser: (id: string) => apiClient.delete<ApiResponse>(`/superadmin/users/${id}`),

  getAuditLogs: (params?: { page?: number; limit?: number; userId?: string; action?: string }) =>
    apiClient.get<{ data: AuditLogEntry[]; pagination: ApiPagination }>(
      "/superadmin/audit-logs",
      params ? toQueryParams(params) : undefined,
    ),

  getSystemHealth: () => apiClient.get<SystemHealth>("/superadmin/system-health"),

  getCooperatives: () => apiClient.get<CooperativeOption[]>("/superadmin/cooperatives"),

  getBackups: (params?: { page?: number; limit?: number }) =>
    apiClient.get<{
      backups: BackupEntry[];
      totalSize: number;
      lastBackup: BackupEntry | null;
      pagination?: ApiPagination;
    }>("/superadmin/backups", params ? toQueryParams(params) : undefined),

  createBackup: () => apiClient.post<BackupEntry>("/superadmin/backups"),

  restoreBackup: (id: string) =>
    apiClient.post<{ success: boolean; message: string }>(`/superadmin/backups/${id}/restore`),

  downloadBackup: (id: string, filename: string) =>
    apiClient.download(`/superadmin/backups/${id}/download`, undefined, filename),

  deleteBackup: (id: string) => apiClient.delete<ApiResponse>(`/superadmin/backups/${id}`),

  getSettings: () => apiClient.get<Record<string, unknown>>("/superadmin/settings"),

  updateSetting: (key: string, value: string) =>
    apiClient.patch<ApiResponse>(`/superadmin/settings/${key}`, { value }),

  getRoles: () => apiClient.get<RoleInfo[]>("/superadmin/roles"),

  updateRolePermissions: (role: string, permissions: string[]) =>
    apiClient.put<ApiResponse>(`/superadmin/roles/${role}/permissions`, { permissions }),
};
