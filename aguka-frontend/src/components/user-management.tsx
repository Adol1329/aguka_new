import { PageHeader } from "@/components/dashboard-ui";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, MoreHorizontal, Loader2, Edit, Trash2, UserCheck, UserX, UserPlus, Shield, Smartphone, Mail, CheckCircle, XCircle, X, Clock } from "lucide-react";
import { TableSearchBar } from "@/components/table-search-bar";
import { useAuth } from "@/lib/auth";
import { useSuperAdminUsers, useDeleteSuperAdminUser, useUpdateSuperAdminUser, useCreateSuperAdminUser, useApproveUser, useRejectUser, useSuperAdminAuditLogs } from "@/hooks/use-data";
import { useState } from "react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useI18n } from "@/lib/i18n";

export function UserManagementComponent() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<string>("");
  const [editUser, setEditUser] = useState<any>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [page, setPage] = useState(1);
  const [drawerUser, setDrawerUser] = useState<any>(null);

  // New User State
  const [newUser, setNewUser] = useState({
    phone: "",
    email: "",
    password: "",
    role: "farmer",
    fullName: "",
    district: "",
    sector: ""
  });

  const { data: usersData, isLoading } = useSuperAdminUsers({
    page,
    limit: 10,
    search: search || undefined,
    role: filterRole || undefined,
  });

  const deleteMutation = useDeleteSuperAdminUser();
  const updateMutation = useUpdateSuperAdminUser();
  const createMutation = useCreateSuperAdminUser();
  const approveMutation = useApproveUser();
  const rejectMutation = useRejectUser();

  const userList = usersData?.data || [];
  const pagination = usersData?.pagination;

  const handleCreate = async () => {
    if (!newUser.phone || !newUser.fullName) {
      toast.error(t("users.error.phone_fullname_required"));
      return;
    }
    createMutation.mutate(newUser, {
      onSuccess: () => {
        toast.success(t("users.success.user_created"));
        setShowAddDialog(false);
        setNewUser({ phone: "", email: "", password: "", role: "farmer", fullName: "", district: "", sector: "" });
      },
      onError: (err: any) => toast.error(err.message || t("users.error.create_failed")),
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm(t("users.confirm.delete_user"))) return;
    deleteMutation.mutate(id, {
      onSuccess: () => toast.success(t("users.success.user_deleted")),
      onError: (err: any) => toast.error(err.message || t("users.error.delete_failed")),
    });
  };

  const handleToggleStatus = (user: any) => {
    updateMutation.mutate(
      { id: user.id, data: { isActive: !user.isActive } },
      {
        onSuccess: () => toast.success(user.isActive ? t("users.success.user_deactivated") : t("users.success.user_activated")),
        onError: (err: any) => toast.error(err.message || t("users.error.update_failed")),
      }
    );
  };

  const handleSaveEdit = () => {
    if (!editUser) return;
    updateMutation.mutate(
      { id: editUser.id, data: { role: editUser.role } },
      {
        onSuccess: () => {
          toast.success(t("users.success.role_updated"));
          setShowEditDialog(false);
        },
        onError: (err: any) => toast.error(err.message || t("users.error.update_failed")),
      }
    );
  };

  const handleApprove = (id: string) => {
    approveMutation.mutate(id, {
      onSuccess: () => toast.success(t("users.success.user_approved")),
      onError: (err: any) => toast.error(err.message || t("users.error.approve_failed")),
    });
  };

  const handleReject = (id: string) => {
    const reason = prompt(t("users.prompt.reject_reason"));
    if (!reason) return;
    rejectMutation.mutate({ id, reason }, {
      onSuccess: () => toast.success(t("users.success.user_rejected")),
      onError: (err: any) => toast.error(err.message || t("users.error.reject_failed")),
    });
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
        title={t("users.page.title")}
        subtitle={t("users.page.subtitle")}
        action={
          <Button onClick={() => setShowAddDialog(true)} className="bg-gradient-hero shadow-lg shadow-primary/20">
            <UserPlus className="mr-2 h-4 w-4" />
            {t("users.action.provision_new_user")}
          </Button>
        }
      />

      <Card className="p-0 overflow-hidden border-border/50">
        <div className="p-5 border-b border-border/50 bg-muted/10 flex gap-4 flex-wrap items-center justify-between">
          <div className="flex-1 max-w-md">
            <TableSearchBar
              value={search}
              onChange={setSearch}
              onClear={() => setSearch("")}
              placeholder={t("users.search.placeholder")}
              resultsCount={pagination?.totalItems}
            />
          </div>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <select
              className="rounded-md border border-input bg-background px-3 py-1.5 text-xs font-bold uppercase tracking-wider"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="">{t("users.filter.global_roles")}</option>
              <option value="farmer">{t("role.farmer")}</option>
              <option value="officer">{t("role.officer")}</option>
              <option value="cooperative">{t("role.cooperative")}</option>
              <option value="admin">{t("role.admin")}</option>
              <option value="super_admin">{t("role.super_admin")}</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase font-black tracking-widest text-muted-foreground border-b bg-muted/5">
                <th className="px-6 py-4">{t("users.table.identity")}</th>
                <th className="px-6 py-4">{t("users.table.access_level")}</th>
                <th className="px-6 py-4">{t("users.table.status")}</th>
                <th className="px-6 py-4">{t("users.table.registration")}</th>
                <th className="px-6 py-4 text-right">{t("users.table.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {userList.map((u: any) => (
                <tr
                  key={u.id}
                  className="group hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => setDrawerUser(u)}
                >
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-foreground">{u.fullName || u.farmerProfile?.fullName || t("users.fallback.unnamed_user")}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Smartphone className="h-2.5 w-2.5" /> {u.phone}
                        </span>
                        {u.email && (
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Mail className="h-2.5 w-2.5" /> {u.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge role={u.role} />
                  </td>
                  <td className="px-6 py-4">
                    {u.status === 'pending_verification' ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase bg-amber-500/10 text-amber-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                        {t("users.status.pending")}
                      </span>
                    ) : (
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                        u.isActive ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${u.isActive ? 'bg-success' : 'bg-destructive'}`} />
                        {u.isActive ? t("users.status.active") : t("users.status.locked")}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-[10px] text-muted-foreground font-mono">
                      {u.createdAt ? new Date(u.createdAt).toISOString().split('T')[0] : t("users.fallback.na")}
                    </div>
                  </td>
                   <td className="px-6 py-4 text-right">
                    {user?.id !== u.id ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => { setEditUser(u); setShowEditDialog(true); }}>
                            <Edit className="mr-2 h-4 w-4" />
                            {t("users.action.modify_role")}
                          </DropdownMenuItem>
                          {u.status === 'pending_verification' && (
                            <>
                              <DropdownMenuItem className="text-success font-bold" onClick={() => handleApprove(u.id)}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                {t("users.action.approve_account")}
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive font-bold" onClick={() => handleReject(u.id)}>
                                <XCircle className="mr-2 h-4 w-4" />
                                {t("users.action.reject_account")}
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuItem onClick={() => handleToggleStatus(u)}>
                            {u.isActive ? (
                              <><UserX className="mr-2 h-4 w-4 text-amber-600" /> {t("users.action.suspend_account")}</>
                            ) : (
                              <><UserCheck className="mr-2 h-4 w-4 text-success" /> {t("users.action.reinstate_account")}</>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive font-bold" onClick={() => handleDelete(u.id)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t("users.action.purge_account")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                        {t("users.label.you")}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {userList.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-20 text-center flex flex-col items-center justify-center">
                    <Loader2 className="h-8 w-8 text-muted-foreground opacity-20 mb-4 animate-spin" />
                    <p className="text-muted-foreground font-medium italic">{t("users.empty.no_accounts_matching")}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="p-4 border-t border-border/50 bg-muted/5">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                  <PaginationItem key={p}>
                    <PaginationLink 
                      isActive={page === p}
                      onClick={() => setPage(p)}
                      className="cursor-pointer"
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                    className={page === pagination.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </Card>

      {/* Add User Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("users.dialog.add.title")}</DialogTitle>
            <DialogDescription>{t("users.dialog.add.description")}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="fullName">{t("auth.full_name")}</Label>
              <Input id="fullName" placeholder={t("users.placeholder.full_name")} value={newUser.fullName} onChange={(e) => setNewUser({...newUser, fullName: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="phone">{t("auth.phone")}</Label>
                 <Input id="phone" placeholder={t("auth.phone.placeholder")} value={newUser.phone} onChange={(e) => setNewUser({...newUser, phone: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">{t("auth.role")}</Label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                >
                  <option value="farmer">{t("role.farmer")}</option>
                  <option value="officer">{t("role.officer")}</option>
                  <option value="cooperative">{t("role.cooperative")}</option>
                  <option value="admin">{t("role.admin")}</option>
                  <option value="super_admin">{t("role.super_admin")}</option>
                </select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">{t("auth.email_optional")}</Label>
               <Input id="email" type="email" placeholder={t("auth.email.placeholder")} value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">{t("users.label.initial_password")}</Label>
               <Input id="password" type="password" placeholder={t("auth.password.placeholder")} value={newUser.password} onChange={(e) => setNewUser({...newUser, password: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="district">{t("users.label.district")}</Label>
                <Input id="district" placeholder={t("users.label.district")} value={newUser.district} onChange={(e) => setNewUser({...newUser, district: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sector">{t("users.label.sector")}</Label>
                <Input id="sector" placeholder={t("users.label.sector")} value={newUser.sector} onChange={(e) => setNewUser({...newUser, sector: e.target.value})} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>{t("users.action.abort")}</Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending} className="bg-primary">
              {createMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
              {t("users.action.create_account")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("users.dialog.edit.title")}</DialogTitle>
          </DialogHeader>
          {editUser && (
            <div className="space-y-6 pt-4">
              <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 border">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {(editUser.fullName || editUser.farmerProfile?.fullName || "?")[0]}
                </div>
                <div>
                  <div className="font-bold">{editUser.fullName || editUser.farmerProfile?.fullName || t("users.fallback.unnamed_user")}</div>
                  <div className="text-xs text-muted-foreground">{editUser.phone}</div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t("users.label.assigned_role")}</Label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={editUser.role}
                  onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
                >
                  <option value="farmer">{t("role.farmer")}</option>
                  <option value="officer">{t("role.officer")}</option>
                  <option value="cooperative">{t("role.cooperative")}</option>
                  <option value="admin">{t("role.admin")}</option>
                  <option value="super_admin">{t("role.super_admin")}</option>
                </select>
                <p className="text-[10px] text-muted-foreground mt-2 italic">
                  {t("users.dialog.edit.role_change_note")}
                </p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowEditDialog(false)}>{t("common.cancel")}</Button>
                <Button onClick={handleSaveEdit} disabled={updateMutation.isPending} className="bg-primary">
                  {updateMutation.isPending ? t("users.status.syncing") : t("users.action.update_permission")}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* User Profile Side Drawer */}
      {drawerUser && (
        <>
          <div
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40"
            onClick={() => setDrawerUser(null)}
          />
          <div className="fixed top-0 right-0 h-full w-full max-w-md bg-card border-l border-border shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-5 border-b border-border/50 bg-muted/10">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-black text-lg">
                  {(drawerUser.fullName || drawerUser.farmerProfile?.fullName || drawerUser.phone || "?")[0].toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-foreground">
                    {drawerUser.fullName || drawerUser.farmerProfile?.fullName || "Unnamed User"}
                  </div>
                  <div className="text-xs text-muted-foreground">{drawerUser.phone}</div>
                </div>
              </div>
              <button
                onClick={() => setDrawerUser(null)}
                className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Profile Section */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Profile</h4>
                <div className="rounded-xl border border-border/50 divide-y divide-border/30 overflow-hidden">
                  {[
                    { label: "Full Name", value: drawerUser.fullName || drawerUser.farmerProfile?.fullName || "—" },
                    { label: "Phone", value: drawerUser.phone || "—" },
                    { label: "Email", value: drawerUser.email || "—" },
                    { label: "District", value: drawerUser.farmerProfile?.district || drawerUser.district || "—" },
                    { label: "Sector", value: drawerUser.farmerProfile?.sector || drawerUser.sector || "—" },
                    { label: "Language", value: drawerUser.language || "en" },
                  ].map(item => (
                    <div key={item.label} className="flex justify-between items-center px-4 py-2.5 text-sm">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="font-semibold text-foreground">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Account Status */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Account Status</h4>
                <div className="rounded-xl border border-border/50 divide-y divide-border/30 overflow-hidden">
                  <div className="flex justify-between items-center px-4 py-2.5 text-sm">
                    <span className="text-muted-foreground">Role</span>
                    <Badge role={drawerUser.role} />
                  </div>
                  <div className="flex justify-between items-center px-4 py-2.5 text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <span className={`font-bold text-xs uppercase ${
                      drawerUser.status === 'pending_verification'
                        ? 'text-amber-500'
                        : drawerUser.isActive
                          ? 'text-success'
                          : 'text-destructive'
                    }`}>
                      {drawerUser.status === 'pending_verification' ? '⏳ Pending' : drawerUser.isActive ? '✅ Active' : '🔒 Suspended'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center px-4 py-2.5 text-sm">
                    <span className="text-muted-foreground">Registered</span>
                    <span className="font-semibold text-xs text-foreground font-mono">
                      {drawerUser.createdAt ? new Date(drawerUser.createdAt).toLocaleDateString() : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center px-4 py-2.5 text-sm">
                    <span className="text-muted-foreground">Last Updated</span>
                    <span className="font-semibold text-xs text-foreground font-mono">
                      {drawerUser.updatedAt ? new Date(drawerUser.updatedAt).toLocaleDateString() : "—"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Quick Actions</h4>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 font-bold text-xs h-9"
                    onClick={() => { setEditUser(drawerUser); setShowEditDialog(true); }}
                  >
                    <Edit className="mr-1.5 h-3.5 w-3.5" /> Modify Role
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`flex-1 font-bold text-xs h-9 ${
                      drawerUser.isActive
                        ? 'border-amber-500/20 text-amber-600 hover:bg-amber-500/5'
                        : 'border-success/20 text-success hover:bg-success/5'
                    }`}
                    onClick={() => { handleToggleStatus(drawerUser); setDrawerUser(null); }}
                    disabled={user?.id === drawerUser.id}
                  >
                    {drawerUser.isActive
                      ? <><UserX className="mr-1.5 h-3.5 w-3.5" /> Suspend</>
                      : <><UserCheck className="mr-1.5 h-3.5 w-3.5" /> Reinstate</>}
                  </Button>
                </div>
              </div>

              {/* ID Reference */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">System Reference</h4>
                <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
                  <div className="text-[10px] text-muted-foreground mb-1">User ID</div>
                  <div className="font-mono text-xs text-foreground break-all">{drawerUser.id}</div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Badge({ role }: { role: string }) {
  const styles: Record<string, string> = {
    super_admin: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
    admin: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    officer: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    cooperative: "bg-sky-500/10 text-sky-500 border-sky-500/20",
    farmer: "bg-slate-500/10 text-slate-500 border-slate-500/20",
  };

  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border tracking-widest ${styles[role] || styles.farmer}`}>
      {role.replace("_", " ")}
    </span>
  );
}
