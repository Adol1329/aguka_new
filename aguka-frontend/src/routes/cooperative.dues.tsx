import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { PageHeader } from "@/components/dashboard-ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { cooperativeApi } from "@/api";
import { useCooperativeMembers } from "@/hooks/use-data";
import { Loader2, DollarSign, Plus, AlertCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/cooperative/dues")({
  component: CooperativeDuesPage,
});

function CooperativeDuesPage() {
  const { user } = useAuth();
  const coopId = user?.cooperativeId;
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [form, setForm] = useState({ userId: "", amount: "", period: "", dueDate: "" });

  const { data: dues, isLoading } = useQuery({
    queryKey: ["cooperative-dues", coopId, statusFilter],
    queryFn: () =>
      coopId ? cooperativeApi.getDues(coopId).then((r) => r.data || []) : Promise.resolve([]),
    enabled: !!coopId,
  });

  const { data: members } = useCooperativeMembers(coopId || "");

  const createMutation = useMutation({
    mutationFn: (data: any) => cooperativeApi.createDue(coopId!, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cooperative-dues", coopId] });
      setShowCreate(false);
      setForm({ userId: "", amount: "", period: "", dueDate: "" });
      toast.success("Due created");
    },
    onError: () => toast.error("Failed to create due"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ dueId, data }: { dueId: string; data: any }) =>
      cooperativeApi.updateDue(coopId!, dueId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cooperative-dues", coopId] });
      toast.success("Due updated");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (dueId: string) => cooperativeApi.deleteDue(coopId!, dueId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cooperative-dues", coopId] });
      toast.success("Due deleted");
    },
  });

  if (!coopId) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <DollarSign className="h-16 w-16 text-muted-foreground/20" />
        <h2 className="text-2xl font-bold mt-4">No Cooperative Assigned</h2>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const filteredDues =
    statusFilter === "all" ? dues : dues?.filter((d: any) => d.status === statusFilter);

  const totalCollected =
    dues?.filter((d: any) => d.status === "paid").reduce((s: number, d: any) => s + d.amount, 0) ||
    0;
  const totalPending =
    dues
      ?.filter((d: any) => d.status === "pending")
      .reduce((s: number, d: any) => s + d.amount, 0) || 0;

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      paid: "bg-success/10 text-success border-success/30",
      pending: "bg-warning/10 text-warning border-warning/30",
      overdue: "bg-destructive/10 text-destructive border-destructive/30",
      waived: "bg-muted text-muted-foreground",
    };
    return styles[status] || "bg-muted text-muted-foreground";
  };

  const handleMarkPaid = (dueId: string) => {
    updateMutation.mutate({ dueId, data: { status: "paid" } });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Member Dues"
        subtitle="Track member contributions and fees."
        action={
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Due
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-black text-success">
              {totalCollected.toLocaleString()} RWF
            </div>
            <div className="text-xs text-muted-foreground">Collected</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-black text-warning">
              {totalPending.toLocaleString()} RWF
            </div>
            <div className="text-xs text-muted-foreground">Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-black">{dues?.length || 0}</div>
            <div className="text-xs text-muted-foreground">Total Records</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2 mb-4">
        {["all", "paid", "pending", "overdue", "waived"].map((s) => (
          <Button
            key={s}
            variant={statusFilter === s ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(s)}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </Button>
        ))}
      </div>

      {!filteredDues || filteredDues.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20">
            <DollarSign className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-bold mb-2">No Dues Records</h3>
            <p className="text-muted-foreground text-sm">
              Create a due to start tracking member contributions.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredDues.map((due: any) => (
            <Card key={due.id} className="border-border/50">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-bold">{due.fullName}</div>
                  <div className="text-sm text-muted-foreground">
                    {due.period} · Due {new Date(due.dueDate).toLocaleDateString()}
                  </div>
                  <div className="text-lg font-black mt-1">{due.amount.toLocaleString()} RWF</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={getStatusBadge(due.status)}>
                    {due.status}
                  </Badge>
                  {due.status === "pending" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      onClick={() => handleMarkPaid(due.id)}
                    >
                      Mark Paid
                    </Button>
                  )}
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-destructive"
                    onClick={() => deleteMutation.mutate(due.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Member Due</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Member</Label>
              <Select
                value={form.userId}
                onValueChange={(v) => setForm((p) => ({ ...p, userId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select member" />
                </SelectTrigger>
                <SelectContent>
                  {(members || []).map((m: any) => (
                    <SelectItem key={m.userId} value={m.userId}>
                      {m.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Amount (RWF)</Label>
                <Input
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
                />
              </div>
              <div>
                <Label>Period</Label>
                <Input
                  value={form.period}
                  onChange={(e) => setForm((p) => ({ ...p, period: e.target.value }))}
                  placeholder="e.g. 2024-Q1"
                />
              </div>
            </div>
            <div>
              <Label>Due Date</Label>
              <Input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => createMutation.mutate(form)}
              disabled={!form.userId || !form.amount || !form.period || !form.dueDate}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
