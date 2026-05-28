import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pestDiseaseApi } from "@/api/pest-disease";

export function usePestDiseaseAlerts(params?: {
  cooperativeId?: string;
  farmerId?: string;
  severity?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["pest-disease-alerts", params],
    queryFn: () => pestDiseaseApi.getAlerts(params).then((r) => r.data || []),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useCreatePestDiseaseAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      farmerId: string;
      alertType: "pest" | "disease";
      severity: "info" | "warning" | "critical";
      title: string;
      message: string;
      recommendation?: string;
    }) => pestDiseaseApi.createAlert(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pest-disease-alerts"] });
    },
  });
}

export function useUpdatePestDiseaseAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ alertId, data }: { alertId: string; data: { isRead?: boolean } }) =>
      pestDiseaseApi.updateAlert(alertId, data),
    onSuccess: (_, { alertId }) => {
      qc.invalidateQueries({ queryKey: ["pest-disease-alerts"] });
      qc.invalidateQueries({ queryKey: ["pest-disease-alert", alertId] });
    },
  });
}

export function usePestDiseaseStats(cooperativeId: string, params?: { days?: number }) {
  return useQuery({
    queryKey: ["pest-disease-stats", cooperativeId, params],
    queryFn: () => pestDiseaseApi.getStats(cooperativeId, params).then((r) => r.data),
    staleTime: 1000 * 60 * 15, // 15 minutes
    enabled: !!cooperativeId,
  });
}
