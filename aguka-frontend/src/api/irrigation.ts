import { apiClient, ApiResponse } from './client';

export interface IrrigationSchedule {
  id: string;
  farmerId: string;
  cropId?: string;
  scheduleType: string;
  startTime?: string;
  durationMinutes?: number;
  frequency: string;
  daysOfWeek: number[];
  waterSource?: string;
  waterAmountLiters?: number;
  pumpEnabled: boolean;
  valveEnabled: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IrrigationLog {
  id: string;
  scheduleId?: string;
  zoneId?: string;
  farmerId: string;
  action?: string;
  reason?: string;
  triggeredBy?: string;
  startTime?: string;
  endTime?: string;
  executedAt?: string;
  durationMinutes?: number;
  waterUsedLiters?: number;
  waterSource?: string;
  status: string;
  createdAt: string;
}

export interface IrrigationStatus {
  isActive: boolean;
  activeZoneId: string | null;
  zones: Array<{ id: string; name: string; status: string; moistureLevel?: number; temperature?: number }>;
  waterUsedToday: number;
  savedWater: number;
}

export const irrigationApi = {
  getSchedules: () =>
    apiClient.get<IrrigationSchedule[]>('/irrigation/schedules'),

  getLogs: () =>
    apiClient.get<IrrigationLog[]>('/irrigation/logs'),

  getStatus: () =>
    apiClient.get<IrrigationStatus>('/irrigation/status'),

  control: (zoneId: string, action: 'start' | 'stop') =>
    apiClient.post<ApiResponse>('/irrigation/control', { zoneId, action }),

  createSchedule: (data: Partial<IrrigationSchedule>) =>
    apiClient.post<IrrigationSchedule>('/irrigation/schedules', data),

  updateSchedule: (id: string, data: Partial<IrrigationSchedule>) =>
    apiClient.put<IrrigationSchedule>(`/irrigation/schedules/${id}`, data),

  deleteSchedule: (id: string) =>
    apiClient.delete<ApiResponse>(`/irrigation/schedules/${id}`),

  trigger: (zoneId: string) =>
    apiClient.post<ApiResponse>('/irrigation/trigger', { zoneId }),

  stop: (zoneId: string) =>
    apiClient.post<ApiResponse>('/irrigation/stop', { zoneId }),
};
