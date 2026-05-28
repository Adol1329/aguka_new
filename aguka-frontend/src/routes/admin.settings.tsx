import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard-ui";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, Shield, FileText, Database, Save, Loader2, RotateCcw, Info } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { settingsApi, type AdminSystemSettings } from "@/api/settings";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettings,
});

const DEFAULTS: AdminSystemSettings = {
  smsEnabled: true,
  pushEnabled: true,
  emailEnabled: true,
  weeklySummaryEnabled: true,
  securityLogAlertsEnabled: false,
  cooperativeRegistrationAlertsEnabled: true,
  requireGpsVerification: true,
  autoApproveSmallHarvests: false,
  moistureThreshold: 30,
  yieldBoundary: 60,
  financialVariance: 15,
  realTimeWeatherSyncEnabled: true,
  marketPriceSyncEnabled: true,
  autoReportFrequency: "weekly",
  reportRecipients: "admin@aguka.rw",
};

const parseSettingValue = <T,>(value: unknown, fallback: T): T => {
  if (value === undefined || value === null) return fallback;
  if (typeof value !== "string") return value as T;

  try {
    return JSON.parse(value) as T;
  } catch {
    return value as T;
  }
};

function TooltipHint({ text }: { text: string }) {
  const [show, setShow] = useState(false);
  return (
    <span
      className="relative inline-block cursor-pointer text-muted-foreground"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <Info className="h-3.5 w-3.5" />
      {show && (
        <span className="absolute left-5 top-0 z-50 w-52 rounded-md bg-foreground px-3 py-2 text-[11px] leading-snug text-background shadow-lg">
          {text}
        </span>
      )}
    </span>
  );
}

function AdminSettings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [settings, setSettings] = useState<AdminSystemSettings>({ ...DEFAULTS });

  useEffect(() => {
    let mounted = true;

    settingsApi
      .getSettings()
      .then((response) => {
        if (!mounted) return;
        const rows = response.data || {};
        const nextSettings = Object.fromEntries(
          Object.entries(DEFAULTS).map(([key, fallback]) => [
            key,
            parseSettingValue(rows[key], fallback),
          ]),
        ) as unknown as AdminSystemSettings;
        setSettings(nextSettings);
      })
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : "Failed to load settings");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const updateSetting = <K extends keyof AdminSystemSettings>(
    key: K,
    value: AdminSystemSettings[K],
  ) => setSettings((current) => ({ ...current, [key]: value }));

  const handleSave = () => setShowConfirm(true);

  const confirmSave = async () => {
    setShowConfirm(false);
    setSaving(true);
    try {
      await settingsApi.updateSettings(settings);
      setLastSaved(new Date());
      toast.success("System configurations updated successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSettings({ ...DEFAULTS });
    toast.info("Settings reset locally. Save changes to persist defaults.");
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="System Configuration"
          subtitle="Define reporting standards and notification logic."
        />
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset to Defaults
          </Button>
          <Button onClick={handleSave} disabled={saving} className="shadow-lg shadow-primary/20">
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Configure how the system communicates with administrators.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "Critical sensor alerts via SMS", key: "smsEnabled" },
                { label: "Push notifications", key: "pushEnabled" },
                { label: "Email notifications", key: "emailEnabled" },
                { label: "Weekly regional performance summary", key: "weeklySummaryEnabled" },
                { label: "Security & access logs notifications", key: "securityLogAlertsEnabled" },
                {
                  label: "New cooperative registration alerts",
                  key: "cooperativeRegistrationAlertsEnabled",
                },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between border-b border-border/50 pb-4 last:border-0 last:pb-0"
                >
                  <div className="text-sm font-medium">{item.label}</div>
                  <Switch
                    checked={Boolean(settings[item.key as keyof AdminSystemSettings])}
                    onCheckedChange={(checked) =>
                      updateSetting(item.key as keyof AdminSystemSettings, checked as never)
                    }
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-success" />
                Data Validation Standards
              </CardTitle>
              <CardDescription>Enforce rules for farm data verification.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Require GPS verification for new farms</div>
                <Switch
                  checked={settings.requireGpsVerification}
                  onCheckedChange={(checked) => updateSetting("requireGpsVerification", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Auto-approve harvest records under 5 Tons</div>
                <Switch
                  checked={settings.autoApproveSmallHarvests}
                  onCheckedChange={(checked) => updateSetting("autoApproveSmallHarvests", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-info" />
                Reporting Thresholds
              </CardTitle>
              <CardDescription>Define the logic for attention-required flags.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <NumberSetting
                label="Soil Moisture Low Threshold (%)"
                value={settings.moistureThreshold}
                tooltip="When soil moisture falls below this %, a drought risk alert is triggered for affected farms."
                help="Triggers drought risk alert."
                onChange={(value) => updateSetting("moistureThreshold", value)}
              />
              <NumberSetting
                label="Yield Score Warning Boundary"
                value={settings.yieldBoundary}
                tooltip="Farmers with a yield score below this value are flagged as needs support across dashboards."
                help="Flags farmer as needs support."
                onChange={(value) => updateSetting("yieldBoundary", value)}
              />
              <NumberSetting
                label="Financial Variance Tolerance (%)"
                value={settings.financialVariance}
                tooltip="Market price deviations above this % trigger financial risk alerts for cooperative managers."
                help="Alerts on market price deviations."
                onChange={(value) => updateSetting("financialVariance", value)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Reporting Delivery
              </CardTitle>
              <CardDescription>Persist automatic report schedule and recipients.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                  Auto-report frequency
                </label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={settings.autoReportFrequency}
                  onChange={(e) => updateSetting("autoReportFrequency", e.target.value)}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                  Report recipients
                </label>
                <Input
                  value={settings.reportRecipients}
                  onChange={(e) => updateSetting("reportRecipients", e.target.value)}
                  placeholder="admin@aguka.rw, operations@aguka.rw"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-amber-500" />
                Integration Sync
              </CardTitle>
              <CardDescription>Configure external data source frequency.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-sm font-medium">
                  Real-time Weather (Every 15 mins)
                  <TooltipHint text="Pulls temperature, rainfall, and humidity from REMA weather stations every 15 minutes." />
                </div>
                <Switch
                  checked={settings.realTimeWeatherSyncEnabled}
                  onCheckedChange={(checked) =>
                    updateSetting("realTimeWeatherSyncEnabled", checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-sm font-medium">
                  Market Price Sync (Daily 8:00 AM)
                  <TooltipHint text="Fetches crop prices from RAB and NAEB market databases every morning at 08:00." />
                </div>
                <Switch
                  checked={settings.marketPriceSyncEnabled}
                  onCheckedChange={(checked) => updateSetting("marketPriceSyncEnabled", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="border-t border-border/40 pt-4 text-xs text-muted-foreground">
        {lastSaved ? (
          <>
            Last saved by <span className="font-bold text-foreground">{user?.name || "Admin"}</span>{" "}
            at {lastSaved.toLocaleString()}
          </>
        ) : (
          "No changes saved in this session."
        )}
      </div>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-warning" />
              Confirm Configuration Change
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to save these changes? This will affect alert thresholds,
              reporting, and notification behavior across the system.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowConfirm(false)}>
              Cancel
            </Button>
            <Button onClick={confirmSave} disabled={saving}>
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Yes, Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function NumberSetting({
  label,
  value,
  tooltip,
  help,
  onChange,
}: {
  label: string;
  value: number;
  tooltip: string;
  help: string;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-muted-foreground">
        {label}
        <TooltipHint text={tooltip} />
      </label>
      <div className="flex items-center gap-4">
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-24 font-bold"
        />
        <span className="text-xs italic text-muted-foreground">{help}</span>
      </div>
    </div>
  );
}
