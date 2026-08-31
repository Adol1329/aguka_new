import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  soilApi,
  weatherApi,
  farmersApi,
  usersApi,
  notificationsApi,
  locationApi,
  cooperativeApi,
  irrigationApi,
  marketApi,
  activitiesApi,
  auditApi,
  superAdminApi,
  adminApi,
  forumApi,
  officerApi,
  authApi,
  aiApi,
  Activity,
  ActivitiesResponse,
  FarmerCrop,
  FarmerListResponse,
  IrrigationSchedule,
  SensorSnapshot,
  type KpiSummary,
} from "@/api";

export function useSoilReadings(farmerId?: string) {
  return useQuery({
    queryKey: ["soil-readings", farmerId],
    queryFn: () =>
      (farmerId ? farmersApi.getSoilReadings(farmerId) : soilApi.getReadings()).then(
        (r) => r.data || [],
      ),
  });
}

export function useSoilStatus() {
  return useQuery({
    queryKey: ["soil-status"],
    queryFn: () => soilApi.getCurrentStatus().then((r) => r.data),
    staleTime: 1000 * 60,
  });
}

export function useWeatherForecast() {
  return useQuery({
    queryKey: ["weather-forecast"],
    queryFn: () => weatherApi.getForecast().then((r) => r.data || []),
    staleTime: 1000 * 60 * 5,
  });
}

export function useCurrentWeather() {
  return useQuery({
    queryKey: ["weather-current"],
    queryFn: () => weatherApi.getCurrent().then((r) => r.data),
    staleTime: 1000 * 60 * 5,
  });
}

// ==========================================
// AI ENGINE HOOKS
// ==========================================

export function useAIAnalyzeFarm() {
  return useMutation({
    mutationFn: () => aiApi.analyzeFarm().then((res) => res.data),
  });
}

export function useAIAnalyzePayload() {
  return useMutation({
    mutationFn: (payload: SensorSnapshot) => aiApi.analyzePayload(payload).then((res) => res.data),
  });
}

export function useAIHistory(limit?: number, category?: string) {
  return useQuery({
    queryKey: ["ai", "history", limit, category],
    queryFn: () => aiApi.getHistory({ limit, category }).then((res) => res.data),
  });
}

export function useAICooperativeAnalysis(cooperativeId?: string) {
  return useQuery({
    queryKey: ["ai", "cooperative-analysis", cooperativeId],
    queryFn: () => aiApi.cooperativeAnalysis(cooperativeId).then((res) => res.data),
  });
}

export function useFarmers(
  params?: {
    page?: number;
    limit?: number;
    search?: string;
    district?: string;
    cooperativeId?: string;
  },
  options: Omit<UseQueryOptions<FarmerListResponse, Error>, "queryKey" | "queryFn"> = {},
) {
  return useQuery({
    queryKey: ["farmers", params],
    queryFn: () =>
      farmersApi.listFarmers(params).then((r) => {
        // Backend listFarmers returns { success, data: { data: [...], pagination: {...} } }
        const actualData = (r as any).data;
        return {
          data: actualData?.data || [],
          pagination: actualData?.pagination || { total: 0, page: 1, limit: 100, totalPages: 0 },
        } as FarmerListResponse;
      }),
    ...options,
  });
}

export function useAssignedFarmers(
  params?: { page?: number; limit?: number },
  options: Omit<UseQueryOptions<FarmerListResponse, Error>, "queryKey" | "queryFn"> = {},
) {
  return useQuery({
    queryKey: ["assigned-farmers", params],
    queryFn: () =>
      farmersApi.getAssignedFarmers(params).then((r) => {
        // Backend returns { success, data: [...], pagination: {...} } spread directly
        const body = r as unknown as {
          success: boolean;
          data: FarmerListResponse["data"];
          pagination: FarmerListResponse["pagination"];
        };
        return {
          data: body.data || [],
          pagination: body.pagination || { total: 0, page: 1, limit: 100, totalPages: 0 },
        } as FarmerListResponse;
      }),
    ...options,
  });
}

export function useFarmerProfile() {
  return useQuery({
    queryKey: ["farmer-profile"],
    queryFn: () => farmersApi.getProfile().then((r) => r.data),
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpdateFarmerProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => farmersApi.updateProfile(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["farmer-profile"] }),
  });
}

export function useMyDistributions() {
  return useQuery({
    queryKey: ["my-distributions"],
    queryFn: () => farmersApi.getMyDistributions().then((r) => r.data || []),
  });
}

export function useFarmerCrops() {
  return useQuery({
    queryKey: ["farmer-crops"],
    queryFn: () => farmersApi.getCrops().then((r) => r.data || []),
  });
}

export function useCreateFarmerCrop() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<FarmerCrop>) => farmersApi.createCrop(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["farmer-crops"] }),
  });
}

export function useCropTypes() {
  return useQuery({
    queryKey: ["crop-types"],
    queryFn: () => farmersApi.getCropTypes().then((r) => r.data || []),
    staleTime: 1000 * 60 * 60,
  });
}

export function useActivities(
  params?: { page?: number; limit?: number; cropId?: string },
  options: any = {},
) {
  return useQuery<ActivitiesResponse>({
    queryKey: ["activities", params],
    queryFn: () => activitiesApi.list(params).then((r) => r.data!),
    ...options,
  });
}

export function useCreateActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      activityType: string;
      notes?: string;
      activityDate: string;
      farmerCropId?: string;
      quantity?: number;
      unit?: string;
      costRwf?: number;
    }) => activitiesApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["activities"] }),
  });
}

export function useActivityTypes() {
  return useQuery({
    queryKey: ["activity-types"],
    queryFn: () => activitiesApi.getTypes().then((r) => r.data || []),
    staleTime: 1000 * 60 * 60,
  });
}

export function useUsers(params?: {
  page?: number;
  limit?: number;
  role?: string;
  excludeRole?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ["users", params],
    queryFn: () => usersApi.list(params).then((r) => r.data),
  });
}

export function useUpdateUserStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, isActive }: { id: string; status?: string; isActive?: boolean }) =>
      usersApi.updateStatus(id, status!, isActive),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      qc.invalidateQueries({ queryKey: ["farmers"] });
      qc.invalidateQueries({ queryKey: ["superadmin-users"] });
    },
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => usersApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      qc.invalidateQueries({ queryKey: ["farmers"] });
      qc.invalidateQueries({ queryKey: ["superadmin-users"] });
    },
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      qc.invalidateQueries({ queryKey: ["farmers"] });
      qc.invalidateQueries({ queryKey: ["superadmin-users"] });
    },
  });
}

export function useApproveUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersApi.approveUser(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      qc.invalidateQueries({ queryKey: ["superadmin-users"] });
    },
  });
}

export function useRejectUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => usersApi.rejectUser(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      qc.invalidateQueries({ queryKey: ["superadmin-users"] });
    },
  });
}

export function useVerifyFarmer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => farmersApi.verifyFarmer(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["farmers"] });
      qc.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useBulkVerifyFarmers() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => farmersApi.bulkVerifyFarmers(ids),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["farmers"] });
      qc.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof usersApi.createUser>[0]) => usersApi.createUser(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      qc.invalidateQueries({ queryKey: ["farmers"] });
    },
  });
}

export function useUserProfile() {
  return useQuery({
    queryKey: ["user-profile"],
    queryFn: () => authApi.getMe().then((r) => r.data),
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpdateUserProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => authApi.updateMe(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user-profile"] });
      qc.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useUploadAvatar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => authApi.uploadAvatar(file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user-profile"] });
      qc.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useAuditLogs(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["audit-logs", params],
    queryFn: () => auditApi.list(params).then((r) => r.data),
  });
}

export function useNotifications(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["notifications", params],
    queryFn: () => notificationsApi.list(params).then((r) => r.data || []),
  });
}

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: ["notifications-unread-count"],
    queryFn: () => notificationsApi.getUnreadCount().then((r) => r.data?.count ?? 0),
  });
}

export function useNotificationRules() {
  return useQuery({
    queryKey: ["notification-rules"],
    queryFn: () => notificationsApi.getRules().then((r) => r.data || []),
  });
}

export function useCreateNotificationRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      name: string;
      type: string;
      channels: string[];
      conditions?: Record<string, unknown>;
    }) => notificationsApi.createRule(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notification-rules"] }),
  });
}

export function useUpdateNotificationRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      notificationsApi.updateRule(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notification-rules"] }),
  });
}

export function useDeleteNotificationRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.deleteRule(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notification-rules"] }),
  });
}

export function useProvinces() {
  return useQuery({
    queryKey: ["provinces"],
    queryFn: () => locationApi.getProvinces().then((r) => r.data || []),
    staleTime: 1000 * 60 * 30,
  });
}

export function useDistricts(provinceCode?: string) {
  return useQuery({
    queryKey: ["districts", provinceCode],
    queryFn: () => locationApi.getDistricts(provinceCode!).then((r) => r.data || []),
    enabled: !!provinceCode,
    staleTime: 1000 * 60 * 30,
  });
}

export function useSectors(districtCode?: string) {
  return useQuery({
    queryKey: ["sectors", districtCode],
    queryFn: () => locationApi.getSectors(districtCode!).then((r) => r.data || []),
    enabled: !!districtCode,
    staleTime: 1000 * 60 * 30,
  });
}

export function useCells(sectorCode?: string) {
  return useQuery({
    queryKey: ["cells", sectorCode],
    queryFn: () => locationApi.getCells(sectorCode!).then((r) => r.data || []),
    enabled: !!sectorCode,
    staleTime: 1000 * 60 * 30,
  });
}

export function useVillages(cellCode?: string) {
  return useQuery({
    queryKey: ["villages", cellCode],
    queryFn: () => locationApi.getVillages(cellCode!).then((r) => r.data || []),
    enabled: !!cellCode,
    staleTime: 1000 * 60 * 30,
  });
}

export function useIrrigationSchedules() {
  return useQuery({
    queryKey: ["irrigation-schedules"],
    queryFn: () => irrigationApi.getSchedules().then((r) => r.data || []),
  });
}

export function useUpdateIrrigationSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<IrrigationSchedule> }) =>
      irrigationApi.updateSchedule(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["irrigation-schedules"] }),
  });
}

export function useDeleteIrrigationSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => irrigationApi.deleteSchedule(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["irrigation-schedules"] }),
  });
}

export function useTriggerIrrigation() {
  return useMutation({
    mutationFn: (zoneId: string) => irrigationApi.trigger(zoneId),
  });
}

export function useStopIrrigation() {
  return useMutation({
    mutationFn: (zoneId: string) => irrigationApi.stop(zoneId),
  });
}

export function useIrrigationLogs() {
  return useQuery({
    queryKey: ["irrigation-logs"],
    queryFn: () => irrigationApi.getLogs().then((r) => r.data || []),
  });
}

export function useIrrigationStatus() {
  return useQuery({
    queryKey: ["irrigation-status"],
    queryFn: () => irrigationApi.getStatus().then((r) => r.data),
    refetchInterval: 1000 * 30,
  });
}

export function useMarketPrices(filters?: { crop?: string; market?: string }) {
  return useQuery({
    queryKey: ["market-prices", filters],
    queryFn: () => marketApi.getPrices(filters).then((r) => r.data || []),
    staleTime: 1000 * 60 * 5,
  });
}

export function usePriceAlerts() {
  return useQuery({
    queryKey: ["market-alerts"],
    queryFn: () => marketApi.getAlerts().then((r) => r.data || []),
  });
}

export function useCreatePriceAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      cropId: string;
      targetPrice: number;
      alertType: string;
      marketId?: string;
      smsEnabled?: boolean;
    }) => marketApi.createAlert(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["market-alerts"] }),
  });
}

export function useMarketAlerts() {
  return usePriceAlerts();
}

export function useDeletePriceAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => marketApi.deleteAlert(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["market-alerts"] }),
  });
}

export function useMarketInsights() {
  return useQuery({
    queryKey: ["market-insights"],
    queryFn: () => marketApi.getInsights().then((r) => r.data || []),
    staleTime: 1000 * 60 * 5,
  });
}

export function useRecommendedMarkets(cropId: string | null) {
  return useQuery({
    queryKey: ["market-recommendations", cropId],
    queryFn: () => marketApi.getRecommendedMarkets({ cropId: cropId! }).then((r) => r.data || []),
    enabled: !!cropId,
  });
}

export function useCooperatives(
  params?: { districtId?: string; district?: string },
  options: Omit<UseQueryOptions<any[], Error>, "queryKey" | "queryFn"> = {},
) {
  return useQuery({
    queryKey: ["cooperatives", params],
    queryFn: () => cooperativeApi.listCooperatives(params).then((r) => r.data || []),
    ...options,
  });
}

export function useCreateCooperative() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      name: string;
      district: string;
      sector: string;
      contactPhone?: string;
      description?: string;
    }) => cooperativeApi.createCooperative(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cooperatives"] }),
  });
}

export function useAssignCooperativeManager() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) =>
      cooperativeApi.assignManager(id, { userId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cooperatives"] });
      qc.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useImportFarmers() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ coopId, file }: { coopId: string; file: File }) =>
      cooperativeApi.importFarmers(coopId, file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["farmers"] });
      qc.invalidateQueries({ queryKey: ["cooperative-members"] });
    },
  });
}

export function useCooperativeMembers(coopId: string) {
  return useQuery({
    queryKey: ["cooperative-members", coopId],
    queryFn: () => cooperativeApi.getMembers(coopId).then((r) => r.data || []),
    enabled: !!coopId,
  });
}

export function useAddCooperativeMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ coopId, data }: { coopId: string; data: { userId: string; role?: string } }) =>
      cooperativeApi.addMember(coopId, data),
    onSuccess: (_, { coopId }) =>
      qc.invalidateQueries({ queryKey: ["cooperative-members", coopId] }),
  });
}

export function useUpdateMemberStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      coopId,
      memberId,
      status,
    }: {
      coopId: string;
      memberId: string;
      status: string;
    }) => cooperativeApi.updateMemberStatus(coopId, memberId, status),
    onSuccess: (_, { coopId }) =>
      qc.invalidateQueries({ queryKey: ["cooperative-members", coopId] }),
  });
}

export function useRemoveCooperativeMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ coopId, memberId }: { coopId: string; memberId: string }) =>
      cooperativeApi.removeMember(coopId, memberId),
    onSuccess: (_, { coopId }) =>
      qc.invalidateQueries({ queryKey: ["cooperative-members", coopId] }),
  });
}

export function useCooperativeResources(coopId: string) {
  return useQuery({
    queryKey: ["cooperative-resources", coopId],
    queryFn: () => cooperativeApi.getResources(coopId).then((r) => r.data || []),
    enabled: !!coopId,
  });
}

export function useCooperativePerformance(coopId: string) {
  return useQuery({
    queryKey: ["cooperative-performance", coopId],
    queryFn: () => cooperativeApi.getPerformance(coopId).then((r) => r.data),
    enabled: !!coopId,
  });
}

export function useCooperativeActivities(coopId: string) {
  return useQuery({
    queryKey: ["cooperative-activities", coopId],
    queryFn: () => cooperativeApi.getActivities(coopId).then((r) => r.data || []),
    enabled: !!coopId,
  });
}

export function useCreateCooperativeActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ coopId, data }: { coopId: string; data: any }) =>
      cooperativeApi.createActivity(coopId, data),
    onSuccess: (_, { coopId }) =>
      qc.invalidateQueries({ queryKey: ["cooperative-activities", coopId] }),
  });
}

export function useUpdateCooperativeActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ coopId, activityId, data }: { coopId: string; activityId: string; data: any }) =>
      cooperativeApi.updateActivity(coopId, activityId, data),
    onSuccess: (_, { coopId }) =>
      qc.invalidateQueries({ queryKey: ["cooperative-activities", coopId] }),
  });
}

export function useDeleteCooperativeActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ coopId, activityId }: { coopId: string; activityId: string }) =>
      cooperativeApi.deleteActivity(coopId, activityId),
    onSuccess: (_, { coopId }) =>
      qc.invalidateQueries({ queryKey: ["cooperative-activities", coopId] }),
  });
}

export function useMyCooperative() {
  return useQuery({
    queryKey: ["cooperative-me"],
    queryFn: () => cooperativeApi.getMy().then((r) => r.data),
  });
}

export function useUpdateCooperative() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      cooperativeApi.updateCooperative(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cooperative-me"] }),
  });
}

export function useMyJoinRequest() {
  return useQuery({
    queryKey: ["my-join-request"],
    queryFn: () => cooperativeApi.getMyJoinRequest().then((r) => r.data),
  });
}

export function useSubmitJoinRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (cooperativeId: string) => cooperativeApi.submitJoinRequest(cooperativeId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-join-request"] }),
  });
}

export function useAddCooperativeResource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ coopId, data }: { coopId: string; data: any }) =>
      cooperativeApi.addResource(coopId, data),
    onSuccess: (_, { coopId }) =>
      qc.invalidateQueries({ queryKey: ["cooperative-resources", coopId] }),
  });
}

export function useDistributeResource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      coopId,
      resourceId,
      data,
    }: {
      coopId: string;
      resourceId: string;
      data: { farmerId: string; quantity?: number; notes?: string };
    }) => cooperativeApi.distributeResource(coopId, resourceId, data),
    onSuccess: (_, { coopId }) => {
      qc.invalidateQueries({ queryKey: ["cooperative-resources", coopId] });
      qc.invalidateQueries({ queryKey: ["resource-distributions", coopId] });
    },
  });
}

export function useResourceDistributions(coopId: string, params?: any) {
  return useQuery({
    queryKey: ["resource-distributions", coopId, params],
    queryFn: () => cooperativeApi.getDistributions(coopId, params).then((r) => r.data || []),
    enabled: !!coopId,
  });
}

export function useUpdateCooperativeResource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ coopId, resourceId, data }: { coopId: string; resourceId: string; data: any }) =>
      cooperativeApi.updateResource(coopId, resourceId, data),
    onSuccess: (_, { coopId }) =>
      qc.invalidateQueries({ queryKey: ["cooperative-resources", coopId] }),
  });
}

export function useDeleteCooperativeResource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ coopId, resourceId }: { coopId: string; resourceId: string }) =>
      cooperativeApi.deleteResource(coopId, resourceId),
    onSuccess: (_, { coopId }) =>
      qc.invalidateQueries({ queryKey: ["cooperative-resources", coopId] }),
  });
}

export function useCooperativeAnalytics(coopId: string) {
  return useQuery({
    queryKey: ["cooperative-analytics", coopId],
    queryFn: () => cooperativeApi.getAnalytics(coopId).then((r) => r.data),
    enabled: !!coopId,
  });
}

export function useCooperativeFarmerDetail(coopId: string, farmerId: string) {
  return useQuery({
    queryKey: ["cooperative-farmer-detail", coopId, farmerId],
    queryFn: () => cooperativeApi.getFarmerDetail(coopId, farmerId).then((r) => r.data),
    enabled: !!coopId && !!farmerId,
  });
}

export function useCooperativeJoinRequests(coopId: string) {
  return useQuery({
    queryKey: ["cooperative-join-requests", coopId],
    queryFn: () => cooperativeApi.getJoinRequests(coopId).then((r) => r.data || []),
    enabled: !!coopId,
  });
}

export function useCooperativeEventAttendees(coopId: string, activityId: string) {
  return useQuery({
    queryKey: ["cooperative-event-attendees", coopId, activityId],
    queryFn: () => cooperativeApi.getEventAttendees(coopId, activityId).then((r) => r.data),
    enabled: !!coopId && !!activityId,
  });
}

export function useApproveJoinRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ coopId, requestId }: { coopId: string; requestId: string }) =>
      cooperativeApi.approveJoinRequest(coopId, requestId),
    onSuccess: (_, { coopId }) => {
      qc.invalidateQueries({ queryKey: ["cooperative-join-requests", coopId] });
      qc.invalidateQueries({ queryKey: ["cooperative-members", coopId] });
    },
  });
}

export function useRejectJoinRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ coopId, requestId }: { coopId: string; requestId: string }) =>
      cooperativeApi.rejectJoinRequest(coopId, requestId),
    onSuccess: (_, { coopId }) =>
      qc.invalidateQueries({ queryKey: ["cooperative-join-requests", coopId] }),
  });
}

export function useMarkAttendance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      coopId,
      activityId,
      data,
    }: {
      coopId: string;
      activityId: string;
      data: { userId: string; status: string };
    }) => cooperativeApi.markAttendance(coopId, activityId, data),
    onSuccess: (_, { coopId, activityId }) => {
      qc.invalidateQueries({ queryKey: ["cooperative-event-attendees", coopId, activityId] });
      qc.invalidateQueries({ queryKey: ["cooperative-activities", coopId] });
    },
  });
}

export function useUpdateBookingDelivery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      coopId,
      bookingId,
      data,
    }: {
      coopId: string;
      bookingId: string;
      data: { deliveryStatus: string; deliveryDate?: string };
    }) => cooperativeApi.updateBookingDelivery(coopId, bookingId, data),
    onSuccess: (_, { coopId }) =>
      qc.invalidateQueries({ queryKey: ["cooperative-resources", coopId] }),
  });
}

export function useCooperativeDues(coopId: string) {
  return useQuery({
    queryKey: ["cooperative-dues", coopId],
    queryFn: () => cooperativeApi.getDues(coopId).then((r) => r.data || []),
    enabled: !!coopId,
  });
}

export function useCreateDue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ coopId, data }: { coopId: string; data: any }) =>
      cooperativeApi.createDue(coopId, data),
    onSuccess: (_, { coopId }) => qc.invalidateQueries({ queryKey: ["cooperative-dues", coopId] }),
  });
}

export function useUpdateDue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ coopId, dueId, data }: { coopId: string; dueId: string; data: any }) =>
      cooperativeApi.updateDue(coopId, dueId, data),
    onSuccess: (_, { coopId }) => qc.invalidateQueries({ queryKey: ["cooperative-dues", coopId] }),
  });
}

export function useDeleteDue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ coopId, dueId }: { coopId: string; dueId: string }) =>
      cooperativeApi.deleteDue(coopId, dueId),
    onSuccess: (_, { coopId }) => qc.invalidateQueries({ queryKey: ["cooperative-dues", coopId] }),
  });
}

export function useCooperativeExpenses(coopId: string) {
  return useQuery({
    queryKey: ["cooperative-expenses", coopId],
    queryFn: () => cooperativeApi.getExpenses(coopId).then((r) => r.data || []),
    enabled: !!coopId,
  });
}

export function useCreateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ coopId, data }: { coopId: string; data: any }) =>
      cooperativeApi.createExpense(coopId, data),
    onSuccess: (_, { coopId }) =>
      qc.invalidateQueries({ queryKey: ["cooperative-expenses", coopId] }),
  });
}

export function useDeleteExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ coopId, expenseId }: { coopId: string; expenseId: string }) =>
      cooperativeApi.deleteExpense(coopId, expenseId),
    onSuccess: (_, { coopId }) =>
      qc.invalidateQueries({ queryKey: ["cooperative-expenses", coopId] }),
  });
}

export function useSendEventReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ coopId, activityId }: { coopId: string; activityId: string }) =>
      cooperativeApi.sendEventReminder(coopId, activityId),
    onSuccess: (_, { coopId }) =>
      qc.invalidateQueries({ queryKey: ["cooperative-activities", coopId] }),
  });
}

export function useCommunityPosts(params?: {
  category?: string;
  page?: number;
  limit?: number;
  audienceType?: any;
  audienceId?: string;
}) {
  return useQuery({
    queryKey: ["community-posts", params],
    queryFn: () => forumApi.getPosts(params).then((r) => r.data?.posts || []),
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      title: string;
      content: string;
      category?: string;
      type?: any;
      priority?: string;
      audienceType?: any;
      audienceId?: string;
      imageUrls?: string[];
      videoUrls?: string[];
      attachmentUrls?: string[];
    }) => forumApi.createPost(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["community-posts"] }),
  });
}

export function useLikePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => forumApi.likePost(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["community-posts"] }),
  });
}

export function useAddComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      content,
      parentCommentId,
    }: {
      id: string;
      content: string;
      parentCommentId?: string;
    }) => forumApi.addComment(id, content, parentCommentId),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ["community-posts"] });
      qc.invalidateQueries({ queryKey: ["forum-post", id] });
    },
  });
}

export function useReportPost() {
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => forumApi.reportPost(id, reason),
    onSuccess: () => {
      toast.success("Post reported successfully.");
    },
  });
}

export function useDeletePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => forumApi.deletePost(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["community-posts"] });
      toast.success("Post deleted.");
    },
  });
}

export function useVerifyAnswer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) => forumApi.verifyAnswer(commentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["community-posts"] });
      toast.success("Answer verified!");
    },
  });
}

export function usePinPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isPinned }: { id: string; isPinned: boolean }) =>
      forumApi.pinPost(id, isPinned),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["community-posts"] });
    },
  });
}

export function useAdvisories() {
  return useQuery({
    queryKey: ["advisories"],
    queryFn: () =>
      officerApi.getAdvisories().then((r) => {
        // Backend returns { success, data: [...] } so r is the full body
        const body = r as unknown as { success: boolean; data: any[] };
        return body.data || [];
      }),
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateAdvisory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      title: string;
      message: string;
      severity?: string;
      farmerIds?: string[];
    }) => officerApi.createAdvisory(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["advisories"] }),
  });
}

export function useRisks() {
  return useQuery({
    queryKey: ["risks"],
    queryFn: () =>
      officerApi.getRisks().then((r) => {
        const body = r as unknown as { success: boolean; data: any[] };
        return body.data || [];
      }),
    staleTime: 1000 * 60 * 5,
  });
}

export function useAdminKpiSummary() {
  return useQuery({
    queryKey: ["admin-kpi-summary"],
    queryFn: () => adminApi.getKpiSummary().then((r) => r.data),
    refetchInterval: 60_000,
  });
}

export function useSuperAdminDashboard() {
  return useQuery({
    queryKey: ["superadmin-dashboard"],
    queryFn: () => superAdminApi.getDashboard().then((r) => r.data),
  });
}

export function useSuperAdminUsers(params?: {
  page?: number;
  limit?: number;
  role?: string;
  search?: string;
  status?: string;
}) {
  return useQuery<any>({
    queryKey: ["superadmin-users", params],
    queryFn: () => superAdminApi.getUsers(params).then((r) => r.data),
  });
}

export function useSuperAdminAuditLogs(params?: {
  page?: number;
  limit?: number;
  userId?: string;
  action?: string;
}) {
  return useQuery({
    queryKey: ["superadmin-audit-logs", params],
    queryFn: () => superAdminApi.getAuditLogs(params).then((r) => r.data),
  });
}

export function useSuperAdminSystemHealth() {
  return useQuery({
    queryKey: ["superadmin-system-health"],
    queryFn: () => superAdminApi.getSystemHealth().then((r) => r.data),
  });
}

export function useSuperAdminBackups(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["superadmin-backups", params],
    queryFn: () => superAdminApi.getBackups(params).then((r) => r.data),
  });
}

export function useCreateBackup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => superAdminApi.createBackup(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["superadmin-backups"] }),
  });
}

export function useDeleteBackup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => superAdminApi.deleteBackup(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["superadmin-backups"] }),
  });
}

export function useRestoreBackup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => superAdminApi.restoreBackup(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["superadmin-backups"] }),
  });
}

export function useSuperAdminSettings() {
  return useQuery({
    queryKey: ["superadmin-settings"],
    queryFn: () => superAdminApi.getSettings(),
  });
}

export function useUpdateSuperAdminSetting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) =>
      superAdminApi.updateSetting(key, value),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["superadmin-settings"] }),
  });
}

export function useSuperAdminRoles() {
  return useQuery({
    queryKey: ["superadmin-roles"],
    queryFn: () => superAdminApi.getRoles(),
  });
}

export function useUpdateRolePermissions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ role, permissions }: { role: string; permissions: string[] }) =>
      superAdminApi.updateRolePermissions(role, permissions),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["superadmin-roles"] }),
  });
}

export function useCreateSuperAdminUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      phone: string;
      email?: string;
      password?: string;
      role: string;
      fullName: string;
      district: string;
      sector: string;
    }) => superAdminApi.createUser(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["superadmin-users"] }),
  });
}

export function useUpdateSuperAdminUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { role?: string; isActive?: boolean; language?: string };
    }) => superAdminApi.updateUser(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["superadmin-users"] }),
  });
}

export function useDeleteSuperAdminUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => superAdminApi.deleteUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["superadmin-users"] }),
  });
}

export function useOfficerAnalysis() {
  return useQuery<any>({
    queryKey: ["officer-analysis"],
    queryFn: () => officerApi.getAnalysis().then((r) => (r as any).data),
    staleTime: 1000 * 60 * 5,
  });
}

export function useOfficerFarmerAnalysis(farmerId: string) {
  return useQuery<any>({
    queryKey: ["officer-farmer-analysis", farmerId],
    queryFn: () => officerApi.getFarmerAnalysis(farmerId).then((r) => (r as any).data),
    enabled: !!farmerId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useOfficerPerformanceAnalysis(options?: {
  startDate?: string;
  endDate?: string;
  limit?: number;
}) {
  return useQuery<any>({
    queryKey: ["officer-performance-analysis", options],
    queryFn: () => officerApi.getPerformanceAnalysis(options).then((r) => (r as any).data),
    staleTime: 1000 * 60 * 5,
  });
}

// ═══════════════════════════════════════════════
// SUPER ADMIN — 6 NEW FEATURES
// ═══════════════════════════════════════════════

// FEATURE 1: MERGE ACCOUNTS
export function useMergeUsers() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { primaryUserId: string; secondaryUserId: string }) =>
      superAdminApi.mergeUsers(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["superadmin-users"] });
    },
  });
}

// FEATURE 2: RESET PASSWORD
export function useResetUserPassword() {
  return useMutation({
    mutationFn: (id: string) => superAdminApi.resetUserPassword(id),
  });
}

// FEATURE 6: FORCE LOGOUT
export function useForceLogoutUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => superAdminApi.forceLogoutUser(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["superadmin-users"] });
    },
  });
}

// FEATURE 3: FEATURE FLAGS
export function useFeatureFlags() {
  return useQuery({
    queryKey: ["feature-flags"],
    queryFn: () => superAdminApi.getFeatureFlags().then((r) => r.data || []),
  });
}

export function useUpdateFeatureFlags() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (flags: Array<{ key: string; enabled: boolean }>) =>
      superAdminApi.updateFeatureFlags(flags),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["feature-flags"] }),
  });
}

// FEATURE 4: PASSWORD POLICY
export function usePasswordPolicy() {
  return useQuery({
    queryKey: ["password-policy"],
    queryFn: () => superAdminApi.getPasswordPolicy().then((r) => r.data),
  });
}

export function useUpdatePasswordPolicy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (config: {
      minLength: number;
      requireUppercase: boolean;
      requireLowercase: boolean;
      requireNumbers: boolean;
      requireSpecial: boolean;
      expiryDays: number;
      preventReuse: number;
    }) => superAdminApi.updatePasswordPolicy(config),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["password-policy"] }),
  });
}

// FEATURE 5: AUDIT RETENTION
export function useAuditRetention() {
  return useQuery({
    queryKey: ["audit-retention"],
    queryFn: () => superAdminApi.getAuditRetention().then((r) => r.data),
  });
}

export function useUpdateAuditRetention() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (config: { retentionDays: number; archiveBeforeCleanup: boolean }) =>
      superAdminApi.updateAuditRetention(config),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["audit-retention"] }),
  });
}

export function useCleanupAuditLogs() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => superAdminApi.cleanupAuditLogs(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["audit-retention"] });
      qc.invalidateQueries({ queryKey: ["superadmin-audit-logs"] });
    },
  });
}
