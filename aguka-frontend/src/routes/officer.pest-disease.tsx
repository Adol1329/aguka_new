import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard-ui";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAssignedFarmers } from "@/hooks/use-data";
import {
  useCreatePestDiseaseAlert,
  usePestDiseaseAlerts,
  useUpdatePestDiseaseAlert,
} from "@/hooks/use-pest-disease";
import {
  AlertTriangle,
  Bell,
  Bug,
  Check,
  ImagePlus,
  Leaf,
  Loader2,
  Plus,
  Search,
  X,
  ChevronsUpDown,
} from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { FormEvent, useMemo, useState } from "react";

export const Route = createFileRoute("/officer/pest-disease")({
  component: PestDiseasePage,
});

type FarmerOption = {
  id: string;
  fullName?: string | null;
  farmName?: string | null;
  district?: string | null;
  sector?: string | null;
  user?: { phone?: string | null };
};

type PestAlert = {
  id: string;
  alertType: "pest" | "disease";
  severity: "info" | "warning" | "critical";
  title: string;
  message: string;
  recommendation?: string | null;
  isRead?: boolean;
  createdAt: string;
  farmer?: {
    fullName?: string | null;
    district?: string | null;
    sector?: string | null;
    user?: { phone?: string | null; fullName?: string | null };
  };
};

const severityConfig = {
  info: { dot: "bg-blue-500", chip: "bg-blue-100 text-blue-700", label: "Info" },
  warning: { dot: "bg-amber-500", chip: "bg-amber-100 text-amber-700", label: "Warning" },
  critical: { dot: "bg-red-500", chip: "bg-red-100 text-red-700", label: "Critical" },
};

function PestDiseasePage() {
  const { data: alertsData, isLoading } = usePestDiseaseAlerts({ limit: 50 });
  const { data: farmers } = useAssignedFarmers({ page: 1, limit: 100 });
  const createAlertMutation = useCreatePestDiseaseAlert();
  const updateAlertMutation = useUpdatePestDiseaseAlert();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [farmerSearch, setFarmerSearch] = useState("");
  const [photoName, setPhotoName] = useState("");
  const [openFarmerSelect, setOpenFarmerSelect] = useState(false);
  const [formData, setFormData] = useState({
    farmerId: "",
    alertType: "pest" as "pest" | "disease",
    severity: "warning" as "info" | "warning" | "critical",
    title: "",
    message: "",
    recommendation: "",
  });

  const alerts = (alertsData || []) as PestAlert[];
  const farmerList = useMemo(() => (farmers?.data || []) as FarmerOption[], [farmers?.data]);
  const filteredFarmers = useMemo(() => {
    const q = farmerSearch.trim().toLowerCase();
    if (!q) return farmerList;
    return farmerList.filter((farmer) =>
      [farmer.fullName, farmer.farmName, farmer.district, farmer.sector, farmer.user?.phone]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q)),
    );
  }, [farmerList, farmerSearch]);

  const resetForm = () => {
    setFormData({
      farmerId: "",
      alertType: "pest",
      severity: "warning",
      title: "",
      message: "",
      recommendation: "",
    });
    setPhotoName("");
    setFarmerSearch("");
  };

  const handleCreateAlert = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.farmerId) {
      toast.error("Please select a farmer from the list.");
      return;
    }
    await createAlertMutation.mutateAsync(formData);
    setShowCreateForm(false);
    resetForm();
  };

  const handleMarkAsRead = async (alertId: string) => {
    await updateAlertMutation.mutateAsync({ alertId, data: { isRead: true } });
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
        title="Pest & Disease Monitoring"
        subtitle="Track and manage threats to crops in your assigned farms."
        action={
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Alert
          </Button>
        }
      />

      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">Active Alerts</h2>
            <p className="text-sm text-muted-foreground">Visible before creating a new alert.</p>
          </div>
          <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold">
            {alerts.filter((alert) => !alert.isRead).length} active
          </span>
        </div>
        {alerts.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {alerts.map((alert) => {
              const Icon = alert.alertType === "pest" ? Bug : Leaf;
              const severity = severityConfig[alert.severity] || severityConfig.info;
              const farmerName =
                alert.farmer?.fullName ||
                alert.farmer?.user?.fullName ||
                alert.farmer?.user?.phone ||
                "Unknown farmer";
              return (
                <div key={alert.id} className="rounded-lg border bg-muted/20 p-4">
                  <div className="flex items-start gap-3">
                    <div className={`rounded-lg p-2 ${severity.chip}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-semibold">{alert.title}</div>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${severity.chip}`}
                        >
                          {severity.label}
                        </span>
                      </div>
                      <div className="mt-1 text-xs uppercase text-muted-foreground">
                        {alert.alertType} · {farmerName}
                      </div>
                      <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                        {alert.message}
                      </p>
                      <div className="mt-3 flex items-center justify-between gap-2 text-[10px] uppercase text-muted-foreground">
                        <span>{new Date(alert.createdAt).toLocaleDateString()}</span>
                        {!alert.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onClick={() => handleMarkAsRead(alert.id)}
                          >
                            <Check className="mr-1 h-3 w-3" />
                            Resolve
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-12 text-center">
            <Bell className="mb-3 h-10 w-10 text-muted-foreground opacity-40" />
            <h3 className="text-sm font-semibold">No pest or disease alerts reported</h3>
            <p className="mt-1 max-w-sm text-xs text-muted-foreground">
              Create an alert when you detect field evidence from an assigned farm.
            </p>
            <Button className="mt-4" onClick={() => setShowCreateForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Alert
            </Button>
          </div>
        )}
      </Card>

      {showCreateForm && (
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Create New Alert</h3>
            <Button variant="ghost" size="sm" onClick={() => setShowCreateForm(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <form onSubmit={handleCreateAlert} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Farmer</label>
              <Popover open={openFarmerSelect} onOpenChange={setOpenFarmerSelect}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openFarmerSelect}
                    className={cn(
                      "w-full justify-between font-normal",
                      !formData.farmerId && "text-muted-foreground"
                    )}
                  >
                    {formData.farmerId
                      ? (function () {
                          const farmer = farmerList.find((f) => f.id === formData.farmerId);
                          return farmer
                            ? `${farmer.fullName || farmer.user?.phone || "Unknown farmer"} · ${
                                farmer.district || "Unknown district"
                              }`
                            : "Select a farmer...";
                        })()
                      : "Select a farmer..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search name, phone, district..." />
                    <CommandList>
                      <CommandEmpty>No farmer found.</CommandEmpty>
                      <CommandGroup>
                        {farmerList.map((farmer) => (
                          <CommandItem
                            key={farmer.id}
                            value={`${farmer.fullName} ${farmer.user?.phone} ${farmer.district} ${farmer.id}`}
                            onSelect={() => {
                              setFormData({ ...formData, farmerId: farmer.id });
                              setOpenFarmerSelect(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.farmerId === farmer.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {farmer.fullName || farmer.user?.phone || "Unknown farmer"} ·{" "}
                            {farmer.district || "Unknown district"}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {/* Removed hidden required input to prevent silent validation failures */}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Alert Type</label>
                <select
                  value={formData.alertType}
                  onChange={(e) =>
                    setFormData({ ...formData, alertType: e.target.value as "pest" | "disease" })
                  }
                  className="w-full rounded-md border border-input bg-background px-4 py-2"
                >
                  <option value="pest">Pest Infestation</option>
                  <option value="disease">Disease Outbreak</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Severity</label>
                <select
                  value={formData.severity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      severity: e.target.value as "info" | "warning" | "critical",
                    })
                  }
                  className="w-full rounded-md border border-input bg-background px-4 py-2"
                >
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="critical">Critical</option>
                </select>
                <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${severityConfig[formData.severity].dot}`}
                  />
                  {severityConfig[formData.severity].label}
                </div>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Title</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Fall armyworm detected in Northern Zone"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Description</label>
              <Textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={3}
                placeholder="Describe the pest/disease, affected crops, severity level..."
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Recommendation (Optional)</label>
              <Textarea
                value={formData.recommendation}
                onChange={(e) => setFormData({ ...formData, recommendation: e.target.value })}
                rows={2}
                placeholder="e.g. Apply recommended pesticide, isolate affected plants..."
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Field Photo</label>
              <label className="flex cursor-pointer items-center justify-center rounded-lg border border-dashed p-4 text-sm text-muted-foreground hover:bg-muted/30">
                <ImagePlus className="mr-2 h-4 w-4" />
                {photoName || "Attach pest or disease photo"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setPhotoName(e.target.files?.[0]?.name || "")}
                />
              </label>
            </div>

            <div className="sticky bottom-0 -mx-6 flex justify-end gap-3 border-t bg-background/95 px-6 py-4 backdrop-blur">
              <Button variant="ghost" type="button" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createAlertMutation.isPending}
                className="bg-gradient-hero"
              >
                {createAlertMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                Create Alert
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}
