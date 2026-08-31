import { Prisma } from "@prisma/client";
import crypto from "crypto";
import {
  ReportContext,
  ReportFilters,
  ReportDefinition,
  RiskLevel,
  ActionPriorityLevel,
  RiskItem,
  RecommendationItem,
} from "./types.js";

export class ReportError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number = 400,
  ) {
    super(message);
    this.name = "ReportError";
  }
}

export function generateReportId(reportType: string): string {
  const year = new Date().getFullYear();
  const seq = Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .toUpperCase()
    .padStart(6, "0");
  const safeType = reportType
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 12);
  return `AGK-${safeType}-${year}-${seq}`;
}

export function reportHash(report: ReportDefinition): string {
  const payload = JSON.stringify({
    id: report.context.reportId,
    title: report.context.title,
    kpis: report.kpis.map((k) => `${k.id}:${k.value}`),
    generated: report.context.generatedAt.toISOString(),
  });
  return crypto.createHash("sha256").update(payload).digest("hex").slice(0, 24);
}

export function asNumber(
  value: Prisma.Decimal | number | null | undefined,
  fallback = 0,
): number {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "number") return value;
  return Number(value.toString());
}

export function percent(num: number, denom: number, decimals = 1): number {
  if (!denom) return 0;
  const result = (num / denom) * 100;
  const p = Math.pow(10, decimals);
  return Math.round(result * p) / p;
}

export function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function standardDeviation(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = average(values);
  const squareDiffs = values.map((v) => (v - mean) ** 2);
  return Math.sqrt(average(squareDiffs));
}

export interface DailyPoint {
  date: Date;
  value: number;
  secondary?: number;
}

/**
 * Collapses raw timestamped readings (which can be several per day for
 * sensor data) into one point per calendar day, sorted chronologically.
 * Line charts built straight from raw readings both duplicate x-axis date
 * labels (multiple readings sharing the same day) and render as a jagged
 * mass when point density is high — aggregating first fixes both.
 */
export function aggregateByDay(
  points: DailyPoint[],
  method: "average" | "sum" = "average",
): { label: string; value: number; secondary?: number }[] {
  const groups = new Map<string, { value: number[]; secondary: number[] }>();
  for (const p of points) {
    const key = p.date.toISOString().slice(0, 10);
    const g = groups.get(key) ?? { value: [], secondary: [] };
    g.value.push(p.value);
    if (p.secondary !== undefined) g.secondary.push(p.secondary);
    groups.set(key, g);
  }

  const combine = (values: number[]) =>
    method === "sum" ? values.reduce((a, b) => a + b, 0) : average(values);
  const round2 = (n: number) => Math.round(n * 100) / 100;

  return Array.from(groups.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dateKey, g]) => ({
      label: dateKey.slice(5),
      value: round2(combine(g.value)),
      secondary: g.secondary.length > 0 ? round2(combine(g.secondary)) : undefined,
    }));
}

export function classifyRisk(score: number): RiskLevel {
  if (score < 30) return "critical";
  if (score < 60) return "high";
  if (score < 80) return "moderate";
  return "low";
}

export function periodLabel(filters: ReportFilters): string {
  if (!filters.startDate && !filters.endDate) return "All time";
  const fmt = (d?: Date) => (d ? d.toISOString().slice(0, 10) : "—");
  return `${fmt(filters.startDate)} → ${fmt(filters.endDate)}`;
}

export function dateRangeFilter(filters: ReportFilters): {
  gte?: Date;
  lte?: Date;
} {
  return {
    ...(filters.startDate ? { gte: filters.startDate } : {}),
    ...(filters.endDate ? { lte: filters.endDate } : {}),
  };
}

export function buildSpatialFilter(filters: ReportFilters): any {
  return {
    ...(filters.district
      ? { district: { equals: filters.district, mode: "insensitive" as const } }
      : {}),
    ...(filters.cooperativeId ? { cooperativeId: filters.cooperativeId } : {}),
    ...(filters.farmerId ? { id: filters.farmerId } : {}),
  };
}

export function buildContext(opts: {
  reportType: string;
  title: string;
  subtitle?: string;
  roleScope: ReportContext["scope"]["roleScope"];
  filters: ReportFilters;
  targetId?: string;
  targetName?: string;
  generatedBy?: string;
  organizationName?: string;
  footer?: string;
  signatoryName?: string;
  signatoryRole?: string;
}): ReportContext {
  const orgName = opts.organizationName || "Imbaraga Farmers Organization";
  const sysName = "AGUKA SMART FARMING KIT";

  return {
    reportId: generateReportId(opts.reportType),
    title: opts.title,
    subtitle: opts.subtitle,
    reportType: opts.reportType,
    generatedAt: new Date(),
    season: opts.filters.season ?? "Current",
    filters: opts.filters,
    scope: {
      roleScope: opts.roleScope,
      targetId: opts.targetId,
      targetName: opts.targetName,
    },
    systemName: sysName,
    organization: orgName,
    footer:
      opts.footer || `© ${new Date().getFullYear()} ${sysName} · ${orgName}`,
    signatories: [
      {
        name: opts.signatoryName || "System Generated",
        role: opts.signatoryRole || "AGUKA Analytics Engine",
        organization: orgName,
        date: new Date(),
      },
    ],
  };
}

export function computeRiskScore(risks: RiskItem[]): number {
  if (risks.length === 0) return 100;
  const weights: Record<RiskLevel, number> = {
    low: 0,
    moderate: 25,
    high: 50,
    critical: 100,
  };
  const total = risks.reduce((sum, r) => sum + weights[r.level], 0);
  const score = Math.max(0, 100 - total / risks.length);
  return Math.round(score);
}

export function computeActionPriorityLevel(
  risks: RiskItem[],
  recommendations: RecommendationItem[],
): ActionPriorityLevel {
  const hasCriticalRisk = risks.some((r) => r.level === "critical");
  const hasUrgentRec = recommendations.some((r) => r.priority === "urgent");
  if (hasCriticalRisk || hasUrgentRec) return "critical";
  const hasHighRisk = risks.some((r) => r.level === "high");
  const hasHighRec = recommendations.some((r) => r.priority === "high");
  if (hasHighRisk || hasHighRec) return "high";
  const hasModerateRisk = risks.some((r) => r.level === "moderate");
  if (hasModerateRisk) return "medium";
  return "low";
}

export function completeReport(
  report: Partial<ReportDefinition> &
    Pick<
      ReportDefinition,
      | "context"
      | "executiveSummary"
      | "kpis"
      | "charts"
      | "tables"
      | "recommendations"
      | "risks"
      | "metadata"
    >,
): ReportDefinition {
  return {
    ...report,
    insights: report.insights ?? [],
    alerts: report.alerts ?? extractAlerts(report.risks ?? []),
    comparisons: report.comparisons ?? [],
    riskScore: report.riskScore ?? computeRiskScore(report.risks ?? []),
    actionPriorityLevel:
      report.actionPriorityLevel ??
      computeActionPriorityLevel(
        report.risks ?? [],
        report.recommendations ?? [],
      ),
  };
}

export function extractAlerts(
  risks: RiskItem[],
): import("./types.js").AlertItem[] {
  return risks
    .filter((r) => r.level === "critical" || r.level === "high")
    .map((r) => ({
      level: r.level,
      category: r.category,
      message: r.message,
      affected: r.affected,
      recommendation: r.recommendation,
    }));
}
