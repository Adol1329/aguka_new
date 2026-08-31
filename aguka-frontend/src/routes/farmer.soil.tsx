import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard-ui";
import { Card } from "@/components/ui/card";
import { useOverview } from "@/hooks/useOverview";
import { Droplets, Thermometer, Beaker, FlaskConical, Loader2 } from "lucide-react";

export const Route = createFileRoute("/farmer/soil")({
  component: SoilMonitoring,
});

function SoilMonitoring() {
  const { data, isLoading, isError, refetch } = useOverview();

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col h-[80vh] items-center justify-center gap-4">
        <p className="text-muted-foreground">Could not load soil data</p>
        <button onClick={() => refetch()} className="px-4 py-2 bg-primary text-white rounded-lg">
          Retry
        </button>
      </div>
    );
  }

  const { soilLatest: latest, soilTrend: displayReadings } = data;

  const getNitrogenLabel = (val: number | null) => {
    if (val === null) return "No data";
    if (val > 120) return "High";
    if (val >= 40) return "Med";
    return "Low";
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Soil Monitoring" subtitle="Real-time readings from your soil sensors." />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Moisture",
            value: latest.moisture !== null ? `${latest.moisture}%` : "No data",
            status:
              latest.moisture === null ? "Inactive" : latest.moisture >= 45 ? "Optimal" : "Too Dry",
            icon: Droplets,
            color: "info",
          },
          {
            label: "Temperature",
            value: latest.temperature !== null ? `${latest.temperature}°C` : "No data",
            status:
              latest.temperature === null ? "Inactive" : latest.temperature <= 28 ? "Good" : "High",
            icon: Thermometer,
            color: "warning",
          },
          {
            label: "pH",
            value: latest.ph !== null ? latest.ph.toFixed(1) : "No data",
            status:
              latest.ph === null
                ? "Inactive"
                : latest.ph >= 6.0 && latest.ph <= 7.0
                  ? "Healthy"
                  : "Suboptimal",
            icon: Beaker,
            color: "success",
          },
          {
            label: "Nitrogen (N)",
            value: getNitrogenLabel(latest.nitrogen),
            status: latest.nitrogen === null ? "Inactive" : "Healthy range",
            icon: FlaskConical,
            color: "success",
          },
        ].map((s) => (
          <Card key={s.label} className="p-5">
            <div
              className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary`}
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
        <h3 className="font-display text-lg font-semibold mb-4">
          Moisture & temperature (last 7 readings)
        </h3>
        {displayReadings.length > 0 ? (
          <div className="flex h-64 items-end justify-between gap-3">
            {displayReadings.slice(-7).map((r: any, idx: number) => (
              <div key={idx} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex w-full gap-1 h-48 items-end">
                  <div
                    className="flex-1 rounded-t bg-info/70"
                    style={{ height: `${Number(r.moisture || 0) * 1.5}px` }}
                    title={`${r.moisture}% moisture`}
                  />
                  <div
                    className="flex-1 rounded-t bg-warning/70"
                    style={{ height: `${(Number(r.temperature) || 20) * 3}px` }}
                    title={`${r.temperature}°C temperature`}
                  />
                </div>
                <div className="text-[10px] text-muted-foreground">
                  {new Date(r.recordedAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-64 items-center justify-center text-muted-foreground">
            No soil reading data available for the chart.
          </div>
        )}
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
          {latest.moisture === null ? (
            "Waiting for initial sensor readings to provide recommendations."
          ) : (
            <>
              Soil moisture is {latest.moisture < 40 ? "trending down" : "looking good"}.
              {latest.moisture < 40
                ? " Consider light irrigation tomorrow morning to maintain optimal root health."
                : " No immediate irrigation needed for your current crop stage."}
            </>
          )}
        </p>
      </Card>
    </div>
  );
}
