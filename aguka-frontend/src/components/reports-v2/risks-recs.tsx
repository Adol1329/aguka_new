import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, ShieldCheck, Lightbulb } from "lucide-react";
import type { ReportRiskItem, ReportRecommendation } from "@/api/reports-v2";

const RISK_STYLES: Record<string, { bg: string; text: string; ring: string }> = {
  low: { bg: "bg-success/10", text: "text-success", ring: "border-success/30" },
  moderate: { bg: "bg-warning/10", text: "text-warning", ring: "border-warning/30" },
  high: { bg: "bg-orange-500/10", text: "text-orange-600", ring: "border-orange-500/30" },
  critical: { bg: "bg-destructive/10", text: "text-destructive", ring: "border-destructive/30" },
};

const PRIORITY_STYLES: Record<string, string> = {
  urgent: "bg-destructive text-destructive-foreground",
  high: "bg-orange-500 text-white",
  medium: "bg-warning text-warning-foreground",
  low: "bg-success text-success-foreground",
};

export function RisksList({ risks }: { risks: ReportRiskItem[] }) {
  if (risks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="h-4 w-4 text-success" />
            Risk Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No active risks identified in the reporting period.
          </p>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          Risk Assessment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {risks.map((r, i) => {
          const style = RISK_STYLES[r.level] ?? RISK_STYLES.moderate;
          return (
            <div key={i} className={`rounded-lg border ${style.ring} ${style.bg} p-3`}>
              <div className="mb-1 flex items-center gap-2">
                <span
                  className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${style.text}`}
                >
                  {r.level}
                </span>
                <span className="text-sm font-semibold">{r.category}</span>
                {r.affected !== undefined && (
                  <span className="ml-auto text-xs text-muted-foreground">
                    {r.affected} affected
                  </span>
                )}
              </div>
              <p className="text-sm text-foreground/90">{r.message}</p>
              {r.recommendation && (
                <p className="mt-1 text-xs italic text-muted-foreground">→ {r.recommendation}</p>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

export function RecommendationsList({ items }: { items: ReportRecommendation[] }) {
  if (items.length === 0) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Lightbulb className="h-4 w-4 text-warning" />
          AI Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((r, i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-3">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <span
                className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${PRIORITY_STYLES[r.priority]}`}
              >
                {r.priority}
              </span>
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {r.category}
              </span>
              <span className="ml-auto text-[10px] uppercase text-muted-foreground">
                confidence: {r.confidence}
              </span>
            </div>
            <p className="text-sm font-semibold">{r.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{r.rationale}</p>
            <p className="mt-1 text-sm font-medium text-primary">→ {r.action}</p>
            {r.evidence && (
              <p className="mt-1 text-xs italic text-muted-foreground">{r.evidence}</p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
