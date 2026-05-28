import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { PageHeader } from "@/components/dashboard-ui";
import { Card } from "@/components/ui/card";
import { useSuperAdminAuditLogs } from "@/hooks/use-data";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useTableSearch } from "@/hooks/use-table-search";
import { TableSearchBar } from "@/components/table-search-bar";
import { TablePagination } from "@/components/table-pagination";

export const Route = createFileRoute("/super-admin/audit")({
  component: AuditPage,
});

function getHumanDescription(log: any): string {
  const action = log.action || "";
  const before = log.oldValue || log.before;
  const after = log.newValue || log.after;

  if (action === "UPDATE_USER" && before && after) {
    const changes: string[] = [];
    if (before.role !== after.role) {
      changes.push(`Role changed: ${before.role?.toUpperCase() || "NONE"} → ${after.role?.toUpperCase() || "NONE"}`);
    }
    if (before.isActive !== after.isActive) {
      if (after.isActive === false) {
        changes.push("User suspended by admin");
      } else {
        changes.push("User reinstated by admin");
      }
    }
    if (before.status !== after.status) {
      changes.push(`Status changed: ${before.status} → ${after.status}`);
    }
    if (changes.length > 0) return changes.join(", ");
    return "User account updated";
  }

  if (action === "CREATE_USER") {
    return `New user registered or created (${after?.phone || after?.email || "N/A"})`;
  }

  if (action === "DELETE_USER") {
    return "User purged/deleted from system";
  }

  if (action === "APPROVE_USER") {
    return "Registration application approved";
  }

  if (action === "REJECT_USER") {
    return "Registration application rejected";
  }

  if (action === "LOGIN") {
    return "Successfully logged into system";
  }

  if (action === "LOGOUT") {
    return "Logged out of system";
  }

  if (action === "UPDATE_PROFILE") {
    return "Farmer profile details updated";
  }

  if (action === "UPDATE_PERMISSIONS") {
    return `Role permissions updated for ${after?.role || "role"}`;
  }

  if (action.includes("CREATE")) {
    return `Created new ${log.resourceType || "resource"}`;
  }
  if (action.includes("DELETE")) {
    return `Purged ${log.resourceType || "resource"}`;
  }
  if (action.includes("UPDATE")) {
    return `Modified ${log.resourceType || "resource"}`;
  }

  return `Performed action ${action}`;
}

function AuditPage() {
  const [serverPage, setServerPage] = React.useState(1);
  const [clientPage, setClientPage] = React.useState(1);
  const [filterAction, setFilterAction] = React.useState("ALL");
  const [filterUser, setFilterUser] = React.useState("");
  const [dateFrom, setDateFrom] = React.useState("");
  const [dateTo, setDateTo] = React.useState("");
  const PAGE_SIZE = 20;

  const { data: auditData, isLoading } = useSuperAdminAuditLogs({
    page: serverPage,
    limit: 100, // Load larger batch for client-side pagination
  });

  // Reset pages when filters change
  React.useEffect(() => {
    setClientPage(1);
    setServerPage(1);
  }, [filterAction, filterUser, dateFrom, dateTo]);

  const logList = auditData?.data || [];
  const serverPagination = auditData?.pagination;

  // Client-side filtering
  const filteredLogs = React.useMemo(() => {
    return logList.filter((log: any) => {
      if (filterAction !== "ALL") {
        if (filterAction === "LOCK") {
          const before = log.oldValue || log.before;
          const after = log.newValue || log.after;
          const isLock = log.action === "UPDATE_USER" && before && after && before.isActive !== after.isActive && after.isActive === false;
          if (!isLock) return false;
        } else {
          if (!log.action.includes(filterAction)) return false;
        }
      }
      if (filterUser.trim() !== "") {
        const phone = log.user?.phone || "System";
        if (!phone.toLowerCase().includes(filterUser.toLowerCase())) return false;
      }
      if (dateFrom) {
        const logDate = new Date(log.createdAt);
        const from = new Date(dateFrom); from.setHours(0, 0, 0, 0);
        if (logDate < from) return false;
      }
      if (dateTo) {
        const logDate = new Date(log.createdAt);
        const to = new Date(dateTo); to.setHours(23, 59, 59, 999);
        if (logDate > to) return false;
      }
      return true;
    });
  }, [logList, filterAction, filterUser, dateFrom, dateTo]);

  const totalFiltered = filteredLogs.length;
  const totalClientPages = Math.max(1, Math.ceil(totalFiltered / PAGE_SIZE));
  const paginatedLogs = filteredLogs.slice((clientPage - 1) * PAGE_SIZE, clientPage * PAGE_SIZE);

  const exportCSV = () => {
    const headers = ["#", "Actor", "Action", "Description", "Module", "Entity", "Timestamp"];
    const rows = filteredLogs.map((log: any, i: number) => [
      i + 1,
      log.user?.phone || "System",
      log.action,
      getHumanDescription(log),
      log.module || "",
      log.resourceId ? `${log.resourceType || "RESOURCE"}(${log.resourceId})` : "",
      new Date(log.createdAt).toLocaleString(),
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "audit-logs.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const actionColor = (action: string) => {
    if (action.includes("DELETE")) return "bg-destructive/10 text-destructive";
    if (action.includes("CREATE")) return "bg-success/10 text-success";
    if (action.includes("UPDATE")) return "bg-warning/10 text-warning";
    if (action.includes("LOGIN")) return "bg-primary/10 text-primary";
    return "bg-muted/60 text-muted-foreground";
  };

  const dotColor = (action: string) => {
    if (action.includes("DELETE")) return "bg-destructive";
    if (action.includes("CREATE")) return "bg-success";
    if (action.includes("UPDATE")) return "bg-warning";
    return "bg-primary";
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
        title="Audit Logs"
        subtitle="Monitor every action across the system."
        action={
          <Button variant="outline" className="border-primary/20 hover:border-primary text-primary hover:bg-primary/5 font-bold" onClick={exportCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        }
      />

      <Card className="border border-border/50 shadow-card-soft overflow-hidden">
        {/* Filter Bar */}
        <div className="p-5 border-b border-border/50 bg-muted/10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Search Actor</label>
              <input
                type="text"
                className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Search phone number..."
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Action Type</label>
              <select
                className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
              >
                <option value="ALL">ALL Actions</option>
                <option value="CREATE">CREATE</option>
                <option value="UPDATE">UPDATE</option>
                <option value="DELETE">DELETE</option>
                <option value="LOGIN">LOGIN</option>
                <option value="LOCK">LOCK / SUSPEND</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Date From</label>
              <input
                type="date"
                className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Date To</label>
              <input
                type="date"
                className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>

          {/* Results summary */}
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Showing <span className="font-bold text-foreground">{paginatedLogs.length}</span> of{" "}
              <span className="font-bold text-foreground">{totalFiltered}</span> filtered entries
              {serverPagination && (
                <> (server total: <span className="font-bold text-foreground">{serverPagination.totalItems}</span>)</>
              )}
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/50 bg-muted/20 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-4 w-8">#</th>
                <th className="px-4 py-4">Actor</th>
                <th className="px-4 py-4">Action</th>
                <th className="px-4 py-4 min-w-[240px]">Description</th>
                <th className="px-4 py-4">Affected Entity</th>
                <th className="px-4 py-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {paginatedLogs.map((log: any, index: number) => (
                <tr key={log.id} className="group hover:bg-muted/20 transition-colors">
                  {/* Row number */}
                  <td className="px-4 py-3 text-xs text-muted-foreground font-mono">
                    {(clientPage - 1) * PAGE_SIZE + index + 1}
                  </td>

                  {/* Actor */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full shrink-0 ${dotColor(log.action)}`} />
                      <span className="font-bold text-sm text-foreground">
                        {log.user?.phone || "System"}
                      </span>
                    </div>
                  </td>

                  {/* Action badge */}
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider whitespace-nowrap ${actionColor(log.action)}`}>
                      {log.action}
                    </span>
                  </td>

                  {/* Description */}
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-foreground leading-snug">
                      {getHumanDescription(log)}
                    </div>
                    {log.module && (
                      <div className="text-[10px] text-muted-foreground mt-0.5 font-mono">
                        Module: {log.module}
                      </div>
                    )}
                  </td>

                  {/* Affected Entity */}
                  <td className="px-4 py-3">
                    {log.resourceId ? (
                      <div className="text-xs font-mono text-muted-foreground">
                        <span className="font-bold text-foreground text-[10px] uppercase tracking-wider">
                          {log.resourceType || "RESOURCE"}
                        </span>
                        <div className="text-[10px] truncate max-w-[120px]" title={log.resourceId}>
                          {log.resourceId}
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground/50">—</span>
                    )}
                  </td>

                  {/* Timestamp */}
                  <td className="px-4 py-3 text-right">
                    <span className="text-xs text-muted-foreground font-mono whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {paginatedLogs.length === 0 && (
          <div className="text-center py-16 text-muted-foreground italic text-sm">
            No audit logs match the specified search filters.
          </div>
        )}

        {/* Pagination */}
        {totalClientPages > 1 && (
          <div className="p-4 border-t border-border/50 bg-muted/5 flex items-center justify-between gap-4">
            <span className="text-xs text-muted-foreground">
              Page <span className="font-bold text-foreground">{clientPage}</span> of{" "}
              <span className="font-bold text-foreground">{totalClientPages}</span>
            </span>
            <div className="flex gap-1 items-center">
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3 text-xs"
                disabled={clientPage === 1}
                onClick={() => setClientPage(p => Math.max(1, p - 1))}
              >
                ← Prev
              </Button>
              {Array.from({ length: Math.min(totalClientPages, 7) }, (_, i) => {
                const start = Math.max(1, clientPage - 3);
                const p = start + i;
                if (p > totalClientPages) return null;
                return (
                  <Button
                    key={p}
                    variant={p === clientPage ? "default" : "ghost"}
                    size="sm"
                    className={`h-8 w-8 text-xs ${p === clientPage ? "bg-primary text-primary-foreground" : ""}`}
                    onClick={() => setClientPage(p)}
                  >
                    {p}
                  </Button>
                );
              })}
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3 text-xs"
                disabled={clientPage === totalClientPages}
                onClick={() => setClientPage(p => Math.min(totalClientPages, p + 1))}
              >
                Next →
              </Button>
            </div>

            {/* Load more from server if needed */}
            {serverPagination && serverPagination.hasNextPage && clientPage === totalClientPages && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-primary"
                onClick={() => setServerPage(p => p + 1)}
              >
                Load more from server
              </Button>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}


