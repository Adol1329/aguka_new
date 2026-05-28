import { apiClient } from './client';

export const livestockApi = {
  getGuidance: (params?: {
    animalType?: string;
    breed?: string;
    age?: string;
    healthStatus?: string;
  }) =>
    apiClient.get('/livestock/guidance', { params }),
    
  getMyLivestock: () =>
    apiClient.get('/livestock/my-livestock'),
    
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
  }) =>
    apiClient.post('/livestock', data),
    
  updateLivestock: (livestockId: string, data: {
    animalType?: string;
    breed?: string;
    tagNumber?: string;
    birthDate?: string;
    purchaseDate?: string;
    weightKg?: number;
    healthStatus?: string;
    feedingRegime?: string;
    notes?: string;
  }) =>
    apiClient.patch(`/livestock/${livestockId}`, data),
    
  removeLivestock: (livestockId: string) =>
    apiClient.delete(`/livestock/${livestockId}`),
    
  getStats: () =>
    apiClient.get('/livestock/stats')
};