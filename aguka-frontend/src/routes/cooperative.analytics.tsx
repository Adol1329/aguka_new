import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/dashboard-ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { cooperativeApi } from "@/api";
import { Loader2, Thermometer, Droplets, Sprout, Cloud, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/cooperative/analytics")({
  component: CooperativeAnalyticsPage,
});

function CooperativeAnalyticsPage() {
  const { user } = useAuth();
  const coopId = user?.cooperativeId;

  const {
    data: analytics,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["cooperative-analytics", coopId],
    queryFn: () =>
      coopId ? cooperativeApi.getAnalytics(coopId).then((r) => r.data) : Promise.resolve(null),
    enabled: !!coopId,
  });

  if (!coopId) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <Cloud className="h-16 w-16 text-muted-foreground/20" />
        <h2 className="text-2xl font-bold">No Cooperative Assigned</h2>
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

  if (isError || !analytics) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-2xl font-bold text-destructive">Failed to load analytics</h2>
      </div>
    );
  }

  const { soil, weather, irrigation, cropHealth } = analytics;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Cooperative Analytics"
        subtitle="Aggregated soil, weather, irrigation, and crop health data."
      />

      {/* Soil Summary */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 pb-3">
          <Sprout className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Soil Summary</CardTitle>
          <Badge variant="outline" className="ml-auto">
            {soil.totalReadings} readings
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3 mb-6">
            <div className="bg-primary/5 p-4 rounded-xl text-center">
              <div className="text-2xl font-black text-primary">{soil.averageMoisture}%</div>
              <div className="text-xs text-muted-foreground mt-1">Avg Moisture</div>
            </div>
            <div className="bg-warning/5 p-4 rounded-xl text-center">
              <div className="text-2xl font-black text-warning">{soil.averageTemperature}°C</div>
              <div className="text-xs text-muted-foreground mt-1">Avg Temperature</div>
            </div>
            <div className="bg-success/5 p-4 rounded-xl text-center">
              <div className="text-2xl font-black text-success">{soil.averagePh}</div>
              <div className="text-xs text-muted-foreground mt-1">Avg pH Level</div>
            </div>
          </div>
          {soil.recentReadings?.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs uppercase text-muted-foreground font-bold">
                    <th className="pb-2">Farmer</th>
                    <th className="pb-2">Farm</th>
                    <th className="pb-2">Moisture</th>
                    <th className="pb-2">Temperature</th>
                    <th className="pb-2">pH</th>
                  </tr>
                </thead>
                <tbody>
                  {soil.recentReadings.map((r: any) => (
                    <tr key={r.id} className="border-b border-border/30 last:border-0">
                      <td className="py-2 font-medium">{r.farmerName}</td>
                      <td className="py-2 text-muted-foreground">{r.farmName || "-"}</td>
                      <td className="py-2">{r.moisturePercent}%</td>
                      <td className="py-2">
                        {r.temperatureCelsius ? `${r.temperatureCelsius}°C` : "-"}
                      </td>
                      <td className="py-2">{r.phLevel ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Weather Summary */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 pb-3">
          <Cloud className="h-5 w-5 text-blue-500" />
          <CardTitle className="text-lg">Weather Summary</CardTitle>
          {weather.lastUpdated && (
            <Badge variant="outline" className="ml-auto text-xs">
              Updated {new Date(weather.lastUpdated).toLocaleDateString()}
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-xl">
              <div className="text-sm font-bold text-muted-foreground mb-2">
                Temperature Readings
              </div>
              <div className="text-3xl font-black text-blue-600">
                {weather.temperatureTrend?.length || 0}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Historical data points</div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-xl">
              <div className="text-sm font-bold text-muted-foreground mb-2">Last Recorded Temp</div>
              <div className="text-3xl font-black text-blue-600">
                {weather.temperatureTrend?.[0]?.temperature !== null &&
                weather.temperatureTrend?.[0]?.temperature !== undefined
                  ? `${Number(weather.temperatureTrend[0].temperature).toFixed(1)}°C`
                  : "N/A"}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Most recent reading</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Irrigation Compliance */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 pb-3">
          <Droplets className="h-5 w-5 text-cyan-500" />
          <CardTitle className="text-lg">Irrigation Compliance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="bg-cyan-50 dark:bg-cyan-950/20 p-4 rounded-xl text-center">
              <div className="text-3xl font-black text-cyan-600">{irrigation.complianceRate}%</div>
              <div className="text-xs text-muted-foreground mt-1">Compliance Rate</div>
            </div>
            <div className="bg-cyan-50 dark:bg-cyan-950/20 p-4 rounded-xl text-center">
              <div className="text-3xl font-black text-cyan-600">
                {irrigation.farmersWithIrrigation}/{irrigation.totalFarmers}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Farmers Using Irrigation</div>
            </div>
            <div className="bg-cyan-50 dark:bg-cyan-950/20 p-4 rounded-xl text-center">
              <div className="text-3xl font-black text-cyan-600">{irrigation.totalLogs}</div>
              <div className="text-xs text-muted-foreground mt-1">Total Irrigation Events</div>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs font-bold mb-1">
              <span>Irrigation Adoption</span>
              <span>{irrigation.complianceRate}%</span>
            </div>
            <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-500 rounded-full transition-all"
                style={{ width: `${irrigation.complianceRate}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Crop Health */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 pb-3">
          <Sprout className="h-5 w-5 text-green-500" />
          <CardTitle className="text-lg">Crop Summary</CardTitle>
          <Badge variant="outline" className="ml-auto">
            {cropHealth.totalCrops} crops
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 mb-4">
            <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-xl text-center">
              <div className="text-3xl font-black text-green-600">{cropHealth.totalCrops}</div>
              <div className="text-xs text-muted-foreground mt-1">Total Crops Planted</div>
            </div>
            <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-xl text-center">
              <div className="text-3xl font-black text-green-600">{cropHealth.totalFarmers}</div>
              <div className="text-xs text-muted-foreground mt-1">Farmers with Crops</div>
            </div>
          </div>
          {Object.keys(cropHealth.byType).length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs uppercase text-muted-foreground font-bold">
                    <th className="pb-2">Crop Type</th>
                    <th className="pb-2">Count</th>
                    <th className="pb-2">Est. Yield (kg)</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(cropHealth.byType).map(([name, data]: [string, any]) => (
                    <tr key={name} className="border-b border-border/30 last:border-0">
                      <td className="py-2 font-medium">{name}</td>
                      <td className="py-2">{data.count}</td>
                      <td className="py-2">{data.totalYield.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
