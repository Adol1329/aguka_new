import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard-ui";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  useSuperAdminSettings,
  useUpdateSuperAdminSetting,
  useSuperAdminSystemHealth,
  useFeatureFlags,
  useUpdateFeatureFlags,
} from "@/hooks/use-data";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2, Flag } from "lucide-react";

export const Route = createFileRoute("/super-admin/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { data: settingsData, isLoading: loadingSettings } = useSuperAdminSettings();
  const { data: healthData, isLoading: loadingHealth } = useSuperAdminSystemHealth();
  const updateSetting = useUpdateSuperAdminSetting();

  const settings = (settingsData?.data || {}) as Record<string, string>;
  const health = healthData;

  const [moistureLow, setMoistureLow] = useState(String(settings["moistureThreshold"] || "25"));
  const [moistureHigh, setMoistureHigh] = useState(
    String(settings["moistureMaxThreshold"] || "75"),
  );
  const [rainfallAlert, setRainfallAlert] = useState(String(settings["rainThreshold"] || "40"));
  const [pushEnabled, setPushEnabled] = useState(settings["notifications.push"] === "true");
  const [smsEnabled, setSmsEnabled] = useState(settings["notifications.sms"] === "true");
  const [emailEnabled, setEmailEnabled] = useState(settings["notifications.email"] === "true");
  const [backupSchedule, setBackupSchedule] = useState(settings["backup_schedule"] || "0 0 * * *");
  const { data: flags, isLoading: loadingFlags } = useFeatureFlags();
  const updateFlags = useUpdateFeatureFlags();
  const [localFlags, setLocalFlags] = useState<Array<{ key: string; enabled: boolean }> | null>(
    null,
  );
  useEffect(() => {
    if (flags && !localFlags)
      setLocalFlags(flags.map((f: any) => ({ key: f.key, enabled: f.enabled })));
  }, [flags]);

  const handleSaveThreshold = (key: string, value: string) => {
    updateSetting.mutate(
      { key, value },
      {
        onSuccess: () => toast.success("Setting saved"),
        onError: () => toast.error("Failed to save setting"),
      },
    );
  };

  const handleToggleNotification = (key: string, value: boolean) => {
    updateSetting.mutate(
      { key, value: String(value) },
      {
        onSuccess: () => toast.success("Notification setting updated"),
        onError: () => toast.error("Failed to update setting"),
      },
    );
  };

  if (loadingSettings || loadingHealth) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Settings"
        subtitle="Configure thresholds, integrations and notification rules."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6 space-y-4">
          <h3 className="font-display text-lg font-semibold">Alert thresholds</h3>
          <div className="space-y-2">
            <Label>Soil moisture (low %)</Label>
            <Input
              value={moistureLow}
              type="number"
              onChange={(e) => setMoistureLow(e.target.value)}
              onBlur={() => handleSaveThreshold("moistureThreshold", moistureLow)}
            />
          </div>
          <div className="space-y-2">
            <Label>Soil moisture (high %)</Label>
            <Input
              value={moistureHigh}
              type="number"
              onChange={(e) => setMoistureHigh(e.target.value)}
              onBlur={() => handleSaveThreshold("moistureMaxThreshold", moistureHigh)}
            />
          </div>
          <div className="space-y-2">
            <Label>Rainfall alert (mm/24h)</Label>
            <Input
              value={rainfallAlert}
              type="number"
              onChange={(e) => setRainfallAlert(e.target.value)}
              onBlur={() => handleSaveThreshold("rainThreshold", rainfallAlert)}
            />
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="font-display text-lg font-semibold">Notifications</h3>
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <div className="font-medium text-sm">Push notifications</div>
              <div className="text-xs text-muted-foreground">Mobile app push alerts</div>
            </div>
            <Switch
              checked={pushEnabled}
              onCheckedChange={(v) => {
                setPushEnabled(v);
                handleToggleNotification("notifications.push", v);
              }}
            />
          </div>
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <div className="font-medium text-sm">SMS alerts</div>
              <div className="text-xs text-muted-foreground">For basic phones via USSD</div>
            </div>
            <Switch
              checked={smsEnabled}
              onCheckedChange={(v) => {
                setSmsEnabled(v);
                handleToggleNotification("notifications.sms", v);
              }}
            />
          </div>
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <div className="font-medium text-sm">Email digest</div>
              <div className="text-xs text-muted-foreground">Daily summary email</div>
            </div>
            <Switch
              checked={emailEnabled}
              onCheckedChange={(v) => {
                setEmailEnabled(v);
                handleToggleNotification("notifications.email", v);
              }}
            />
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="font-display text-lg font-semibold">Maintenance</h3>
          <div className="space-y-2">
            <Label>Automated Backup Schedule (Cron)</Label>
            <Input
              value={backupSchedule}
              placeholder="0 0 * * *"
              onChange={(e) => setBackupSchedule(e.target.value)}
              onBlur={() => handleSaveThreshold("backup_schedule", backupSchedule)}
            />
            <p className="text-[10px] text-muted-foreground italic">
              Use standard cron syntax (e.g., "0 0 * * *" for daily at midnight).
            </p>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="font-display text-lg font-semibold">System status</h3>
          {health && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border p-3">
                <div className="text-xs text-muted-foreground">API</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="h-2 w-2 rounded-full bg-success" />
                  <span className="text-sm font-medium">{health.api.status}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Uptime: {health.api.uptime}
                </div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-xs text-muted-foreground">Database</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="h-2 w-2 rounded-full bg-success" />
                  <span className="text-sm font-medium">{health.database.status}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">{health.database.provider}</div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-xs text-muted-foreground">Sensors</div>
                <div className="text-sm font-medium mt-1">{health.sensors.health}% healthy</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {health.sensors.active}/{health.sensors.total} active
                </div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-xs text-muted-foreground">Memory</div>
                <div className="text-sm font-medium mt-1">{health.memory.usage}</div>
                <div className="text-xs text-muted-foreground mt-1">Node.js</div>
              </div>
            </div>
          )}
        </Card>

        <Card className="p-6 space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-semibold flex items-center gap-2">
              <Flag className="h-5 w-5 text-primary" />
              Feature Flags
            </h3>
            {localFlags && (
              <Button
                size="sm"
                onClick={() =>
                  updateFlags.mutate(localFlags, {
                    onSuccess: () => toast.success("Feature flags updated"),
                    onError: () => toast.error("Failed to update feature flags"),
                  })
                }
                disabled={updateFlags.isPending}
              >
                {updateFlags.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Flags
              </Button>
            )}
          </div>
          {loadingFlags ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(localFlags || []).map((flag) => (
                <div
                  key={flag.key}
                  className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/30 transition-colors"
                >
                  <div>
                    <div className="text-sm font-semibold">
                      {flag.key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {flags?.find((f: any) => f.key === flag.key)?.description || ""}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase ${flag.enabled ? "text-success" : "text-destructive"}`}
                    >
                      {flag.enabled ? "ON" : "OFF"}
                    </span>
                    <Switch
                      checked={flag.enabled}
                      onCheckedChange={(v) =>
                        setLocalFlags((prev) =>
                          (prev || []).map((f) => (f.key === flag.key ? { ...f, enabled: v } : f)),
                        )
                      }
                    />
                  </div>
                </div>
              ))}
              {(!localFlags || localFlags.length === 0) && (
                <div className="col-span-2 text-xs text-muted-foreground italic text-center py-4">
                  No feature flags configured
                </div>
              )}
            </div>
          )}
        </Card>

        <Card className="p-6 space-y-4 lg:col-span-2">
          <h3 className="font-display text-lg font-semibold">Integrations</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { name: "Rwanda Met Agency", status: "Pending" },
              { name: "Mobile money (MTN MoMo)", status: "Pending" },
              { name: "USSD Gateway (*321#)", status: "Pending" },
              { name: "RAB Extension Services", status: "Pending" },
            ].map((i) => (
              <div key={i.name} className="flex items-center justify-between rounded-lg border p-3">
                <div className="text-sm font-medium">{i.name}</div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    i.status === "Connected"
                      ? "bg-success/10 text-success"
                      : "bg-warning/10 text-warning"
                  }`}
                >
                  {i.status}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
