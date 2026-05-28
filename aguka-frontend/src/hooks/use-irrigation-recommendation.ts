import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { irrigationRecommendationApi } from "@/api/irrigation-recommendation";

export function useIrrigationRecommendation() {
  return useQuery({
    queryKey: ["irrigation-recommendation"],
    queryFn: () => irrigationRecommendationApi.getRecommendations().then(r => r.data),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

export function useAcceptIrrigationRecommendation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => 
      irrigationRecommendationApi.acceptRecommendation(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["irrigation-recommendation"] });
      qc.invalidateQueries({ queryKey: ["irrigation-schedules"] });
      qc.invalidateQueries({ queryKey: ["irrigation-status"] });
    },
  });
}