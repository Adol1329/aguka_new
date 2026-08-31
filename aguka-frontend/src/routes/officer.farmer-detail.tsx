import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard-ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Thermometer,
  Droplets,
  Beaker,
  Sprout,
  Cloud,
  Calendar,
  ClipboardList,
  Plus,
  Pencil,
  Trash2,
  Activity,
  Loader2,
  Sun,
  Wind,
  MapPin,
  TrendingUp,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { farmersApi } from "@/api/farmers";
import { officerApi } from "@/api/officer";
import { weatherApi } from "@/api/weather";
import { activitiesApi } from "@/api/activities";
import { apiClient } from "@/api/client";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/officer/farmer-detail")({
  component: FarmerDetailPage,
});

type SoilReading = {
  moisturePercent?: number | string | null;
  moisture?: number | string | null;
  soilTemperatureCelsius?: number | string | null;
  soilTemperature?: number | string | null;
  temperatureCelsius?: number | string | null;
  ph?: number | string | null;
  pH?: number | string | null;
  nitrogen?: number | string | null;
  readingAt?: string;
};

type VisitNote = {
  id: string;
  visitDate: string;
  notes: string;
  actionItems?: string;
  status: string;
  followUpDate?: string;
  createdAt: string;
  updatedAt: string;
};

type NoteFormData = {
  visitDate: string;
  notes: string;
  actionItems: string;
  status: string;
  followUpDate: string;
};

const emptyNoteForm: NoteFormData = {
  visitDate: new Date().toISOString().slice(0, 10),
  notes: "",
  actionItems: "",
  status: "pending",
  followUpDate: "",
};

function getScoreBadgeClass(score: number | null) {
  if (score === null) return "bg-slate-100 text-slate-600 border-slate-200";
  if (score < 50) return "bg-red-100 text-red-700 border-red-200";
  if (score < 75) return "bg-amber-100 text-amber-700 border-amber-200";
  return "bg-emerald-100 text-emerald-700 border-emerald-200";
}

function getStatusBadgeClass(status: string) {
  switch (status) {
    case "completed":
      return "bg-emerald-100 text-emerald-700";
    case "cancelled":
      return "bg-red-100 text-red-700";
    default:
      return "bg-amber-100 text-amber-700";
  }
}

function computeScore(soilReadings?: SoilReading[]): number | null {
  const latest = soilReadings?.[soilReadings.length - 1];
  if (!latest) return null;
  const moisture = Number(latest.moisturePercent ?? latest.moisture);
  const temp = Number(
    latest.soilTemperatureCelsius ?? latest.soilTemperature ?? latest.temperatureCelsius,
  );
  const hasMoisture = Number.isFinite(moisture);
  const hasTemp = Number.isFinite(temp);
  if (!hasMoisture && !hasTemp) return null;
  const moistureScore = hasMoisture ? Math.max(0, 100 - Math.abs(moisture - 55) * 2) : 70;
  const tempScore = hasTemp ? Math.max(0, 100 - Math.abs(temp - 24) * 4) : 70;
  return Math.round(moistureScore * 0.7 + tempScore * 0.3);
}

function FarmerDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-9 w-9" />
        <div className="space-y-1">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-10 w-96" />
      <Skeleton className="h-80 rounded-xl" />
    </div>
  );
}

function FarmerDetailPage() {
  const { farmerId: _farmerId } = (useSearch({ strict: false }) as { farmerId?: string }) ?? {};
  const farmerId = _farmerId ?? "";
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [activeTab, setActiveTab] = useState("overview");
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<VisitNote | null>(null);
  const [deletingNote, setDeletingNote] = useState<VisitNote | null>(null);
  const [noteForm, setNoteForm] = useState<NoteFormData>(emptyNoteForm);

  const { data: farmer, isLoading: farmerLoading } = useQuery({
    queryKey: ["farmer", farmerId],
    queryFn: () => farmersApi.getFarmerById(farmerId).then((r) => r.data),
    enabled: !!farmerId,
  });

  const { data: soilReadings, isLoading: soilLoading } = useQuery({
    queryKey: ["farmer-soil", farmerId],
    queryFn: () =>
      farmersApi
        .getSoilReadings(farmerId, { limit: 30 })
        .then((r) => (r as any).data?.data || (r as any).data || []),
    enabled: !!farmerId,
  });

  const { data: analysis } = useQuery({
    queryKey: ["farmer-analysis", farmerId],
    queryFn: () => officerApi.getFarmerAnalysis(farmerId).then((r) => (r as any).data),
    enabled: !!farmerId,
    staleTime: 1000 * 60 * 5,
  });

  const { data: weather } = useQuery({
    queryKey: ["weather-current"],
    queryFn: () => weatherApi.getCurrent().then((r) => r.data),
    staleTime: 1000 * 60 * 5,
  });

  const { data: forecast } = useQuery({
    queryKey: ["weather-forecast"],
    queryFn: () => weatherApi.getForecast().then((r) => r.data || []),
    staleTime: 1000 * 60 * 5,
  });

  const { data: activitiesData, isLoading: activitiesLoading } = useQuery({
    queryKey: ["farmer-activities", farmerId],
    queryFn: () =>
      activitiesApi
        .getByFarmer(farmerId, { limit: 20 })
        .then((r) => (r as any).data?.data || (r as any).data || []),
    enabled: !!farmerId,
  });

  const { data: crops, isLoading: cropsLoading } = useQuery({
    queryKey: ["farmer-crops", farmerId],
    queryFn: () =>
      apiClient
        .get(`/farmers/${farmerId}/crops`)
        .then((r) => (r as any).data?.data || (r as any).data || []),
    enabled: !!farmerId,
  });

  const {
    data: notes,
    isLoading: notesLoading,
    refetch: refetchNotes,
  } = useQuery({
    queryKey: ["farmer-notes", farmerId],
    queryFn: () =>
      apiClient
        .get(`/officer/farmers/${farmerId}/notes`)
        .then((r) => (r as any).data?.data || (r as any).data || []),
    enabled: !!farmerId,
  });

  const createNoteMutation = useMutation({
    mutationFn: (data: NoteFormData) => apiClient.post(`/officer/farmers/${farmerId}/notes`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["farmer-notes", farmerId] });
      toast.success("Visit note created");
      setNoteDialogOpen(false);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateNoteMutation = useMutation({
    mutationFn: ({ noteId, data }: { noteId: string; data: NoteFormData }) =>
      apiClient.patch(`/officer/farmers/${farmerId}/notes/${noteId}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["farmer-notes", farmerId] });
      toast.success("Visit note updated");
      setNoteDialogOpen(false);
      setEditingNote(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteNoteMutation = useMutation({
    mutationFn: (noteId: string) =>
      apiClient.delete(`/officer/farmers/${farmerId}/notes/${noteId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["farmer-notes", farmerId] });
      toast.success("Visit note deleted");
      setDeletingNote(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const readings = useMemo(() => {
    if (!Array.isArray(soilReadings)) return [];
    return (soilReadings as SoilReading[]).filter(
      (r) => r.readingAt && (r.moisturePercent != null || r.moisture != null),
    );
  }, [soilReadings]);

  const latestReading = readings[readings.length - 1] || null;

  const perfScore = useMemo(() => {
    if (analysis?.performanceScore != null) return analysis.performanceScore;
    if (analysis?.score != null) return analysis.score;
    return computeScore(readings);
  }, [analysis, readings]);

  const activitiesList = useMemo(() => {
    if (!Array.isArray(activitiesData)) return [];
    return activitiesData;
  }, [activitiesData]);

  const notesList = useMemo(() => {
    if (!Array.isArray(notes)) return [];
    return notes as VisitNote[];
  }, [notes]);

  const cropsList = useMemo(() => {
    if (!Array.isArray(crops)) return [];
    return crops;
  }, [crops]);

  const soilMoisture = latestReading
    ? Number(latestReading.moisturePercent ?? latestReading.moisture ?? 0)
    : 0;
  const soilTemp = latestReading
    ? Number(
        latestReading.soilTemperatureCelsius ??
          latestReading.soilTemperature ??
          latestReading.temperatureCelsius ??
          0,
      )
    : 0;
  const soilPH = latestReading ? Number(latestReading.ph ?? latestReading.pH ?? 0) : null;
  const soilNitrogen = latestReading ? Number(latestReading.nitrogen ?? 0) : null;

  const todayWeather = (forecast?.[0] as any) || null;

  function openAddNote() {
    setNoteForm(emptyNoteForm);
    setEditingNote(null);
    setNoteDialogOpen(true);
  }

  function openEditNote(note: VisitNote) {
    setNoteForm({
      visitDate: note.visitDate?.slice(0, 10) || "",
      notes: note.notes || "",
      actionItems: note.actionItems || "",
      status: note.status || "pending",
      followUpDate: note.followUpDate?.slice(0, 10) || "",
    });
    setEditingNote(note);
    setNoteDialogOpen(true);
  }

  function handleNoteSubmit() {
    if (!noteForm.visitDate || !noteForm.notes.trim()) {
      toast.error("Visit date and notes are required");
      return;
    }
    const data: NoteFormData = {
      ...noteForm,
      notes: noteForm.notes.trim(),
      actionItems: noteForm.actionItems.trim(),
    };
    if (editingNote) {
      updateNoteMutation.mutate({ noteId: editingNote.id, data });
    } else {
      createNoteMutation.mutate(data);
    }
  }

  if (farmerLoading) {
    return <FarmerDetailSkeleton />;
  }

  if (!farmer) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
        <div className="text-4xl text-muted-foreground">404</div>
        <h2 className="text-xl font-semibold">Farmer not found</h2>
        <Button variant="outline" onClick={() => navigate({ to: "/officer/farms" })}>
          Back to farms
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={() => navigate({ to: "/officer/farms" })}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <PageHeader
              title={farmer.fullName || "Unnamed Farmer"}
              subtitle={`${farmer.district || ""}${farmer.sector ? ` · ${farmer.sector}` : ""}`}
            />
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="outline" className={getScoreBadgeClass(perfScore)}>
            {perfScore === null ? "No score" : `Score: ${perfScore}`}
          </Badge>
          <Button variant="outline" size="sm" asChild>
            <Link to="/officer/reports-v2">View in Reports</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <MapPin className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-medium text-muted-foreground">Farm Size</div>
              <div className="font-semibold truncate">
                {farmer.farmSizeHectares != null ? `${farmer.farmSizeHectares} ha` : "N/A"}
              </div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
              <Sprout className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-medium text-muted-foreground">Soil Type</div>
              <div className="font-semibold truncate">{farmer.soilType || "N/A"}</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              <Droplets className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-medium text-muted-foreground">Irrigation</div>
              <div className="font-semibold truncate">{farmer.irrigationType || "N/A"}</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-medium text-muted-foreground">Performance</div>
              <div className="font-semibold truncate">
                {perfScore != null ? `${perfScore}/100` : "N/A"}
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="soil">Soil</TabsTrigger>
          <TabsTrigger value="crops">Crops</TabsTrigger>
          <TabsTrigger value="weather">Weather</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="notes">Visit Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Farmer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <div className="text-xs text-muted-foreground">District</div>
                  <div className="font-medium">{farmer.district || "N/A"}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Sector</div>
                  <div className="font-medium">{farmer.sector || "N/A"}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Cell</div>
                  <div className="font-medium">{farmer.cell || "N/A"}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Village</div>
                  <div className="font-medium">{farmer.village || "N/A"}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Farm Size</div>
                  <div className="font-medium">
                    {farmer.farmSizeHectares != null ? `${farmer.farmSizeHectares} ha` : "N/A"}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Elevation</div>
                  <div className="font-medium">
                    {farmer.elevationMeters != null ? `${farmer.elevationMeters} m` : "N/A"}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Soil Type</div>
                  <div className="font-medium">{farmer.soilType || "N/A"}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Water Source</div>
                  <div className="font-medium">{farmer.waterSource || "N/A"}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Irrigation</div>
                  <div className="font-medium">{farmer.irrigationType || "N/A"}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {analysis && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Performance Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <div className="text-xs text-muted-foreground">Score</div>
                    <div className="text-2xl font-bold">
                      {perfScore != null ? `${perfScore}/100` : "N/A"}
                    </div>
                  </div>
                  {analysis.category && (
                    <div>
                      <div className="text-xs text-muted-foreground">Category</div>
                      <div className="text-2xl font-bold">{analysis.category}</div>
                    </div>
                  )}
                  {analysis.trend && (
                    <div>
                      <div className="text-xs text-muted-foreground">Trend</div>
                      <div className="text-2xl font-bold">{analysis.trend}</div>
                    </div>
                  )}
                </div>
                {analysis.summary && (
                  <>
                    <Separator className="my-4" />
                    <p className="text-sm text-muted-foreground">{analysis.summary}</p>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="soil" className="mt-6 space-y-6">
          {soilLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-xl" />
              ))}
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="p-5">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-info/10 text-info">
                    <Droplets className="h-5 w-5" />
                  </div>
                  <div className="text-xs uppercase text-muted-foreground">Moisture</div>
                  <div className="font-display text-3xl font-bold">
                    {soilMoisture > 0 ? `${soilMoisture.toFixed(0)}%` : "N/A"}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {soilMoisture > 0
                      ? soilMoisture < 40
                        ? "Low"
                        : soilMoisture > 70
                          ? "High"
                          : "Optimal"
                      : "No reading"}
                  </div>
                </Card>
                <Card className="p-5">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-warning/10 text-warning">
                    <Thermometer className="h-5 w-5" />
                  </div>
                  <div className="text-xs uppercase text-muted-foreground">Temperature</div>
                  <div className="font-display text-3xl font-bold">
                    {soilTemp > 0 ? `${soilTemp.toFixed(1)}°C` : "N/A"}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {soilTemp > 0
                      ? soilTemp < 18
                        ? "Cool"
                        : soilTemp > 30
                          ? "Warm"
                          : "Good"
                      : "No reading"}
                  </div>
                </Card>
                <Card className="p-5">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-success/10 text-success">
                    <Beaker className="h-5 w-5" />
                  </div>
                  <div className="text-xs uppercase text-muted-foreground">pH</div>
                  <div className="font-display text-3xl font-bold">
                    {soilPH != null && soilPH > 0 ? soilPH.toFixed(1) : "N/A"}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {soilPH != null && soilPH > 0
                      ? soilPH < 5.5
                        ? "Acidic"
                        : soilPH > 7.5
                          ? "Alkaline"
                          : "Neutral"
                      : "No reading"}
                  </div>
                </Card>
                <Card className="p-5">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                    <Activity className="h-5 w-5" />
                  </div>
                  <div className="text-xs uppercase text-muted-foreground">Nitrogen</div>
                  <div className="font-display text-3xl font-bold">
                    {soilNitrogen != null && soilNitrogen > 0
                      ? soilNitrogen > 50
                        ? "High"
                        : "Med"
                      : "N/A"}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {soilNitrogen != null && soilNitrogen > 0 ? "Healthy" : "No reading"}
                  </div>
                </Card>
              </div>

              <Card className="p-6">
                <h3 className="font-display mb-4 text-lg font-semibold">
                  Moisture & Temperature ({readings.length} readings)
                </h3>
                {readings.length === 0 ? (
                  <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
                    No soil readings available
                  </div>
                ) : (
                  <>
                    <div className="flex h-64 items-end justify-between gap-1">
                      {readings.map((r: SoilReading, idx: number) => {
                        const m = Number(r.moisturePercent ?? r.moisture ?? 0);
                        const t = Number(
                          r.soilTemperatureCelsius ??
                            r.soilTemperature ??
                            r.temperatureCelsius ??
                            0,
                        );
                        return (
                          <div key={idx} className="flex flex-1 flex-col items-center gap-1">
                            <div
                              className="flex w-full gap-0.5"
                              style={{ height: "192px", alignItems: "flex-end" }}
                            >
                              <div
                                className="flex-1 rounded-t bg-info/70 min-w-[4px]"
                                style={{ height: `${Math.min(m * 2, 192)}px` }}
                                title={`Moisture: ${m.toFixed(0)}%`}
                              />
                              <div
                                className="flex-1 rounded-t bg-warning/70 min-w-[4px]"
                                style={{ height: `${Math.min(t * 5, 192)}px` }}
                                title={`Temp: ${t.toFixed(1)}°C`}
                              />
                            </div>
                            <div className="text-[10px] text-muted-foreground whitespace-nowrap">
                              {new Date(r.readingAt!).toLocaleDateString([], {
                                month: "short",
                                day: "numeric",
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-4 flex gap-4 text-xs">
                      <span className="flex items-center gap-1">
                        <span className="h-3 w-3 rounded bg-info/70" />
                        Moisture %
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="h-3 w-3 rounded bg-warning/70" />
                        Temp °C
                      </span>
                    </div>
                  </>
                )}
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="crops" className="mt-6 space-y-4">
          {cropsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
          ) : cropsList.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Sprout className="mb-3 h-10 w-10 text-muted-foreground opacity-20" />
                <p className="text-sm text-muted-foreground">No crops recorded</p>
              </CardContent>
            </Card>
          ) : (
            cropsList.map((c: any) => {
              const cropName = c.crop?.nameEn || c.cropName || "Unknown";
              return (
                <Card key={c.id}>
                  <CardContent className="flex items-start justify-between p-5">
                    <div className="space-y-1">
                      <h4 className="font-semibold">{cropName}</h4>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        {c.plantedDate && (
                          <span>Planted: {new Date(c.plantedDate).toLocaleDateString()}</span>
                        )}
                        {c.expectedHarvestDate && (
                          <span>
                            Harvest: {new Date(c.expectedHarvestDate).toLocaleDateString()}
                          </span>
                        )}
                        {c.plotSizeHectares != null && <span>{c.plotSizeHectares} ha</span>}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        {c.estimatedYieldKg != null && (
                          <span>Est. yield: {c.estimatedYieldKg} kg</span>
                        )}
                        {c.actualYieldKg != null && <span>Actual yield: {c.actualYieldKg} kg</span>}
                      </div>
                    </div>
                    <Badge
                      variant={
                        c.status === "growing"
                          ? "default"
                          : c.status === "harvested"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {c.status || "active"}
                    </Badge>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="weather" className="mt-6 space-y-6">
          {!todayWeather ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Cloud className="mb-3 h-10 w-10 text-muted-foreground opacity-20" />
                <p className="text-sm text-muted-foreground">Weather data unavailable</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card className="overflow-hidden bg-gradient-to-br from-sky-500 to-blue-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm opacity-80">Current Conditions</div>
                    <div className="font-display mt-1 text-5xl font-bold">
                      {todayWeather.temperatureCelsius}°
                    </div>
                    <div className="mt-1 opacity-90">
                      {todayWeather.condition || "Partly cloudy"}
                    </div>
                  </div>
                  <Sun className="h-20 w-20 opacity-40" />
                </div>
                <div className="mt-6 grid grid-cols-3 gap-3">
                  <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
                    <Droplets className="mb-1 h-4 w-4 opacity-80" />
                    <div className="text-xs opacity-80">Humidity</div>
                    <div className="font-semibold">{todayWeather.humidityPercent || 0}%</div>
                  </div>
                  <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
                    <Wind className="mb-1 h-4 w-4 opacity-80" />
                    <div className="text-xs opacity-80">Wind</div>
                    <div className="font-semibold">{todayWeather.windSpeedKmh || 0} km/h</div>
                  </div>
                  <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
                    <Cloud className="mb-1 h-4 w-4 opacity-80" />
                    <div className="text-xs opacity-80">Rain Chance</div>
                    <div className="font-semibold">
                      {todayWeather.precipitationProbability || 0}%
                    </div>
                  </div>
                </div>
              </Card>

              {forecast && forecast.length > 0 && (
                <Card className="p-6">
                  <h3 className="font-display mb-4 text-lg font-semibold">5-Day Forecast</h3>
                  <div className="grid gap-3 sm:grid-cols-5">
                    {forecast.slice(0, 5).map((w: any, idx: number) => (
                      <div key={idx} className="rounded-xl border bg-gradient-data p-4 text-center">
                        <div className="text-xs font-medium text-muted-foreground">
                          {new Date(w.date || w.forecastDate).toLocaleDateString([], {
                            weekday: "short",
                          })}
                        </div>
                        <div className="my-2 text-3xl">
                          {(w.precipitationProbability || 0) > 50
                            ? "🌧️"
                            : (w.temperatureCelsius || 0) > 25
                              ? "☀️"
                              : "⛅"}
                        </div>
                        <div className="text-sm font-semibold">{w.temperatureCelsius}°</div>
                        <div className="mt-1 text-xs text-info">
                          💧 {w.precipitationProbability || 0}%
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="activities" className="mt-6 space-y-4">
          {activitiesLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-xl" />
              ))}
            </div>
          ) : activitiesList.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <ClipboardList className="mb-3 h-10 w-10 text-muted-foreground opacity-20" />
                <p className="text-sm text-muted-foreground">No activities recorded</p>
              </CardContent>
            </Card>
          ) : (
            activitiesList.map((a: any) => (
              <Card key={a.id}>
                <CardContent className="flex items-start gap-4 p-5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Activity className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium capitalize">
                        {(a.activityType || "").replace(/_/g, " ")}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(a.activityDate || a.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {a.notes && (
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{a.notes}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="notes" className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Field Visit Notes</h3>
            <Button size="sm" onClick={openAddNote}>
              <Plus className="mr-1 h-4 w-4" />
              Add Note
            </Button>
          </div>

          {notesLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-xl" />
              ))}
            </div>
          ) : notesList.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="mb-3 h-10 w-10 text-muted-foreground opacity-20" />
                <p className="text-sm text-muted-foreground">No visit notes yet</p>
                <Button variant="outline" size="sm" className="mt-4" onClick={openAddNote}>
                  <Plus className="mr-1 h-4 w-4" />
                  Add first note
                </Button>
              </CardContent>
            </Card>
          ) : (
            notesList.map((note: VisitNote) => (
              <Card key={note.id}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium">
                          {new Date(note.visitDate).toLocaleDateString([], {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        <Badge className={getStatusBadgeClass(note.status)} variant="outline">
                          {note.status}
                        </Badge>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{note.notes}</p>
                      {note.actionItems && (
                        <div>
                          <span className="text-xs font-medium text-muted-foreground">
                            Action items:
                          </span>
                          <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                            {note.actionItems}
                          </p>
                        </div>
                      )}
                      {note.followUpDate && (
                        <div className="text-xs text-muted-foreground">
                          Follow-up: {new Date(note.followUpDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEditNote(note)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => setDeletingNote(note)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingNote ? "Edit Visit Note" : "Add Visit Note"}</DialogTitle>
            <DialogDescription>Record details from a field visit to this farmer.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="visitDate">Visit Date *</Label>
              <Input
                id="visitDate"
                type="date"
                value={noteForm.visitDate}
                onChange={(e) => setNoteForm((prev) => ({ ...prev, visitDate: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes *</Label>
              <Textarea
                id="notes"
                rows={4}
                placeholder="Describe the visit observations..."
                value={noteForm.notes}
                onChange={(e) => setNoteForm((prev) => ({ ...prev, notes: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="actionItems">Action Items</Label>
              <Textarea
                id="actionItems"
                rows={3}
                placeholder="Any follow-up actions needed..."
                value={noteForm.actionItems}
                onChange={(e) => setNoteForm((prev) => ({ ...prev, actionItems: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="followUpDate">Follow-Up Date</Label>
              <Input
                id="followUpDate"
                type="date"
                value={noteForm.followUpDate}
                onChange={(e) => setNoteForm((prev) => ({ ...prev, followUpDate: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={noteForm.status}
                onValueChange={(value) => setNoteForm((prev) => ({ ...prev, status: value }))}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onClick={handleNoteSubmit}
              disabled={createNoteMutation.isPending || updateNoteMutation.isPending}
            >
              {createNoteMutation.isPending || updateNoteMutation.isPending
                ? "Saving..."
                : editingNote
                  ? "Update"
                  : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!deletingNote}
        onOpenChange={(open) => {
          if (!open) setDeletingNote(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Visit Note</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this visit note from{" "}
              {deletingNote ? new Date(deletingNote.visitDate).toLocaleDateString() : ""}? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={() => {
                if (deletingNote) deleteNoteMutation.mutate(deletingNote.id);
              }}
              disabled={deleteNoteMutation.isPending}
            >
              {deleteNoteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
