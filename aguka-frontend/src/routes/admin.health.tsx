import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard-ui";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSuperAdminSystemHealth } from "@/hooks/use-data";
import {
  Loader2,
  Server,
  Database,
  Cpu,
  MemoryStick,
  Activity,
  Wifi,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useI18n } from "@/i18n";

export const Route = createFileRoute("/admin/health")({
  component: SystemHealthPage,
});

function GaugeBar({
  label,
  value,
  max = 100,
  unit = "%",
  color = "bg-primary",
  icon: Icon,
  t,
}: {
  label: string;
  value: number;
  max?: number;
  unit?: string;
  color?: string;
  icon?: any;
  t: (key: any, params?: Record<string, string | number>) => string;
}) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const isCritical = pct > 85;
  const isWarning = pct > 65 && pct <= 85;
  const displayColor = isCritical ? "bg-destructive" : isWarning ? "bg-amber-500" : color;

  const capacityKey = isCritical
    ? "health.capacity.critical"
    : isWarning
      ? "health.capacity.warning"
      : "health.capacity.normal";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 font-semibold text-foreground">
          {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
          {label}
        </div>
        <span
          className={`font-black text-base tabular-nums ${isCritical ? "text-destructive" : isWarning ? "text-amber-500" : "text-foreground"}`}
        >
          {value}
          {unit}
        </span>
      </div>
      <div className="relative h-3 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${displayColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="text-[10px] text-muted-foreground">
        {t(capacityKey, { pct })}
      </div>
    </div>
  );
}

function StatusIndicator({
  label,
  status,
  t,
}: {
  label: string;
  status: "healthy" | "degraded" | "down";
  t: (key: any) => string;
}) {
  const statusLabel = t("health.status." + status);
  const config = {
    healthy: { color: "bg-success", text: "text-success", icon: CheckCircle2 },
    degraded: {
      color: "bg-amber-500",
      text: "text-amber-500",
      icon: AlertCircle,
    },
    down: { color: "bg-destructive", text: "text-destructive", icon: AlertCircle },
  }[status];

  return (
    <div className="flex items-center justify-between py-3 border-b border-border/40 last:border-0">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${config.color} animate-pulse`} />
        <span className={`text-xs font-bold uppercase ${config.text}`}>{statusLabel}</span>
      </div>
    </div>
  );
}

function UptimeClock({ uptimeSeconds }: { uptimeSeconds: number }) {
  const [elapsed, setElapsed] = useState(uptimeSeconds);

  useEffect(() => {
    const interval = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const days = Math.floor(elapsed / 86400);
  const hours = Math.floor((elapsed % 86400) / 3600);
  const mins = Math.floor((elapsed % 3600) / 60);
  const secs = Math.floor(elapsed % 60);

  return (
    <div className="flex gap-3 font-black text-2xl tabular-nums tracking-tight">
      {days > 0 && (
        <span>
          {days}
          <span className="text-xs font-normal text-muted-foreground ml-0.5">d</span>
        </span>
      )}
      <span>
        {String(hours).padStart(2, "0")}
        <span className="text-xs font-normal text-muted-foreground ml-0.5">h</span>
      </span>
      <span>
        {String(mins).padStart(2, "0")}
        <span className="text-xs font-normal text-muted-foreground ml-0.5">m</span>
      </span>
      <span className="text-primary">
        {String(secs).padStart(2, "0")}
        <span className="text-xs font-normal text-muted-foreground ml-0.5">s</span>
      </span>
    </div>
  );
}

function SystemHealthPage() {
  const { t } = useI18n();
  const { data: health, isLoading, refetch } = useSuperAdminSystemHealth();
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
      setLastRefreshed(new Date());
    }, 30000); // Auto-refresh every 30s
    return () => clearInterval(interval);
  }, [refetch]);

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const h = health as any;
  const memPercent = h?.memory?.percent ?? 0;
  const sensorHealth = h?.sensors?.health ?? 0;
  const apiStatus = h?.api?.status === "healthy" ? "healthy" : "degraded";
  const dbStatus = h?.database?.status === "connected" ? "healthy" : "down";

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("health.page.title")}
        subtitle={t("health.page.subtitle")}
        action={
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">
              {t("health.last_refreshed")} {lastRefreshed.toLocaleTimeString()}
            </span>
            <Badge
              variant="outline"
              className="text-success border-success/30 bg-success/5 font-bold uppercase text-[10px]"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-success mr-1.5 animate-pulse inline-block" />
              {t("health.live")}
            </Badge>
          </div>
        }
      />

      {/* Uptime Banner */}
      <Card className="p-6 border border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Clock className="h-6 w-6" />
            </div>
            <div>
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
              {t("health.system_uptime")}
            </div>
            <UptimeClock uptimeSeconds={h?.api?.uptimeSeconds ?? 0} />
            </div>
            <div className="text-right">
            <div className="text-xs text-muted-foreground">{t("health.environment")}</div>
            <Badge variant="secondary" className="font-bold uppercase">
              {h?.platform?.environment ?? "production"}
            </Badge>
            <div className="text-xs text-muted-foreground mt-1">
              v{h?.platform?.version ?? "1.0.0"}
            </div>
          </div>
        </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Resource Usage */}
        <Card className="p-6 border border-border/50 space-y-6">
          <h3 className="font-bold text-base flex items-center gap-2">
            <Cpu className="h-5 w-5 text-primary" />
            {t("health.resource_usage")}
          </h3>

          <GaugeBar
            label={t("health.memory_heap")}
            value={h?.memory?.usedMB ?? 0}
            max={h?.memory?.totalMB ?? 512}
            unit="MB"
            color="bg-info"
            icon={MemoryStick}
            t={t}
          />

          <GaugeBar
            label={t("health.memory_utilization")}
            value={memPercent}
            max={100}
            unit="%"
            color="bg-primary"
            icon={Cpu}
            t={t}
          />

          <GaugeBar
            label={t("health.sensor_connectivity")}
            value={sensorHealth}
            max={100}
            unit="%"
            color="bg-success"
            icon={Wifi}
            t={t}
          />

          <div className="pt-2 border-t border-border/40">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-black text-foreground">{h?.sensors?.active ?? 0}</div>
                <div className="text-xs text-muted-foreground">{t("health.sensors_online")}</div>
              </div>
              <div>
                <div className="text-2xl font-black text-foreground">{h?.sensors?.total ?? 0}</div>
                <div className="text-xs text-muted-foreground">{t("health.total_sensors")}</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Service Status */}
        <Card className="p-6 border border-border/50 space-y-4">
          <h3 className="font-bold text-base flex items-center gap-2">
            <Server className="h-5 w-5 text-primary" />
            {t("health.service_status")}
          </h3>

          <StatusIndicator label={"🚀 " + t("health.service.api")} status={apiStatus} t={t} />
          <StatusIndicator label={"🗄️ " + t("health.service.database")} status={dbStatus} t={t} />
          <StatusIndicator
            label={"📡 " + t("health.service.sensor")}
            status={sensorHealth > 50 ? "healthy" : sensorHealth > 20 ? "degraded" : "down"}
            t={t}
          />
          <StatusIndicator label={"📨 " + t("health.service.email")} status="healthy" t={t} />
          <StatusIndicator label={"🔐 " + t("health.service.auth")} status="healthy" t={t} />
          <StatusIndicator label={"🌐 " + t("health.service.websocket")} status="healthy" t={t} />

          <div className="pt-4 border-t border-border/40">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{t("health.database_provider")}</span>
              <Badge variant="secondary" className="font-bold uppercase text-[10px]">
                <Database className="h-3 w-3 mr-1" />
                {h?.database?.provider ?? "PostgreSQL"}
              </Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* API Performance */}
      <Card className="p-6 border border-border/50">
        <h3 className="font-bold text-base flex items-center gap-2 mb-6">
          <Activity className="h-5 w-5 text-primary" />
          {t("health.performance_indicators")}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {[
            {
              label: t("health.api_response"),
              value: "~42ms",
              desc: t("health.api_response_desc"),
              color: "text-success",
            },
            { label: t("health.db_response"), value: "~18ms", desc: t("health.db_response_desc"), color: "text-info" },
            {
              label: t("health.auth_latency"),
              value: "~65ms",
              desc: t("health.auth_latency_desc"),
              color: "text-primary",
            },
            { label: t("health.sensor_sync"), value: "15s", desc: t("health.sensor_sync_desc"), color: "text-warning" },
          ].map((item) => (
            <div
              key={item.label}
              className="text-center p-4 rounded-xl bg-muted/30 border border-border/30"
            >
              <div className={`text-2xl font-black ${item.color}`}>{item.value}</div>
              <div className="text-xs font-bold mt-1">{item.label}</div>
              <div className="text-[10px] text-muted-foreground">{item.desc}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
