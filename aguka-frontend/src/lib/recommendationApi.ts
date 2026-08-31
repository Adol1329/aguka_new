import { Recommendation } from "@/types/recommendation";
import { apiClient } from "@/api/client";

/**
 * Fetch recommendations for the current farmer
 * @param type Optional recommendation type filter
 * @returns Promise resolving to array of recommendations
 */
export const fetchRecommendations = async (type?: string): Promise<Recommendation[]> => {
  const params: Record<string, string> = {};
  if (type) {
    params.type = type;
  }

  const response = await apiClient.get<Recommendation[]>("/recommendations", params);
  return response.data || [];
};

/**
 * Accept a recommendation
 * @param id Recommendation ID
 * @param type Recommendation type
 * @returns Promise resolving to acceptance result
 */
export const acceptRecommendation = async (id: string, type: string): Promise<any> => {
  const response = await apiClient.post<any>("/recommendations/accept", { id, type });
  return response.data;
};

/**
 * Dismiss a recommendation
 * @param id Recommendation ID
 * @param type Recommendation type
 * @returns Promise resolving to dismissal result
 */
export const dismissRecommendation = async (id: string, type: string): Promise<any> => {
  const response = await apiClient.post<any>("/recommendations/dismiss", { id, type });
  return response.data;
};
