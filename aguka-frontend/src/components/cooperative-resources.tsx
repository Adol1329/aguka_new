import { PageHeader } from "@/components/dashboard-ui";
import { Card, CardContent } from "@/components/ui/card";
import {
  Package,
  Truck,
  Loader2,
  Plus,
  Search,
  MapPin,
  Layers,
  Pencil,
  Trash2,
  AlertTriangle,
  History,
  Calendar,
  Wrench,
} from "lucide-react";
import {
  useCooperativeResources,
  useAddCooperativeResource,
  useCooperativeMembers,
  useDistributeResource,
  useUpdateCooperativeResource,
  useDeleteCooperativeResource,
} from "@/hooks/use-data";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";

export function CooperativeResourcesComponent() {
  const { user } = useAuth();
  const coopId = user?.cooperativeId;
  const { data: resources, isLoading: resourcesLoading } = useCooperativeResources(coopId || "");
  const { data: members } = useCooperativeMembers(coopId || "");
  const addResource = useAddCooperativeResource();
  const distributeResource = useDistributeResource();
  const updateResource = useUpdateCooperativeResource();
  const deleteResource = useDeleteCooperativeResource();

  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);

  // New Resource states
  const [name, setName] = useState("");
  const [type, setType] = useState<"inputs" | "equipment">("inputs");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("0");
  const [unit, setUnit] = useState("kg");
  const [location, setLocation] = useState("");
  const [minStock, setMinStock] = useState("5");
  const [expiry, setExpiry] = useState("");
  const [condition, setCondition] = useState("Good");

  // Distribution states
  const [assigningResource, setAssigningResource] = useState<any>(null);
  const [targetMemberId, setTargetMemberId] = useState("");
  const [assignQty, setAssignQty] = useState("1");
  const [notes, setNotes] = useState("");

  // Edit states
  const [editingResource, setEditingResource] = useState<any>(null);

  if (!coopId) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <Package className="h-16 w-16 text-muted-foreground/20" />
        <h2 className="text-2xl font-bold">No Cooperative Assigned</h2>
        <p className="text-muted-foreground max-w-md text-center">
          Access to shared resources requires being assigned to a cooperative.
        </p>
      </div>
    );
  }

  const handleAdd = async () => {
    if (!name || (type === "inputs" && !quantity)) {
      toast.error("Please provide name and quantity");
      return;
    }

    try {
      await addResource.mutateAsync({
        coopId,
        data: {
          name,
          resourceType: type,
          category,
          quantity: type === "inputs" ? parseFloat(quantity) : 1,
          unit: type === "inputs" ? unit : "unit",
          location,
          condition: type === "equipment" ? condition : undefined,
          minStockLevel: type === "inputs" ? parseFloat(minStock) : undefined,
          expiryDate: expiry || undefined,
        },
      });
      toast.success("Resource added to inventory");
      setOpen(false);
      resetForm();
    } catch (error) {
      toast.error("Failed to add resource");
    }
  };

  const resetForm = () => {
    setName("");
    setQuantity("0");
    setLocation("");
    setCategory("");
    setExpiry("");
    setMinStock("5");
    setCondition("Good");
  };

  const handleDistribute = async () => {
    if (!targetMemberId) {
      toast.error("Please select a farmer");
      return;
    }

    try {
      await distributeResource.mutateAsync({
        coopId: coopId!,
        resourceId: assigningResource.id,
        data: {
          farmerId: targetMemberId,
          quantity: assigningResource.resourceType === "inputs" ? parseFloat(assignQty) : undefined,
          notes,
        },
      });
      toast.success("Resource allocated successfully");
      setAssigningResource(null);
      setTargetMemberId("");
      setAssignQty("1");
      setNotes("");
    } catch (error: any) {
      toast.error(error.message || "Failed to allocate resource");
    }
  };

  const handleDelete = async (r: any) => {
    if (!confirm(`Delete "${r.name}"? This cannot be undone.`)) return;
    try {
      await deleteResource.mutateAsync({ coopId: coopId!, resourceId: r.id });
      toast.success("Resource deleted");
    } catch (error) {
      toast.error("Failed to delete resource");
    }
  };

  const filteredResources = (resources || []).filter(
    (r: any) =>
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.category || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (resourcesLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Resource Distribution"
          subtitle="Directly allocate inputs and equipment to farmers."
        />
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/cooperative/distributions" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              History
            </Link>
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-hero">
                <Plus className="mr-2 h-4 w-4" />
                Add New Resource
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add to Inventory</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Type</label>
                  <Select value={type} onValueChange={(v: any) => setType(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inputs">Consumable Input (Seeds, Fertilizer)</SelectItem>
                      <SelectItem value="equipment">Asset / Equipment (Tools, Pumps)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Resource Name</label>
                  <Input
                    placeholder={type === "inputs" ? "e.g. NPK 17-17-17" : "e.g. Motorized Pump"}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <Input
                      placeholder="e.g. Fertilizer"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Location</label>
                    <Input
                      placeholder="e.g. MUSANZE Depot"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                </div>

                {type === "inputs" ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Stock Quantity</label>
                        <Input
                          type="number"
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Unit</label>
                        <Select value={unit} onValueChange={setUnit}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="kg">Kilograms (kg)</SelectItem>
                            <SelectItem value="bags">Bags</SelectItem>
                            <SelectItem value="liters">Liters</SelectItem>
                            <SelectItem value="units">Units</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-amber-600 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" /> Min Stock Level
                        </label>
                        <Input
                          type="number"
                          value={minStock}
                          onChange={(e) => setMinStock(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Expiry Date</label>
                        <Input
                          type="date"
                          value={expiry}
                          onChange={(e) => setExpiry(e.target.value)}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Initial Condition</label>
                    <Select value={condition} onValueChange={setCondition}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Excellent">Excellent</SelectItem>
                        <SelectItem value="Good">Good</SelectItem>
                        <SelectItem value="Fair">Fair</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAdd} disabled={addResource.isPending}>
                  {addResource.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Confirm Addition
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search inputs or equipment..."
          className="pl-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredResources.map((r: any) => {
          const isLowStock =
            r.resourceType === "inputs" &&
            Number(r.availableQuantity) <= Number(r.minStockLevel) &&
            Number(r.availableQuantity) > 0;
          const isOutOfStock = r.resourceType === "inputs" && Number(r.availableQuantity) <= 0;

          return (
            <Card
              key={r.id}
              className={cn(
                "overflow-hidden hover:shadow-md transition-shadow group border-l-4",
                r.resourceType === "equipment" ? "border-l-blue-500" : "border-l-emerald-500",
                isOutOfStock && "opacity-60 grayscale",
              )}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-xl transition-colors",
                      r.resourceType === "equipment"
                        ? "bg-blue-100 text-blue-600"
                        : "bg-emerald-100 text-emerald-600",
                    )}
                  >
                    {r.resourceType === "equipment" ? (
                      <Truck className="h-6 w-6" />
                    ) : (
                      <Package className="h-6 w-6" />
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {isOutOfStock ? (
                      <Badge variant="destructive">Out of Stock</Badge>
                    ) : isLowStock ? (
                      <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                        Low Stock
                      </Badge>
                    ) : (
                      <Badge
                        variant={
                          r.status === "available" || r.status === "Available"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {r.status}
                      </Badge>
                    )}

                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(r)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-bold text-lg">{r.name}</h3>
                  <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full font-bold uppercase">
                    {r.category || r.resourceType}
                  </span>
                </div>

                <div className="space-y-2.5 mt-4 pt-3 border-t border-border/50">
                  {r.resourceType === "inputs" ? (
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground font-medium">
                        <Layers className="h-4 w-4" />
                        Remaining
                      </div>
                      <span className={cn("font-bold", isLowStock && "text-amber-600")}>
                        {r.availableQuantity} {r.unit}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground font-medium">
                        <Wrench className="h-4 w-4" />
                        Condition
                      </div>
                      <span className="font-bold">{r.condition || "Good"}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground font-medium">
                      <MapPin className="h-4 w-4" />
                      Location
                    </div>
                    <span className="font-medium text-xs">{r.location || "Coop Depot"}</span>
                  </div>

                  {r.expiryDate && (
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground font-medium text-[11px]">
                        <Calendar className="h-3.5 w-3.5" />
                        Expires
                      </div>
                      <span className="text-[11px]">
                        {new Date(r.expiryDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-5">
                  <Button
                    className="w-full text-xs h-9 bg-primary/5 text-primary border-primary/20 hover:bg-primary hover:text-white"
                    variant="outline"
                    onClick={() => setAssigningResource(r)}
                    disabled={isOutOfStock || r.status === "assigned" || r.status === "Assigned"}
                  >
                    Assign to Farmer
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filteredResources.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-center bg-muted/10 rounded-2xl border-2 border-dashed">
            <Package className="h-12 w-12 text-muted-foreground/20 mb-4" />
            <h3 className="font-bold text-lg">Inventory Empty</h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              Register fertilizers, seeds, or equipment to start direct distribution to farmers.
            </p>
          </div>
        )}
      </div>

      {/* Assign Dialog */}
      <Dialog open={!!assigningResource} onOpenChange={() => setAssigningResource(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Allocate {assigningResource?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="p-3 bg-muted/30 rounded-lg text-sm mb-2">
              Directly assign this resource to a farmer. Stock will be updated immediately.
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Select Recipient Farmer</label>
              <Select value={targetMemberId} onValueChange={setTargetMemberId}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Choose a farmer..." />
                </SelectTrigger>
                <SelectContent>
                  {(members || []).map((m: any) => (
                    <SelectItem key={m.userId} value={m.userId}>
                      {m.fullName} ({m.phone})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {assigningResource?.resourceType === "inputs" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Quantity to Issue</label>
                  <Input
                    type="number"
                    max={assigningResource?.availableQuantity}
                    min="1"
                    value={assignQty}
                    onChange={(e) => setAssignQty(e.target.value)}
                    className="h-11 font-bold text-lg"
                  />
                </div>
                <div className="space-y-2 flex flex-col justify-end pb-3">
                  <div className="text-[10px] text-muted-foreground uppercase font-bold">
                    In Stock
                  </div>
                  <div className="text-sm font-bold text-emerald-600">
                    {assigningResource?.availableQuantity} {assigningResource?.unit}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Distribution Notes</label>
              <Input
                placeholder="e.g. Collected for Season A planting"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setAssigningResource(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleDistribute}
              disabled={distributeResource.isPending}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {distributeResource.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Confirm Distribution
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
