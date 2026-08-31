import { apiClient, ApiResponse } from "./client";

export interface UserProfile {
  id: string;
  userId: string;
  farmerCode?: string;
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

export interface CropType {
  id: string;
  nameEn: string;
  nameRw?: string;
  nameFr?: string;
  category: string;
}

export interface CropGuidance {
  crop: {
    id: string;
    nameEn: string;
    nameRw?: string;
    nameFr?: string;
    category: string;
  };
  farmerCrop: {
    id: string;
    plantedDate: string;
    expectedHarvestDate?: string;
    actualHarvestDate?: string;
    plotSizeHectares?: number;
    status: string;
    estimatedYieldKg?: number;
    actualYieldKg?: number;
    notes?: string;
  };
  growingPeriodDays: number | null;
  waterRequirementMm: string | null;
  nitrogenRequirementKgha: string | null;
  phosphorusRequirementKgha: string | null;
  potassiumRequirementKgha: string | null;
  optimalPhMin: string | null;
  optimalPhMax: string | null;
  optimalTempMinCelsius: string | null;
  optimalTempMaxCelsius: string | null;
  rootDepthCm: number | null;
  cropCoefficient: string | null;
}

export interface FarmGuidanceResponse {
  crops: Array<{ crop: FarmerCrop; guidance: CropGuidance }>;
  livestock: Array<{
    id: string;
    animalType: string;
    breed: string | null;
    healthStatus: string;
  }>;
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

  getCropTypes: () => apiClient.get<CropType[]>("/farmers/crop-types"),

  listFarmers: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    district?: string;
    cooperativeId?: string;
  }) => {
    const qs: Record<string, string> = {};
    if (params?.page) qs.page = String(params.page);
    if (params?.limit) qs.limit = String(params.limit);
    if (params?.search) qs.search = params.search;
    if (params?.district) qs.district = params.district;
    if (params?.cooperativeId) qs.cooperativeId = params.cooperativeId;
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

  getFarmGuidance: () => apiClient.get<FarmGuidanceResponse>("/farmers/guidance"),

  getMyDistributions: () => apiClient.get<any[]>("/farmers/distributions"),
};
