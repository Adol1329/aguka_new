import { apiClient } from "./client";

export interface OverviewResponse {
  farmer: {
    fullName: string;
    farmName: string;
    district: string;
    sector: string;
  };
  soilLatest: {
    moisture: number | null;
    temperature: number | null;
    ph: number | null;
    nitrogen: number | null;
    phosphorus: number | null;
    potassium: number | null;
    recordedAt: string | null;
    hasData: boolean;
  };
  soilTrend: Array<{
    recordedAt: string;
    moisture: number;
    temperature: number;
    ph: number;
  }>;
  weather: {
    temperature: number;
    condition: string;
    humidity: number;
    forecast: Array<{ day: string; high: number; condition: string; rainChance: number }>;
  };
  crops: Array<{
    id: string;
    cropName: string;
    cropCategory: string;
    areaHectares: number;
    plantedDate: string;
    growingDurationDays: number;
    status: "GROWING" | "HARVESTED" | "DORMANT" | "FAILED" | null;
    estimatedYieldKg: number | null;
    location: string;
  }>;
  recentActivities: Array<{
    id: string;
    activityType: string;
    cropName: string | null;
    notes: string | null;
    activityDate: string;
  }>;
}

export async function getOverview(): Promise<OverviewResponse> {
  const res = await apiClient.get<OverviewResponse>("/farmer/overview");
  return res.data!;
}
