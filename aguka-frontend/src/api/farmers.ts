import { apiClient, ApiResponse } from "./client";

export interface UserProfile {
  id: string;
  userId: string;
  fullName: string;
  farmName?: string;
  location: string;
  district: string;
  sector: string;
  cell?: string;
  village?: string;
  provinceCode?: string;
  districtCode?: string;
  sectorCode?: string;
  cellCode?: string;
  villageCode?: string;
  farmSizeHectares?: number;
  gpsLatitude?: number;
  gpsLongitude?: number;
  elevationMeters?: number;
  soilType?: string;
  waterSource?: string;
  irrigationType?: string;
  preferredChannel: string;
  literacyLevel?: string;
  emergencyContact?: string;
  familyMembers: number;
  createdAt: string;
  updatedAt: string;
}

export interface FarmerCrop {
  id: string;
  cropId: string;
  plantedDate: string;
  expectedHarvestDate?: string;
  actualHarvestDate?: string;
  plotSizeHectares?: number;
  status: string;
  estimatedYieldKg?: number;
  actualYieldKg?: number;
  notes?: string;
  crop?: {
    id: string;
    nameEn: string;
    nameRw?: string;
    nameFr?: string;
    category: string;
    imageUrl?: string;
  };
}

export interface FarmerListResponse {
  data: Array<{
    id: string;
    fullName: string;
    district: string;
    sector: string;
    farmSizeHectares?: number;
    user: {
      phone: string;
      email?: string;
      status: string;
    };
  }>;
  pagination: {
    page: number;
    currentPage?: number;
    limit: number;
    pageSize?: number;
    total: number;
    totalItems?: number;
    totalPages: number;
    hasNextPage?: boolean;
    hasPrevPage?: boolean;
  };
}

export const farmersApi = {
  getProfile: () => apiClient.get<UserProfile>("/farmers/profile"),

  updateProfile: (data: Partial<UserProfile>) =>
    apiClient.patch<UserProfile>("/farmers/profile", data),

  getCrops: () => apiClient.get<FarmerCrop[]>("/farmers/crops"),

  listFarmers: (params?: { page?: number; limit?: number; search?: string; district?: string }) => {
    const qs: Record<string, string> = {};
    if (params?.page) qs.page = String(params.page);
    if (params?.limit) qs.limit = String(params.limit);
    if (params?.search) qs.search = params.search;
    if (params?.district) qs.district = params.district;
    return apiClient.get<FarmerListResponse>("/farmers", Object.keys(qs).length ? qs : undefined);
  },

  getFarmerById: (id: string) => apiClient.get<UserProfile>(`/farmers/${id}`),

  getSoilReadings: (
    farmerId: string,
    params?: { startDate?: string; endDate?: string; limit?: number },
  ) => apiClient.get<ApiResponse>(`/farmers/${farmerId}/soil`, params as Record<string, string>),

  getAssignedFarmers: (params?: { page?: number; limit?: number }) =>
    apiClient.get<FarmerListResponse>("/farmers/assigned", params as Record<string, string>),

  createCrop: (data: Partial<FarmerCrop>) => apiClient.post<FarmerCrop>("/farmers/crops", data),

  verifyFarmer: (id: string) => apiClient.patch(`/farmers/${id}/verify`),
  
  bulkVerifyFarmers: (ids: string[]) => apiClient.patch(`/farmers/bulk-verify`, { ids }),
};
