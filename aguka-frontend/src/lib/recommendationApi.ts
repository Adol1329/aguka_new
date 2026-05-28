import { Recommendation } from "@/types/recommendation";

const API_BASE = import.meta.env.VITE_API_URL || "";

/**
 * Fetch recommendations for the current farmer
 * @param type Optional recommendation type filter
 * @returns Promise resolving to array of recommendations
 */
export const fetchRecommendations = async (type?: string): Promise<Recommendation[]> => {
  const url = new URL(`/api/recommendations`, API_BASE);
  if (type) {
    url.searchParams.set("type", type);
  }

  const response = await fetch(url.toString(), {
    credentials: "include", // Important for sending cookies with request
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch recommendations: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data || [];
};

/**
 * Accept a recommendation
 * @param id Recommendation ID
 * @param type Recommendation type
 * @returns Promise resolving to acceptance result
 */
export const acceptRecommendation = async (id: string, type: string): Promise<any> => {
  const response = await fetch(`${API_BASE}/api/recommendations/accept`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ id, type }),
  });

  if (!response.ok) {
    throw new Error(`Failed to accept recommendation: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Dismiss a recommendation
 * @param id Recommendation ID
 * @param type Recommendation type
 * @returns Promise resolving to dismissal result
 */
export const dismissRecommendation = async (id: string, type: string): Promise<any> => {
  const response = await fetch(`${API_BASE}/api/recommendations/dismiss`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ id, type }),
  });

  if (!response.ok) {
    throw new Error(`Failed to dismiss recommendation: ${response.statusText}`);
  }

  return response.json();
};