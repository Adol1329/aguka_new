import { apiClient } from "./client";

export interface AdminSystemSettings {
  smsEnabled: boolean;
  pushEnabled: boolean;
  emailEnabled: boolean;
  weeklySummaryEnabled: boolean;
  securityLogAlertsEnabled: boolean;
  cooperativeRegistrationAlertsEnabled: boolean;
  requireGpsVerification: boolean;
  autoApproveSmallHarvests: boolean;
  moistureThreshold: number;
  yieldBoundary: number;
  financialVariance: number;
  realTimeWeatherSyncEnabled: boolean;
  marketPriceSyncEnabled: boolean;
  autoReportFrequency: string;
  reportRecipients: string;
}

export type SystemSettingsResponse = Record<string, unknown>;

export const settingsApi = {
  getSettings: () => apiClient.get<SystemSettingsResponse>("/superadmin/settings"),

  updateSettings: (settings: AdminSystemSettings) =>
    apiClient.put<SystemSettingsResponse>("/superadmin/settings", settings),
};
