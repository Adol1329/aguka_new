import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard-ui";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUsers, useApproveUser, useCreateUser } from "@/hooks/use-data";
import { locationApi } from "@/api/location";
import {
  Plus, Loader2, CheckCircle, Search, AlertTriangle, Key, Mail, X, UserPlus, Eye, EyeOff,
} from "lucide-react";
import { useState, useEffect, FormEvent } from "react";
import { toast } from "sonner";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export const Route = createFileRoute("/admin/users")({
  component: UserManagement,
});

const ROLE_OPTIONS = ["All Roles", "farmer", "officer", "cooperative", "admin"];
const STATUS_OPTIONS = ["All Status", "active", "pending_verification", "inactive"];
const CREATE_ROLES = ["farmer", "officer", "cooperative", "admin"];

function isIncompleteProfile(u: any): boolean {
  const name = u.profile?.fullName || u.farmerProfile?.fullName;
  const location = u.profile?.district || u.farmerProfile?.district || u.district;
  return !name || !location;
}

function TableSkeleton() {
  return (
    <tbody>
      {[...Array(6)].map((_, i) => (
        <tr key={i} className="border-b border-border/20">
          {[...Array(7)].map((_, j) => (
            <td key={j} className="py-4 pr-4">
              <div className="h-3 bg-muted animate-pulse rounded" style={{ width: `${50 + Math.random() * 40}%` }} />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}

// ─── Add User Modal ────────────────────────────────────────────────────────────
function AddUserModal({ onClose }: { onClose: () => void }) {
  const createUser = useCreateUser();

  const [form, setForm] = useState({
    phone: "",
    email: "",
    password: "",
    role: "farmer",
    fullName: "",
    farmName: "",
    farmSizeHectares: "",
    provinceCode: "",
    districtCode: "",
    sectorCode: "",
    cellCode: "",
    villageCode: "",
  });

  const [showPw, setShowPw] = useState(false);
  const [provinces, setProvinces] = useState<{ code: string; name: string }[]>([]);
  const [districts, setDistricts] = useState<{ code: string; name: string }[]>([]);
  const [sectors, setSectors] = useState<{ code: string; name: string }[]>([]);
  const [cells, setCells] = useState<{ code: string; name: string }[]>([]);
  const [villages, setVillages] = useState<{ code: string; name: string }[]>([]);

  // Load provinces on mount
  useEffect(() => {
    locationApi.getProvinces().then((r) => setProvinces((r.data as any) || []));
  }, []);

  const handleProvinceChange = async (code: string) => {
    setForm(f => ({ ...f, provinceCode: code, districtCode: "", sectorCode: "", cellCode: "", villageCode: "" }));
    setDistricts([]); setSectors([]); setCells([]); setVillages([]);
    if (code) {
      const r = await locationApi.getDistricts(code);
      setDistricts((r.data as any) || []);
    }
  };
  const handleDistrictChange = async (code: string) => {
    setForm(f => ({ ...f, districtCode: code, sectorCode: "", cellCode: "", villageCode: "" }));
    setSectors([]); setCells([]); setVillages([]);
    if (code) {
      const r = await locationApi.getSectors(code);
      setSectors((r.data as any) || []);
    }
  };
  const handleSectorChange = async (code: string) => {
    setForm(f => ({ ...f, sectorCode: code, cellCode: "", villageCode: "" }));
    setCells([]); setVillages([]);
    if (code) {
      const r = await locationApi.getCells(code);
      setCells((r.data as any) || []);
    }
  };
  const handleCellChange = async (code: string) => {
    setForm(f => ({ ...f, cellCode: code, villageCode: "" }));
    setVillages([]);
    if (code) {
      const r = await locationApi.getVillages(code);
      setVillages((r.data as any) || []);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.phone || !form.password || !form.fullName || !form.role) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    try {
      await createUser.mutateAsync({
        phone: form.phone,
        email: form.email || undefined,
        password: form.password,
        role: form.role,
        fullName: form.fullName,
        farmName: form.role === "farmer" ? form.farmName || undefined : undefined,
        farmSizeHectares: form.role === "farmer" && form.farmSizeHectares ? Number(form.farmSizeHectares) : undefined,
        provinceCode: form.provinceCode || undefined,
        districtCode: form.districtCode || undefined,
        sectorCode: form.sectorCode || undefined,
        cellCode: form.cellCode || undefined,
        villageCode: form.villageCode || undefined,
      });
      toast.success(`User "${form.fullName}" created successfully ✓`);
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Failed to create user. Check if the phone number is already registered.");
    }
  };

  const sel = "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-2xl bg-background shadow-2xl border border-border animate-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 p-6 border-b">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <UserPlus className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Add New User</h2>
            <p className="text-xs text-muted-foreground">Create a new account in the system</p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto rounded-full p-1.5 text-muted-foreground hover:bg-muted transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
          <div className="p-6 space-y-5">
            {/* Role */}
            <div className="space-y-1.5">
              <Label>Role <span className="text-destructive">*</span></Label>
              <select className={sel} value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                {CREATE_ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
              </select>
            </div>

            {/* Full Name */}
            <div className="space-y-1.5">
              <Label>Full Name <span className="text-destructive">*</span></Label>
              <Input
                placeholder="e.g. Alice Nyirabashyitsi"
                value={form.fullName}
                onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                required
              />
            </div>

            {/* Phone + Email */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Phone <span className="text-destructive">*</span></Label>
                <Input
                  placeholder="e.g. 0788123456"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Email <span className="text-muted-foreground text-[10px]">(optional)</span></Label>
                <Input
                  type="email"
                  placeholder="user@example.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label>Temporary Password <span className="text-destructive">*</span></Label>
              <div className="relative">
                <Input
                  type={showPw ? "text" : "password"}
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPw(v => !v)}
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground">User should change this after their first login.</p>
            </div>

            {/* Farmer-only fields */}
            {form.role === "farmer" && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Farm Name</Label>
                  <Input placeholder="e.g. Nyira Mixed Farm" value={form.farmName} onChange={e => setForm(f => ({ ...f, farmName: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Farm Size (Ha)</Label>
                  <Input type="number" step="0.1" min="0" placeholder="e.g. 1.5" value={form.farmSizeHectares} onChange={e => setForm(f => ({ ...f, farmSizeHectares: e.target.value }))} />
                </div>
              </div>
            )}

            {/* Location cascade */}
            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Location</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Province</Label>
                  <select className={sel} value={form.provinceCode} onChange={e => handleProvinceChange(e.target.value)}>
                    <option value="">Select province</option>
                    {provinces.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">District</Label>
                  <select className={sel} value={form.districtCode} onChange={e => handleDistrictChange(e.target.value)} disabled={!districts.length}>
                    <option value="">Select district</option>
                    {districts.map(d => <option key={d.code} value={d.code}>{d.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Sector</Label>
                  <select className={sel} value={form.sectorCode} onChange={e => handleSectorChange(e.target.value)} disabled={!sectors.length}>
                    <option value="">Select sector</option>
                    {sectors.map(s => <option key={s.code} value={s.code}>{s.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Cell</Label>
                  <select className={sel} value={form.cellCode} onChange={e => handleCellChange(e.target.value)} disabled={!cells.length}>
                    <option value="">Select cell</option>
                    {cells.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5 col-span-2">
                  <Label className="text-xs">Village</Label>
                  <select className={sel} value={form.villageCode} onChange={e => setForm(f => ({ ...f, villageCode: e.target.value }))} disabled={!villages.length}>
                    <option value="">Select village</option>
                    {villages.map(v => <option key={v.code} value={v.code}>{v.name}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 px-6 py-4 border-t bg-muted/30 rounded-b-2xl">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-primary" disabled={createUser.isPending}>
              {createUser.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</>
              ) : (
                <><UserPlus className="mr-2 h-4 w-4" /> Create User</>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
function UserManagement() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [showAddUser, setShowAddUser] = useState(false);
  const { data: usersData, isLoading } = useUsers({ page, limit: 50, excludeRole: "super_admin" });
  const approveMutation = useApproveUser();

  const handleApprove = (id: string) => {
    approveMutation.mutate(id, {
      onSuccess: () => toast.success("User approved successfully ✓"),
      onError: () => toast.error("Failed to approve user"),
    });
  };

  // Reset password states
  const [resetUser, setResetUser] = useState<{ id: string; name: string } | null>(null);
  const [resetSentEmail, setResetSentEmail] = useState("");
  const [isResetting, setIsResetting] = useState(false);

  const handleResetClick = (id: string, name: string) => {
    setResetUser({ id, name });
    setResetSentEmail("");
  };

  const handleConfirmReset = async () => {
    if (!resetUser) return;
    setIsResetting(true);
    try {
      const { authApi } = await import("@/api/auth");
      const res = await authApi.adminResetPassword(resetUser.id);
      setResetSentEmail(res.data?.maskedEmail || "the user's email");
      toast.success(`Password reset code sent for ${resetUser.name}.`);
    } catch (err: any) {
      toast.error(err.message || "Failed to reset password");
    } finally {
      setIsResetting(false);
    }
  };

  const allUsers = Array.isArray(usersData?.data) ? usersData.data : [];

  const displayUsers = allUsers.filter((u: any) => {
    const name = u.profile?.fullName || u.farmerProfile?.fullName || u.phone || "";
    const matchSearch = searchTerm === "" ||
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phone?.includes(searchTerm) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = roleFilter === "All Roles" || u.role === roleFilter;
    const matchStatus = statusFilter === "All Status" || u.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  const PAGE_SIZE = 10;
  const totalPages = Math.max(1, Math.ceil(displayUsers.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedUsers = displayUsers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const roleBadgeClass = (role: string) => {
    if (role === "farmer") return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    if (role === "officer") return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    if (role === "cooperative") return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
    return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage Users"
        subtitle="Users within your assigned scope."
        action={
          <Button className="bg-gradient-hero" onClick={() => setShowAddUser(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        }
      />

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            className="w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Search by name, phone or email..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
          />
        </div>

        <select
          className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
        >
          {ROLE_OPTIONS.map(r => <option key={r}>{r}</option>)}
        </select>

        <select
          className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
        >
          {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
        </select>

        <span className="text-xs text-muted-foreground ml-auto">
          {displayUsers.length} users found
        </span>
      </div>

      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="pb-3 pr-4">Name</th>
                <th className="pb-3 pr-4">Phone / Email</th>
                <th className="pb-3 pr-4">Location</th>
                <th className="pb-3 pr-4">Role</th>
                <th className="pb-3 pr-4">Joined</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            {isLoading ? <TableSkeleton /> : (
              <tbody>
                {paginatedUsers.map((u: any) => {
                  const fullName = u.profile?.fullName || u.farmerProfile?.fullName;
                  const location = u.profile?.district || u.farmerProfile?.district || u.district;
                  const incomplete = isIncompleteProfile(u);
                  return (
                    <tr key={u.id} className="border-b border-border/30 last:border-0 hover:bg-green-50/30 dark:hover:bg-green-950/10 transition-colors">
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">{fullName || u.phone}</span>
                          {incomplete && (
                            <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-[9px] font-black px-1.5 py-0.5 h-auto">
                              <AlertTriangle className="h-2.5 w-2.5 mr-1" />
                              Incomplete
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-4 pr-4 text-muted-foreground">
                        <div className="text-xs font-mono">{u.phone}</div>
                        {u.email && <div className="text-[10px]">{u.email}</div>}
                      </td>
                      <td className="py-4 pr-4 text-xs">
                        {location
                          ? <span className="text-foreground">{location}</span>
                          : <span className="text-muted-foreground/50 italic">Not set</span>
                        }
                      </td>
                      <td className="py-4 pr-4">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${roleBadgeClass(u.role)}`}>
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-4 pr-4 text-[10px] text-muted-foreground whitespace-nowrap">
                        {new Date(u.createdAt).toLocaleDateString("en-RW", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                      <td className="py-4 pr-4">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          u.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                          u.status === 'pending_verification' ? 'bg-amber-100 text-amber-800' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {u.status?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-4 text-right space-x-2">
                        {u.status === 'pending_verification' ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs bg-success/10 text-success hover:bg-success/20 hover:text-success border-success/20"
                            onClick={() => handleApprove(u.id)}
                            disabled={approveMutation.isPending}
                          >
                            {approveMutation.isPending && approveMutation.variables === u.id ? (
                              <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                            ) : (
                              <CheckCircle className="mr-1.5 h-3 w-3" />
                            )}
                            Approve
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 hover:text-amber-700 border-amber-500/20"
                            onClick={() => handleResetClick(u.id, fullName || u.phone)}
                          >
                            <Key className="mr-1.5 h-3 w-3" />
                            Reset Password
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {paginatedUsers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-sm text-muted-foreground italic">
                      No users match the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            )}
          </table>
        </div>

        {totalPages > 1 && (
          <div className="mt-6 border-t pt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <PaginationItem key={p}>
                    <PaginationLink isActive={page === p} onClick={() => setPage(p)} className="cursor-pointer">
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </Card>

      {/* Add User Modal */}
      {showAddUser && <AddUserModal onClose={() => setShowAddUser(false)} />}

      {/* Reset Password Modal */}
      {resetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setResetUser(null)}
              className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
                <Key className="h-6 w-6" />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">Reset User Password</h3>
                <p className="text-xs text-slate-500">
                  Reset credentials for <span className="font-semibold text-slate-700">{resetUser.name}</span>. This will invalidate all their active login sessions.
                </p>
              </div>

              {resetSentEmail ? (
                <div className="space-y-3 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-emerald-600 border border-emerald-100">
                      <Mail className="h-4 w-4" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-emerald-800">Reset code sent</span>
                      <p className="text-xs leading-relaxed text-emerald-700">
                        A one-time password reset code was sent to {resetSentEmail}. The user must use the forgot-password page to create their own new password.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-amber-100 bg-amber-50 p-4 text-xs font-semibold leading-relaxed text-amber-800">
                  This will invalidate the user's current password and email them a one-time reset code. The admin will not see or handle the user's password.
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setResetUser(null)}
                  className="w-1/2 border-slate-200 rounded-xl h-11 text-sm font-semibold text-slate-600"
                >
                  Close
                </Button>
                {!resetSentEmail ? (
                  <Button
                    onClick={handleConfirmReset}
                    disabled={isResetting}
                    className="w-1/2 rounded-xl bg-amber-600 hover:bg-amber-700 h-11 text-sm font-bold text-white shadow-lg shadow-amber-600/10 active:scale-95 transition-all"
                  >
                    {isResetting ? "Sending..." : "Send Reset Code"}
                  </Button>
                ) : (
                  <Button
                    onClick={handleConfirmReset}
                    disabled={isResetting}
                    className="w-1/2 rounded-xl bg-emerald-600 hover:bg-emerald-700 h-11 text-sm font-bold text-white shadow-lg shadow-emerald-600/10 active:scale-95 transition-all animate-pulse"
                  >
                    {isResetting ? "Sending..." : "Send New Code"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
