import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, StatCard } from "@/components/dashboard-ui";
import { Card } from "@/components/ui/card";
import {
  Sprout,
  Bell,
  AlertTriangle,
  Users,
  Loader2,
  ClipboardList,
  Calendar,
  Activity,
  ArrowRight,
} from "lucide-react";
import { useFarmers, useRisks, useAdvisories } from "@/hooks/use-data";
import { useQuery } from "@tanstack/react-query";
import { officerApi } from "@/api/officer";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/officer/")({
  component: OfficerDashboard,
});

function OfficerDashboard() {
  const { data: farmers, isLoading: loadingFarmers } = useFarmers();
  const { data: risks, isLoading: loadingRisks } = useRisks();
  const { data: advisories, isLoading: loadingAdvisories } = useAdvisories();

  const { data: fieldWork, isLoading: loadingFieldWork } = useQuery({
    queryKey: ["officer-field-work"],
    queryFn: () => officerApi.getFieldWork().then((r) => (r as any).data || []),
  });

  if (loadingFarmers || loadingRisks || loadingAdvisories || loadingFieldWork) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const activeRisks = Array.isArray(risks) ? risks.filter((r: any) => r.status !== "resolved") : [];
  const farmerList = farmers?.data || [];

  const pendingVisits = Array.isArray(fieldWork)
    ? fieldWork.filter((v: any) => v.status === "pending")
    : [];

  const recentActivities = Array.isArray(fieldWork) ? fieldWork.slice(0, 5) : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Field Officer Dashboard"
        subtitle="Operational overview of your assigned farmers and field risks."
      />

      {/* 1. Overview Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Assigned Farmers"
          value={farmerList.length}
          icon={Users}
          accent="primary"
        />
        <StatCard
          label="Farms Monitored"
          value={farmerList.length}
          icon={Sprout}
          accent="success"
        />
        <StatCard
          label="Pending Visits"
          value={pendingVisits.length}
          icon={ClipboardList}
          accent="warning"
        />
        <StatCard
          label="Active Risks"
          value={activeRisks.length}
          icon={AlertTriangle}
          accent="destructive"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending Field Visits */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5 text-warning" />
              Pending Field Visits
            </h3>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/officer/field-work">View All</Link>
            </Button>
          </div>
          <div className="space-y-3">
            {pendingVisits.slice(0, 4).map((v: any) => (
              <div
                key={v.id}
                className="flex items-start justify-between gap-3 rounded-lg border p-3 hover:bg-muted/30 transition-colors"
              >
                <div>
                  <div className="text-sm font-medium">{v.farmer?.fullName}</div>
                  <div className="text-xs text-muted-foreground">
                    Scheduled: {new Date(v.visitDate).toLocaleDateString()}
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                  <Link to="/officer/farmer-detail" search={{ farmerId: v.farmer?.id }}>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ))}
            {pendingVisits.length === 0 && (
              <div className="text-center py-6 text-sm text-muted-foreground border border-dashed rounded-lg">
                No pending field visits.
              </div>
            )}
          </div>
        </Card>

        {/* Recent Activities (Visit Logs) */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-semibold flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Recent Activities
            </h3>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/officer/field-work">History</Link>
            </Button>
          </div>
          <div className="space-y-3">
            {recentActivities.map((v: any) => (
              <div key={v.id} className="rounded-lg border p-3">
                <div className="flex items-start justify-between">
                  <div className="text-sm font-medium">{v.farmer?.fullName}</div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold ${
                      v.status === "completed"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {v.status}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-1 line-clamp-1">
                  {v.notes || "Field visit recorded"}
                </div>
                <div className="text-[10px] text-muted-foreground mt-1">
                  {new Date(v.visitDate).toLocaleDateString()}
                </div>
              </div>
            ))}
            {recentActivities.length === 0 && (
              <div className="text-center py-6 text-sm text-muted-foreground border border-dashed rounded-lg">
                No recent field activities.
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* High-Level Risk Summary */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-semibold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            High-Level Risk Summary
          </h3>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/officer/risks">Risk Tracker</Link>
          </Button>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {activeRisks.slice(0, 6).map((r: any) => (
            <div
              key={r.id}
              className={`rounded-lg border p-3 ${
                r.severity === "critical"
                  ? "bg-destructive/5 border-destructive/20"
                  : "bg-warning/5 border-warning/20"
              }`}
            >
              <div className="text-sm font-semibold">{r.title || r.type}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {r.farmer?.farmName || "District-wide"}
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span
                  className={`text-[10px] font-bold uppercase ${
                    r.severity === "critical" ? "text-destructive" : "text-warning"
                  }`}
                >
                  {r.severity}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {new Date(r.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
          {activeRisks.length === 0 && (
            <div className="col-span-3 text-center py-8 text-muted-foreground border border-dashed rounded-lg">
              No active agricultural or climate risks detected.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
