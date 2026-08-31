import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/dashboard-ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { officerApi } from "@/api/officer";
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  FileText,
  AlertTriangle,
  Info,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/i18n";

export const Route = createFileRoute("/officer/templates")({
  component: TemplatesPage,
});

function TemplatesPage() {
  const { t } = useI18n();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({
    title: "",
    message: "",
    recommendation: "",
    severity: "info",
  });

  const { data: templatesData, isLoading } = useQuery({
    queryKey: ["officer-templates"],
    queryFn: () => officerApi.getTemplates().then((r: any) => r.data || []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) =>
      editing ? officerApi.updateTemplate(editing.id, data) : officerApi.createTemplate(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["officer-templates"] });
      setDialogOpen(false);
      setEditing(null);
      setForm({ title: "", message: "", recommendation: "", severity: "info" });
      toast.success(editing ? "Template updated" : "Template created");
    },
    onError: () => toast.error("Failed to save template"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => officerApi.deleteTemplate(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["officer-templates"] });
      toast.success("Template deleted");
    },
  });

  const templates = Array.isArray(templatesData) ? templatesData : [];
  const filtered = templates.filter(
    (t: any) =>
      t.title?.toLowerCase().includes(search.toLowerCase()) ||
      t.message?.toLowerCase().includes(search.toLowerCase()),
  );

  const openNew = () => {
    setEditing(null);
    setForm({ title: "", message: "", recommendation: "", severity: "info" });
    setDialogOpen(true);
  };
  const openEdit = (t: any) => {
    setEditing(t);
    setForm({
      title: t.title,
      message: t.message,
      recommendation: t.recommendation || "",
      severity: t.severity,
    });
    setDialogOpen(true);
  };

  const severityIcon: Record<string, any> = {
    info: Info,
    warning: AlertTriangle,
    critical: AlertCircle,
  };
  const severityColor: Record<string, string> = {
    info: "bg-blue-100 text-blue-800",
    warning: "bg-amber-100 text-amber-800",
    critical: "bg-red-100 text-red-800",
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Advisory Templates"
        subtitle="Create and manage reusable advisory message templates."
      />

      <div className="flex items-center gap-4">
        <Input
          placeholder="Search templates..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={openNew}>
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Template" : "New Template"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div>
              <Label>Message</Label>
              <Textarea
                rows={4}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />
            </div>
            <div>
              <Label>Recommendation (optional)</Label>
              <Textarea
                rows={2}
                value={form.recommendation}
                onChange={(e) => setForm({ ...form, recommendation: e.target.value })}
              />
            </div>
            <div>
              <Label>Severity</Label>
              <Select
                value={form.severity}
                onValueChange={(v) => setForm({ ...form, severity: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => createMutation.mutate(form)}
                disabled={!form.title || !form.message || createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {editing ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            <FileText className="h-8 w-8 mx-auto mb-4 opacity-50" />
            <p>No templates yet. Create one to quickly send advisories.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((t: any) => {
            const SevIcon = severityIcon[t.severity] || Info;
            return (
              <Card key={t.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <SevIcon
                        className={`h-5 w-5 mt-0.5 ${t.severity === "critical" ? "text-red-500" : t.severity === "warning" ? "text-amber-500" : "text-blue-500"}`}
                      />
                      <div>
                        <CardTitle className="text-base">{t.title}</CardTitle>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {t.message}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge className={severityColor[t.severity]}>{t.severity}</Badge>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(t)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => {
                          if (confirm("Delete this template?")) deleteMutation.mutate(t.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
