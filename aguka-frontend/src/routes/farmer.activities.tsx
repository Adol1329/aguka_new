import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard-ui";
import { Card } from "@/components/ui/card";
import {
  useActivities,
  useCreateActivity,
  useFarmerCrops,
  useActivityTypes,
} from "@/hooks/use-data";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Sprout,
  Beaker,
  Droplets,
  Bug,
  Scissors,
  SprayCan,
  Wheat,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { useTableSearch } from "@/hooks/use-table-search";
import { TableSearchBar } from "@/components/table-search-bar";
import { TablePagination } from "@/components/table-pagination";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/farmer/activities")({
  component: ActivitiesPage,
});

// Maps the icon identifier string served by /farmers/activity-types to the
// actual lucide component — new types just need a matching entry here.
const ICON_REGISTRY: Record<string, LucideIcon> = {
  Sprout,
  Beaker,
  Droplets,
  Bug,
  Scissors,
  SprayCan,
  Wheat,
};

function ActivitiesPage() {
  const [page, setPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const { data: activitiesData, isLoading } = useActivities({ page, limit: 10 });
  const { data: crops } = useFarmerCrops();
  const { data: activityTypes } = useActivityTypes();
  const createActivity = useCreateActivity();

  const activities = Array.isArray(activitiesData)
    ? activitiesData
    : (activitiesData as any)?.data || [];
  const pagination = (activitiesData as any)?.pagination;

  const typeFiltered = useMemo(
    () =>
      typeFilter === "all"
        ? activities
        : activities.filter((a: any) => a.activityType === typeFilter),
    [activities, typeFilter],
  );

  const {
    query,
    setQuery,
    filteredData: displayedActivities,
    reset,
  } = useTableSearch(typeFiltered, ["activityType", "notes", "description", "farmerCrop.crop.name"]);

  const [formData, setFormData] = useState({
    activityType: "",
    notes: "",
    activityDate: new Date().toISOString().split("T")[0],
    farmerCropId: "",
    quantity: "",
    unit: "",
    costRwf: "",
  });

  useEffect(() => {
    setPage(1);
  }, [query, typeFilter]);

  // Default the form's selected type to the first available one once loaded.
  useEffect(() => {
    if (activityTypes?.length && !formData.activityType) {
      setFormData((prev) => ({ ...prev, activityType: activityTypes[0].name }));
    }
  }, [activityTypes]);

  const selectedType = activityTypes?.find((t) => t.name === formData.activityType);
  const showQuantity = selectedType?.fields.includes("quantity") ?? true;
  const showUnit = selectedType?.fields.includes("unit") ?? true;
  const showCost = selectedType?.fields.includes("costRwf") ?? true;

  const iconFor = (activityType: string): LucideIcon => {
    const iconName = activityTypes?.find((t) => t.name === activityType)?.icon;
    return (iconName && ICON_REGISTRY[iconName]) || Sprout;
  };

  const handleCreate = async () => {
    if (!formData.activityType) {
      toast.error("Please select an activity type");
      return;
    }
    try {
      await createActivity.mutateAsync({
        activityType: formData.activityType,
        notes: formData.notes,
        activityDate: formData.activityDate,
        farmerCropId: formData.farmerCropId || undefined,
        quantity: showQuantity && formData.quantity ? parseFloat(formData.quantity) : undefined,
        unit: showUnit && formData.unit ? formData.unit : undefined,
        costRwf: showCost && formData.costRwf ? parseFloat(formData.costRwf) : undefined,
      });
      setIsDialogOpen(false);
      setFormData({
        activityType: activityTypes?.[0]?.name || "",
        notes: "",
        activityDate: new Date().toISOString().split("T")[0],
        farmerCropId: "",
        quantity: "",
        unit: "",
        costRwf: "",
      });
      toast.success("Activity logged successfully!");
    } catch (error) {
      toast.error("Failed to log activity");
    }
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
        title="Farm Activities"
        subtitle="Record what you do on the farm."
        action={
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-hero">
                <Plus className="mr-2 h-4 w-4" />
                Log activity
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Log Farm Activity</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="type">Activity Type</Label>
                  <Select
                    value={formData.activityType}
                    onValueChange={(v) => setFormData((prev) => ({ ...prev, activityType: v }))}
                  >
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {activityTypes?.map((t) => (
                        <SelectItem key={t.id} value={t.name}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="crop">Crop (Optional)</Label>
                  <Select
                    value={formData.farmerCropId}
                    onValueChange={(v) => setFormData((prev) => ({ ...prev, farmerCropId: v }))}
                  >
                    <SelectTrigger id="crop">
                      <SelectValue placeholder="Select crop" />
                    </SelectTrigger>
                    <SelectContent>
                      {crops?.map((c: any) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.crop?.nameEn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.activityDate}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, activityDate: e.target.value }))
                    }
                  />
                </div>
                {(showQuantity || showUnit) && (
                  <div className="grid grid-cols-2 gap-4">
                    {showQuantity && (
                      <div className="grid gap-2">
                        <Label htmlFor="quantity">Quantity</Label>
                        <Input
                          id="quantity"
                          type="number"
                          placeholder="0.00"
                          value={formData.quantity}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, quantity: e.target.value }))
                          }
                        />
                      </div>
                    )}
                    {showUnit && (
                      <div className="grid gap-2">
                        <Label htmlFor="unit">Unit</Label>
                        <Input
                          id="unit"
                          placeholder="kg, L, etc."
                          value={formData.unit}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, unit: e.target.value }))
                          }
                        />
                      </div>
                    )}
                  </div>
                )}
                {showCost && (
                  <div className="grid gap-2">
                    <Label htmlFor="cost">Cost (RWF)</Label>
                    <Input
                      id="cost"
                      type="number"
                      placeholder="0"
                      value={formData.costRwf}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, costRwf: e.target.value }))
                      }
                    />
                  </div>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Describe what you did..."
                    value={formData.notes}
                    onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  className="bg-gradient-hero"
                  onClick={handleCreate}
                  disabled={createActivity.isPending}
                >
                  {createActivity.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Activity
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />
      <Card className="p-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex-1">
            <TableSearchBar
              value={query}
              onChange={setQuery}
              onClear={reset}
              placeholder="Search activities..."
              resultsCount={displayedActivities.length}
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {activityTypes?.map((t) => (
                <SelectItem key={t.id} value={t.name}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-3">
          {displayedActivities?.map((a: any) => {
            const Icon = iconFor(a.activityType);
            return (
              <div
                key={a.id}
                className="flex items-start gap-4 rounded-lg border p-4 hover:bg-muted/30 transition-colors"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">
                    {a.activityType} {a.farmerCrop ? `· ${a.farmerCrop.crop.nameEn}` : ""}
                  </div>
                  <div className="text-sm text-muted-foreground">{a.notes || a.description}</div>
                  {(a.quantity || a.costRwf) && (
                    <div className="mt-2 flex gap-3 text-xs font-medium">
                      {a.quantity && (
                        <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-primary">
                          {a.quantity} {a.unit}
                        </span>
                      )}
                      {a.costRwf && (
                        <span className="flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-green-600">
                          {Number(a.costRwf).toLocaleString()} RWF
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(a.activityDate).toLocaleDateString()}
                </div>
              </div>
            );
          })}
          {displayedActivities?.length === 0 && (
            <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
              No activities found.
            </div>
          )}
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="mt-6">
            <TablePagination
              page={page}
              totalPages={pagination.totalPages}
              totalItems={pagination.total}
              itemsPerPage={10}
              onPageChange={setPage}
            />
          </div>
        )}
      </Card>
    </div>
  );
}
