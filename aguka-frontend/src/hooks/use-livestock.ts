import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { livestockApi } from "@/api/livestock";

export function useLivestockGuidance(
  params?: {
    animalType?: string;
    breed?: string;
    age?: string;
    healthStatus?: string;
  }
) {
  return useQuery({
    queryKey: ["livestock-guidance", params],
    queryFn: () => livestockApi.getGuidance(params).then(r => r.data),
    staleTime: 1000 * 60 * 30, // 30 minutes
    enabled: !!params?.animalType || !!params?.breed || !!params?.age || !!params?.healthStatus,
  });
}

export function useMyLivestock() {
  return useQuery({
    queryKey: ["my-livestock"],
    queryFn: () => livestockApi.getMyLivestock().then(r => r.data || []),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useAddLivestock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      animalType: string;
      breed?: string;
      tagNumber?: string;
      birthDate?: string;
      purchaseDate?: string;
      weightKg?: number;
      healthStatus?: string;
      feedingRegime?: string;
      notes?: string;
    }) => livestockApi.addLivestock(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-livestock"] });
      qc.invalidateQueries({ queryKey: ["livestock-stats"] });
    },
  });
}

export function useUpdateLivestock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ livestockId, data }: { 
      livestockId: string; 
      data: {
        animalType?: string;
        breed?: string;
        tagNumber?: string;
        birthDate?: string;
        purchaseDate?: string;
        weightKg?: number;
        healthStatus?: string;
        feedingRegime?: string;
        notes?: string;
      }
    }) => livestockApi.updateLivestock(livestockId, data),
    onSuccess: (_, { livestockId }) => {
      qc.invalidateQueries({ queryKey: ["my-livestock"] });
      qc.invalidateQueries({ queryKey: ["livestock-stats"] });
      qc.invalidateQueries({ queryKey: ["livestock", livestockId] });
    },
  });
}

export function useRemoveLivestock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (livestockId: string) => livestockApi.removeLivestock(livestockId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-livestock"] });
      qc.invalidateQueries({ queryKey: ["livestock-stats"] });
    },
  });
}

export function useLivestockStats() {
  return useQuery({
    queryKey: ["livestock-stats"],
    queryFn: () => livestockApi.getStats().then(r => r.data),
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
}