import { PageHeader, StatCard } from "@/components/dashboard-ui";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Shield, Activity, Server, Loader2 } from "lucide-react";
import {
  useSuperAdminDashboard,
  useSuperAdminAuditLogs,
  useSuperAdminSystemHealth,
} from "@/hooks/use-data";
import { useNavigate } from "@tanstack/react-router";
import { useI18n } from "@/i18n";

export function SuperAdminDashboardComponent() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { data: dashboard, isLoading: loadingDashboard } = useSuperAdminDashboard();
  const { data: auditData, isLoading: loadingAudit } = useSuperAdminAuditLogs({
    page: 1,
    limit: 6,
  });
  const { data: health, isLoading: loadingHealth } = useSuperAdminSystemHealth();

  const isLoading = loadingDashboard || loadingAudit || loadingHealth;

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const logList = auditData?.data || [];
  const stats = dashboard;
  const systemHealth = health;

  const roleStats = [
    { role: "farmer", label: t("role.farmer"), color: "bg-success" },
    { role: "officer", label: t("role.officer"), color: "bg-info" },
    { role: "cooperative", label: t("role.cooperative"), color: "bg-primary" },
    { role: "admin", label: t("role.admin"), color: "bg-warning" },
    { role: "super_admin", label: t("role.super_admin"), color: "bg-destructive" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("super_admin.console.title")}
        subtitle={t("super_admin.console.subtitle")}
        action={
          <Button
            className="bg-gradient-hero"
            onClick={() => navigate({ to: "/super-admin/health" })}
          >
            <Activity className="mr-2 h-4 w-4" />
            {t("super_admin.system_health")}
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={t("super_admin.total_users")}
          value={stats?.totalUsers || 0}
          icon={Users}
          accent="primary"
          trend={`${stats?.totalFarmers || 0} ${t("common.farmers")}`}
          trendUp
        />
        <StatCard
          label={t("super_admin.sensors_active")}
          value={`${stats?.sensorUptime || 0}%`}
          icon={Activity}
          accent="success"
          trend={`${stats?.activeSensors || 0}/${stats?.totalSensors || 0} ${t("common.online")}`}
        />
        <StatCard
          label={t("super_admin.system_uptime")}
          value={systemHealth?.api.uptime || "N/A"}
          icon={Server}
          accent="info"
          trend={systemHealth?.api.status || "N/A"}
        />
        <StatCard
          label={t("super_admin.cooperatives")}
          value={stats?.totalCoops || 0}
          icon={Shield}
          accent="warning"
          trend={`${stats?.totalCrops || 0} ${t("common.crop_types")}`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold flex items-center gap-2">
              {t("super_admin.recent_audit_logs")}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate({ to: "/super-admin/audit" })}
            >
              {t("common.viewall")}
            </Button>
          </div>
          <div className="space-y-3">
            {logList.map((log: any) => (
              <div
                key={log.id}
                className="flex items-start gap-3 rounded-lg border border-border/50 p-3 hover:bg-muted/40 transition-colors"
              >
                <div
                  className={`mt-1 h-2 w-2 rounded-full ${
                    log.action.includes("DELETE")
                      ? "bg-destructive"
                      : log.action.includes("CREATE")
                        ? "bg-success"
                        : "bg-info"
                  }`}
                />
                <div className="flex-1">
                  <div className="text-sm">
                    <span className="font-medium">{log.user?.phone || "System"}</span>{" "}
                    <span className="text-muted-foreground">{log.action}</span>{" "}
                    <span className="font-medium">{log.module}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(log.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
            {logList.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">{t("super_admin.no_audit_records")}</div>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="mb-4 font-display text-lg font-semibold flex items-center gap-2">
            {t("super_admin.role_distribution")}
          </h3>
          <div className="space-y-4">
            {roleStats.map((r) => {
              const usersByRole =
                stats?.recentUsers?.filter((u: any) => u.role === r.role).length || 0;
              const totalUsers = stats?.totalUsers || 1;
              const pct = Math.round((usersByRole / totalUsers) * 100);
              return (
                <div key={r.role}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="font-medium">{r.label}</span>
                    <span className="text-muted-foreground">{usersByRole}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div
                      className={`h-2 rounded-full ${r.color}`}
                      style={{ width: `${Math.max(pct, usersByRole > 0 ? 5 : 0)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="mb-4 font-display text-lg font-semibold">{t("super_admin.recently_registered")}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b">
                <th className="pb-3">{t("super_admin.phone")}</th>
                <th className="pb-3">{t("super_admin.role_heading")}</th>
                <th className="pb-3">{t("super_admin.joined_at")}</th>
              </tr>
            </thead>
            <tbody>
              {(stats?.recentUsers || []).map((u: any) => (
                <tr key={u.id} className="border-b border-border/30 last:border-0">
                  <td className="py-3 font-medium">{u.phone}</td>
                  <td className="py-3">
                    <span className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                      {t(("role." + u.role) as any)}
                    </span>
                  </td>
                  <td className="py-3 text-muted-foreground">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
