import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  reportsV2Api,
  type ReportDefinition,
  type ReportFilters as Filters,
} from "@/api/reports-v2";
import { ReportFiltersBar } from "./filters";
import { ReportViewer } from "./viewer";

export interface ReportPageProps {
  role: "farmer" | "officer" | "cooperative" | "admin" | "super_admin";
  reportType: string;
  showFarmer?: boolean;
  showDistrict?: boolean;
  showCooperative?: boolean;
  showCrop?: boolean;
  showSeason?: boolean;
}

export function ReportPage({
  role,
  reportType,
  showFarmer = true,
  showDistrict = true,
  showCooperative = true,
  showCrop = true,
  showSeason = true,
}: ReportPageProps) {
  const [filters, setFilters] = useState<Filters>({});
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["reports-v2", role, reportType, filters],
    queryFn: async () => {
      const res = await reportsV2Api.fetch(role, reportType, filters);
      return (res.data ?? null) as ReportDefinition | null;
    },
  });

  return (
    <div className="space-y-4">
      <ReportFiltersBar
        role={role}
        reportType={reportType}
        initial={filters}
        onChange={setFilters}
        showFarmer={showFarmer}
        showDistrict={showDistrict}
        showCooperative={showCooperative}
        showCrop={showCrop}
        showSeason={showSeason}
      />

      {isLoading || isFetching ? (
        <div className="flex h-[40vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-8 text-center">
          <AlertCircle className="h-10 w-10 text-destructive" />
          <p className="font-semibold">Failed to load report</p>
          <p className="text-sm text-muted-foreground">
            {(error as Error)?.message ?? "Unknown error"}
          </p>
          <Button onClick={() => refetch()}>Retry</Button>
        </div>
      ) : data ? (
        <ReportViewer report={data} />
      ) : (
        <p className="text-sm text-muted-foreground">No data</p>
      )}
    </div>
  );
}
