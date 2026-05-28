import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard-ui";
import { Card } from "@/components/ui/card";
import { useWeatherForecast } from "@/hooks/use-data";
import { CloudRain, Wind, Droplets, Sun, Loader2 } from "lucide-react";

export const Route = createFileRoute("/farmer/weather")({
  component: WeatherPage,
});

function WeatherPage() {
  const { data: forecast, isLoading } = useWeatherForecast();

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const today = (forecast?.[0] as any) || { temperatureCelsius: 28, humidityPercent: 62, windSpeedKmh: 12, precipitationProbability: 0, condition: "Partly Cloudy" };

  return (
    <div className="space-y-6">
      <PageHeader title="Weather" subtitle="Local conditions and forecast for your region." />

      <Card className="overflow-hidden bg-gradient-hero p-8 text-primary-foreground">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm opacity-80">Current Conditions</div>
            <div className="font-display text-6xl font-bold mt-2">{today.temperatureCelsius}°</div>
            <div className="opacity-90">Partly cloudy, light breeze</div>
          </div>
          <Sun className="h-24 w-24 opacity-50" />
        </div>
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="rounded-xl bg-primary-foreground/10 p-3 backdrop-blur">
            <Droplets className="h-4 w-4 mb-1 opacity-80" />
            <div className="text-xs opacity-80">Humidity</div>
            <div className="font-semibold">{today.humidityPercent}%</div>
          </div>
          <div className="rounded-xl bg-primary-foreground/10 p-3 backdrop-blur">
            <Wind className="h-4 w-4 mb-1 opacity-80" />
            <div className="text-xs opacity-80">Wind</div>
            <div className="font-semibold">{today.windSpeedKmh} km/h</div>
          </div>
          <div className="rounded-xl bg-primary-foreground/10 p-3 backdrop-blur">
            <CloudRain className="h-4 w-4 mb-1 opacity-80" />
            <div className="text-xs opacity-80">Rain Chance</div>
            <div className="font-semibold">{today.precipitationProbability}%</div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-display text-lg font-semibold mb-4">Multi-day forecast</h3>
        <div className="grid gap-3 md:grid-cols-7">
          {forecast?.map((w: any, idx: number) => (
            <div key={idx} className="rounded-xl border bg-gradient-data p-4 text-center">
              <div className="text-xs font-medium text-muted-foreground">
                {new Date(w.forecastDate).toLocaleDateString([], { weekday: 'short' })}
              </div>
              <div className="text-3xl my-2">
                {w.precipitationProbability > 50 ? "🌧️" : w.temperatureCelsius > 25 ? "☀️" : "⛅"}
              </div>
              <div className="text-sm font-semibold">{w.temperatureCelsius}°</div>
              <div className="text-xs text-info mt-1">💧 {w.precipitationProbability}%</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
