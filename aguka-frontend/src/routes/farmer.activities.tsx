import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard-ui";
import { Card } from "@/components/ui/card";
import { useActivities, useCreateActivity, useFarmerCrops } from "@/hooks/use-data";
import { Button } from "@/components/ui/button";
import { Plus, Sprout, Beaker, Droplets, Bug, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useTableSearch } from "@/hooks/use-table-search";
import { TableSearchBar } from "@/components/table-search-bar";
import { TablePagination } from "@/components/table-pagination";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/farmer/activities")({
  component: ActivitiesPage,
});

function ActivitiesPage() {
  const [page, setPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: activitiesData, isLoading } = useActivities({ page, limit: 10 });
  const { data: crops } = useFarmerCrops();
  const createActivity = useCreateActivity();

  const activities = Array.isArray(activitiesData) ? activitiesData : (activitiesData as any)?.data || [];
  const pagination = (activitiesData as any)?.pagination;

  const { query, setQuery, filteredData: displayedActivities, reset } = useTableSearch(
    activities,
    ['activityType', 'notes', 'description', 'farmerCrop.crop.name']
  );

  const [formData, setFormData] = useState({
    activityType: "Planting",
    notes: "",
    activityDate: new Date().toISOString().split('T')[0],
    farmerCropId: ""
  });

  useEffect(() => {
    setPage(1);
  }, [query]);
  
  const icons: Record<string, typeof Sprout> = {
    planting: Sprout,
    fertilizing: Beaker,
    irrigation: Droplets,
    pest_control: Bug,
    harvest: Sprout,
  };

  const handleCreate = async () => {
    try {
      await createActivity.mutateAsync(formData);
      setIsDialogOpen(false);
      setFormData({
        activityType: "Planting",
        notes: "",
        activityDate: new Date().toISOString().split('T')[0],
        farmerCropId: ""
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
                    onValueChange={(v) => setFormData(prev => ({ ...prev, activityType: v }))}
                  >
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Planting">Planting</SelectItem>
                      <SelectItem value="Fertilizing">Fertilizing</SelectItem>
                      <SelectItem value="Irrigation">Irrigation</SelectItem>
                      <SelectItem value="Pest Control">Pest Control</SelectItem>
                      <SelectItem value="Harvesting">Harvesting</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="crop">Crop (Optional)</Label>
                  <Select 
                    value={formData.farmerCropId} 
                    onValueChange={(v) => setFormData(prev => ({ ...prev, farmerCropId: v }))}
                  >
                    <SelectTrigger id="crop">
                      <SelectValue placeholder="Select crop" />
                    </SelectTrigger>
                    <SelectContent>
                      {crops?.map((c: any) => (
                        <SelectItem key={c.id} value={c.id}>{c.crop?.nameEn}</SelectItem>
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
                    onChange={(e) => setFormData(prev => ({ ...prev, activityDate: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea 
                    id="notes" 
                    placeholder="Describe what you did..." 
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
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
        <div className="mb-6">
          <TableSearchBar
            value={query}
            onChange={setQuery}
            onClear={reset}
            placeholder="Search activities..."
            resultsCount={displayedActivities.length}
          />
        </div>
        <div className="space-y-3">
          {displayedActivities?.map((a: any) => {
            const Icon = icons[a.activityType?.toLowerCase()] || Sprout;
            return (
              <div key={a.id} className="flex items-start gap-4 rounded-lg border p-4 hover:bg-muted/30 transition-colors">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">
                    {a.activityType} {a.farmerCrop ? `· ${a.farmerCrop.crop.nameEn}` : ""}
                  </div>
                  <div className="text-sm text-muted-foreground">{a.notes || a.description}</div>
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
