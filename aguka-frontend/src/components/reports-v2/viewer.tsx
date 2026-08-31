import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, AlertTriangle, Lightbulb, GitCompare } from "lucide-react";
import type { ReportDefinition } from "@/api/reports-v2";
import { KpiGrid } from "./kpi";
import { ChartGrid, isChartEmpty } from "./charts";
import { TableSectionCard } from "./table";
import { RecommendationsList, RisksList } from "./risks-recs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-slate-100 text-slate-700 border-slate-200",
  medium: "bg-amber-100 text-amber-700 border-amber-200",
  high: "bg-orange-100 text-orange-700 border-orange-200",
  critical: "bg-red-100 text-red-700 border-red-200",
};

export function ReportViewer({ report }: { report: ReportDefinition }) {
  const ctx = report.context;
  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-primary/3 to-transparent">
        <CardHeader>
          <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                <FileText className="h-3.5 w-3.5" />
                {ctx.organization}
              </div>
              <CardTitle className="text-2xl">{ctx.title}</CardTitle>
              {ctx.subtitle && <p className="mt-1 text-sm text-muted-foreground">{ctx.subtitle}</p>}
            </div>
            <div className="space-y-1 text-right text-xs text-muted-foreground">
              <div>
                <strong className="text-foreground">Report ID:</strong>{" "}
                <code className="rounded bg-muted px-1 py-0.5">{ctx.reportId}</code>
              </div>
              <div>
                <strong className="text-foreground">Generated:</strong>{" "}
                {new Date(ctx.generatedAt).toLocaleString()}
              </div>
              {ctx.season && (
                <div>
                  <strong className="text-foreground">Season:</strong> {ctx.season}
                </div>
              )}
              <div>
                <strong className="text-foreground">Scope:</strong>{" "}
                <Badge variant="outline" className="text-[10px]">
                  {ctx.scope.roleScope}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Executive Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-foreground/90">{report.executiveSummary}</p>
        </CardContent>
      </Card>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Key Performance Indicators
        </h2>
        <KpiGrid kpis={report.kpis} />
      </section>

      {report.insights && report.insights.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              <CardTitle className="text-base">Insights</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {report.insights.map((insight, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  {insight}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap gap-3">
        <Badge
          variant="outline"
          className={cn("text-xs px-3 py-1", PRIORITY_COLORS[report.actionPriorityLevel])}
        >
          Priority: {report.actionPriorityLevel}
        </Badge>
        <Badge variant="outline" className="text-xs px-3 py-1">
          Risk Score: {report.riskScore}/100
        </Badge>
      </div>

      {report.alerts && report.alerts.length > 0 && (
        <Card className="border-red-200 bg-red-50/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <CardTitle className="text-base">Alerts</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {report.alerts.map((alert, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-lg border border-red-200 bg-white p-3"
              >
                <Badge
                  className={cn(
                    "mt-0.5 shrink-0",
                    alert.level === "critical" ? "bg-red-600" : "bg-orange-500",
                  )}
                >
                  {alert.level}
                </Badge>
                <div className="min-w-0">
                  <p className="text-sm font-medium">{alert.category}</p>
                  <p className="text-sm text-muted-foreground">{alert.message}</p>
                  {alert.recommendation && (
                    <p className="mt-1 text-xs text-muted-foreground/80">{alert.recommendation}</p>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {report.comparisons && report.comparisons.length > 0 && (
        <section className="space-y-4">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            <GitCompare className="h-4 w-4" /> Comparisons
          </h2>
          {report.comparisons.map((comp, i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle className="text-sm">{comp.heading}</CardTitle>
                {comp.insight && <p className="text-xs text-muted-foreground">{comp.insight}</p>}
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b text-xs text-muted-foreground">
                        {comp.metrics.map((m) => (
                          <th key={m.key} className="px-3 py-2 font-medium">
                            {m.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {comp.data.map((row, ri) => (
                        <tr key={ri} className="border-b last:border-0">
                          {comp.metrics.map((m) => (
                            <td key={m.key} className="px-3 py-2">
                              {row[m.key] ?? "—"}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      )}

      {report.charts.some((c) => !isChartEmpty(c)) && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Trends &amp; Analysis
          </h2>
          <ChartGrid charts={report.charts} />
        </section>
      )}

      {report.tables.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Detailed Data
          </h2>
          {report.tables.map((t, i) => (
            <TableSectionCard key={i} table={t} />
          ))}
        </section>
      )}

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <RisksList risks={report.risks} />
        <RecommendationsList items={report.recommendations} />
      </section>

      <Card>
        <CardContent className="flex flex-col gap-1 p-4 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-4">
            <span>
              <strong>Data Points:</strong> {report.metadata.dataPoints.toLocaleString()}
            </span>
            <span>
              <strong>Period:</strong> {report.metadata.periodLabel}
            </span>
            <span>
              <strong>Hash:</strong> <code>{report.metadata.hash}</code>
            </span>
            <span>
              <strong>Version:</strong> {report.metadata.version}
            </span>
          </div>
          {report.metadata.generatedBy && <span>Generated by: {report.metadata.generatedBy}</span>}
        </CardContent>
      </Card>
    </div>
  );
}
