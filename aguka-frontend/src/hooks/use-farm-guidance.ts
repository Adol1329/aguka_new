import { useQuery } from "@tanstack/react-query";
import { farmersApi } from "@/api/farmers";

export function useFarmGuidance() {
  return useQuery({
    queryKey: ["farm-guidance"],
    queryFn: () => farmersApi.getFarmGuidance().then((r) => r.data),
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
}
