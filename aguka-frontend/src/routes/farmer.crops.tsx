import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard-ui";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFarmerCrops, useCreateFarmerCrop, useCropTypes } from "@/hooks/use-data";
import { ApiError } from "@/api/client";
import { Plus, Calendar, Ruler, TrendingUp, Loader2, ArrowRight, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/farmer/crops")({
  component: CropsPage,
});

function calculateCropDetails(c: any) {
  const planted = new Date(c.plantedDate);
  const growingDays = c.crop?.growingPeriodDays || 90; // default 90 days
  const expectedHarvest = new Date(planted.getTime() + growingDays * 24 * 60 * 60 * 1000);
  const now = new Date();
  const daysToHarvest = Math.ceil(
    (expectedHarvest.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );

  let status = (c.status || "").toLowerCase();
  let badgeColor = "bg-background/80 text-foreground";

  if (status === "growing" || status === "planted") {
    if (daysToHarvest < 0) {
      status = "OVERDUE";
      badgeColor = "bg-destructive text-destructive-foreground";
    } else if (daysToHarvest <= 14) {
      status = "READY TO HARVEST";
      badgeColor = "bg-warning text-warning-foreground";
    } else {
      status = "GROWING";
      badgeColor = "bg-success text-success-foreground";
    }
  } else if (status === "failed") {
    status = "FAILED";
    badgeColor = "bg-destructive text-destructive-foreground";
  } else if (status === "dormant") {
    status = "DORMANT";
    badgeColor = "bg-muted text-muted-foreground";
  } else if (status === "harvested") {
    status = "HARVESTED";
    badgeColor = "bg-primary text-primary-foreground";
  } else {
    status = status.toUpperCase();
  }

  // Yield estimate
  const area = Number(c.plotSizeHectares) || 0;
  // If no explicit estimated yield, estimate 3000kg/ha
  const estYield = Number(c.estimatedYieldKg) > 0 ? Number(c.estimatedYieldKg) : area * 3000;

  return { expectedHarvest, daysToHarvest, status, badgeColor, estYield };
}

function CropsPage() {
  const { data: crops, isLoading } = useFarmerCrops();
  const { data: cropTypes } = useCropTypes();
  const createCrop = useCreateFarmerCrop();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newCrop, setNewCrop] = useState({
    cropId: "",
    plotSize: "",
    plantedDate: new Date().toISOString().split("T")[0],
  });

  // A crop already registered as growing/planted can't be added again —
  // matches the backend's duplicate-registration guard.
  const activeCropIds = new Set(
    (Array.isArray(crops) ? crops : [])
      .filter((c: any) => !["harvested", "failed"].includes((c.status || "").toLowerCase()))
      .map((c: any) => c.cropId),
  );
  const availableCropTypes = (cropTypes || []).filter((t) => !activeCropIds.has(t.id));

  const handleCreate = async () => {
    if (!newCrop.cropId || !newCrop.plotSize) {
      toast.error("Please fill in all required fields");
      return;
    }
    createCrop.mutate(
      {
        cropId: newCrop.cropId,
        plotSizeHectares: parseFloat(newCrop.plotSize),
        plantedDate: new Date(newCrop.plantedDate).toISOString(),
        status: "growing",
      },
      {
        onSuccess: () => {
          toast.success("Crop registered successfully");
          setShowAddDialog(false);
          setNewCrop({
            cropId: "",
            plotSize: "",
            plantedDate: new Date().toISOString().split("T")[0],
          });
        },
        onError: (error) => {
          if (error instanceof ApiError && error.status === 409) {
            toast.error("You already have this crop registered as growing");
          } else {
            toast.error("Failed to register crop");
          }
        },
      },
    );
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
      <div className="flex items-center justify-between">
        <PageHeader title="My Crops" subtitle="Manage the crops currently growing on your farm." />
        <Button onClick={() => setShowAddDialog(true)} className="bg-gradient-hero">
          <Plus className="mr-2 h-4 w-4" />
          Add New Crop
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.isArray(crops) && crops.length > 0 ? (
          crops.map((c: any) => {
            const details = calculateCropDetails(c);

            return (
              <Card
                key={c.id}
                className="overflow-hidden group hover:shadow-lg transition-all border-border/50"
              >
                <div className="aspect-video w-full bg-muted relative overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary/20">
                    <TrendingUp className="h-12 w-12" />
                  </div>
                  <div className="absolute top-2 right-2">
                    <Badge
                      className={`backdrop-blur-sm uppercase text-[10px] font-black ${details.badgeColor}`}
                    >
                      {details.status}
                    </Badge>
                  </div>
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="font-display">{c.crop?.nameEn || "Crop"}</CardTitle>
                  <CardDescription>{c.crop?.category || "Cereal"}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 py-2 border-y border-border/50">
                    <div className="flex flex-col text-xs text-muted-foreground font-medium">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>Planted</span>
                      </div>
                      <span className="text-foreground">
                        {new Date(c.plantedDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex flex-col text-xs text-muted-foreground font-medium">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Calendar className="h-3.5 w-3.5 text-warning" />
                        <span>Harvest</span>
                      </div>
                      <span className="text-foreground">
                        {details.expectedHarvest.toLocaleDateString()}
                      </span>
                      {details.daysToHarvest > 0 ? (
                        <span className="text-[9px] text-muted-foreground mt-0.5">
                          In {details.daysToHarvest} days
                        </span>
                      ) : (
                        <span className="text-[9px] text-destructive font-bold mt-0.5">
                          {Math.abs(details.daysToHarvest)} days ago
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex flex-col">
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground uppercase font-black tracking-tight">
                        <Ruler className="h-3 w-3" /> Area & Yield
                      </span>
                      <span className="text-sm font-bold text-primary">
                        {c.plotSizeHectares || "0"} ha · {details.estYield.toLocaleString()} Kg
                      </span>
                    </div>
                    <Button variant="ghost" size="sm" className="group/btn" asChild>
                      <Link to="/farmer/activities" search={{ cropId: c.id }}>
                        Log activity
                        <ArrowRight className="ml-1 h-3 w-3 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card className="col-span-full py-16 flex flex-col items-center justify-center text-center border-dashed border-2">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <TrendingUp className="h-8 w-8 text-muted-foreground opacity-30" />
            </div>
            <h3 className="text-xl font-bold">No crops registered</h3>
            <p className="text-sm text-muted-foreground mb-8 max-w-sm">
              Start tracking your farm's production by adding the crops you are currently growing.
            </p>
            <Button onClick={() => setShowAddDialog(true)} size="lg" className="bg-primary px-8">
              <Plus className="mr-2 h-5 w-5" />
              Register Your First Crop
            </Button>
          </Card>
        )}
      </div>

      {/* Add Crop Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Register New Crop</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Crop Type</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={newCrop.cropId}
                onChange={(e) => setNewCrop({ ...newCrop, cropId: e.target.value })}
                disabled={availableCropTypes.length === 0}
              >
                <option value="">
                  {availableCropTypes.length === 0
                    ? "All crops already registered"
                    : "Select crop type..."}
                </option>
                {availableCropTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nameEn}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Plot Size (ha)</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="1.5"
                  value={newCrop.plotSize}
                  onChange={(e) => setNewCrop({ ...newCrop, plotSize: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Planted Date</Label>
                <Input
                  type="date"
                  value={newCrop.plantedDate}
                  onChange={(e) => setNewCrop({ ...newCrop, plantedDate: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={createCrop.isPending} className="bg-primary">
              {createCrop.isPending ? "Registering..." : "Add Crop"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
