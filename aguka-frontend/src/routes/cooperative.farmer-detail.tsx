import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/dashboard-ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth";
import { cooperativeApi } from "@/api";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Sprout, Droplets, Calendar, Package, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/cooperative/farmer-detail")({
  component: CooperativeFarmerDetailPage,
});

function CooperativeFarmerDetailPage() {
  const { farmerId } = (useSearch({ strict: false }) as { farmerId?: string }) ?? {};
  const farmerIdStr = farmerId ?? "";
  const { user } = useAuth();
  const coopId = user?.cooperativeId;

  const {
    data: farmer,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["cooperative-farmer-detail", coopId, farmerId],
    queryFn: () =>
      coopId && farmerIdStr
        ? cooperativeApi.getFarmerDetail(coopId, farmerIdStr).then((r) => r.data)
        : Promise.resolve(null),
    enabled: !!coopId && !!farmerIdStr,
  });

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !farmer) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-2xl font-bold text-destructive">Farmer not found</h2>
        <Button variant="outline" className="mt-4" asChild>
          <Link to="/cooperative/farmers">Back to Farmers</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/cooperative/farmers">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Link>
        </Button>
      </div>
      <PageHeader
        title={farmer.fullName}
        subtitle={`${farmer.district} · ${farmer.sector} · ${farmer.farmName || "No farm name"}`}
      />

      <Tabs defaultValue="soil">
        <TabsList>
          <TabsTrigger value="soil">Soil</TabsTrigger>
          <TabsTrigger value="crops">Crops ({farmer._count?.crops || 0})</TabsTrigger>
          <TabsTrigger value="activities">
            Activities ({farmer._count?.activities || 0})
          </TabsTrigger>
          <TabsTrigger value="bookings">Resource Bookings</TabsTrigger>
        </TabsList>

        <TabsContent value="soil" className="mt-4">
          {farmer.soilReadings?.length > 0 ? (
            <div className="grid gap-4">
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-black text-primary">
                      {Number(farmer.soilReadings[0]?.moisturePercent || 0).toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground">Latest Moisture</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-black text-warning">
                      {farmer.soilReadings[0]?.temperatureCelsius
                        ? `${Number(farmer.soilReadings[0].temperatureCelsius).toFixed(1)}°C`
                        : "N/A"}
                    </div>
                    <div className="text-xs text-muted-foreground">Latest Temperature</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-black text-success">
                      {farmer.soilReadings[0]?.phLevel
                        ? Number(farmer.soilReadings[0].phLevel).toFixed(1)
                        : "N/A"}
                    </div>
                    <div className="text-xs text-muted-foreground">Latest pH</div>
                  </CardContent>
                </Card>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-bold">Recent Readings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left text-xs uppercase text-muted-foreground font-bold">
                          <th className="pb-2">Date</th>
                          <th className="pb-2">Moisture</th>
                          <th className="pb-2">Temperature</th>
                          <th className="pb-2">pH</th>
                        </tr>
                      </thead>
                      <tbody>
                        {farmer.soilReadings.map((r: any) => (
                          <tr key={r.id} className="border-b border-border/30 last:border-0">
                            <td className="py-2">{new Date(r.readingAt).toLocaleDateString()}</td>
                            <td className="py-2">{Number(r.moisturePercent || 0).toFixed(1)}%</td>
                            <td className="py-2">
                              {r.temperatureCelsius
                                ? `${Number(r.temperatureCelsius).toFixed(1)}°C`
                                : "-"}
                            </td>
                            <td className="py-2">
                              {r.phLevel ? Number(r.phLevel).toFixed(1) : "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="p-10 text-center text-muted-foreground">
                No soil readings recorded.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="crops" className="mt-4">
          {farmer.crops?.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {farmer.crops.map((c: any) => (
                <Card key={c.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Sprout className="h-4 w-4 text-green-500" />
                      <span className="font-bold">{c.crop?.nameEn || "Unknown Crop"}</span>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>Planted: {new Date(c.plantedDate).toLocaleDateString()}</div>
                      {c.estimatedYieldKg && (
                        <div>Est. Yield: {Number(c.estimatedYieldKg).toLocaleString()} kg</div>
                      )}
                      {c.areaHectares && <div>Area: {Number(c.areaHectares).toFixed(2)} ha</div>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-10 text-center text-muted-foreground">
                No crops recorded.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="activities" className="mt-4">
          {farmer.activities?.length > 0 ? (
            <div className="space-y-3">
              {farmer.activities.map((a: any) => (
                <Card key={a.id}>
                  <CardContent className="p-4 flex items-start justify-between">
                    <div>
                      <div className="font-bold">{a.activityType}</div>
                      <div className="text-sm text-muted-foreground">{a.category || "General"}</div>
                      {a.notes && <div className="text-sm mt-1">{a.notes}</div>}
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <div>{new Date(a.activityDate).toLocaleDateString()}</div>
                      {a.costRwf && <div>{Number(a.costRwf).toLocaleString()} RWF</div>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-10 text-center text-muted-foreground">
                No activities recorded.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="bookings" className="mt-4">
          {farmer.bookings?.length > 0 ? (
            <div className="space-y-3">
              {farmer.bookings.map((b: any) => (
                <Card key={b.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-bold">{b.resource?.name || "Unknown Resource"}</div>
                        <div className="text-sm text-muted-foreground">Qty: {b.quantity}</div>
                      </div>
                      <Badge variant="outline">{b.status}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      {new Date(b.startDate).toLocaleDateString()} -{" "}
                      {new Date(b.endDate).toLocaleDateString()}
                    </div>
                    {b.deliveryStatus && (
                      <div className="text-xs mt-1">
                        Delivery:{" "}
                        <Badge variant="outline" className="text-[10px]">
                          {b.deliveryStatus}
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-10 text-center text-muted-foreground">
                No resource bookings.
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
