import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, StatCard } from "@/components/dashboard-ui";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useMyLivestock,
  useAddLivestock,
  useUpdateLivestock,
  useRemoveLivestock,
  useLivestockStats,
} from "@/hooks/use-livestock";
import {
  Dog,
  Bird,
  Rabbit,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Syringe,
  Weight,
  Tag,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/farmer/livestock")({
  component: LivestockPage,
});

const ANIMAL_TYPES = ["Cow", "Goat", "Sheep", "Chicken", "Pig", "Rabbit", "Other"] as const;
const HEALTH_STATUSES = ["healthy", "sick", "recovering", "pregnant", "lactating"] as const;

const animalIcons: Record<string, typeof Dog> = {
  Cow: Dog,
  Goat: Dog,
  Sheep: Dog,
  Chicken: Bird,
  Pig: Dog,
  Rabbit: Rabbit,
  Other: Dog,
};

const healthColors: Record<string, string> = {
  healthy: "bg-green-100 text-green-800 border-green-200",
  sick: "bg-red-100 text-red-800 border-red-200",
  recovering: "bg-yellow-100 text-yellow-800 border-yellow-200",
  pregnant: "bg-purple-100 text-purple-800 border-purple-200",
  lactating: "bg-blue-100 text-blue-800 border-blue-200",
};

const defaultForm = {
  animalType: "",
  breed: "",
  tagNumber: "",
  birthDate: "",
  purchaseDate: "",
  weightKg: "",
  healthStatus: "",
  feedingRegime: "",
  notes: "",
};

function LivestockPage() {
  const { data: livestock, isLoading: loadingLivestock } = useMyLivestock();
  const { data: stats, isLoading: loadingStats } = useLivestockStats();
  const addLivestock = useAddLivestock();
  const updateLivestock = useUpdateLivestock();
  const removeLivestock = useRemoveLivestock();

  const [tab, setTab] = useState("list");
  const [form, setForm] = useState({ ...defaultForm });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ ...defaultForm });
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleFormChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleAdd = () => {
    if (!form.animalType) {
      toast.error("Please select an animal type");
      return;
    }
    addLivestock.mutate(
      {
        animalType: form.animalType,
        breed: form.breed || undefined,
        tagNumber: form.tagNumber || undefined,
        birthDate: form.birthDate || undefined,
        purchaseDate: form.purchaseDate || undefined,
        weightKg: form.weightKg ? parseFloat(form.weightKg) : undefined,
        healthStatus: form.healthStatus || undefined,
        feedingRegime: form.feedingRegime || undefined,
        notes: form.notes || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Livestock added successfully");
          setForm({ ...defaultForm });
          setTab("list");
        },
        onError: () => toast.error("Failed to add livestock"),
      },
    );
  };

  const openEdit = (item: any) => {
    setEditingId(item.id);
    setEditForm({
      animalType: item.animalType || "",
      breed: item.breed || "",
      tagNumber: item.tagNumber || "",
      birthDate: item.birthDate ? item.birthDate.split("T")[0] : "",
      purchaseDate: item.purchaseDate ? item.purchaseDate.split("T")[0] : "",
      weightKg: item.weightKg?.toString() || "",
      healthStatus: item.healthStatus || "",
      feedingRegime: item.feedingRegime || "",
      notes: item.notes || "",
    });
    setEditDialogOpen(true);
  };

  const handleEditChange = (key: string, value: string) => {
    setEditForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleUpdate = () => {
    if (!editingId) return;
    updateLivestock.mutate(
      {
        livestockId: editingId,
        data: {
          animalType: editForm.animalType || undefined,
          breed: editForm.breed || undefined,
          tagNumber: editForm.tagNumber || undefined,
          birthDate: editForm.birthDate || undefined,
          purchaseDate: editForm.purchaseDate || undefined,
          weightKg: editForm.weightKg ? parseFloat(editForm.weightKg) : undefined,
          healthStatus: editForm.healthStatus || undefined,
          feedingRegime: editForm.feedingRegime || undefined,
          notes: editForm.notes || undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success("Livestock updated successfully");
          setEditDialogOpen(false);
          setEditingId(null);
        },
        onError: () => toast.error("Failed to update livestock"),
      },
    );
  };

  const handleDelete = (id: string) => {
    setConfirmDeleteId(id);
  };

  const confirmDelete = () => {
    if (!confirmDeleteId) return;
    removeLivestock.mutate(confirmDeleteId, {
      onSuccess: () => {
        toast.success("Livestock removed successfully");
        setConfirmDeleteId(null);
      },
      onError: () => toast.error("Failed to remove livestock"),
    });
  };

  const loading = loadingLivestock || loadingStats;

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const statsData = stats as any;
  const livestockData = (livestock as any[]) || [];
  const byType = statsData?.byType as Record<string, number> | undefined;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Livestock Management"
        subtitle="Manage your farm animals, track health and vaccination records."
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Animals"
          value={statsData?.totalAnimals ?? 0}
          icon={Dog}
          accent="primary"
        />
        {byType &&
          Object.entries(byType)
            .slice(0, 3)
            .map(([type, count]) => {
              const Icon = animalIcons[type] || Dog;
              return <StatCard key={type} label={type} value={count} icon={Icon} accent="info" />;
            })}
        <Card className="p-5 bg-gradient-card border-border/50 hover:shadow-card-soft transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Vaccination
              </div>
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-2 text-sm">
                  <Syringe className="h-3.5 w-3.5 text-green-500" />
                  <span>{statsData?.vaccinationStatus?.vaccinated ?? 0} vaccinated</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <RefreshCw className="h-3.5 w-3.5 text-yellow-500" />
                  <span>{statsData?.vaccinationStatus?.pending ?? 0} pending</span>
                </div>
              </div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-info/10 text-info">
              <Syringe className="h-5 w-5" />
            </div>
          </div>
        </Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="list">My Livestock</TabsTrigger>
          <TabsTrigger value="add">Add New</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          {livestockData.length === 0 ? (
            <Card className="col-span-full py-16 flex flex-col items-center justify-center text-center border-dashed border-2">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Dog className="h-8 w-8 text-muted-foreground opacity-30" />
              </div>
              <h3 className="text-xl font-bold">No livestock registered</h3>
              <p className="text-sm text-muted-foreground mb-8 max-w-sm">
                Start tracking your farm animals by adding your livestock.
              </p>
              <Button onClick={() => setTab("add")} size="lg" className="bg-primary px-8">
                <Plus className="mr-2 h-5 w-5" />
                Add Your First Animal
              </Button>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {livestockData.map((item: any) => {
                const Icon = animalIcons[item.animalType] || Dog;
                return (
                  <Card
                    key={item.id}
                    className="overflow-hidden group hover:shadow-lg transition-all border-border/50"
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <CardTitle className="font-display text-lg">
                              {item.animalType}
                            </CardTitle>
                            {item.breed && <CardDescription>{item.breed}</CardDescription>}
                          </div>
                        </div>
                        <Badge className={healthColors[item.healthStatus] || ""}>
                          {item.healthStatus}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-3 py-2 border-y border-border/50 text-sm">
                        {item.tagNumber && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Tag className="h-3.5 w-3.5" />
                            {item.tagNumber}
                          </div>
                        )}
                        {item.weightKg != null && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Weight className="h-3.5 w-3.5" />
                            {item.weightKg} kg
                          </div>
                        )}
                      </div>
                      {item.vaccinationDates?.length > 0 && (
                        <div className="text-xs text-muted-foreground">
                          <span className="font-medium">Vaccinations:</span>{" "}
                          {item.vaccinationDates
                            .map((d: string) => new Date(d).toLocaleDateString())
                            .join(", ")}
                        </div>
                      )}
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => openEdit(item)}
                        >
                          <Pencil className="mr-1 h-3.5 w-3.5" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="mr-1 h-3.5 w-3.5" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="add">
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>Register New Livestock</CardTitle>
              <CardDescription>
                Fill in the details below to add a new animal to your farm.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label>Animal Type *</Label>
                <Select
                  value={form.animalType}
                  onValueChange={(v) => handleFormChange("animalType", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select animal type..." />
                  </SelectTrigger>
                  <SelectContent>
                    {ANIMAL_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Breed</Label>
                  <Input
                    placeholder="e.g. Friesian"
                    value={form.breed}
                    onChange={(e) => handleFormChange("breed", e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Tag Number</Label>
                  <Input
                    placeholder="e.g. COW-001"
                    value={form.tagNumber}
                    onChange={(e) => handleFormChange("tagNumber", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Birth Date</Label>
                  <Input
                    type="date"
                    value={form.birthDate}
                    onChange={(e) => handleFormChange("birthDate", e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Purchase Date</Label>
                  <Input
                    type="date"
                    value={form.purchaseDate}
                    onChange={(e) => handleFormChange("purchaseDate", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Weight (kg)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 450"
                    value={form.weightKg}
                    onChange={(e) => handleFormChange("weightKg", e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Health Status</Label>
                  <Select
                    value={form.healthStatus}
                    onValueChange={(v) => handleFormChange("healthStatus", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status..." />
                    </SelectTrigger>
                    <SelectContent>
                      {HEALTH_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Feeding Regime</Label>
                <Input
                  placeholder="e.g. Grass-fed, supplemented with hay"
                  value={form.feedingRegime}
                  onChange={(e) => handleFormChange("feedingRegime", e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>Notes</Label>
                <Textarea
                  placeholder="Any additional notes..."
                  rows={3}
                  value={form.notes}
                  onChange={(e) => handleFormChange("notes", e.target.value)}
                />
              </div>
              <Button
                onClick={handleAdd}
                disabled={addLivestock.isPending || !form.animalType}
                className="bg-primary"
              >
                {addLivestock.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Livestock
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Livestock</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Animal Type</Label>
              <Select
                value={editForm.animalType}
                onValueChange={(v) => handleEditChange("animalType", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select animal type..." />
                </SelectTrigger>
                <SelectContent>
                  {ANIMAL_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Breed</Label>
                <Input
                  value={editForm.breed}
                  onChange={(e) => handleEditChange("breed", e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>Tag Number</Label>
                <Input
                  value={editForm.tagNumber}
                  onChange={(e) => handleEditChange("tagNumber", e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Birth Date</Label>
                <Input
                  type="date"
                  value={editForm.birthDate}
                  onChange={(e) => handleEditChange("birthDate", e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>Purchase Date</Label>
                <Input
                  type="date"
                  value={editForm.purchaseDate}
                  onChange={(e) => handleEditChange("purchaseDate", e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Weight (kg)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={editForm.weightKg}
                  onChange={(e) => handleEditChange("weightKg", e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>Health Status</Label>
                <Select
                  value={editForm.healthStatus}
                  onValueChange={(v) => handleEditChange("healthStatus", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status..." />
                  </SelectTrigger>
                  <SelectContent>
                    {HEALTH_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Feeding Regime</Label>
              <Input
                value={editForm.feedingRegime}
                onChange={(e) => handleEditChange("feedingRegime", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Notes</Label>
              <Textarea
                rows={3}
                value={editForm.notes}
                onChange={(e) => handleEditChange("notes", e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={updateLivestock.isPending}
              className="bg-primary"
            >
              {updateLivestock.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!confirmDeleteId} onOpenChange={() => setConfirmDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Livestock</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to remove this animal? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDeleteId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={removeLivestock.isPending}
            >
              {removeLivestock.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
