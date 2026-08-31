import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard-ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  ClipboardList,
  Loader2,
  Search,
  Filter,
  Plus,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { officerApi } from "@/api/officer";
import { useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/officer/field-work")({
  component: FieldWorkPage,
});

type FieldVisit = {
  id: string;
  farmerId: string;
  visitDate: string;
  notes: string;
  actionItems?: string;
  status: string;
  followUpDate?: string;
  createdAt: string;
  farmer: {
    id: string;
    fullName: string;
    farmName: string;
    district: string;
    sector: string;
  };
};

function getStatusBadgeClass(status: string) {
  switch (status) {
    case "completed":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "cancelled":
      return "bg-red-100 text-red-700 border-red-200";
    case "pending":
      return "bg-amber-100 text-amber-700 border-amber-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
}

function FieldWorkPage() {
  const { t } = useI18n();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: visits, isLoading } = useQuery({
    queryKey: ["officer-field-work"],
    queryFn: () => officerApi.getFieldWork().then((r) => (r as any).data || []),
  });

  const filteredVisits = useMemo(() => {
    if (!Array.isArray(visits)) return [];
    return visits.filter((v: FieldVisit) => {
      const matchesSearch =
        v.farmer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.farmer.farmName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || v.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [visits, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    if (!Array.isArray(visits)) return { total: 0, pending: 0, completed: 0, followUps: 0 };
    return {
      total: visits.length,
      pending: visits.filter((v) => v.status === "pending").length,
      completed: visits.filter((v) => v.status === "completed").length,
      followUps: visits.filter((v) => v.followUpDate && new Date(v.followUpDate) >= new Date())
        .length,
    };
  }, [visits]);

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
        title="Field Work Operations"
        subtitle="Manage visit schedules, observations, and follow-up actions."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase text-muted-foreground">Total Visits</div>
              <div className="text-2xl font-bold">{stats.total}</div>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase text-muted-foreground">Pending</div>
              <div className="text-2xl font-bold">{stats.pending}</div>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase text-muted-foreground">Completed</div>
              <div className="text-2xl font-bold">{stats.completed}</div>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-info/10 text-info">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase text-muted-foreground">Follow-ups</div>
              <div className="text-2xl font-bold">{stats.followUps}</div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by farmer or farm name..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="mr-2 h-3.5 w-3.5" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Button asChild>
              <Link to="/officer/farms">
                <Plus className="mr-2 h-4 w-4" />
                New Visit
              </Link>
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {filteredVisits.length > 0 ? (
            filteredVisits.map((visit: FieldVisit) => (
              <Card key={visit.id} className="overflow-hidden border-l-4 border-l-primary/30">
                <CardContent className="p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-3 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className={getStatusBadgeClass(visit.status)} variant="outline">
                          {visit.status}
                        </Badge>
                        <span className="text-sm font-semibold flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          {new Date(visit.visitDate).toLocaleDateString([], {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>

                      <div>
                        <Link
                          to="/officer/farmer-detail"
                          search={{ farmerId: visit.farmer.id }}
                          className="text-lg font-bold hover:text-primary transition-colors"
                        >
                          {visit.farmer.fullName}
                        </Link>
                        <div className="text-sm text-muted-foreground flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {visit.farmer.farmName} · {visit.farmer.district}
                          </span>
                        </div>
                      </div>

                      <div className="bg-muted/30 rounded-lg p-3">
                        <div className="text-xs font-bold uppercase text-muted-foreground mb-1">
                          Observations
                        </div>
                        <p className="text-sm text-foreground/80 line-clamp-3">
                          {visit.notes || "No observations recorded."}
                        </p>
                      </div>

                      {visit.actionItems && (
                        <div className="flex items-start gap-2 text-sm text-muted-foreground">
                          <AlertCircle className="h-4 w-4 mt-0.5 text-info shrink-0" />
                          <div>
                            <span className="font-semibold text-foreground/70">Action:</span>{" "}
                            {visit.actionItems}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 min-w-[140px]">
                      {visit.followUpDate && (
                        <div className="rounded-lg bg-info/5 border border-info/20 p-2 text-center">
                          <div className="text-[10px] uppercase font-bold text-info">Follow-up</div>
                          <div className="text-xs font-semibold">
                            {new Date(visit.followUpDate).toLocaleDateString()}
                          </div>
                        </div>
                      )}
                      <Button variant="outline" size="sm" asChild>
                        <Link to="/officer/farmer-detail" search={{ farmerId: visit.farmer.id }}>
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ClipboardList className="h-12 w-12 text-muted-foreground opacity-20 mb-3" />
              <h3 className="text-lg font-semibold">No visit records found</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                No field visits match your current filters. Try adjusting your search or add a new
                visit from the farmer detail page.
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
