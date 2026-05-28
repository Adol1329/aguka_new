import { PageHeader, StatCard } from "@/components/dashboard-ui";
import { Card } from "@/components/ui/card";
import { Droplets, Sprout, Cloud, Sun, ArrowRight, ListChecks, Loader2, TrendingUp, MessageSquare, BookOpen } from "lucide-react";
import { useSoilReadings, useSoilStatus, useWeatherForecast, useActivities, useFarmerProfile, useFarmerCrops } from "@/hooks/use-data";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { useI18n } from "@/i18n";
import { RecommendationList } from "@/components/recommendations/RecommendationList";

export function FarmerDashboardComponent() {
  const { t } = useI18n();
  const { data: profile, isLoading: isProfileLoading } = useFarmerProfile();
  const { data: crops, isLoading: isCropsLoading } = useFarmerCrops();
  const { data: soilStatus, isLoading: isSoilStatusLoading } = useSoilStatus();
  const { data: soilReadings, isLoading: isSoilReadingsLoading } = useSoilReadings();
  const { data: weatherForecast, isLoading: isWeatherLoading } = useWeatherForecast();
  const { data: activities, isLoading: isActivitiesLoading } = useActivities();

  const isLoading = isProfileLoading || isCropsLoading || isSoilStatusLoading || isSoilReadingsLoading || isWeatherLoading || isActivitiesLoading;

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const cropNames = Array.isArray(crops) ? crops.map((c: any) => c.crop?.nameEn || c.crop?.nameRw || 'Unknown').join(', ') : '';
  const subtitle = [
    profile?.farmName || 'My Farm',
    cropNames,
    profile?.farmSizeHectares ? `${profile.farmSizeHectares} ha` : '',
    profile?.sector || profile?.district || '',
  ].filter(Boolean).join(' · ');

  const displaySoilReadings = Array.isArray(soilReadings) ? soilReadings.slice(-7) : [];
  const displayWeather = Array.isArray(weatherForecast) ? weatherForecast : [];
  const displayActivities = Array.isArray(activities) ? (activities as any).data || activities : [];

  const currentWeather = displayWeather[0];

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
         <PageHeader title={t("dashboard.farmer.title")} subtitle={subtitle} />
         <div className="flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-600 border border-amber-100">
           <span className="relative flex h-2 w-2">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
             <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
           </span>
           {t("dashboard.iot_simulation_active")}
         </div>
       </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
         <StatCard
           label={t("smart.soil_moisture")}
           value={soilStatus?.current?.moisturePercent ? `${soilStatus.current.moisturePercent}%` : 'No data'}
           icon={Droplets}
           accent="info"
           trend="Optimal range"
         />
         <StatCard
           label={t("smart.soil_temperature")}
           value={soilStatus?.current?.temperatureCelsius ? `${soilStatus.current.temperatureCelsius}°C` : 'No data'}
           icon={Sun}
           accent="warning"
         />
         <StatCard
           label={t("smart.soil_ph")}
           value={soilStatus?.current?.phLevel?.toString() || 'No data'}
           icon={Sprout}
           accent="success"
           trend="Healthy"
         />
         <StatCard
           label={t("smart.weather_monitoring")}
           value={currentWeather ? `${currentWeather.temperatureCelsius}°C` : 'No data'}
           icon={Cloud}
           accent="primary"
           trend={currentWeather?.condition}
         />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 p-6">
           <div className="flex items-center justify-between mb-4">
             <h3 className="font-display text-lg font-semibold flex items-center gap-2">
               <Sprout className="h-5 w-5 text-success" />
               {t("dashboard.soil_moisture_7days")}
             </h3>
            <Button asChild variant="ghost" size="sm">
              <Link to="/farmer/soil">
                View details <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </div>
          {displaySoilReadings.length > 0 ? (
            <div className="flex h-48 items-end justify-between gap-2">
              {displaySoilReadings.map((r: any, idx: number) => (
                <div key={idx} className="flex flex-1 flex-col items-center gap-2">
                  <div className="text-xs font-medium">{r.moisturePercent}%</div>
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-info to-info/40 transition-all hover:from-info/80"
                    style={{ height: `${Number(r.moisturePercent) * 1.5}px` }}
                  />
                  <div className="text-xs text-muted-foreground">
                    {new Date(r.readingAt).toLocaleDateString(undefined, { weekday: 'short' })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
             <div className="flex h-48 items-center justify-center text-muted-foreground">
               {t("dashboard.no_soil_data")}
             </div>
          )}
        </Card>

        <Card className="p-6">
             <h3 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
               <Cloud className="h-5 w-5 text-info" />
               {t("dashboard.7day_forecast")}
             </h3>
          {displayWeather.length > 0 ? (
            <div className="space-y-2">
              {displayWeather.slice(0, 5).map((w: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-lg p-2 hover:bg-muted/40"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{w.icon || (w.precipitationProbability > 50 ? "🌧️" : "☀️")}</span>
                    <div>
                      <div className="text-sm font-medium">
                        {new Date(w.date || w.readingAt || w.forecastDate || Date.now()).toLocaleDateString(undefined, { weekday: 'short' })}
                      </div>
                      <div className="text-xs text-muted-foreground">{w.condition || "Clear"}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {w.temperatureCelsius}°
                    </div>
                    <div className="text-xs text-info">{w.precipitationProbability || 0}% rain</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
             <div className="flex h-48 items-center justify-center text-muted-foreground">
               {t("dashboard.no_weather_data")}
             </div>
          )}
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
           <h3 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
             <TrendingUp className="h-5 w-5 text-primary" />
             {t("dashboard.quick_actions")}
           </h3>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-1 bg-primary/5 border-primary/20 hover:bg-primary/10" asChild>
              <Link to="/farmer/crops">
                <Sprout className="h-5 w-5 mb-1" />
                <span className="text-xs">My Crops</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-1 bg-amber-50 border-amber-200 hover:bg-amber-100" asChild>
              <Link to="/farmer/guidance">
                <BookOpen className="h-5 w-5 mb-1 text-amber-600" />
                <span className="text-xs">Expert Guides</span>
              </Link>
            </Button>
          </div>
        </Card>

        <Card className="p-6">
           <h3 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
             <MessageSquare className="h-5 w-5 text-primary" />
             {t("dashboard.farmer_community")}
           </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Connect with other farmers to share ideas and ask questions.
          </p>
          <Button className="w-full" asChild>
            <Link to="/farmer/community">
              Go to Community
            </Link>
          </Button>
        </Card>
      </div>

         <Card className="p-6">
           <div className="flex items-center justify-between mb-4">
             <h3 className="font-display text-lg font-semibold flex items-center gap-2">
               <ListChecks className="h-5 w-5 text-primary" />
               {t("dashboard.recent_activities")}
             </h3>
          <Button asChild variant="ghost" size="sm">
            <Link to="/farmer/activities">
              View all <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </div>
        {displayActivities.length > 0 ? (
          <div className="space-y-2">
            {displayActivities.slice(0, 4).map((a: any) => (
              <div key={a.id} className="flex items-start gap-3 rounded-lg border p-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-success" />
                <div className="flex-1">
                  <div className="text-sm font-medium">
                    {a.activityType} · {a.cropId ? "Crop" : "Farm"}
                  </div>
                  <div className="text-xs text-muted-foreground">{a.notes}</div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(a.activityDate).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
             <div className="flex h-24 items-center justify-center text-muted-foreground">
               {t("dashboard.no_recent_activities")}
             </div>
        )}
      </Card>

      {/* Recommendations Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-semibold flex items-center gap-2">
            <ListChecks className="h-5 w-5 text-primary" /> {t("smart.recommendations")}
          </h3>
          <Button asChild variant="ghost" size="sm">
            <Link to="/farmer/recommendations">
              View all <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </div>
        <RecommendationList />
      </Card>
    </div>
  );
}
