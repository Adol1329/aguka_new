import { apiClient } from "./client";

export interface AIRecommendation {
  id?: string;
  farmerId: string;
  category: "irrigation" | "weather" | "pest_disease" | "crop_health" | "performance";
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  message: string;
  recommendation: string;
  actionRequired: boolean;
  details: any;
  generatedAt: string;
  expiresAt?: string;
  confidence: number;
}

export interface SensorSnapshot {
  soilMoisture: number;
  temperature: number;
  humidity: number;
  rainfallProbability: number;
  rainfall3DayMm?: number;
  cropType: string;
  farmSize?: number;
  soilPh?: number;
  soilNitrogen?: number;
}

export const aiApi = {
  analyzeFarm: async () => {
    return apiClient.post<{ data: { recommendations: AIRecommendation[] } }>("/ai/analyze");
  },

  analyzePayload: async (payload: SensorSnapshot) => {
    return apiClient.post<{ data: { recommendations: AIRecommendation[] } }>("/ai/recommendations", payload);
  },

  getHistory: async (params?: { limit?: number; category?: string }) => {
    const query: Record<string, string> = {};
    if (params?.limit) query.limit = String(params.limit);
    if (params?.category) query.category = params.category;
    return apiClient.get<{ data: AIRecommendation[] }>("/ai/history", query);
  },

  getFarmRecommendations: async (farmerId: string) => {
    return apiClient.get<{ data: AIRecommendation[] }>(`/ai/farm/${farmerId}`);
  },

  cooperativeAnalysis: async (cooperativeId?: string) => {
    const query = cooperativeId ? { cooperativeId } : undefined;
    return apiClient.get<{ data: any }>("/ai/cooperative-analysis", query);
  },
};
