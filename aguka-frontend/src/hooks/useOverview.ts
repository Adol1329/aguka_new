import { useQuery } from "@tanstack/react-query";
import { getOverview } from "@/api/overview";

export function useOverview() {
  return useQuery({
    queryKey: ["overview"],
    queryFn: getOverview,
    refetchInterval: 5 * 60 * 1000, // refresh every 5 minutes
    staleTime: 2 * 60 * 1000,
  });
}
