import { apiClient } from "./client";

export interface Guide {
  id: string;
  title: string;
  crop: string | null;
  category: string;
  summary: string;
  readingTime: number;
  waterRequirement: string | null;
  growthPeriod: string | null;
  optimalTemp: string | null;
  soilType: string | null;
  icon: string | null;
  createdAt: string;
}

export interface GuideDetail extends Guide {
  content: string;
}

export interface GuideFilters {
  crops: string[];
  categories: string[];
}

export const guidesApi = {
  getGuides: (params?: { crop?: string; category?: string }) =>
    apiClient.get<Guide[]>("/guides", params as Record<string, string>),

  getGuideById: (id: string) => apiClient.get<GuideDetail>(`/guides/${id}`),

  getFilters: () => apiClient.get<GuideFilters>("/guides/filters"),
};
