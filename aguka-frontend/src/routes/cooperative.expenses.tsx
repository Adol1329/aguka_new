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
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth";
import { cooperativeApi } from "@/api";
import { Loader2, Receipt, Plus, AlertCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/cooperative/expenses")({
  component: CooperativeExpensesPage,
});

const EXPENSE_CATEGORIES = [
  "equipment",
  "supplies",
  "transport",
  "labor",
  "utilities",
  "maintenance",
  "other",
];

function CooperativeExpensesPage() {
  const { user } = useAuth();
  const coopId = user?.cooperativeId;
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [form, setForm] = useState({ category: "", amount: "", description: "", expenseDate: "" });

  const { data: expenses, isLoading } = useQuery({
    queryKey: ["cooperative-expenses", coopId, categoryFilter],
    queryFn: () =>
      coopId ? cooperativeApi.getExpenses(coopId).then((r) => r.data || []) : Promise.resolve([]),
    enabled: !!coopId,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => cooperativeApi.createExpense(coopId!, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cooperative-expenses", coopId] });
      setShowCreate(false);
      setForm({ category: "", amount: "", description: "", expenseDate: "" });
      toast.success("Expense recorded");
    },
    onError: () => toast.error("Failed to record expense"),
  });

  const deleteMutation = useMutation({
    mutationFn: (expenseId: string) => cooperativeApi.deleteExpense(coopId!, expenseId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cooperative-expenses", coopId] });
      toast.success("Expense deleted");
    },
  });

  if (!coopId) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Receipt className="h-16 w-16 text-muted-foreground/20" />
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

  const filtered =
    categoryFilter === "all"
      ? expenses
      : expenses?.filter((e: any) => e.category === categoryFilter);

  const totalExpenses = expenses?.reduce((s: number, e: any) => s + Number(e.amount), 0) || 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expense Reports"
        subtitle="Track cooperative expenditures and operational costs."
        action={
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Record Expense
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="bg-gradient-to-br from-destructive/5 to-transparent border-destructive/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-black text-destructive">
              {totalExpenses.toLocaleString()} RWF
            </div>
            <div className="text-xs text-muted-foreground">Total Expenses</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-black">{expenses?.length || 0}</div>
            <div className="text-xs text-muted-foreground">Total Records</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-black">
              {expenses?.length ? Math.round(totalExpenses / expenses.length).toLocaleString() : 0}{" "}
              RWF
            </div>
            <div className="text-xs text-muted-foreground">Avg per Expense</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2 flex-wrap mb-4">
        {["all", ...EXPENSE_CATEGORIES].map((c) => (
          <Button
            key={c}
            variant={categoryFilter === c ? "default" : "outline"}
            size="sm"
            onClick={() => setCategoryFilter(c)}
          >
            {c.charAt(0).toUpperCase() + c.slice(1)}
          </Button>
        ))}
      </div>

      {!filtered || filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20">
            <Receipt className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-bold mb-2">No Expenses</h3>
            <p className="text-muted-foreground text-sm">Record your first cooperative expense.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((expense: any) => (
            <Card key={expense.id} className="border-border/50">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{expense.category}</span>
                    <span className="text-xs text-muted-foreground">
                      · {new Date(expense.expenseDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">{expense.description}</div>
                  <div className="text-lg font-black mt-1 text-destructive">
                    {Number(expense.amount).toLocaleString()} RWF
                  </div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-destructive"
                  onClick={() => deleteMutation.mutate(expense.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Expense</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Amount (RWF)</Label>
              <Input
                type="number"
                value={form.amount}
                onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              />
            </div>
            <div>
              <Label>Expense Date</Label>
              <Input
                type="date"
                value={form.expenseDate}
                onChange={(e) => setForm((p) => ({ ...p, expenseDate: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => createMutation.mutate(form)}
              disabled={!form.category || !form.amount || !form.description || !form.expenseDate}
            >
              Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
