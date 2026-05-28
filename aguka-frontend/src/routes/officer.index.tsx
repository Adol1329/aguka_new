import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, StatCard } from "@/components/dashboard-ui";
import { Card } from "@/components/ui/card";
import { Sprout, Bell, AlertTriangle, Users, Loader2 } from "lucide-react";
import { useFarmers, useRisks, useAdvisories } from "@/hooks/use-data";

export const Route = createFileRoute("/officer/")({
  component: OfficerDashboard,
});

function OfficerDashboard() {
  const { data: farmers, isLoading: loadingFarmers } = useFarmers();
  const { data: risks, isLoading: loadingRisks } = useRisks();
  const { data: advisories, isLoading: loadingAdvisories } = useAdvisories();

  if (loadingFarmers || loadingRisks || loadingAdvisories) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const activeRisks = Array.isArray(risks) ? risks.filter((r: any) => r.status !== "resolved") : [];
  const farmerList = farmers?.data || [];
  const farmersNeedingAttention = farmerList.filter((f: any) => f.yieldScore < 60);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Field Officer Dashboard"
        subtitle="Operational overview of your assigned farmers and field risks."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Assigned farmers" value={farmerList.length} icon={Users} accent="primary" />
        <StatCard label="Farms monitored" value={farmerList.length} icon={Sprout} accent="success" />
        <StatCard
          label="Advisories sent"
          value={Array.isArray(advisories) ? advisories.length : 0}
          icon={Bell}
          accent="info"
          trend="Total"
        />
        <StatCard label="Active risks" value={activeRisks.length} icon={AlertTriangle} accent="warning" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Active risks
          </h3>
          <div className="space-y-3">
            {activeRisks.map((r: any) => (
              <div
                key={r.id}
                className="flex items-start justify-between gap-3 rounded-lg border p-3"
              >
                <div>
                  <div className="text-sm font-medium">{r.title || r.type}</div>
                  <div className="text-xs text-muted-foreground">
                    {r.location || "District-wide"} · {new Date(r.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    r.severity === "critical"
                      ? "bg-destructive/10 text-destructive"
                      : r.severity === "warning"
                        ? "bg-warning/10 text-warning"
                        : "bg-info/10 text-info"
                  }`}
                >
                  {r.severity}
                </span>
              </div>
            ))}
            {activeRisks.length === 0 && (
              <div className="text-center py-4 text-xs text-muted-foreground">No active risks reported.</div>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Recent advisories
          </h3>
          <div className="space-y-3">
            {Array.isArray(advisories) && advisories.slice(0, 5).map((a: any) => (
              <div key={a.id} className="rounded-lg border p-3">
                <div className="flex items-start justify-between">
                  <div className="text-sm font-medium">{a.title}</div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      a.severity === "critical"
                        ? "bg-destructive/10 text-destructive"
                        : a.severity === "warning"
                          ? "bg-warning/10 text-warning"
                          : "bg-info/10 text-info"
                    }`}
                  >
                    {a.severity}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {a.message?.substring(0, 80)}... · {new Date(a.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
            {(!Array.isArray(advisories) || advisories.length === 0) && (
              <div className="text-center py-4 text-xs text-muted-foreground">No advisories sent yet.</div>
            )}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="font-display text-lg font-semibold mb-4">Farms needing attention</h3>
        <div className="grid gap-3 md:grid-cols-3">
          {farmersNeedingAttention.map((f: any) => (
            <div key={f.id} className="rounded-lg border border-warning/30 bg-warning/5 p-3">
              <div className="text-sm font-medium">{f.fullName || f.name}</div>
              <div className="text-xs text-muted-foreground">
                {f.district}
              </div>
              <div className="text-xs text-warning mt-2">Yield score: {f.yieldScore}/100</div>
            </div>
          ))}
          {farmersNeedingAttention.length === 0 && (
            <div className="col-span-3 text-center py-8 text-muted-foreground">
              All farms are performing within optimal ranges.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
