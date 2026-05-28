import { createFileRoute } from "@tanstack/react-router";
import { ReportsComponent } from "@/components/reports-view";

type ReportsSearch = {
  farmerId?: string;
};

export const Route = createFileRoute("/reports/")({
  component: () => {
    const { farmerId } = Route.useSearch();
    return <ReportsComponent farmerId={farmerId} />;
  },
  validateSearch: (search: Record<string, unknown>): ReportsSearch => {
    return {
      farmerId: (search.farmerId as string) || undefined,
    };
  },
});
