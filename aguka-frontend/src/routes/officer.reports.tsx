import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard-ui";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { cooperativeApi } from "@/api";
import { useCooperativeActivities } from "@/hooks/use-data";

export const Route = createFileRoute("/officer/reports")({
  component: OfficerReportsPage,
});

function OfficerReportsPage() {
  const { data: cooperatives, isLoading: coopsLoading } = useQuery({
    queryKey: ["cooperatives-list"],
    queryFn: () => cooperativeApi.getMy(),
  });

  const coopId = (cooperatives?.data as any)?.id;
  const { data: activities, isLoading: activitiesLoading } = useCooperativeActivities(coopId || "");

  const isLoading = coopsLoading || (coopId ? activitiesLoading : false);

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Advisory & Monitoring Reports" />
      <Card className="p-6">
        {!coopId ? (
          <div className="text-center py-12 text-muted-foreground">
            No cooperative found.
          </div>
        ) : !activities || activities.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No activities available to generate reports.
          </div>
        ) : (
          <div className="space-y-2">
            {activities.map((activity: any) => (
              <div key={activity.id} className="flex justify-between rounded-lg border p-3 hover:bg-muted/30">
                <span className="text-sm font-medium">{activity.title}</span>
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
