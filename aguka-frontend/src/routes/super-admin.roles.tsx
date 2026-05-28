import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard-ui";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSuperAdminRoles, useUpdateRolePermissions } from "@/hooks/use-data";
import { Loader2, Shield, Users, Edit2, Check, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export const Route = createFileRoute("/super-admin/roles")({
  component: RolesPage,
});

const ALL_PERMISSIONS = [
  "manage_users", "manage_roles", "manage_settings", "view_audit_logs", 
  "manage_backups", "manage_all_data", "broadcast_notifications",
  "manage_assigned_farmers", "send_advisories", "view_reports",
  "manage_cooperative_members", "manage_resources", "schedule_events",
  "view_own_farm", "log_activities", "view_advisories", "view_weather", "view_market_prices"
];

const PERMISSION_LABELS: Record<string, string> = {
  manage_users: "Manage users",
  manage_roles: "Manage roles",
  manage_settings: "Manage settings",
  view_audit_logs: "View audit logs",
  manage_backups: "Manage backups",
  manage_all_data: "Manage all data",
  broadcast_notifications: "Broadcast notifications",
  manage_assigned_farmers: "Manage assigned farmers",
  send_advisories: "Send advisories",
  view_reports: "View reports",
  manage_cooperative_members: "Manage cooperative members",
  manage_resources: "Manage resources",
  schedule_events: "Schedule events",
  view_own_farm: "View own farm",
  log_activities: "Log activities",
  view_advisories: "View advisories",
  view_weather: "View weather",
  view_market_prices: "View market prices",
};

function RolesPage() {
  const { data: rolesData, isLoading } = useSuperAdminRoles();
  const updatePermissions = useUpdateRolePermissions();
  const [editingRole, setEditingRole] = useState<any>(null);
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  // Custom Role Creation
  const [showCreateRole, setShowCreateRole] = useState(false);
  const [customRoles, setCustomRoles] = useState<any[]>([]);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDesc, setNewRoleDesc] = useState("");
  const [newRolePerms, setNewRolePerms] = useState<string[]>([]);

  const handleCreateRole = () => {
    if (!newRoleName.trim()) return;
    const slug = newRoleName.toLowerCase().replace(/\s+/g, '_');
    setCustomRoles(prev => [...prev, {
      role: slug,
      label: newRoleName,
      description: newRoleDesc,
      permissions: newRolePerms,
      userCount: 0,
      isCustom: true,
    }]);
    setNewRoleName("");
    setNewRoleDesc("");
    setNewRolePerms([]);
    setShowCreateRole(false);
  };

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const roles = rolesData?.data || [];

  // Combine server roles and custom roles, then paginate together
  const allRoles = [...roles, ...customRoles];
  const PAGE_SIZE = 10;
  const totalItems = allRoles.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const paginatedAllRoles = allRoles.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleEdit = (role: any) => {
    setEditingRole(role);
    setSelectedPerms(role.permissions);
  };

  const handleTogglePerm = (perm: string) => {
    setSelectedPerms(prev => 
      prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
    );
  };

  const handleSave = async () => {
    try {
      await updatePermissions.mutateAsync({
        role: editingRole.role,
        permissions: selectedPerms
      });
      toast.success(`Permissions for ${editingRole.role} updated`);
      setEditingRole(null);
    } catch (error) {
      toast.error("Failed to update permissions");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Roles & Access Control"
        subtitle="Manage system-wide roles and their granular permissions."
        action={
          <Button className="bg-primary shadow-lg shadow-primary/20" onClick={() => setShowCreateRole(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Custom Role
          </Button>
        }
      />

      <Card className="border border-border/50 shadow-card-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/50 bg-muted/20 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Assigned Users</th>
                <th className="px-6 py-4">Permissions</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {paginatedAllRoles.map((role: any) => (
                <tr key={role.role} className="group hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Shield className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="font-bold text-foreground capitalize">
                          {role.label || role.role.replace(/_/g, " ")}
                        </span>
                        {role.isCustom && (
                          <Badge variant="outline" className="ml-2 text-[9px] font-black uppercase border-amber-500/30 text-amber-600 bg-amber-500/5">Custom</Badge>
                        )}
                        {role.description && (
                          <div className="text-[10px] text-muted-foreground">{role.description}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{role.userCount || 0} users</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1.5 max-w-xl">
                      {role.permissions.map((perm: string) => (
                        <Badge key={perm} variant="secondary" className="text-[10px] font-semibold py-0.5 px-2">
                          {PERMISSION_LABELS[perm] || perm}
                        </Badge>
                      ))}
                      {role.permissions.length === 0 && (
                        <span className="text-xs text-muted-foreground italic">No permissions assigned</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="font-bold text-xs h-8 border-primary/20 hover:border-primary text-primary hover:bg-primary/5"
                      onClick={() => handleEdit(role)}
                    >
                      <Edit2 className="mr-1.5 h-3.5 w-3.5" />
                      Modify Permissions
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-border/50 bg-muted/5">
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
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </Card>

      <Dialog open={!!editingRole} onOpenChange={() => setEditingRole(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Permissions for {editingRole?.role.replace("_", " ")}
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ALL_PERMISSIONS.map(perm => (
                <div key={perm} className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-muted/50 cursor-pointer transition-colors" onClick={() => handleTogglePerm(perm)}>
                  <Checkbox 
                    checked={selectedPerms.includes(perm)} 
                    onCheckedChange={() => handleTogglePerm(perm)}
                  />
                  <div className="flex-1">
                    <div className="text-sm font-semibold">{PERMISSION_LABELS[perm] || perm}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{perm}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="pt-4 border-t">
            <Button variant="outline" onClick={() => setEditingRole(null)}>Cancel</Button>
            <Button onClick={handleSave} disabled={updatePermissions.isPending}>
              {updatePermissions.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Create Custom Role Dialog */}
      <Dialog open={showCreateRole} onOpenChange={setShowCreateRole}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Create Custom Role
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-5 py-4">
            <div className="space-y-2">
              <Label htmlFor="roleName">Role Name <span className="text-destructive">*</span></Label>
              <Input
                id="roleName"
                placeholder="e.g. Field Inspector"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="roleDesc">Description</Label>
              <Input
                id="roleDesc"
                placeholder="What does this role do?"
                value={newRoleDesc}
                onChange={(e) => setNewRoleDesc(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Permissions</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ALL_PERMISSIONS.map(perm => (
                  <div
                    key={perm}
                    className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => setNewRolePerms(prev =>
                      prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
                    )}
                  >
                    <Checkbox
                      checked={newRolePerms.includes(perm)}
                      onCheckedChange={() => setNewRolePerms(prev =>
                        prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
                      )}
                    />
                    <div className="flex-1">
                      <div className="text-sm font-semibold">{PERMISSION_LABELS[perm] || perm}</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{perm}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4 border-t">
            <Button variant="outline" onClick={() => setShowCreateRole(false)}>Cancel</Button>
            <Button onClick={handleCreateRole} disabled={!newRoleName.trim()}>
              <Plus className="mr-2 h-4 w-4" />
              Create Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
