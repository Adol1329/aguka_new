import { PageHeader } from "@/components/dashboard-ui";
import { Card } from "@/components/ui/card";
import {
  useFarmers,
  useUsers,
  useAddCooperativeMember,
  useCooperativeMembers,
  useRemoveCooperativeMember,
  useUpdateMemberStatus,
  useImportFarmers,
} from "@/hooks/use-data";
import { cooperativeApi } from "@/api/cooperative";
import { ApiError } from "@/api/client";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Loader2,
  Users,
  Search,
  MapPin,
  Smartphone,
  Trash2,
  UserX,
  Upload,
  Download,
  AlertTriangle,
  CheckCircle2,
  KeyRound,
  MessageSquare,
  MessageSquareOff,
} from "lucide-react";
import { useState, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { useTableSearch } from "@/hooks/use-table-search";
import { TableSearchBar } from "@/components/table-search-bar";
import { toast } from "sonner";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface RowError {
  row: number;
  fullName?: string;
  errors: string[];
}

interface ImportedFarmer {
  id: string;
  fullName: string;
  phone: string;
  tempPassword: string;
  smsSent: boolean;
  smsError?: string;
}

function ImportFarmersDialog({
  open,
  onOpenChange,
  coopId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  coopId: string;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [rowErrors, setRowErrors] = useState<RowError[] | null>(null);
  const [results, setResults] = useState<ImportedFarmer[] | null>(null);
  const [smsMeta, setSmsMeta] = useState<{ configured: boolean; sandbox: boolean } | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const importFarmers = useImportFarmers();

  const reset = () => {
    setSelectedFile(null);
    setRowErrors(null);
    setResults(null);
    setSmsMeta(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  const handleDownloadTemplate = async () => {
    setIsDownloading(true);
    try {
      await cooperativeApi.downloadFarmerImportTemplate(coopId);
    } catch (err: any) {
      toast.error(err?.message || "Failed to download template.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Choose an Excel file first.");
      return;
    }
    setRowErrors(null);
    try {
      const res = await importFarmers.mutateAsync({ coopId, file: selectedFile });
      setResults((res as any)?.data?.farmers || []);
      setSmsMeta({
        configured: !!(res as any)?.data?.smsConfigured,
        sandbox: !!(res as any)?.data?.smsSandbox,
      });
      toast.success(`${(res as any)?.data?.imported || 0} farmer(s) imported ✓`);
    } catch (err: any) {
      if (err instanceof ApiError && Array.isArray(err.details)) {
        setRowErrors(err.details as RowError[]);
      } else {
        toast.error(err?.message || "Failed to import farmers.");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? onOpenChange(v) : handleClose())}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Import Farmers from Excel</DialogTitle>
        </DialogHeader>

        {results ? (
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-2 text-success text-sm font-semibold">
              <CheckCircle2 className="h-4 w-4" />
              {results.length} farmer{results.length === 1 ? "" : "s"} imported and added to your cooperative
            </div>

            {smsMeta?.configured ? (
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-1">
                <p className="text-xs font-semibold flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5" />
                  {results.filter((f) => f.smsSent).length} of {results.length} texted their login
                  credentials automatically.
                </p>
                {smsMeta.sandbox && (
                  <p className="text-[11px] text-muted-foreground">
                    SMS is in sandbox mode — messages only reach Africa's Talking's test simulator, not
                    real phones. Configure production credentials to deliver for real.
                  </p>
                )}
                {results.some((f) => !f.smsSent) && (
                  <p className="text-[11px] text-muted-foreground">
                    Farmers marked below without an SMS icon need their password shared manually.
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <KeyRound className="h-3.5 w-3.5" />
                SMS isn't configured — share these temporary passwords with each farmer manually. They'll
                be asked to change it on first login.
              </p>
            )}

            <div className="max-h-64 overflow-y-auto rounded-lg border divide-y text-sm">
              {results.map((f) => (
                <div key={f.id} className="flex items-center justify-between px-3 py-2">
                  <div className="flex items-center gap-2">
                    {smsMeta?.configured &&
                      (f.smsSent ? (
                        <MessageSquare
                          className="h-3.5 w-3.5 shrink-0 text-success"
                          aria-label="SMS sent"
                        />
                      ) : (
                        <MessageSquareOff
                          className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                          aria-label="SMS failed"
                        />
                      ))}
                    <div>
                      <div className="font-medium">{f.fullName}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">
                        {f.phone}
                        {smsMeta?.configured && !f.smsSent && f.smsError ? ` · ${f.smsError}` : ""}
                      </div>
                    </div>
                  </div>
                  <Badge className="font-mono text-[10px]">{f.tempPassword}</Badge>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleDownloadTemplate}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Download Excel Template
            </Button>

            <div className="space-y-1.5">
              <Label>Upload Completed File</Label>
              <Input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => {
                  setSelectedFile(e.target.files?.[0] || null);
                  setRowErrors(null);
                }}
              />
            </div>

            {rowErrors && rowErrors.length > 0 && (
              <div className="space-y-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                <div className="flex items-center gap-2 text-xs font-bold text-destructive">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {rowErrors.length} row(s) have errors — nothing was imported. Fix and re-upload.
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1.5">
                  {rowErrors.map((r) => (
                    <div key={r.row} className="text-xs">
                      <span className="font-semibold">
                        Row {r.row}
                        {r.fullName ? ` (${r.fullName})` : ""}:
                      </span>{" "}
                      <span className="text-muted-foreground">{r.errors.join("; ")}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={handleClose}>
            {results ? "Done" : "Cancel"}
          </Button>
          {!results && (
            <Button onClick={handleUpload} disabled={!selectedFile || importFarmers.isPending}>
              {importFarmers.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              Upload & Import
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function CooperativeFarmersComponent() {
  const { user } = useAuth();
  const coopId = user?.cooperativeId;
  const [page, setPage] = useState(1);
  const { data: farmersData, isLoading } = useFarmers({ page, limit: 10, cooperativeId: coopId || undefined });
  const { data: memberRecords } = useCooperativeMembers(coopId || "");
  const addMember = useAddCooperativeMember();
  const removeMember = useRemoveCooperativeMember();
  const updateStatus = useUpdateMemberStatus();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Use a query for users to find potential new members
  const { data: usersData, isLoading: isUsersLoading } = useUsers({
    search: searchTerm || undefined,
    role: "farmer",
    limit: 5,
  } as any);

  const farmers = Array.isArray(farmersData?.data) ? farmersData.data : [];
  const pagination = farmersData?.pagination;

  const {
    query,
    setQuery,
    filteredData: displayedFarmers,
    reset,
  } = useTableSearch(farmers, ["fullName", "sector", "district", "waterSource"]);

  if (!coopId) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <Users className="h-16 w-16 text-muted-foreground/20" />
        <h2 className="text-2xl font-bold">No Cooperative Assigned</h2>
        <p className="text-muted-foreground max-w-md text-center">
          Assignment to a cooperative is required to manage member farmers.
        </p>
      </div>
    );
  }

  const handleAddMember = async (farmerId: string) => {
    try {
      await addMember.mutateAsync({
        coopId: coopId || "",
        data: { userId: farmerId },
      });
      toast.success("Farmer added to cooperative successfully");
      setShowAddDialog(false);
    } catch (error) {
      toast.error("Failed to add farmer to cooperative");
    }
  };

  const getMemberId = (f: any) =>
    (memberRecords as any[])?.find((m: any) => m.userId === f.userId || m.user?.phone === f.phone)?.id;

  const handleSuspend = async (f: any) => {
    const memberId = getMemberId(f);
    if (!memberId || !coopId) return toast.error("Cannot find member record");
    try {
      await updateStatus.mutateAsync({ coopId, memberId, status: "suspended" });
      toast.success(`${f.fullName} suspended`);
    } catch {
      toast.error("Failed to suspend member");
    }
  };

  const handleRemove = async (f: any) => {
    const memberId = getMemberId(f);
    if (!memberId || !coopId) return toast.error("Cannot find member record");
    if (!confirm(`Remove ${f.fullName} from cooperative? This cannot be undone.`)) return;
    try {
      await removeMember.mutateAsync({ coopId, memberId });
      toast.success(`${f.fullName} removed from cooperative`);
    } catch {
      toast.error("Failed to remove member");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Farmers"
        subtitle="Manage farmers under your cooperative."
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowImportDialog(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Import from Excel
            </Button>
            <Button onClick={() => setShowAddDialog(true)} className="bg-gradient-hero">
              <Plus className="mr-2 h-4 w-4" />
              Add farmer
            </Button>
          </div>
        }
      />
      <Card className="p-6">
        <div className="mb-6 max-w-md">
          <TableSearchBar
            value={query}
            onChange={setQuery}
            onClear={reset}
            placeholder="Search farmers..."
            resultsCount={displayedFarmers.length}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground font-black">
                <th className="pb-4">Name</th>
                <th className="pb-4">Location</th>
                <th className="pb-4">District</th>
                <th className="pb-4">Farm Size</th>
                <th className="pb-4">Status</th>
                <th className="pb-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedFarmers.map((f: any) => (
                <tr
                  key={f.id}
                  className="border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="py-4">
                    <div className="font-bold">{f.fullName}</div>
                    <div className="text-[10px] text-muted-foreground font-mono">
                      {f.phone || "N/A"}
                    </div>
                  </td>
                  <td className="py-4 text-muted-foreground">{f.sector}</td>
                  <td className="py-4 text-muted-foreground font-medium">{f.district}</td>
                  <td className="py-4 font-semibold">{f.farmSizeHectares} ha</td>
                  <td className="py-4">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${
                      (f.status || "active") === "active"
                        ? "bg-success/10 text-success"
                        : (f.status || "").toLowerCase() === "suspended"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {f.status || "Active"}
                    </span>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-1">
                      {(f.status || "active") !== "suspended" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs text-amber-600 hover:text-amber-700"
                          onClick={() => handleSuspend(f)}
                          disabled={updateStatus.isPending}
                        >
                          <UserX className="h-3 w-3 mr-1" />
                          Suspend
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs text-destructive hover:text-destructive"
                        onClick={() => handleRemove(f)}
                        disabled={removeMember.isPending}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {displayedFarmers.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-muted-foreground italic">
                    No farmers found in your cooperative records.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="mt-6 border-t pt-4">
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

      {/* Add Farmer Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Farmer to Cooperative</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or phone..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {isUsersLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                (usersData?.data || []).map((u: any) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                  >
                    <div>
                      <div className="font-bold text-sm">
                        {u.farmerProfile?.fullName || "Unnamed Farmer"}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Smartphone className="h-3 w-3" /> {u.phone}
                        </span>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />{" "}
                          {u.farmerProfile?.district || "No location"}
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs font-bold"
                      onClick={() => handleAddMember(u.id)}
                    >
                      Add
                    </Button>
                  </div>
                ))
              )}
              {!isUsersLoading && (usersData?.data || []).length === 0 && searchTerm && (
                <div className="text-center py-4 text-xs text-muted-foreground italic">
                  No farmers found matching your search.
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {coopId && (
        <ImportFarmersDialog open={showImportDialog} onOpenChange={setShowImportDialog} coopId={coopId} />
      )}
    </div>
  );
}
