import { useQuery } from "@tanstack/react-query";
import { seasonsApi } from "@/api/seasons";

export function useSeasons() {
  return useQuery({
    queryKey: ["seasons"],
    queryFn: () => seasonsApi.getSeasons().then((r) => r.data || []),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}
