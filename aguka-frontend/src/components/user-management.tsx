import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  MoreHorizontal,
  Loader2,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  UserPlus,
  Shield,
  Smartphone,
  Mail,
  CheckCircle,
  XCircle,
  X,
  Clock,
  KeyRound,
  LogOut,
  GitMerge,
  Copy,
} from "lucide-react";
import { TableSearchBar } from "@/components/table-search-bar";
import { useAuth } from "@/lib/auth";
import {
  useSuperAdminUsers,
  useDeleteSuperAdminUser,
  useUpdateSuperAdminUser,
  useCreateSuperAdminUser,
  useApproveUser,
  useRejectUser,
  useSuperAdminAuditLogs,
  useMergeUsers,
  useResetUserPassword,
  useForceLogoutUser,
} from "@/hooks/use-data";
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
import { normalizeRwandaPhone } from "@/utils/phoneUtils";

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
    sector: "",
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
  const mergeMutation = useMergeUsers();
  const resetPasswordMutation = useResetUserPassword();
  const forceLogoutMutation = useForceLogoutUser();

  const [showMergeDialog, setShowMergeDialog] = useState(false);
  const [mergePrimary, setMergePrimary] = useState<any>(null);
  const [mergeSecondary, setMergeSecondary] = useState<any>(null);
  const [mergeSearchQuery, setMergeSearchQuery] = useState("");
  const [resetPwdResult, setResetPwdResult] = useState<any>(null);
  const [showResetPwdDialog, setShowResetPwdDialog] = useState(false);

  const userList = usersData?.data || [];
  const pagination = usersData?.pagination;

  const handleCreate = async () => {
    if (!newUser.phone || !newUser.fullName) {
      toast.error(t("users.error.phone_fullname_required"));
      return;
    }
    const normalizedPhone = normalizeRwandaPhone(newUser.phone);
    if (!normalizedPhone) {
      toast.error(t("auth.error.invalid_phone_format"));
      return;
    }
    createMutation.mutate({ ...newUser, phone: normalizedPhone }, {
      onSuccess: () => {
        toast.success(t("users.success.user_created"));
        setShowAddDialog(false);
        setNewUser({
          phone: "",
          email: "",
          password: "",
          role: "farmer",
          fullName: "",
          district: "",
          sector: "",
        });
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
        onSuccess: () =>
          toast.success(
            user.isActive ? t("users.success.user_deactivated") : t("users.success.user_activated"),
          ),
        onError: (err: any) => toast.error(err.message || t("users.error.update_failed")),
      },
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
      },
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
    rejectMutation.mutate(
      { id, reason },
      {
        onSuccess: () => toast.success(t("users.success.user_rejected")),
        onError: (err: any) => toast.error(err.message || t("users.error.reject_failed")),
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
          <div className="flex items-center gap-2 flex-wrap">
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
            <Button
              size="sm"
              onClick={() => setShowAddDialog(true)}
              className="bg-gradient-hero shadow-sm shadow-primary/20 text-xs font-bold h-8"
            >
              <UserPlus className="mr-1.5 h-3.5 w-3.5" />
              {t("users.action.provision_new_user")}
            </Button>
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
                      <span className="font-bold text-foreground">
                        {u.fullName ||
                          u.farmerProfile?.fullName ||
                          t("users.fallback.unnamed_user")}
                      </span>
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
                    {u.status === "pending_verification" ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase bg-amber-500/10 text-amber-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                        {t("users.status.pending")}
                      </span>
                    ) : (
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                          u.isActive
                            ? "bg-success/10 text-success"
                            : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${u.isActive ? "bg-success" : "bg-destructive"}`}
                        />
                        {u.isActive ? t("users.status.active") : t("users.status.locked")}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-[10px] text-muted-foreground font-mono">
                      {u.createdAt
                        ? new Date(u.createdAt).toISOString().split("T")[0]
                        : t("users.fallback.na")}
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
                          <DropdownMenuItem
                            onClick={() => {
                              setEditUser(u);
                              setShowEditDialog(true);
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            {t("users.action.modify_role")}
                          </DropdownMenuItem>
                          {u.status === "pending_verification" && (
                            <>
                              <DropdownMenuItem
                                className="text-success font-bold"
                                onClick={() => handleApprove(u.id)}
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                {t("users.action.approve_account")}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive font-bold"
                                onClick={() => handleReject(u.id)}
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                {t("users.action.reject_account")}
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuItem onClick={() => handleToggleStatus(u)}>
                            {u.isActive ? (
                              <>
                                <UserX className="mr-2 h-4 w-4 text-amber-600" />{" "}
                                {t("users.action.suspend_account")}
                              </>
                            ) : (
                              <>
                                <UserCheck className="mr-2 h-4 w-4 text-success" />{" "}
                                {t("users.action.reinstate_account")}
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              resetPasswordMutation.mutate(u.id, {
                                onSuccess: (r: any) => {
                                  setResetPwdResult(r.data);
                                  setShowResetPwdDialog(true);
                                },
                                onError: (err: any) => toast.error(err.message),
                              });
                            }}
                          >
                            <KeyRound className="mr-2 h-4 w-4" />
                            {t("users.action.reset_password")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-amber-600 font-bold"
                            onClick={() => {
                              if (confirm(t("users.confirm.force_logout"))) {
                                forceLogoutMutation.mutate(u.id, {
                                  onSuccess: (r: any) =>
                                    toast.success(
                                      `Logged out: ${r.data?.sessionsRevoked || 0} sessions revoked`,
                                    ),
                                  onError: (err: any) => toast.error(err.message),
                                });
                              }
                            }}
                          >
                            <LogOut className="mr-2 h-4 w-4" />
                            {t("users.action.force_logout")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive font-bold"
                            onClick={() => handleDelete(u.id)}
                          >
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
                  <td
                    colSpan={5}
                    className="py-20 text-center flex flex-col items-center justify-center"
                  >
                    <Loader2 className="h-8 w-8 text-muted-foreground opacity-20 mb-4 animate-spin" />
                    <p className="text-muted-foreground font-medium italic">
                      {t("users.empty.no_accounts_matching")}
                    </p>
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
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
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
                    onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                    className={
                      page === pagination.totalPages
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
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
              <Input
                id="fullName"
                placeholder={t("users.placeholder.full_name")}
                value={newUser.fullName}
                onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="phone">{t("auth.phone")}</Label>
                <Input
                  id="phone"
                  placeholder={t("auth.phone.placeholder")}
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">{t("auth.role")}</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
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
              <Input
                id="email"
                type="email"
                placeholder={t("auth.email.placeholder")}
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">{t("users.label.initial_password")}</Label>
              <Input
                id="password"
                type="password"
                placeholder={t("auth.password.placeholder")}
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="district">{t("users.label.district")}</Label>
                <Input
                  id="district"
                  placeholder={t("users.label.district")}
                  value={newUser.district}
                  onChange={(e) => setNewUser({ ...newUser, district: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sector">{t("users.label.sector")}</Label>
                <Input
                  id="sector"
                  placeholder={t("users.label.sector")}
                  value={newUser.sector}
                  onChange={(e) => setNewUser({ ...newUser, sector: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              {t("users.action.abort")}
            </Button>
            <Button
              onClick={handleCreate}
              disabled={createMutation.isPending}
              className="bg-primary"
            >
              {createMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="mr-2 h-4 w-4" />
              )}
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
                  <div className="font-bold">
                    {editUser.fullName ||
                      editUser.farmerProfile?.fullName ||
                      t("users.fallback.unnamed_user")}
                  </div>
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
                <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                  {t("common.cancel")}
                </Button>
                <Button
                  onClick={handleSaveEdit}
                  disabled={updateMutation.isPending}
                  className="bg-primary"
                >
                  {updateMutation.isPending
                    ? t("users.status.syncing")
                    : t("users.action.update_permission")}
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
                  {(drawerUser.fullName ||
                    drawerUser.farmerProfile?.fullName ||
                    drawerUser.phone ||
                    "?")[0].toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-foreground">
                    {drawerUser.fullName || drawerUser.farmerProfile?.fullName || t("users.fallback.unnamed_user")}
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
                <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                  {t("users.section.profile")}
                </h4>
                <div className="rounded-xl border border-border/50 divide-y divide-border/30 overflow-hidden">
                  {[
                    {
                      label: t("auth.full_name"),
                      value: drawerUser.fullName || drawerUser.farmerProfile?.fullName || "—",
                    },
                    { label: t("auth.phone"), value: drawerUser.phone || "—" },
                    { label: t("auth.email_optional"), value: drawerUser.email || "—" },
                    {
                      label: t("users.label.district"),
                      value: drawerUser.farmerProfile?.district || drawerUser.district || "—",
                    },
                    {
                      label: t("users.label.sector"),
                      value: drawerUser.farmerProfile?.sector || drawerUser.sector || "—",
                    },
                    { label: t("users.label.language"), value: drawerUser.language || "en" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex justify-between items-center px-4 py-2.5 text-sm"
                    >
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="font-semibold text-foreground">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Account Status */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                  {t("users.section.account_status")}
                </h4>
                <div className="rounded-xl border border-border/50 divide-y divide-border/30 overflow-hidden">
                  <div className="flex justify-between items-center px-4 py-2.5 text-sm">
                    <span className="text-muted-foreground">{t("users.label.role")}</span>
                    <Badge role={drawerUser.role} />
                  </div>
                  <div className="flex justify-between items-center px-4 py-2.5 text-sm">
                    <span className="text-muted-foreground">{t("users.label.status")}</span>
                    <span
                      className={`font-bold text-xs uppercase ${
                        drawerUser.status === "pending_verification"
                          ? "text-amber-500"
                          : drawerUser.isActive
                            ? "text-success"
                            : "text-destructive"
                      }`}
                    >
                      {drawerUser.status === "pending_verification"
                        ? "⏳ " + t("users.status.pending")
                        : drawerUser.isActive
                          ? "✅ " + t("users.status.active")
                          : "🔒 " + t("users.status.suspended")}
                    </span>
                  </div>
                  <div className="flex justify-between items-center px-4 py-2.5 text-sm">
                    <span className="text-muted-foreground">{t("users.label.registered")}</span>
                    <span className="font-semibold text-xs text-foreground font-mono">
                      {drawerUser.createdAt
                        ? new Date(drawerUser.createdAt).toLocaleDateString()
                        : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center px-4 py-2.5 text-sm">
                    <span className="text-muted-foreground">{t("users.label.last_updated")}</span>
                    <span className="font-semibold text-xs text-foreground font-mono">
                      {drawerUser.updatedAt
                        ? new Date(drawerUser.updatedAt).toLocaleDateString()
                        : "—"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                  {t("users.section.quick_actions")}
                </h4>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 font-bold text-xs h-9"
                    onClick={() => {
                      setEditUser(drawerUser);
                      setShowEditDialog(true);
                    }}
                  >
                    <Edit className="mr-1.5 h-3.5 w-3.5" /> {t("users.action.modify_role")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`flex-1 font-bold text-xs h-9 ${
                      drawerUser.isActive
                        ? "border-amber-500/20 text-amber-600 hover:bg-amber-500/5"
                        : "border-success/20 text-success hover:bg-success/5"
                    }`}
                    onClick={() => {
                      handleToggleStatus(drawerUser);
                      setDrawerUser(null);
                    }}
                    disabled={user?.id === drawerUser.id}
                  >
                    {drawerUser.isActive ? (
                      <>
                        <UserX className="mr-1.5 h-3.5 w-3.5" /> {t("users.action.suspend_account")}
                      </>
                    ) : (
                      <>
                        <UserCheck className="mr-1.5 h-3.5 w-3.5" /> {t("users.action.reinstate_account")}
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* ID Reference */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                  {t("users.section.system_reference")}
                </h4>
                <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
                  <div className="text-[10px] text-muted-foreground mb-1">{t("users.label.user_id")}</div>
                  <div className="font-mono text-xs text-foreground break-all">{drawerUser.id}</div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      {/* Merge Users Dialog */}
      <Dialog open={showMergeDialog} onOpenChange={setShowMergeDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GitMerge className="h-5 w-5 text-primary" />
              {t("users.dialog.merge.title")}
            </DialogTitle>
            <DialogDescription>
              {t("users.dialog.merge.description")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>{t("users.dialog.merge.search_label")}</Label>
              <Input
                placeholder={t("users.dialog.merge.search_placeholder")}
                value={mergeSearchQuery}
                onChange={(e) => setMergeSearchQuery(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {t("users.dialog.merge.primary_label")}
                </div>
                <div className="border rounded-lg p-3 min-h-[100px]">
                  {mergePrimary ? (
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-sm">
                          {mergePrimary.fullName || mergePrimary.phone}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {mergePrimary.phone} — {t(("role." + mergePrimary.role) as any)}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setMergePrimary(null)}>
                        {t("users.dialog.merge.change")}
                      </Button>
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground italic">
                      {t("users.dialog.merge.select_primary")}
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {t("users.dialog.merge.secondary_label")}
                </div>
                <div className="border rounded-lg p-3 min-h-[100px]">
                  {mergeSecondary ? (
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-sm">
                          {mergeSecondary.fullName || mergeSecondary.phone}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {mergeSecondary.phone} — {t(("role." + mergeSecondary.role) as any)}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setMergeSecondary(null)}>
                        {t("users.dialog.merge.change")}
                      </Button>
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground italic">
                      {t("users.dialog.merge.select_secondary")}
                    </div>
                  )}
                </div>
              </div>
            </div>
            {mergeSearchQuery && (
              <div className="border rounded-lg max-h-40 overflow-y-auto">
                {userList
                  .filter(
                    (u: any) =>
                      u.id !== mergePrimary?.id &&
                      (u.phone?.includes(mergeSearchQuery) ||
                        u.fullName?.toLowerCase()?.includes(mergeSearchQuery.toLowerCase()) ||
                        u.email?.includes(mergeSearchQuery)),
                  )
                  .map((u: any) => (
                    <div
                      key={u.id}
                      className="flex items-center justify-between px-3 py-2 hover:bg-muted/50 cursor-pointer border-b last:border-0"
                    >
                      <div className="text-sm">
                        <span className="font-medium">{u.fullName || u.phone}</span>
                        <span className="text-muted-foreground ml-2">
                          {u.phone} — {t(("role." + u.role) as any)}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm" onClick={() => setMergePrimary(u)}>
                          {t("users.dialog.merge.primary_btn")}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setMergeSecondary(u)}>
                          {t("users.dialog.merge.secondary_btn")}
                        </Button>
                      </div>
                    </div>
                  ))}
                {userList.filter((u: any) => u.phone?.includes(mergeSearchQuery)).length === 0 && (
                  <div className="p-3 text-xs text-muted-foreground italic text-center">
                    {t("users.dialog.merge.no_matching")}
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowMergeDialog(false);
                setMergePrimary(null);
                setMergeSecondary(null);
                setMergeSearchQuery("");
              }}
            >
              {t("users.dialog.merge.cancel")}
            </Button>
            <Button
              onClick={() => {
                if (!mergePrimary || !mergeSecondary) {
                  toast.error(t("users.dialog.merge.error_select_both"));
                  return;
                }
                mergeMutation.mutate(
                  { primaryUserId: mergePrimary.id, secondaryUserId: mergeSecondary.id },
                  {
                    onSuccess: (r: any) => {
                      toast.success(t("users.dialog.merge.success"));
                      setShowMergeDialog(false);
                      setMergePrimary(null);
                      setMergeSecondary(null);
                      setMergeSearchQuery("");
                    },
                    onError: (err: any) => toast.error(err.message),
                  },
                );
              }}
              disabled={!mergePrimary || !mergeSecondary || mergeMutation.isPending}
              className="bg-primary"
            >
              {mergeMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <GitMerge className="mr-2 h-4 w-4" />
              )}
              {t("users.dialog.merge.merge_btn")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Result Dialog */}
      <Dialog open={showResetPwdDialog} onOpenChange={setShowResetPwdDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-primary" />
              {t("users.dialog.reset_password.title")}
            </DialogTitle>
            <DialogDescription>
              {t("users.dialog.reset_password.description")}
            </DialogDescription>
          </DialogHeader>
          {resetPwdResult && (
            <div className="space-y-4 py-4">
              <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  {t("users.dialog.reset_password.temp_password")}
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-2 rounded bg-background border text-lg font-mono font-bold tracking-wider">
                    {resetPwdResult.tempPassword}
                  </code>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      navigator.clipboard.writeText(resetPwdResult.tempPassword);
                      toast.success(t("users.dialog.reset_password.copied"));
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                <p className="font-bold text-destructive">{t("users.dialog.reset_password.one_time_warning")}</p>
                <p>{t("users.dialog.reset_password.user_label")} {resetPwdResult.phone}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              onClick={() => {
                setShowResetPwdDialog(false);
                setResetPwdResult(null);
              }}
              className="bg-primary"
            >
              {t("common.done")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Badge({ role }: { role: string }) {
  const { t } = useI18n();
  const styles: Record<string, string> = {
    super_admin: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
    admin: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    officer: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    cooperative: "bg-sky-500/10 text-sky-500 border-sky-500/20",
    farmer: "bg-slate-500/10 text-slate-500 border-slate-500/20",
  };

  return (
    <span
      className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border tracking-widest ${styles[role] || styles.farmer}`}
    >
      {t(("role." + role) as any)}
    </span>
  );
}
