import { apiClient } from './client';

export interface IrrigationRecommendation {
  recommendation: string;
  type: 'info' | 'warning' | 'critical' | 'error';
  confidence: 'low' | 'medium' | 'high';
  actionRequired: boolean;
  details: Record<string, any>;
}

export const irrigationRecommendationApi = {
  getRecommendations: () =>
    apiClient.get<IrrigationRecommendation>('/irrigation-recommendation'),

  acceptRecommendation: (data: Record<string, unknown>) =>
    apiClient.post<IrrigationRecommendation>('/irrigation-recommendation/accept', data),
};