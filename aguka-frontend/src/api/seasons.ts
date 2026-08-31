import { apiClient } from "./client";

export interface Season {
  id: string;
  name: string;
  period: string;
}

export const seasonsApi = {
  getSeasons: () => apiClient.get<Season[]>("/seasons"),
};
