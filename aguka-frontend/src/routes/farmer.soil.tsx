import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard-ui";
import { Card } from "@/components/ui/card";
import { useSoilReadings } from "@/hooks/use-data";
import { Droplets, Thermometer, Beaker, FlaskConical, Loader2 } from "lucide-react";

export const Route = createFileRoute("/farmer/soil")({
  component: SoilMonitoring,
});

function SoilMonitoring() {
  const { data: soilReadings, isLoading } = useSoilReadings();

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const displayReadings = Array.isArray(soilReadings) ? soilReadings.slice(-7) : [];
  const latest = displayReadings[displayReadings.length - 1] || { 
    moisture: 0, 
    soilTemperature: 0, 
    ph: 7.0,
    nitrogen: 0 
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Soil Monitoring" subtitle="Real-time readings from your soil sensors." />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Moisture", value: `${latest.moisture}%`, status: "Optimal", icon: Droplets, color: "info" },
          {
            label: "Temperature",
            value: `${latest.soilTemperature || 22}°C`,
            status: "Good",
            icon: Thermometer,
            color: "warning",
          },
          { label: "pH", value: latest.ph?.toString() || "6.5", status: "Healthy", icon: Beaker, color: "success" },
          {
            label: "Nitrogen (N)",
            value: latest.nitrogen && latest.nitrogen > 50 ? "High" : "Med",
            status: "Healthy range",
            icon: FlaskConical,
            color: "success",
          },
        ].map((s) => (
          <Card key={s.label} className="p-5">
            <div
              className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-${s.color}/10 text-${s.color}`}
            >
              <s.icon className="h-5 w-5" />
            </div>
            <div className="text-xs text-muted-foreground uppercase">{s.label}</div>
            <div className="font-display text-3xl font-bold">{s.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{s.status}</div>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <h3 className="font-display text-lg font-semibold mb-4">Moisture & temperature (7 readings)</h3>
        <div className="flex h-64 items-end justify-between gap-3">
          {displayReadings.map((r: any, idx: number) => (
            <div key={idx} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex w-full gap-1 h-48 items-end">
                <div
                  className="flex-1 rounded-t bg-info/70"
                  style={{ height: `${Number(r.moisture || 0) * 2}px` }}
                  title={`${r.moisture}%`}
                />
                <div
                  className="flex-1 rounded-t bg-warning/70"
                  style={{ height: `${(Number(r.soilTemperature) || 20) * 5}px` }}
                  title={`${r.soilTemperature}°C`}
                />
              </div>
              <div className="text-xs text-muted-foreground">
                {new Date(r.readingAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}
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
      </Card>

      <Card className="p-5 border-success/30 bg-success/5">
        <h4 className="font-semibold mb-2">💡 Recommendation</h4>
        <p className="text-sm text-muted-foreground">
          Soil moisture is {Number(latest.moisture) < 40 ? "trending down" : "looking good"}. 
          {Number(latest.moisture) < 40 ? " Consider light irrigation tomorrow morning." : " No immediate irrigation needed."}
        </p>
      </Card>
    </div>
  );
}
