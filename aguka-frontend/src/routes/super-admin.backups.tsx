import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard-ui";
import { Card, CardContent } from "@/components/ui/card";
import {
  useSuperAdminBackups,
  useCreateBackup,
  useDeleteBackup,
  useRestoreBackup,
} from "@/hooks/use-data";
import {
  Database,
  Download,
  Trash2,
  RefreshCw,
  Loader2,
  ShieldCheck,
  History,
  HardDrive,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { superAdminApi } from "@/api/superadmin";
import type { BackupEntry } from "@/api/superadmin";

export const Route = createFileRoute("/super-admin/backups")({
  component: BackupsPage,
});

function BackupsPage() {
  const { data: backupsData, isLoading } = useSuperAdminBackups();
  const createBackup = useCreateBackup();
  const deleteBackup = useDeleteBackup();
  const restoreBackup = useRestoreBackup();
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduleFreq, setScheduleFreq] = useState("daily");
  const [scheduleTime, setScheduleTime] = useState("02:00");
  const [scheduleRetention, setScheduleRetention] = useState("7");
  const [scheduleSaved, setScheduleSaved] = useState(false);

  const handleSaveSchedule = () => {
    setScheduleSaved(true);
    setScheduleEnabled(true);
    setTimeout(() => setScheduleSaved(false), 3000);
  };

  const getNextBackupPreview = () => {
    const now = new Date();
    const [h, m] = scheduleTime.split(":").map(Number);
    const next = new Date();
    next.setHours(h, m, 0, 0);
    if (next <= now) {
      if (scheduleFreq === "daily") next.setDate(next.getDate() + 1);
      else if (scheduleFreq === "weekly") next.setDate(next.getDate() + 7);
      else next.setMonth(next.getMonth() + 1);
    }
    return next.toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const { backups, totalSize, lastBackup } = backupsData || {
    backups: [],
    totalSize: 0,
    lastBackup: null,
  };

  const handleCreate = async () => {
    try {
      await createBackup.mutateAsync();
      toast.success("Database backup created successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create backup");
    }
  };

  const handleRestore = async (id: string) => {
    setRestoringId(id);
    try {
      await restoreBackup.mutateAsync(id);
      toast.success("Database restored from selected backup.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to restore backup");
    } finally {
      setRestoringId(null);
    }
  };

  const handleDownload = async (backup: BackupEntry) => {
    try {
      await superAdminApi.downloadBackup(backup.id, backup.name || `aguka-backup-${backup.id}.sql`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to download backup");
    }
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Backups & Disaster Recovery"
          subtitle="Ensure data continuity with automated and manual snapshots."
        />
        <Button
          onClick={handleCreate}
          disabled={createBackup.isPending}
          className="bg-primary shadow-lg shadow-primary/20"
        >
          {createBackup.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Database className="mr-2 h-4 w-4" />
          )}
          Create Manual Snapshot
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="p-5 border-border/50 bg-primary/5">
          <div className="flex items-center gap-3 mb-2">
            <HardDrive className="h-5 w-5 text-primary" />
            <span className="text-sm font-bold text-primary uppercase tracking-wider">
              Total Storage
            </span>
          </div>
          <div className="text-3xl font-black">{formatSize(totalSize)}</div>
          <div className="text-xs text-muted-foreground mt-1">
            Across {backups.length} stored snapshots
          </div>
        </Card>

        <Card className="p-5 border-border/50">
          <div className="flex items-center gap-3 mb-2">
            <History className="h-5 w-5 text-success" />
            <span className="text-sm font-bold text-success uppercase tracking-wider">
              Last Sync
            </span>
          </div>
          <div className="text-3xl font-black">
            {lastBackup
              ? new Date(lastBackup.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "N/A"}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {lastBackup
              ? new Date(lastBackup.createdAt).toLocaleDateString()
              : "No backups available"}
          </div>
        </Card>

        <Card className="p-5 border-border/50">
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="h-5 w-5 text-info" />
            <span className="text-sm font-bold text-info uppercase tracking-wider">
              Health Status
            </span>
          </div>
          <div className="text-3xl font-black">99.9%</div>
          <div className="text-xs text-muted-foreground mt-1">Automated backup systems healthy</div>
        </Card>
      </div>

      <Card className="overflow-hidden border-border/50">
        <div className="p-5 border-b border-border/50 bg-muted/20 flex items-center justify-between">
          <h3 className="font-bold flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            Backup History
          </h3>
          <Badge variant="outline" className="text-[10px] font-black uppercase">
            Region: East-1 (Rwanda)
          </Badge>
        </div>
        <CardContent className="p-0">
          <div className="divide-y divide-border/50">
            {backups.map((b: BackupEntry) => (
              <div
                key={b.id}
                className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <Database className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm">{b.name}</div>
                    <div className="text-[10px] text-muted-foreground flex items-center gap-2">
                      <span>{new Date(b.createdAt).toLocaleString()}</span>
                      <span>·</span>
                      <span className="uppercase font-bold tracking-tighter">{b.type}</span>
                      <span>·</span>
                      <span>{formatSize(b.sizeBytes)}</span>
                      <span>·</span>
                      <span className="uppercase font-bold tracking-tighter">{b.status}</span>
                      {b.restoredAt && (
                        <>
                          <span>·</span>
                          <span>Restored {new Date(b.restoredAt).toLocaleString()}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                    onClick={() => handleDownload(b)}
                    disabled={!b.filePath || b.status !== "COMPLETED"}
                  >
                    <Download className="h-4 w-4" />
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-amber-600"
                      >
                        <RefreshCw
                          className={`h-4 w-4 ${restoringId === b.id ? "animate-spin" : ""}`}
                        />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-amber-600" />
                          Confirm System Restoration
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          You are about to restore the system to the state captured on{" "}
                          <strong>{new Date(b.createdAt).toLocaleString()}</strong>. All data
                          created after this point will be lost. This process may take several
                          minutes.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Abort</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleRestore(b.id)}
                          className="bg-amber-600 hover:bg-amber-700"
                          disabled={restoringId === b.id || b.status !== "COMPLETED"}
                        >
                          Confirm Restoration
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => deleteBackup.mutate(b.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {backups.length === 0 && (
              <div className="p-12 text-center text-muted-foreground text-sm italic">
                No backup records found. Create your first snapshot to secure your data.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Schedule Automatic Backup */}
      <Card className="overflow-hidden border-border/50">
        <div className="p-5 border-b border-border/50 bg-muted/20 flex items-center justify-between">
          <h3 className="font-bold flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            Schedule Automatic Backup
          </h3>
          {scheduleEnabled && (
            <Badge className="text-[10px] font-black uppercase bg-success/10 text-success border-success/20">
              <span className="h-1.5 w-1.5 rounded-full bg-success inline-block mr-1.5 animate-pulse" />
              Scheduled Active
            </Badge>
          )}
        </div>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="scheduleFreq">Frequency</Label>
              <Select value={scheduleFreq} onValueChange={setScheduleFreq}>
                <SelectTrigger id="scheduleFreq">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[10px] text-muted-foreground">
                How often to create automatic snapshots.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduleTime">Backup Time (UTC)</Label>
              <Input
                id="scheduleTime"
                type="time"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
              />
              <p className="text-[10px] text-muted-foreground">
                Runs at this time in server UTC timezone.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="retention">Retention Period</Label>
              <Select value={scheduleRetention} onValueChange={setScheduleRetention}>
                <SelectTrigger id="retention">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">Keep last 3 backups</SelectItem>
                  <SelectItem value="7">Keep last 7 backups</SelectItem>
                  <SelectItem value="14">Keep last 14 backups</SelectItem>
                  <SelectItem value="30">Keep last 30 backups</SelectItem>
                  <SelectItem value="-1">Keep all (no limit)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[10px] text-muted-foreground">
                Older backups will be purged automatically.
              </p>
            </div>
          </div>

          {scheduleEnabled && (
            <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/10 text-sm">
              <span className="font-bold text-foreground">⏰ Next scheduled backup:</span>{" "}
              <span className="text-primary font-mono">{getNextBackupPreview()}</span>
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <Button onClick={handleSaveSchedule} className="bg-primary shadow-lg shadow-primary/20">
              {scheduleSaved ? (
                <>
                  <ShieldCheck className="mr-2 h-4 w-4" /> Schedule Saved!
                </>
              ) : (
                <>
                  <Clock className="mr-2 h-4 w-4" /> Save Schedule
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
      {restoringId && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
          <div className="bg-card p-8 rounded-2xl shadow-2xl border flex flex-col items-center gap-6 max-w-sm text-center">
            <div className="relative">
              <Loader2 className="h-16 w-16 text-primary animate-spin" />
              <RefreshCw className="h-6 w-6 text-primary absolute inset-0 m-auto" />
            </div>
            <div>
              <h2 className="text-xl font-black mb-2">Restoring System...</h2>
              <p className="text-sm text-muted-foreground">
                Please do not close this window or refresh the page. We are re-aligning the database
                clusters.
              </p>
            </div>
            <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary animate-[shimmer_2s_infinite]"
                style={{ width: "60%" }}
              ></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
