import { apiClient } from './client';

export const officerApi = {
  getAdvisories: () => 
    apiClient.get<any[]>('/officer/advisories'),
    
  createAdvisory: (data: { title: string; message: string; severity?: string; farmerIds?: string[] }) =>
    apiClient.post('/officer/advisories', data),
    
  getRisks: () =>
    apiClient.get<any[]>('/officer/risks'),
    
  getAnalysis: () =>
    apiClient.get<any>('/officer/analysis'),
    
  getFarmerAnalysis: (farmerId: string) =>
    apiClient.get<any>(`/officer/analysis/farmer/${farmerId}`),
    
  getPerformanceAnalysis: (options?: {
    startDate?: string;
    endDate?: string;
    limit?: number;
  }) => {
    const params = new URLSearchParams();
    if (options?.startDate) params.append('startDate', options.startDate);
    if (options?.endDate) params.append('endDate', options.endDate);
    if (options?.limit) params.append('limit', options.limit.toString());
    
    return apiClient.get<any>(`/officer/analysis/performance?${params.toString()}`);
  },
};
