import { apiClient, ApiResponse } from './client';

export interface LocationItem {
  code: string;
  name: string;
}

export const locationApi = {
  getProvinces: () =>
    apiClient.get<LocationItem[]>('/location/provinces'),

  getDistricts: (provinceCode: string) =>
    apiClient.get<LocationItem[]>(`/location/districts/${provinceCode}`),

  getSectors: (districtCode: string) =>
    apiClient.get<LocationItem[]>(`/location/sectors/${districtCode}`),

  getCells: (sectorCode: string) =>
    apiClient.get<LocationItem[]>(`/location/cells/${sectorCode}`),

  getVillages: (cellCode: string) =>
    apiClient.get<LocationItem[]>(`/location/villages/${cellCode}`),
};
