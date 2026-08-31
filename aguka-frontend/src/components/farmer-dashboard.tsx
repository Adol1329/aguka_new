import { PageHeader } from "@/components/dashboard-ui";
import { Card } from "@/components/ui/card";
import {
  Cloud,
  ArrowRight,
  ListChecks,
  Loader2,
  TrendingUp,
  MessageSquare,
  BookOpen,
} from "lucide-react";
import { useOverview } from "@/hooks/useOverview";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { useI18n } from "@/i18n";
import { computeCropStatus } from "@/utils/cropStatus";
import { formatDistanceToNow, format } from "date-fns";

function SoilStatCard({
  label,
  value,
  unit,
  subLabel,
  status,
}: {
  label: string;
  value: number | null;
  unit: string;
  subLabel: string;
  status: "good" | "warn" | "danger" | "nodata";
}) {
  const colorMap = {
    good: { bg: "#E1F5EE", text: "#04342C", sub: "#0F6E56" },
    warn: { bg: "#FAEEDA", text: "#412402", sub: "#854F0B" },
    danger: { bg: "#FCEBEB", text: "#501313", sub: "#791F1F" },
    nodata: {
      bg: "var(--color-background-secondary)",
      text: "var(--color-text-secondary)",
      sub: "var(--color-text-tertiary)",
    },
  };
  const c = colorMap[status];
  return (
    <div style={{ background: c.bg, borderRadius: 8, padding: "12px 14px" }}>
      <p
        style={{
          fontSize: 11,
          fontWeight: 500,
          color: c.sub,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          marginBottom: 4,
        }}
      >
        {label}
      </p>
      {value !== null ? (
        <p style={{ fontSize: 22, fontWeight: 500, color: c.text }}>
          {value}
          {unit}
        </p>
      ) : (
        <p style={{ fontSize: 18, fontWeight: 500, color: c.text }}>No sensor data</p>
      )}
      <p style={{ fontSize: 12, color: c.sub, marginTop: 2 }}>{subLabel}</p>
    </div>
  );
}

export function FarmerDashboardComponent() {
  const { t } = useI18n();
  const { data, isLoading, isError, refetch } = useOverview();

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="space-y-4 w-full max-w-4xl px-4">
          <div className="h-8 w-1/3 bg-muted animate-pulse rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="h-20 w-full bg-muted animate-pulse rounded"></div>
            <div className="h-20 w-full bg-muted animate-pulse rounded"></div>
            <div className="h-20 w-full bg-muted animate-pulse rounded"></div>
            <div className="h-20 w-full bg-muted animate-pulse rounded"></div>
          </div>
          <div className="h-40 w-full bg-muted animate-pulse rounded mt-6"></div>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col h-[80vh] items-center justify-center gap-4">
        <p className="text-muted-foreground">Could not load farm data</p>
        <Button onClick={() => refetch()} variant="outline">
          Retry
        </Button>
      </div>
    );
  }

  const getMoistureStatus = (val: number | null) => {
    if (val === null) return { status: "nodata" as const, sub: "No sensor data" };
    if (val >= 60) return { status: "good" as const, sub: `${val}% · Optimal` };
    if (val >= 30) return { status: "warn" as const, sub: `${val}% · Borderline` };
    return { status: "danger" as const, sub: `${val}% · Too dry — irrigate` };
  };

  const getTempStatus = (val: number | null) => {
    if (val === null) return { status: "nodata" as const, sub: "No sensor data" };
    if (val >= 15 && val <= 28) return { status: "good" as const, sub: `${val}°C · Normal` };
    if (val > 28 && val <= 32) return { status: "warn" as const, sub: `${val}°C · Warm` };
    return { status: "danger" as const, sub: `${val}°C · Heat stress risk` };
  };

  const getPhStatus = (val: number | null) => {
    if (val === null) return { status: "nodata" as const, sub: "No sensor data" };
    if (val >= 6.0 && val <= 7.0)
      return { status: "good" as const, sub: `${val.toFixed(1)} · Healthy` };
    if ((val >= 5.5 && val < 6.0) || (val > 7.0 && val <= 7.5))
      return { status: "warn" as const, sub: `${val.toFixed(1)} · Suboptimal` };
    return { status: "danger" as const, sub: `${val.toFixed(1)} · Critical` };
  };

  const moistureInfo = getMoistureStatus(data.soilLatest.moisture);
  const tempInfo = getTempStatus(data.soilLatest.temperature);
  const phInfo = getPhStatus(data.soilLatest.ph);

  const subtitle = data.farmer.farmName
    ? `${data.farmer.farmName} ${data.crops[0] ? `· ${data.crops[0].cropName} · ${data.crops[0].areaHectares} ha` : ""} · ${data.farmer.sector || data.farmer.district}`
    : `Welcome, ${data.farmer.fullName}`;

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
        <SoilStatCard
          label="SOIL MOISTURE"
          value={data.soilLatest.moisture}
          unit="%"
          subLabel={moistureInfo.sub}
          status={moistureInfo.status}
        />
        <SoilStatCard
          label="SOIL TEMPERATURE"
          value={data.soilLatest.temperature}
          unit="°C"
          subLabel={tempInfo.sub}
          status={tempInfo.status}
        />
        <SoilStatCard
          label="SOIL PH"
          value={data.soilLatest.ph}
          unit=""
          subLabel={phInfo.sub}
          status={phInfo.status}
        />
        <SoilStatCard
          label="WEATHER"
          value={data.weather.temperature}
          unit="°C"
          subLabel={data.weather.condition}
          status="good"
        />
      </div>

      <div className="text-xs text-muted-foreground -mt-2 mb-4">
        {data.soilLatest.hasData && data.soilLatest.recordedAt
          ? `Last updated ${formatDistanceToNow(new Date(data.soilLatest.recordedAt))} ago · IoT Simulation Active`
          : "No sensor readings yet — simulation will generate data shortly"}
      </div>

      {/* My Crops Section */}
      {data.crops.length > 0 ? (
        <div
          style={{
            border: "0.5px solid var(--color-border-tertiary)",
            borderRadius: 12,
            padding: "1rem 1.25rem",
            background: "var(--color-background-primary)",
            marginBottom: "1rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <h3 style={{ fontSize: 15, fontWeight: 500, margin: 0 }}>My crops</h3>
            <Link to="/farmer/crops" style={{ fontSize: 13, color: "#1D9E75" }}>
              View all →
            </Link>
          </div>
          {data.crops.slice(0, 3).map((crop) => {
            const { label, badgeStyle } = computeCropStatus(
              new Date(crop.plantedDate),
              crop.growingDurationDays,
              crop.status,
            );
            return (
              <div
                key={crop.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 0",
                  borderBottom: "0.5px solid var(--color-border-tertiary)",
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: badgeStyle.text,
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{crop.cropName}</span>
                  <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
                    {" · "}
                    {crop.cropCategory}
                    {" · "}
                    {crop.areaHectares} ha{" · "}
                    {crop.location}
                  </span>
                </div>
                <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
                  Planted {format(new Date(crop.plantedDate), "d MMM yyyy")}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    padding: "2px 10px",
                    borderRadius: 999,
                    fontWeight: 500,
                    background: badgeStyle.background,
                    color: badgeStyle.text,
                  }}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div
          style={{
            border: "0.5px solid var(--color-border-tertiary)",
            borderRadius: 12,
            padding: "2rem",
            background: "var(--color-background-primary)",
            marginBottom: "1rem",
            textAlign: "center",
          }}
        >
          <p className="text-muted-foreground text-sm mb-2">No crops planted yet.</p>
          <Link to="/farmer/crops" className="text-primary text-sm font-medium hover:underline">
            Add your first crop →
          </Link>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-success" />
              {t("dashboard.soil_moisture_7days")}
            </h3>
            <Button asChild variant="ghost" size="sm">
              <Link to="/farmer/soil">
                View details <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </div>
          {data.soilTrend.length > 0 ? (
            <div className="flex h-48 items-end justify-between gap-2">
              {data.soilTrend.slice(-7).map((r, idx) => (
                <div key={idx} className="flex flex-1 flex-col items-center gap-2">
                  <div className="text-xs font-medium">{r.moisture}%</div>
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-info to-info/40 transition-all hover:from-info/80"
                    style={{ height: `${Number(r.moisture) * 1.5}px` }}
                  />
                  <div className="text-xs text-muted-foreground">
                    {new Date(r.recordedAt).toLocaleDateString(undefined, { weekday: "short" })}
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
          {data.weather.forecast.length > 0 ? (
            <div className="space-y-2">
              {data.weather.forecast.slice(0, 5).map((w, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-lg p-2 hover:bg-muted/40"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{w.rainChance > 50 ? "🌧️" : "☀️"}</span>
                    <div>
                      <div className="text-sm font-medium">
                        {new Date(w.day).toLocaleDateString(undefined, { weekday: "short" })}
                      </div>
                      <div className="text-xs text-muted-foreground">{w.condition}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{w.high}°</div>
                    <div className="text-xs text-info">{w.rainChance}% rain</div>
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
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center gap-1 bg-primary/5 border-primary/20 hover:bg-primary/10"
              asChild
            >
              <Link to="/farmer/crops">
                <span className="text-xs">My Crops</span>
              </Link>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center gap-1 bg-amber-50 border-amber-200 hover:bg-amber-100"
              asChild
            >
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
            <Link to="/farmer/community">Go to Community</Link>
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
        {data.recentActivities.length > 0 ? (
          <div className="space-y-2">
            {data.recentActivities.map((a) => (
              <div key={a.id} className="flex items-start gap-3 rounded-lg border p-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-success" />
                <div className="flex-1">
                  <div className="text-sm font-medium">
                    {a.activityType} {a.cropName ? `· ${a.cropName}` : "· Farm"}
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
    </div>
  );
}
