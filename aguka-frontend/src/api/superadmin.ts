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

  getBackupSchedule: () =>
    apiClient.get<{ enabled: boolean; frequency: string; time: string; retention: string } | null>(
      "/superadmin/backup-schedule",
    ),

  saveBackupSchedule: (schedule: {
    enabled: boolean;
    frequency: string;
    time: string;
    retention: string;
  }) => apiClient.put<ApiResponse>("/superadmin/backup-schedule", schedule),

  getCustomRoles: () =>
    apiClient.get<
      Array<{ role: string; label: string; description: string; permissions: string[] }>
    >("/superadmin/custom-roles"),

  saveCustomRoles: (
    roles: Array<{ role: string; label: string; description: string; permissions: string[] }>,
  ) => apiClient.put<ApiResponse>("/superadmin/custom-roles", roles),

  // ─── FEATURE 1: MERGE ACCOUNTS ───────────────

  mergeUsers: (data: { primaryUserId: string; secondaryUserId: string }) =>
    apiClient.post<{
      primaryUserId: string;
      secondaryUserId: string;
      transferredRecords: Record<string, number>;
    }>("/superadmin/users/merge", data),

  // ─── FEATURE 2: RESET PASSWORD ───────────────

  resetUserPassword: (id: string) =>
    apiClient.post<{ tempPassword: string; userId: string; phone: string }>(
      `/superadmin/users/${id}/reset-password`,
    ),

  // ─── FEATURE 6: FORCE LOGOUT ─────────────────

  forceLogoutUser: (id: string) =>
    apiClient.post<{ sessionsRevoked: number; tokensRevoked: number }>(
      `/superadmin/users/${id}/force-logout`,
    ),

  // ─── FEATURE 3: FEATURE FLAGS ────────────────

  getFeatureFlags: () =>
    apiClient.get<
      Array<{
        id: string;
        key: string;
        enabled: boolean;
        description: string | null;
        updatedAt: string;
      }>
    >("/superadmin/feature-flags"),

  updateFeatureFlags: (flags: Array<{ key: string; enabled: boolean }>) =>
    apiClient.put<ApiResponse>("/superadmin/feature-flags", { flags }),

  // ─── FEATURE 4: PASSWORD POLICY ──────────────

  getPasswordPolicy: () =>
    apiClient.get<{
      minLength: number;
      requireUppercase: boolean;
      requireLowercase: boolean;
      requireNumbers: boolean;
      requireSpecial: boolean;
      expiryDays: number;
      preventReuse: number;
    }>("/superadmin/security/password-policy"),

  updatePasswordPolicy: (config: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecial: boolean;
    expiryDays: number;
    preventReuse: number;
  }) => apiClient.put<ApiResponse>("/superadmin/security/password-policy", config),

  // ─── FEATURE 5: AUDIT RETENTION ──────────────

  getAuditRetention: () =>
    apiClient.get<{
      retentionDays: number;
      archiveBeforeCleanup: boolean;
      totalLogs: number;
      expiringLogs: number;
    }>("/superadmin/audit-logs/retention"),

  updateAuditRetention: (config: { retentionDays: number; archiveBeforeCleanup: boolean }) =>
    apiClient.put<ApiResponse>("/superadmin/audit-logs/retention", config),

  cleanupAuditLogs: () =>
    apiClient.post<{ deletedCount: number; retentionDays: number; cutoff: string }>(
      "/superadmin/audit-logs/cleanup",
    ),

  // ─── SUPER ADMIN REPORTS ──────────────
  getAuditReportData: () => apiClient.get<any>("/superadmin/reports/audit/data"),
  getHealthReportData: () => apiClient.get<any>("/superadmin/reports/health/data"),
  getBackupReportData: () => apiClient.get<any>("/superadmin/reports/backup/data"),
  getSecurityReportData: () => apiClient.get<any>("/superadmin/reports/security/data"),
  getNationalReportData: () => apiClient.get<any>("/superadmin/reports/national/data"),

  exportAuditReport: (format: string) =>
    apiClient.downloadPost(
      "/superadmin/reports/audit/export",
      { format },
      `audit_report.${format}`,
    ),
  exportHealthReport: (format: string) =>
    apiClient.downloadPost(
      "/superadmin/reports/health/export",
      { format },
      `health_report.${format}`,
    ),
  exportBackupReport: (format: string) =>
    apiClient.downloadPost(
      "/superadmin/reports/backup/export",
      { format },
      `backup_report.${format}`,
    ),
  exportSecurityReport: (format: string) =>
    apiClient.downloadPost(
      "/superadmin/reports/security/export",
      { format },
      `security_report.${format}`,
    ),
  exportNationalReport: (format: string) =>
    apiClient.downloadPost(
      "/superadmin/reports/national/export",
      { format },
      `national_report.${format}`,
    ),
};
