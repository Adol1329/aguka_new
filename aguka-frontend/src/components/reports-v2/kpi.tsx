import { Card, CardContent } from "@/components/ui/card";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import type { ReportKpi } from "@/api/reports-v2";

const TREND_COLORS = {
  up: "text-success",
  down: "text-destructive",
  flat: "text-muted-foreground",
};

export function KpiGrid({ kpis }: { kpis: ReportKpi[] }) {
  if (kpis.length === 0) return null;
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => (
        <KpiCard key={kpi.id} kpi={kpi} />
      ))}
    </div>
  );
}

function KpiCard({ kpi }: { kpi: ReportKpi }) {
  const TrendIcon =
    kpi.trend?.direction === "up" ? ArrowUp : kpi.trend?.direction === "down" ? ArrowDown : Minus;
  return (
    <Card>
      <CardContent className="flex flex-col gap-2 p-5">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
          {kpi.icon && <span className="text-base">{kpi.icon}</span>}
          <span className="font-semibold">{kpi.label}</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-foreground">{kpi.value}</span>
          {kpi.unit && <span className="text-sm text-muted-foreground">{kpi.unit}</span>}
        </div>
        <div className="flex items-center justify-between">
          {kpi.hint && <span className="text-xs text-muted-foreground">{kpi.hint}</span>}
          {kpi.trend && (
            <span
              className={`flex items-center gap-1 text-xs font-semibold ${TREND_COLORS[kpi.trend.direction]}`}
            >
              <TrendIcon className="h-3 w-3" />
              {kpi.trend.percent}%
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
