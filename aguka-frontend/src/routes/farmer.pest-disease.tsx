import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard-ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePestDiseaseAlerts } from "@/hooks/use-pest-disease";
import { useFarmerProfile } from "@/hooks/use-data";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/i18n";
import { Bug, Leaf, AlertTriangle, RefreshCw, Filter, Search, Loader2 } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/farmer/pest-disease")({
  component: PestDiseasePage,
});

const severityConfig = {
  critical: {
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-700 dark:text-red-300",
    icon: AlertTriangle,
    label: "Critical",
  },
  warning: {
    bg: "bg-amber-100 dark:bg-amber-900/30",
    text: "text-amber-700 dark:text-amber-300",
    icon: AlertTriangle,
    label: "Warning",
  },
  info: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-700 dark:text-blue-300",
    icon: Leaf,
    label: "Info",
  },
};

type Severity = "critical" | "warning" | "info";

function PestDiseasePage() {
  const { t } = useI18n();
  const { data: profile } = useFarmerProfile();
  const [filterSeverity, setFilterSeverity] = useState<Severity | "all">("all");
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: alertsData,
    isLoading,
    refetch,
  } = usePestDiseaseAlerts({
    farmerId: profile?.id,
    ...(filterSeverity !== "all" ? { severity: filterSeverity } : {}),
  });

  const alerts = (alertsData || []) as Array<{
    id: string;
    alertType: "pest" | "disease";
    severity: Severity;
    title: string;
    message: string;
    recommendation?: string | null;
    isRead?: boolean;
    createdAt: string;
  }>;

  const grouped = alerts.reduce(
    (acc, alert) => {
      acc[alert.severity] = acc[alert.severity] || [];
      acc[alert.severity].push(alert);
      return acc;
    },
    {} as Record<Severity, typeof alerts>,
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setTimeout(() => setRefreshing(false), 500);
  };

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pest & Disease Alerts"
        subtitle="Monitor pest infestations and disease outbreaks affecting your farm."
        action={
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Alerts</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              {(["all", "critical", "warning", "info"] as const).map((s) => (
                <Button
                  key={s}
                  variant={filterSeverity === s ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterSeverity(s)}
                >
                  {s === "all" ? "All" : severityConfig[s].label}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-12 text-center">
              <Bug className="mb-3 h-10 w-10 text-muted-foreground opacity-40" />
              <h3 className="text-sm font-semibold">No pest or disease alerts</h3>
              <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                There are currently no pest or disease alerts for your farm.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {(["critical", "warning", "info"] as const).map((severity) => {
                const alertsOfSeverity = grouped[severity];
                if (!alertsOfSeverity?.length) return null;
                const config = severityConfig[severity];
                const Icon = config.icon;

                return (
                  <div key={severity}>
                    <div
                      className={`mb-3 flex items-center gap-2 text-sm font-semibold ${config.text}`}
                    >
                      <Icon className="h-4 w-4" />
                      {config.label}
                      <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                        {alertsOfSeverity.length}
                      </span>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {alertsOfSeverity.map((alert) => (
                        <Card key={alert.id} className="overflow-hidden">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <div className={`rounded-md p-1.5 ${config.bg} ${config.text}`}>
                                  {alert.alertType === "pest" ? (
                                    <Bug className="h-4 w-4" />
                                  ) : (
                                    <Leaf className="h-4 w-4" />
                                  )}
                                </div>
                                <span className="text-xs font-medium uppercase text-muted-foreground">
                                  {alert.alertType}
                                </span>
                              </div>
                              <Badge
                                variant={
                                  severity === "critical"
                                    ? "destructive"
                                    : severity === "warning"
                                      ? "default"
                                      : "secondary"
                                }
                              >
                                {config.label}
                              </Badge>
                            </div>
                            <h4 className="mt-3 font-semibold leading-tight">{alert.title}</h4>
                            <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">
                              {alert.message}
                            </p>
                            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                              <span>{new Date(alert.createdAt).toLocaleDateString()}</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
