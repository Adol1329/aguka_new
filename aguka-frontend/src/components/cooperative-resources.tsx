import { PageHeader } from "@/components/dashboard-ui";
import { Card, CardContent } from "@/components/ui/card";
import { Package, Truck, Loader2, Plus, Search, MapPin, Layers, Pencil, Trash2 } from "lucide-react";
import { useCooperativeResources, useAddCooperativeResource, useCooperativeMembers, useBookResource, useUpdateCooperativeResource, useDeleteCooperativeResource } from "@/hooks/use-data";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export function CooperativeResourcesComponent() {
  const { user } = useAuth();
  const coopId = user?.cooperativeId;
  const { data: resources, isLoading: resourcesLoading } = useCooperativeResources(coopId || "");
  const { data: members } = useCooperativeMembers(coopId || "");
  const addResource = useAddCooperativeResource();
  const bookResource = useBookResource();
  const updateResource = useUpdateCooperativeResource();
  const deleteResource = useDeleteCooperativeResource();

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

  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("equipment");
  const [quantity, setQuantity] = useState("1");
  const [location, setLocation] = useState("");
  
  // Assign/Details states
  const [selectedResource, setSelectedResource] = useState<any>(null);
  const [assigningResource, setAssigningResource] = useState<any>(null);
  const [targetMemberId, setTargetMemberId] = useState("");
  const [assignQty, setAssignQty] = useState("1");
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0]);

  // Edit states
  const [editingResource, setEditingResource] = useState<any>(null);
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState("equipment");
  const [editQuantity, setEditQuantity] = useState("1");
  const [editLocation, setEditLocation] = useState("");
  const [editCondition, setEditCondition] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const openEdit = (r: any) => {
    setEditingResource(r);
    setEditName(r.name || "");
    setEditType(r.resourceType || "equipment");
    setEditQuantity(String(r.quantity || 1));
    setEditLocation(r.location || "");
    setEditCondition(r.condition || "");
    setEditDescription(r.description || "");
  };

  const handleAdd = async () => {
    if (!name || !quantity) {
      toast.error("Please provide name and quantity");
      return;
    }

    try {
      await addResource.mutateAsync({
        coopId,
        data: {
          name,
          resourceType: type,
          quantity: parseInt(quantity),
          location,
        },
      });
      toast.success("Resource added successfully");
      setOpen(false);
      setName("");
      setQuantity("1");
      setLocation("");
    } catch (error) {
      toast.error("Failed to add resource");
    }
  };

  const handleAssign = async () => {
    if (!targetMemberId || !assignQty) {
      toast.error("Please select a member and quantity");
      return;
    }

    try {
      await bookResource.mutateAsync({
        coopId: coopId!,
        resourceId: assigningResource.id,
        data: {
          memberId: targetMemberId,
          quantity: parseInt(assignQty),
          startDate,
          endDate,
          notes: `Assigned by Cooperative Manager`,
        },
      });
      toast.success("Resource assigned successfully");
      setAssigningResource(null);
      setTargetMemberId("");
    } catch (error) {
      toast.error("Failed to assign resource");
    }
  };

  const handleEdit = async () => {
    if (!editName) { toast.error("Name is required"); return; }
    try {
      await updateResource.mutateAsync({
        coopId: coopId!,
        resourceId: editingResource.id,
        data: {
          name: editName,
          resourceType: editType,
          quantity: parseInt(editQuantity),
          location: editLocation,
          condition: editCondition,
          description: editDescription,
        },
      });
      toast.success("Resource updated successfully");
      setEditingResource(null);
    } catch (error) {
      toast.error("Failed to update resource");
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

  const filteredResources = (resources || []).filter((r: any) => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.resourceType.toLowerCase().includes(searchTerm.toLowerCase())
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
          subtitle="Coordinate inputs and equipment across members."
        />
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-hero">
              <Plus className="mr-2 h-4 w-4" />
              Add Resource
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Cooperative Resource</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Resource Name</label>
                <Input placeholder="e.g. Irrigation Pump X1" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Type</label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="equipment">Equipment</SelectItem>
                      <SelectItem value="inputs">Inputs (Seeds/Fertilizer)</SelectItem>
                      <SelectItem value="storage">Storage Space</SelectItem>
                      <SelectItem value="transport">Transport Vehicle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Quantity</label>
                  <Input type="number" min="1" value={quantity} onChange={e => setQuantity(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Storage Location</label>
                <Input placeholder="e.g. Main Warehouse A" value={location} onChange={e => setLocation(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={handleAdd} disabled={addResource.isPending}>
                {addResource.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add to Inventory
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search inventory..." 
          className="pl-9" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredResources.map((r: any) => (
          <Card key={r.id} className="overflow-hidden hover:shadow-md transition-shadow group border-border/50">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  {r.resourceType === 'equipment' ? <Truck className="h-6 w-6" /> : <Package className="h-6 w-6" />}
                </div>
              <div className="flex items-center gap-1.5">
                <Badge variant={r.isAvailable ? "default" : "secondary"}>
                  {r.isAvailable ? "Available" : "In Use"}
                </Badge>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  onClick={() => openEdit(r)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
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
              <h3 className="font-bold text-lg mb-1">{r.name}</h3>
              <div className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-4">{r.resourceType}</div>
              
              <div className="space-y-3 pt-2 border-t border-border/50">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Layers className="h-4 w-4" />
                    Stock
                  </div>
                  <span className="font-bold">{r.availableQuantity || r.quantity} / {r.quantity}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    Location
                  </div>
                  <span className="font-medium text-xs">{r.location || "Central Depot"}</span>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-xs h-8"
                  onClick={() => setAssigningResource(r)}
                  disabled={!r.isAvailable}
                >
                  Assign Member
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="text-xs h-8"
                  onClick={() => setSelectedResource(r)}
                >
                  Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredResources.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-center bg-muted/10 rounded-2xl border-2 border-dashed">
            <Package className="h-12 w-12 text-muted-foreground/20 mb-4" />
            <h3 className="font-bold text-lg">No resources found</h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              You haven't added any equipment or inputs to your cooperative's shared inventory yet.
            </p>
          </div>
        )}
      </div>

      {/* Details Dialog */}
      <Dialog open={!!selectedResource} onOpenChange={() => setSelectedResource(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedResource?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
              <div className="text-sm">
                <div className="text-muted-foreground mb-1 uppercase text-[10px] font-bold">Category</div>
                <div className="font-bold">{selectedResource?.resourceType}</div>
              </div>
              <Badge variant={selectedResource?.isAvailable ? "default" : "secondary"}>
                {selectedResource?.isAvailable ? "Available" : "In Use"}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-bold">Description</h4>
              <p className="text-sm text-muted-foreground">
                {selectedResource?.description || "No description provided for this resource."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-[10px] text-muted-foreground font-bold uppercase">Condition</div>
                <div className="text-sm font-medium">{selectedResource?.condition || "Good"}</div>
              </div>
              <div className="space-y-1">
                <div className="text-[10px] text-muted-foreground font-bold uppercase">Location</div>
                <div className="text-sm font-medium">{selectedResource?.location || "Central Depot"}</div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setSelectedResource(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Dialog */}
      <Dialog open={!!assigningResource} onOpenChange={() => setAssigningResource(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign {assigningResource?.name}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Farmer</label>
              <Select value={targetMemberId} onValueChange={setTargetMemberId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a member..." />
                </SelectTrigger>
                <SelectContent>
                  {(members || []).map((m: any) => (
                    <SelectItem key={m.userId} value={m.userId}>
                      {m.fullName} ({m.phone})
                    </SelectItem>
                  ))}
                  {(members || []).length === 0 && (
                    <div className="p-2 text-center text-xs text-muted-foreground">No members found</div>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Quantity</label>
                <Input 
                  type="number" 
                  max={assigningResource?.availableQuantity || assigningResource?.quantity} 
                  min="1" 
                  value={assignQty} 
                  onChange={e => setAssignQty(e.target.value)} 
                />
              </div>
              <div className="space-y-2 flex flex-col justify-end">
                <div className="text-[10px] text-muted-foreground">
                  Available: {assigningResource?.availableQuantity || assigningResource?.quantity}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Date</label>
                <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">End Date</label>
                <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssigningResource(null)}>Cancel</Button>
            <Button onClick={handleAssign} disabled={bookResource.isPending}>
              {bookResource.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Assign Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingResource} onOpenChange={() => setEditingResource(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Resource</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Resource Name</label>
              <Input value={editName} onChange={e => setEditName(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select value={editType} onValueChange={setEditType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equipment">Equipment</SelectItem>
                    <SelectItem value="inputs">Inputs (Seeds/Fertilizer)</SelectItem>
                    <SelectItem value="storage">Storage Space</SelectItem>
                    <SelectItem value="transport">Transport Vehicle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Quantity</label>
                <Input type="number" min="1" value={editQuantity} onChange={e => setEditQuantity(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Condition</label>
                <Select value={editCondition} onValueChange={setEditCondition}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">Excellent</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                    <SelectItem value="poor">Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <Input placeholder="e.g. Warehouse A" value={editLocation} onChange={e => setEditLocation(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Input placeholder="Optional description" value={editDescription} onChange={e => setEditDescription(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingResource(null)}>Cancel</Button>
            <Button onClick={handleEdit} disabled={updateResource.isPending}>
              {updateResource.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
