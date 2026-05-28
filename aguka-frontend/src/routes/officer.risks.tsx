import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard-ui";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRisks } from "@/hooks/use-data";
import {
  AlertTriangle,
  Bug,
  CloudRain,
  History,
  Leaf,
  Loader2,
  MapPinned,
  Plus,
  ShieldCheck,
} from "lucide-react";

export const Route = createFileRoute("/officer/risks")({
  component: RisksPage,
});

type Risk = {
  id: string;
  alertType?: string;
  type?: string;
  severity?: string;
  title?: string;
  message?: string;
  description?: string;
  recommendation?: string | null;
  isRead?: boolean;
  createdAt: string;
  location?: string;
  farmer?: {
    fullName?: string | null;
    district?: string | null;
    sector?: string | null;
  };
};

const icons: Record<string, typeof Bug> = {
  pest: Bug,
  disease: Leaf,
  weather: CloudRain,
  soil: AlertTriangle,
  climate: CloudRain,
  other: AlertTriangle,
};

const severityClass = (severity?: string) => {
  if (severity === "critical") return "bg-red-100 text-red-700 border-red-200";
  if (severity === "warning") return "bg-amber-100 text-amber-700 border-amber-200";
  return "bg-blue-100 text-blue-700 border-blue-200";
};

function RiskCard({ risk, compact = false }: { risk: Risk; compact?: boolean }) {
  const type = (risk.alertType || risk.type || "other").toLowerCase();
  const Icon = icons[type] || AlertTriangle;
  return (
    <Card className="p-5">
      <div className="flex items-start gap-4">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl ${severityClass(risk.severity)}`}
        >
          <Icon className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="font-semibold">{risk.title || type}</div>
              <div className="text-xs uppercase tracking-tight text-muted-foreground">
                {type} · {risk.farmer?.district || risk.location || "District wide"}
              </div>
            </div>
            <span
              className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${severityClass(risk.severity)}`}
            >
              {risk.severity || "info"}
            </span>
          </div>
          {!compact && (
            <div className="mt-2 text-sm text-muted-foreground">
              {risk.message || risk.description || "Active risk monitoring in progress."}
            </div>
          )}
          <div className="mt-3 text-[10px] uppercase text-muted-foreground">
            Reported: {new Date(risk.createdAt).toLocaleDateString()}
            {risk.farmer?.sector ? ` · ${risk.farmer.sector}` : ""}
          </div>
        </div>
      </div>
    </Card>
  );
}

function RisksPage() {
  const { data: riskData, isLoading } = useRisks();
  const risks = (riskData || []) as Risk[];
  const activeRisks = risks.filter((risk) => !risk.isRead);
  const historicalRisks = risks.filter((risk) => risk.isRead).slice(0, 6);
  const districtCounts = risks.reduce<Record<string, number>>((acc, risk) => {
    const district = risk.farmer?.district || risk.location || "Unmapped";
    acc[district] = (acc[district] || 0) + 1;
    return acc;
  }, {});
  const mostCommonType =
    Object.entries(
      risks.reduce<Record<string, number>>((acc, risk) => {
        const type = risk.alertType || risk.type || "other";
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {}),
    ).sort((a, b) => b[1] - a[1])[0]?.[0] || "None";

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Risk Tracking"
        subtitle="Pest, disease and climate threats across your assigned farms."
        action={
          <Button asChild>
            <Link to="/officer/pest-disease">
              <Plus className="mr-2 h-4 w-4" />
              Add Risk
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <div className="text-xs font-bold uppercase text-muted-foreground">Active risks</div>
          <div className="mt-2 text-3xl font-bold">{activeRisks.length}</div>
        </Card>
        <Card className="p-5">
          <div className="text-xs font-bold uppercase text-muted-foreground">Total this season</div>
          <div className="mt-2 text-3xl font-bold">{risks.length}</div>
        </Card>
        <Card className="p-5">
          <div className="text-xs font-bold uppercase text-muted-foreground">Most common</div>
          <div className="mt-2 text-3xl font-bold capitalize">{mostCommonType}</div>
        </Card>
      </div>

      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-display text-lg font-semibold">Rwanda District Risk Map</h3>
            <p className="text-sm text-muted-foreground">
              Affected districts from assigned farm alerts.
            </p>
          </div>
          <MapPinned className="h-5 w-5 text-primary" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Object.keys(districtCounts).length > 0 ? (
            Object.entries(districtCounts).map(([district, count]) => (
              <div key={district} className="rounded-lg border bg-muted/20 p-3">
                <div className="text-sm font-semibold">{district}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {count} risk{count === 1 ? "" : "s"} reported
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              No districts affected yet.
            </div>
          )}
        </div>
      </Card>

      {activeRisks.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {activeRisks.map((risk) => (
            <RiskCard key={risk.id} risk={risk} />
          ))}
        </div>
      ) : (
        <Card className="flex flex-col items-center justify-center border-dashed py-14 text-center">
          <ShieldCheck className="mb-3 h-12 w-12 text-emerald-600" />
          <h3 className="text-lg font-semibold">No active risks reported</h3>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            Your assigned area is clear right now. Add a field risk when you detect a pest, disease,
            soil, or weather threat.
          </p>
          <Button className="mt-5" asChild>
            <Link to="/officer/pest-disease">
              <Plus className="mr-2 h-4 w-4" />
              Add Risk
            </Link>
          </Button>
        </Card>
      )}

      <Card className="p-5">
        <div className="mb-4 flex items-center gap-2">
          <History className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-display text-lg font-semibold">Historical Risks</h3>
        </div>
        {historicalRisks.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2">
            {historicalRisks.map((risk) => (
              <RiskCard key={risk.id} risk={risk} compact />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
            No resolved risks have been recorded yet.
          </div>
        )}
      </Card>
    </div>
  );
}
