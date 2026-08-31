import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, StatCard } from "@/components/dashboard-ui";
import { Card } from "@/components/ui/card";
import {
  Users,
  Sprout,
  Activity,
  TrendingUp,
  FileText,
  AlertCircle,
  Loader2,
  Check,
  X,
} from "lucide-react";
import { useUsers, useApproveUser, useAdminKpiSummary } from "@/hooks/use-data";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

// Skeleton loader for stat cards
function StatSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border bg-card p-5 space-y-3">
      <div className="h-3 w-24 bg-muted rounded" />
      <div className="h-8 w-16 bg-muted rounded" />
    </div>
  );
}

function AdminDashboard() {
  const { data: kpi, isLoading: loadingKpi, isError: kpiError } = useAdminKpiSummary();
  const { data: usersResult, isLoading: loadingUsers } = useUsers();
  const approveUser = useApproveUser();
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const handleVerify = (userId: string) => {
    approveUser.mutate(userId, {
      onSuccess: () => {
        toast.success("User approved successfully");
        setSelectedUser(null);
      },
    });
  };

  const handleReject = (userId: string, name: string) => {
    setRejectingId(userId);
    setTimeout(() => {
      setRejectingId(null);
      toast.error(`${name} has been rejected and notified.`);
    }, 800);
  };

  // Loading skeleton
  if (loadingKpi || loadingUsers) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <StatSkeleton key={i} />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 h-64 bg-muted animate-pulse rounded-xl border" />
          <div className="h-64 bg-muted animate-pulse rounded-xl border" />
        </div>
      </div>
    );
  }

  const userList = (usersResult as any)?.data || [];

  const stats = {
    totalFarmers: kpi?.totalFarmers ?? 0,
    activeFarms: kpi?.activeFarms ?? 0,
    alertsToday: kpi?.alertsToday ?? 0,
    criticalAlerts: kpi?.criticalAlerts ?? 0,
    sensorsOnline: kpi?.sensorsOnline ?? 0,
    sensorsOffline: kpi?.sensorsOffline ?? 0,
    openSupportTickets: kpi?.openSupportTickets ?? 0,
    farmerGrowthPct: kpi?.farmerGrowthPct ?? 0,
  };

  // Chart data: simple online/offline sensor ratio
  const sensorTotal = stats.sensorsOnline + stats.sensorsOffline;
  const sensorRatio = sensorTotal > 0 ? (stats.sensorsOnline / sensorTotal) * 100 : 0;

  const pendingUsers = userList.filter(
    (u: any) => u.status === "pending_verification" || u.status === "inactive" || !u.isActive,
  );
  const pendingValidations = pendingUsers.length;
  const validationQueue = pendingUsers.slice(0, 5);
  const displayQueue = validationQueue.length > 0 ? validationQueue : userList.slice(0, 5);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Overview"
        subtitle="System usage, farm activity and data validation queue."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active farmers" value={stats.totalFarmers} icon={Users} accent="primary" />
        <StatCard label="Active farms" value={stats.activeFarms} icon={Sprout} accent="success" />
        <StatCard
          label="Sensors online"
          value={`${stats.sensorsOnline}/${sensorTotal}`}
          icon={Activity}
          accent={stats.sensorsOffline > 0 ? "warning" : "info"}
        />
        <StatCard
          label="Growth rate"
          value={`${stats.farmerGrowthPct}%`}
          icon={TrendingUp}
          accent={stats.farmerGrowthPct >= 0 ? "success" : "destructive"}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Alerts today"
          value={stats.alertsToday}
          icon={AlertCircle}
          accent={stats.criticalAlerts > 0 ? "destructive" : "warning"}
        />
        <StatCard
          label="Critical alerts"
          value={stats.criticalAlerts}
          icon={AlertCircle}
          accent="destructive"
        />
        <StatCard
          label="Open tickets"
          value={stats.openSupportTickets}
          icon={FileText}
          accent="info"
        />
        <StatCard
          label="Pending validations"
          value={pendingValidations}
          icon={FileText}
          accent="warning"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Sensor Health Overview */}
        <Card className="lg:col-span-2 p-6">
          <h3 className="mb-1 font-display text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" /> Sensor Network Health
          </h3>
          <p className="text-xs text-muted-foreground mb-5">
            Overall sensor connectivity · {stats.sensorsOnline} online of {sensorTotal} total
          </p>
          <div className="flex items-end gap-4 h-40">
            <div className="flex-1 flex flex-col items-center gap-2">
              <div
                className="w-full rounded-t-md bg-gradient-to-t from-success to-success/40 transition-all"
                style={{ height: `${sensorRatio}%` }}
              />
              <span className="text-[10px] font-bold text-muted-foreground">Online</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-2">
              <div
                className="w-full rounded-t-md bg-gradient-to-t from-destructive to-destructive/40 transition-all"
                style={{ height: `${100 - sensorRatio}%` }}
              />
              <span className="text-[10px] font-bold text-muted-foreground">Offline</span>
            </div>
          </div>
        </Card>

        {/* Validation Queue */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" /> Validation Queue
            </h3>
            {pendingValidations > 0 && (
              <span className="text-[10px] font-black text-warning bg-warning/10 border border-warning/20 px-2 py-0.5 rounded-full">
                {pendingValidations} pending
              </span>
            )}
          </div>
          <div className="space-y-3">
            {displayQueue.map((u: any) => {
              const name = u.fullName || u.farmerProfile?.fullName || u.phone;
              const isPending = u.status === "pending_verification" || !u.isActive;
              const submittedDate = u.createdAt
                ? new Date(u.createdAt).toLocaleDateString("en-RW", {
                    day: "2-digit",
                    month: "short",
                  })
                : "—";
              return (
                <div
                  key={u.id}
                  className="rounded-lg border border-border/50 p-3 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => setSelectedUser(u)}
                    >
                      <div className="text-sm font-bold truncate">{name}</div>
                      <div className="text-[10px] text-muted-foreground capitalize mt-0.5">
                        {u.role?.replace("_", " ")} {u.district ? `· ${u.district}` : ""}
                      </div>
                      <div className="text-[10px] text-muted-foreground/70 mt-0.5">
                        Submitted: {submittedDate}
                      </div>
                    </div>
                    {isPending && (
                      <div className="flex items-center gap-1 shrink-0 mt-0.5">
                        <button
                          onClick={() => handleVerify(u.id)}
                          disabled={approveUser.isPending}
                          title="Approve"
                          className="flex h-7 w-7 items-center justify-center rounded-full bg-success/10 text-success hover:bg-success hover:text-white transition-all border border-success/20 disabled:opacity-50"
                        >
                          {approveUser.isPending && approveUser.variables === u.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Check className="h-3 w-3" />
                          )}
                        </button>
                        <button
                          onClick={() => handleReject(u.id, name)}
                          disabled={rejectingId === u.id}
                          title="Reject"
                          className="flex h-7 w-7 items-center justify-center rounded-full bg-destructive/10 text-destructive hover:bg-destructive hover:text-white transition-all border border-destructive/20 disabled:opacity-50"
                        >
                          {rejectingId === u.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <X className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                    )}
                    {!isPending && (
                      <span
                        className="text-[10px] text-primary font-bold cursor-pointer"
                        onClick={() => setSelectedUser(u)}
                      >
                        View
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            {displayQueue.length === 0 && (
              <div className="text-center py-6 text-xs text-muted-foreground">
                No users available.
              </div>
            )}
          </div>
        </Card>
      </div>

      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl font-display">
              <Users className="h-6 w-6 text-primary" />
              User Profile Details
            </DialogTitle>
            <DialogDescription>
              Quick review of registration data for {selectedUser?.fullName || selectedUser?.phone}.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-6 py-4">
              <section className="grid grid-cols-2 gap-4">
                <DetailItem
                  label="Role"
                  value={
                    <span className="capitalize">{selectedUser?.role?.replace("_", " ")}</span>
                  }
                />
                <DetailItem label="Status" value={selectedUser?.status || "Active"} />
                <DetailItem
                  label="Location"
                  value={`${selectedUser?.district || "Unknown"}, ${selectedUser?.sector || "Unknown"}`}
                />
                <DetailItem
                  label="Contact"
                  value={selectedUser?.phone || selectedUser?.email || "Unknown"}
                />
                <DetailItem
                  label="Submitted"
                  value={
                    selectedUser?.createdAt
                      ? new Date(selectedUser.createdAt).toLocaleString()
                      : "—"
                  }
                />
              </section>
              <Separator />
              <section>
                <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">
                  Additional Info
                </h4>
                <div className="flex flex-wrap gap-2 text-sm">
                  {selectedUser?.farmerProfile && (
                    <div className="flex flex-col gap-1 w-full text-muted-foreground">
                      <span>Farm Name: {selectedUser.farmerProfile.farmName || "N/A"}</span>
                      <span>Farm Size: {selectedUser.farmerProfile.farmSizeHectares || 0} Ha</span>
                    </div>
                  )}
                  {!selectedUser?.farmerProfile &&
                    !selectedUser?.cooperativeProfile &&
                    !selectedUser?.extensionOfficerProfile && (
                      <span className="text-xs text-muted-foreground italic">
                        No specialized profile data available.
                      </span>
                    )}
                </div>
              </section>
            </div>
          </ScrollArea>
          <DialogFooter className="gap-2 sm:justify-between">
            <div className="flex items-center gap-2">
              {(!selectedUser?.isActive || selectedUser?.status === "pending_verification") && (
                <>
                  <Button
                    onClick={() => handleVerify(selectedUser.id)}
                    disabled={approveUser.isPending}
                    className="bg-success hover:bg-success/90 text-white"
                  >
                    {approveUser.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Check className="mr-2 h-4 w-4" /> Approve
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      handleReject(selectedUser.id, selectedUser.fullName || selectedUser.phone);
                      setSelectedUser(null);
                    }}
                  >
                    <X className="mr-2 h-4 w-4" /> Reject
                  </Button>
                </>
              )}
            </div>
            <Button variant="outline" onClick={() => setSelectedUser(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <div className="text-[10px] text-muted-foreground font-bold uppercase">{label}</div>
      <div className="text-sm font-medium">{value || "—"}</div>
    </div>
  );
}
