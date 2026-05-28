import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard-ui";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useSuperAdminSettings, useUpdateSuperAdminSetting, useSuperAdminSystemHealth } from "@/hooks/use-data";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/super-admin/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { data: settingsData, isLoading: loadingSettings } = useSuperAdminSettings();
  const { data: healthData, isLoading: loadingHealth } = useSuperAdminSystemHealth();
  const updateSetting = useUpdateSuperAdminSetting();

  const settings = settingsData?.data || {};
  const health = healthData;

  const [moistureLow, setMoistureLow] = useState(String(settings["soil.moisture.low"] || "25"));
  const [moistureHigh, setMoistureHigh] = useState(String(settings["soil.moisture.high"] || "75"));
  const [rainfallAlert, setRainfallAlert] = useState(String(settings["weather.rainfall.alert"] || "40"));
  const [pushEnabled, setPushEnabled] = useState(settings["notifications.push"] === "true");
  const [smsEnabled, setSmsEnabled] = useState(settings["notifications.sms"] === "true");
  const [emailEnabled, setEmailEnabled] = useState(settings["notifications.email"] === "true");

  const handleSaveThreshold = (key: string, value: string) => {
    updateSetting.mutate({ key, value }, {
      onSuccess: () => toast.success("Setting saved"),
      onError: () => toast.error("Failed to save setting"),
    });
  };

  const handleToggleNotification = (key: string, value: boolean) => {
    updateSetting.mutate({ key, value: String(value) }, {
      onSuccess: () => toast.success("Notification setting updated"),
      onError: () => toast.error("Failed to update setting"),
    });
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
              onBlur={() => handleSaveThreshold("soil.moisture.low", moistureLow)}
            />
          </div>
          <div className="space-y-2">
            <Label>Soil moisture (high %)</Label>
            <Input
              value={moistureHigh}
              type="number"
              onChange={(e) => setMoistureHigh(e.target.value)}
              onBlur={() => handleSaveThreshold("soil.moisture.high", moistureHigh)}
            />
          </div>
          <div className="space-y-2">
            <Label>Rainfall alert (mm/24h)</Label>
            <Input
              value={rainfallAlert}
              type="number"
              onChange={(e) => setRainfallAlert(e.target.value)}
              onBlur={() => handleSaveThreshold("weather.rainfall.alert", rainfallAlert)}
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
            <Switch checked={pushEnabled} onCheckedChange={(v) => { setPushEnabled(v); handleToggleNotification("notifications.push", v); }} />
          </div>
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <div className="font-medium text-sm">SMS alerts</div>
              <div className="text-xs text-muted-foreground">For basic phones via USSD</div>
            </div>
            <Switch checked={smsEnabled} onCheckedChange={(v) => { setSmsEnabled(v); handleToggleNotification("notifications.sms", v); }} />
          </div>
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <div className="font-medium text-sm">Email digest</div>
              <div className="text-xs text-muted-foreground">Daily summary email</div>
            </div>
            <Switch checked={emailEnabled} onCheckedChange={(v) => { setEmailEnabled(v); handleToggleNotification("notifications.email", v); }} />
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
                <div className="text-xs text-muted-foreground mt-1">Uptime: {health.api.uptime}</div>
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
                <div className="text-xs text-muted-foreground mt-1">{health.sensors.active}/{health.sensors.total} active</div>
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
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  i.status === "Connected" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                }`}>
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
