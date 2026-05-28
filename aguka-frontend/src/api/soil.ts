import { apiClient, ApiResponse } from './client';

export interface SoilReading {
  id: string;
  sensorId: string | null;
  farmerId: string;
  moisture: number;
  temperature?: number;
  soilTemperature?: number;
  ph?: number;
  nitrogen?: number;
  phosphorus?: number;
  potassium?: number;
  soilHealthScore?: number;
  readingAt: string;
}

export interface SoilStatus {
  current: SoilReading;
  trend: 'improving' | 'declining' | 'stable';
  recommendation?: string;
}

export const soilApi = {
  getReadings: (params?: { startDate?: string; endDate?: string; limit?: number }) =>
    apiClient.get<SoilReading[]>('/soil/readings', params as Record<string, string>),

  getCurrentStatus: () =>
    apiClient.get<SoilStatus>('/soil/status'),

  getAlerts: () =>
    apiClient.get<ApiResponse>('/soil/alerts'),

  getRecommendations: () =>
    apiClient.get<ApiResponse>('/soil/recommendations'),

  addManualReading: (data: { moisturePercent: number; temperatureCelsius?: number; phLevel?: number }) =>
    apiClient.post<SoilReading>('/soil/manual', data),
};
