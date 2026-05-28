import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileDown,
  FileText,
  Loader2,
  BarChart3,
  Droplets,
  CloudSun,
  ClipboardList,
  Award,
  User,
  X,
  TrendingUp,
} from "lucide-react";
import {
  useSoilReadings,
  useIrrigationLogs,
  useWeatherForecast,
  useFarmers,
  useActivities,
} from "@/hooks/use-data";
import { useAuth } from "@/lib/auth";
import { reportsApi } from "@/api";
import { toast } from "sonner";
import { useState } from "react";
import { Link } from "@tanstack/react-router";

export function ReportsComponent({ farmerId }: { farmerId?: string }) {
  const { user } = useAuth();
  const isFarmer = user?.role === "farmer";
  const effectiveFarmerId = isFarmer ? undefined : farmerId;

  const [downloading, setDownloading] = useState<string | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data: soilReadings, isLoading: soilLoading } = useSoilReadings(effectiveFarmerId);
  const { data: irrigationLogs, isLoading: irrigationLoading } = useIrrigationLogs();
  const { data: weatherData, isLoading: weatherLoading } = useWeatherForecast();

  const { data: farmers, isLoading: farmersLoading } = useFarmers(undefined, {
    enabled: !isFarmer,
  });

  const { data: myActivities, isLoading: activitiesLoading } = useActivities(
    { limit: 100 },
    { enabled: isFarmer || !!effectiveFarmerId },
  );

  const selectedFarmer = farmers?.data?.find((f) => f.id === farmerId);

  const isLoading =
    soilLoading ||
    irrigationLoading ||
    weatherLoading ||
    (isFarmer ? activitiesLoading : farmersLoading);

  const handleDownload = async (type: string) => {
    if (!isFarmer && (!effectiveFarmerId || effectiveFarmerId === "undefined")) {
      toast.error("Please select a farmer to generate this report");
      return;
    }

    setDownloading(type);
    try {
      const params = effectiveFarmerId ? { farmerId: effectiveFarmerId } : undefined;
      switch (type) {
        case "Soil":
          await reportsApi.downloadSoilReport(params);
          break;
        case "Irrigation":
          await reportsApi.downloadIrrigationReport(params);
          break;
        case "Performance":
          await reportsApi.downloadPerformanceReport(params);
          break;
        case "Crops":
          await reportsApi.downloadCropReport(params);
          break;
        default:
          toast.error(`${type} report is not yet implemented`);
          setDownloading(null);
          return;
      }
      toast.success(`${type} report downloaded successfully`);
    } catch (error) {
      toast.error(`Failed to download ${type} report`);
    } finally {
      setDownloading(null);
    }
  };

  const handleSign = async () => {
    if (!farmerId) return;
    setDownloading("Signing");
    try {
      await reportsApi.downloadCertificate(farmerId);
      toast.success("Official Certificate signed and issued successfully!");
    } catch (error) {
      toast.error("Failed to issue certificate");
    } finally {
      setDownloading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const soilCount = Array.isArray(soilReadings) ? soilReadings.length : 0;
  const irrigationCount = Array.isArray(irrigationLogs) ? irrigationLogs.length : 0;
  const weatherCount = Array.isArray(weatherData) ? weatherData.length : 0;

  const reportTypes = [
    {
      title: "Soil Analysis",
      description: `Historical data on moisture, pH, and nutrients (NPK). ${soilCount} records available.`,
      count: soilCount,
      icon: BarChart3,
      type: "Soil",
    },
    {
      title: "Irrigation Logs",
      description: `Records of water usage, schedules, and zone activity. ${irrigationCount} logs available.`,
      count: irrigationCount,
      icon: Droplets,
      type: "Irrigation",
    },
    {
      title: "Weather Patterns",
      description: `Rainfall, temperature, and humidity trends over time. ${weatherCount} forecasts available.`,
      count: weatherCount,
      icon: CloudSun,
      type: "Weather",
    },
  ];

  return (
    <div className="space-y-8">
      {farmerId && selectedFarmer && (
        <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <User className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-bold">Reporting for: {selectedFarmer.fullName}</div>
              <div className="text-xs text-muted-foreground">
                {selectedFarmer.district} · {selectedFarmer.sector}
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/reports" search={{ farmerId: undefined }}>
              <X className="h-4 w-4 mr-2" />
              Clear Filter
            </Link>
          </Button>
        </div>
      )}

      {(isFarmer || farmerId) && (
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 overflow-hidden relative">
          <div className="absolute right-0 top-0 p-8 opacity-10">
            <Award className="h-32 w-32 text-primary" />
          </div>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">Performance Certificate</CardTitle>
                <CardDescription>
                  A verified summary of precision farming metrics and crop performance.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-4 max-w-2xl">
                {isFarmer
                  ? "This report aggregates all your IoT sensor data and activity logs into a professional document."
                  : `Generating a performance certificate for ${selectedFarmer?.fullName || "the farmer"}.`}
              </p>
              <Button
                onClick={() => handleDownload("Performance")}
                disabled={downloading === "Performance"}
                size="lg"
                className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
              >
                {downloading === "Performance" ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <FileDown className="mr-2 h-5 w-5" />
                )}
                {isFarmer ? "Generate My Performance Report" : "Generate Draft Report"}
              </Button>

              {!isFarmer && farmerId && (
                <Button
                  onClick={handleSign}
                  disabled={!!downloading}
                  size="lg"
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary/10 shadow-sm"
                >
                  {downloading === "Signing" ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <Award className="mr-2 h-5 w-5" />
                  )}
                  Sign & Issue Official Certificate
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-end">
          <div className="flex-1">
            <label className="text-xs font-bold uppercase text-muted-foreground">Start date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs font-bold uppercase text-muted-foreground">End date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setStartDate("");
              setEndDate("");
            }}
          >
            Clear dates
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {reportTypes.map((report) => (
          <Card
            key={report.title}
            className="overflow-hidden hover:shadow-md transition-shadow group border-border/50"
          >
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-1">
                <div className="p-2.5 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <report.icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">{report.title}</CardTitle>
              </div>
              <CardDescription className="line-clamp-2">{report.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="default"
                  className="flex-1"
                  disabled={report.count === 0 || !!downloading}
                  title={report.count === 0 ? "No data yet" : "Export report"}
                  onClick={() => handleDownload(report.type)}
                >
                  {downloading === report.type ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <FileDown className="mr-2 h-4 w-4" />
                  )}
                  Export Report
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  disabled={report.count === 0}
                  title={report.count === 0 ? "No data yet" : "View report online"}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  View Online
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {!isFarmer && !farmerId && (
          <>
            <Card className="overflow-hidden hover:shadow-md transition-shadow group border-border/50">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-1">
                  <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg">Financial Performance</CardTitle>
                </div>
                <CardDescription className="line-clamp-2">
                  Market price trends, cooperative revenue estimates and financial audit summaries.
                </CardDescription>
                <div className="text-xs font-semibold text-muted-foreground">
                  {farmers?.pagination?.totalItems || farmers?.data?.length || 0} farmer records
                  available.
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => handleDownload("Financial")}
                  >
                    <FileDown className="mr-2 h-4 w-4" />
                    Financial Report
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden hover:shadow-md transition-shadow group border-border/50">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-1">
                  <div className="p-2.5 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <ClipboardList className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg">System-wide Census</CardTitle>
                </div>
                <CardDescription className="line-clamp-2">
                  Summary of regional farmer activity, growth metrics and hardware deployment
                  status.
                </CardDescription>
                <div className="text-xs font-semibold text-muted-foreground">
                  {farmers?.data?.length || 0} farms in current scope.
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1" onClick={() => handleDownload("System")}>
                    <FileDown className="mr-2 h-4 w-4" />
                    Aggregate Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
