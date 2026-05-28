import { apiClient, ApiResponse } from './client';

export interface MarketPrice {
  id: string;
  cropId: string;
  marketId: string;
  marketName: string;
  district: string;
  priceRwfPerKg: number;
  currency: string;
  trend: string;
  trendPercentage: number;
  recordedAt: string;
}

export interface PriceAlert {
  id: string;
  cropId: string;
  marketId?: string;
  targetPrice: number;
  currentPrice?: number;
  alertType: string;
  isActive: boolean;
  isTriggered: boolean;
  crop?: { nameEn: string };
}

function toParams(obj: Record<string, unknown>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val !== undefined && val !== null) {
      result[key] = String(val);
    }
  }
  return result;
}

export const marketApi = {
  getPrices: (filters?: { crop?: string; market?: string }) =>
    apiClient.get<MarketPrice[]>('/market/prices', filters ? toParams(filters) : undefined),

  getPriceHistory: (params: { crop?: string; market?: string; days: number }) =>
    apiClient.get<ApiResponse>('/market/prices/history', toParams(params)),

  getAlerts: () =>
    apiClient.get<PriceAlert[]>('/market/alerts'),

  createAlert: (data: { cropId: string; targetPrice: number; alertType: string; marketId?: string }) =>
    apiClient.post<PriceAlert>('/market/alerts', data),

  deleteAlert: (id: string) =>
    apiClient.delete<ApiResponse>(`/market/alerts/${id}`),

  getInsights: () =>
    apiClient.get<ApiResponse>('/market/insights'),
};
