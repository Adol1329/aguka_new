import { apiClient } from "./client";

export interface LivestockAnimalGuidance {
  id: string;
  animalType: string;
  breed: string | null;
  weightKg: string | null;
  healthStatus: string;
  lastVaccinationDate: string | null;
  nextVaccinationDue: string | null;
  nutrition: string;
  housing: string;
  breeding: string;
  health: string;
  recommendations: string[];
}

export interface LivestockGuidanceResponse {
  general: {
    nutrition?: string;
    health?: string;
    housing?: string;
    breeding?: string;
  };
  specific: LivestockAnimalGuidance[];
}

export const livestockApi = {
  getGuidance: (params?: {
    animalType?: string;
    breed?: string;
    age?: string;
    healthStatus?: string;
    lang?: string;
  }) =>
    apiClient.get<LivestockGuidanceResponse>(
      "/livestock/guidance",
      params as Record<string, string>,
    ),

  getMyLivestock: () => apiClient.get("/livestock/my-livestock"),

  addLivestock: (data: {
    animalType: string;
    breed?: string;
    tagNumber?: string;
    birthDate?: string;
    purchaseDate?: string;
    weightKg?: number;
    healthStatus?: string;
    feedingRegime?: string;
    notes?: string;
  }) => apiClient.post("/livestock", data),

  updateLivestock: (
    livestockId: string,
    data: {
      animalType?: string;
      breed?: string;
      tagNumber?: string;
      birthDate?: string;
      purchaseDate?: string;
      weightKg?: number;
      healthStatus?: string;
      feedingRegime?: string;
      notes?: string;
    },
  ) => apiClient.patch(`/livestock/${livestockId}`, data),

  removeLivestock: (livestockId: string) => apiClient.delete(`/livestock/${livestockId}`),

  getStats: () => apiClient.get("/livestock/stats"),
};
