import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect, FormEvent } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard-ui";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  useCooperatives,
  useCreateCooperative,
  useAssignCooperativeManager,
  useCreateUser,
  useApproveUser,
  useUsers,
} from "@/hooks/use-data";
import { locationApi, type LocationItem } from "@/api/location";
import { normalizeRwandaPhone } from "@/utils/phoneUtils";
import { Plus, Loader2, UserCog, Search, Building2, MapPin, Phone, UserPlus } from "lucide-react";

export const Route = createFileRoute("/admin/cooperatives")({
  component: AdminCooperatives,
});

const selectClass =
  "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition disabled:opacity-50 disabled:cursor-not-allowed";

function CreateCooperativeDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const createCooperative = useCreateCooperative();
  const createUser = useCreateUser();
  const approveUser = useApproveUser();
  const assignManager = useAssignCooperativeManager();
  const [form, setForm] = useState({
    name: "",
    provinceCode: "",
    districtCode: "",
    district: "",
    sectorCode: "",
    sector: "",
    contactPhone: "",
    description: "",
  });

  const [managerMode, setManagerMode] = useState<"new" | "existing" | "skip">("new");
  const [managerForm, setManagerForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
  });
  const [existingManagerId, setExistingManagerId] = useState("");

  const [provinces, setProvinces] = useState<LocationItem[]>([]);
  const [districts, setDistricts] = useState<LocationItem[]>([]);
  const [sectors, setSectors] = useState<LocationItem[]>([]);

  useEffect(() => {
    if (!open) return;
    locationApi.getProvinces().then((r) => setProvinces((r.data as any) || []));
  }, [open]);

  const handleProvinceChange = async (code: string) => {
    setForm((f) => ({
      ...f,
      provinceCode: code,
      districtCode: "",
      district: "",
      sectorCode: "",
      sector: "",
    }));
    setDistricts([]);
    setSectors([]);
    if (code) {
      const r = await locationApi.getDistricts(code);
      setDistricts((r.data as any) || []);
    }
  };

  const handleDistrictChange = async (code: string) => {
    // Location API returns `code` as a number, but <select> onChange always yields a string —
    // compare as strings so the lookup doesn't silently miss.
    const name = districts.find((d) => String(d.code) === code)?.name || "";
    setForm((f) => ({ ...f, districtCode: code, district: name, sectorCode: "", sector: "" }));
    setSectors([]);
    if (code) {
      const r = await locationApi.getSectors(code);
      setSectors((r.data as any) || []);
    }
  };

  const handleSectorChange = (code: string) => {
    const name = sectors.find((s) => String(s.code) === code)?.name || "";
    setForm((f) => ({ ...f, sectorCode: code, sector: name }));
  };

  const resetForm = () => {
    setForm({
      name: "",
      provinceCode: "",
      districtCode: "",
      district: "",
      sectorCode: "",
      sector: "",
      contactPhone: "",
      description: "",
    });
    setManagerMode("new");
    setManagerForm({ fullName: "", phone: "", email: "", password: "" });
    setExistingManagerId("");
  };

  const isSubmitting = createCooperative.isPending || createUser.isPending || approveUser.isPending || assignManager.isPending;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.district || !form.sector) {
      toast.error("Name, district and sector are required.");
      return;
    }

    let normalizedManagerPhone: string | null = null;
    if (managerMode === "new") {
      if (!managerForm.fullName || !managerForm.phone || !managerForm.password) {
        toast.error("Manager full name, phone and temporary password are required.");
        return;
      }
      if (managerForm.password.length < 6) {
        toast.error("Manager password must be at least 6 characters.");
        return;
      }
      normalizedManagerPhone = normalizeRwandaPhone(managerForm.phone);
      if (!normalizedManagerPhone) {
        toast.error("Invalid manager phone number format. Use e.g. 0788123456");
        return;
      }
    } else if (managerMode === "existing" && !existingManagerId) {
      toast.error("Select an existing cooperative-role user to assign as manager.");
      return;
    }

    let newCoopId: string | undefined;
    try {
      const coopResult: any = await createCooperative.mutateAsync({
        name: form.name,
        district: form.district,
        sector: form.sector,
        contactPhone: form.contactPhone || undefined,
        description: form.description || undefined,
      });
      newCoopId = coopResult?.data?.id;
    } catch (err: any) {
      toast.error(err?.message || "Failed to create cooperative.");
      return;
    }

    if (managerMode === "skip" || !newCoopId) {
      toast.success(`Cooperative "${form.name}" created ✓`);
      resetForm();
      onOpenChange(false);
      return;
    }

    try {
      let managerUserId = existingManagerId;
      if (managerMode === "new") {
        const userResult: any = await createUser.mutateAsync({
          phone: normalizedManagerPhone!,
          email: managerForm.email || undefined,
          password: managerForm.password,
          role: "cooperative",
          fullName: managerForm.fullName,
        });
        managerUserId = userResult?.data?.user?.id;
        if (!managerUserId) throw new Error("Manager account was created but its ID could not be resolved.");
        await approveUser.mutateAsync(managerUserId);
      }

      await assignManager.mutateAsync({ id: newCoopId, userId: managerUserId });
      toast.success(`Cooperative "${form.name}" created with manager assigned ✓`);
      resetForm();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(
        `Cooperative created, but manager setup failed: ${err?.message || "unknown error"}. Use "Assign Manager" to finish this.`,
      );
      resetForm();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Cooperative</DialogTitle>
          <DialogDescription>Register a new cooperative entity.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Name *</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Nyamagabe Farmers Cooperative"
              required
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Province *</Label>
              <select
                className={selectClass}
                value={form.provinceCode}
                onChange={(e) => handleProvinceChange(e.target.value)}
              >
                <option value="">Select province</option>
                {provinces.map((p) => (
                  <option key={p.code} value={p.code}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>District *</Label>
              <select
                className={selectClass}
                value={form.districtCode}
                onChange={(e) => handleDistrictChange(e.target.value)}
                disabled={!districts.length}
              >
                <option value="">Select district</option>
                {districts.map((d) => (
                  <option key={d.code} value={d.code}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Sector *</Label>
              <select
                className={selectClass}
                value={form.sectorCode}
                onChange={(e) => handleSectorChange(e.target.value)}
                disabled={!sectors.length}
              >
                <option value="">Select sector</option>
                {sectors.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Contact Phone</Label>
            <Input
              value={form.contactPhone}
              onChange={(e) => setForm((f) => ({ ...f, contactPhone: e.target.value }))}
              placeholder="e.g. 0788123456"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Input
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Short description"
            />
          </div>

          <div className="space-y-3 rounded-lg border p-3">
            <Label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
              Manager
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { key: "new", label: "Create new" },
                  { key: "existing", label: "Assign existing" },
                  { key: "skip", label: "Skip for now" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setManagerMode(opt.key)}
                  className={`rounded-lg border px-2 py-1.5 text-xs font-semibold transition ${
                    managerMode === opt.key
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-input text-muted-foreground hover:bg-muted/50"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {managerMode === "new" && (
              <div className="space-y-3 pt-1">
                <div className="space-y-1.5">
                  <Label className="text-xs">Full Name *</Label>
                  <Input
                    value={managerForm.fullName}
                    onChange={(e) => setManagerForm((f) => ({ ...f, fullName: e.target.value }))}
                    placeholder="Manager's full name"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Phone *</Label>
                    <Input
                      value={managerForm.phone}
                      onChange={(e) => setManagerForm((f) => ({ ...f, phone: e.target.value }))}
                      placeholder="e.g. 0788123456"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Email (optional)</Label>
                    <Input
                      type="email"
                      value={managerForm.email}
                      onChange={(e) => setManagerForm((f) => ({ ...f, email: e.target.value }))}
                      placeholder="manager@example.com"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Temporary Password *</Label>
                  <Input
                    type="text"
                    value={managerForm.password}
                    onChange={(e) => setManagerForm((f) => ({ ...f, password: e.target.value }))}
                    placeholder="Min. 6 characters"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    The manager can change this after logging in for the first time.
                  </p>
                </div>
              </div>
            )}

            {managerMode === "existing" && (
              <div className="pt-1">
                <CooperativeManagerPicker value={existingManagerId} onChange={setExistingManagerId} />
              </div>
            )}

            {managerMode === "skip" && (
              <p className="text-xs text-muted-foreground italic pt-1">
                You can assign a manager later from the cooperatives list.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="mr-2 h-4 w-4" />
              )}
              Create Cooperative
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CooperativeManagerPicker({
  excludeCooperativeId,
  value,
  onChange,
}: {
  /** Keeps this cooperative's own current manager selectable instead of hiding them. */
  excludeCooperativeId?: string;
  value: string;
  onChange: (userId: string) => void;
}) {
  const [search, setSearch] = useState("");
  const { data: usersData, isLoading } = useUsers({ role: "cooperative", search: search || undefined, limit: 50 });

  const allCandidates = Array.isArray(usersData?.data) ? usersData.data : [];
  // Users already tied to a different cooperative can't be assigned here (backend rejects it) —
  // hide them so the list only shows accounts that are actually assignable.
  const candidates = allCandidates.filter(
    (u: any) => !u.cooperativeId || u.cooperativeId === excludeCooperativeId,
  );
  const hiddenCount = allCandidates.length - candidates.length;

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search cooperative-role users by name or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="max-h-64 overflow-y-auto rounded-lg border divide-y">
        {isLoading ? (
          <div className="p-4 text-sm text-muted-foreground text-center">Loading...</div>
        ) : candidates.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground text-center italic">
            {hiddenCount > 0
              ? "No available cooperative-role accounts — the ones that exist already manage a different cooperative."
              : "No cooperative-role users found."}
          </div>
        ) : (
          candidates.map((u: any) => (
            <button
              type="button"
              key={u.id}
              onClick={() => onChange(u.id)}
              className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-muted/50 transition ${
                value === u.id ? "bg-primary/10" : ""
              }`}
            >
              <span>
                <span className="font-medium">{u.fullName || "Unnamed cooperative account"}</span>
                <span className="ml-2 text-xs text-muted-foreground">{u.phone}</span>
              </span>
              {value === u.id && <Badge className="text-[10px]">Selected</Badge>}
            </button>
          ))
        )}
      </div>
      {hiddenCount > 0 && candidates.length > 0 && (
        <p className="text-[11px] text-muted-foreground italic">
          {hiddenCount} account{hiddenCount === 1 ? "" : "s"} hidden because they already manage a
          different cooperative.
        </p>
      )}
    </div>
  );
}

function AssignManagerDialog({
  cooperative,
  onOpenChange,
}: {
  cooperative: any;
  onOpenChange: (v: boolean) => void;
}) {
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const assignManager = useAssignCooperativeManager();

  const handleAssign = async () => {
    if (!selectedUserId) {
      toast.error("Select a user to assign as manager.");
      return;
    }
    try {
      await assignManager.mutateAsync({ id: cooperative.id, userId: selectedUserId });
      toast.success("Manager assigned ✓");
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.message || "Failed to assign manager.");
    }
  };

  return (
    <Dialog open={!!cooperative} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Manager</DialogTitle>
          <DialogDescription>
            Assign a manager for <span className="font-semibold">{cooperative?.name}</span>.
          </DialogDescription>
        </DialogHeader>

        <CooperativeManagerPicker
          excludeCooperativeId={cooperative?.id}
          value={selectedUserId}
          onChange={setSelectedUserId}
        />

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={assignManager.isPending || !selectedUserId}>
            {assignManager.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <UserCog className="mr-2 h-4 w-4" />
            Assign Manager
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AdminCooperatives() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [managerTarget, setManagerTarget] = useState<any | null>(null);
  const { data: cooperatives, isLoading } = useCooperatives();

  const filtered = useMemo(() => {
    const list = cooperatives || [];
    if (!searchTerm) return list;
    const q = searchTerm.toLowerCase();
    return list.filter(
      (c: any) =>
        c.name?.toLowerCase().includes(q) ||
        c.district?.toLowerCase().includes(q) ||
        c.sector?.toLowerCase().includes(q),
    );
  }, [cooperatives, searchTerm]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cooperatives"
        subtitle="Manage cooperatives and assign managers"
        action={
          <Button className="bg-gradient-hero" onClick={() => setShowCreate(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Cooperative
          </Button>
        }
      />

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search by name, district or sector..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="pb-3 pr-4">Name</th>
                <th className="pb-3 pr-4">Location</th>
                <th className="pb-3 pr-4">Contact</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i} className="border-b border-border/20">
                    {[...Array(5)].map((_, j) => (
                      <td key={j} className="py-4 pr-4">
                        <div className="h-3 bg-muted animate-pulse rounded" style={{ width: `${50 + Math.random() * 40}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-sm text-muted-foreground italic">
                    No cooperatives found.
                  </td>
                </tr>
              ) : (
                filtered.map((c: any) => (
                  <tr
                    key={c.id}
                    className="border-b border-border/30 last:border-0 hover:bg-green-50/30 dark:hover:bg-green-950/10 transition-colors"
                  >
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Building2 className="h-4 w-4" />
                        </div>
                        <span className="font-medium">{c.name}</span>
                      </div>
                    </td>
                    <td className="py-4 pr-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {c.sector}, {c.district}
                      </div>
                    </td>
                    <td className="py-4 pr-4 text-xs text-muted-foreground">
                      {c.contactPhone ? (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {c.contactPhone}
                        </div>
                      ) : (
                        <span className="italic text-muted-foreground/50">Not set</span>
                      )}
                    </td>
                    <td className="py-4 pr-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          c.isActive
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {c.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => setManagerTarget(c)}>
                        <UserCog className="mr-1.5 h-3 w-3" />
                        Assign Manager
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <CreateCooperativeDialog open={showCreate} onOpenChange={setShowCreate} />
      {managerTarget && (
        <AssignManagerDialog cooperative={managerTarget} onOpenChange={() => setManagerTarget(null)} />
      )}
    </div>
  );
}
