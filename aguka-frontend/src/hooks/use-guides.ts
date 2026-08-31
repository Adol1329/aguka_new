import { useQuery } from "@tanstack/react-query";
import { guidesApi } from "@/api/guides";

export function useGuides(params?: { crop?: string; category?: string }) {
  return useQuery({
    queryKey: ["guides", params],
    queryFn: () => guidesApi.getGuides(params).then((r) => r.data || []),
    staleTime: 1000 * 60 * 10,
  });
}

export function useGuide(id: string) {
  return useQuery({
    queryKey: ["guide", id],
    queryFn: () => guidesApi.getGuideById(id).then((r) => r.data),
    enabled: !!id,
    staleTime: 1000 * 60 * 10,
  });
}

export function useGuideFilters() {
  return useQuery({
    queryKey: ["guide-filters"],
    queryFn: () => guidesApi.getFilters().then((r) => r.data),
    staleTime: 1000 * 60 * 30,
  });
}
