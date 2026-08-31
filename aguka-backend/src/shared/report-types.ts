// ─────────────────────────────────────────────
// Shared report type schema
// Consumer-facing API (frontend naming convention)
// ─────────────────────────────────────────────

// ── Utility types ────────────────────────────

export type RiskLevel = "low" | "moderate" | "high" | "critical";
export type TrendDirection = "up" | "down" | "flat";
export type SeasonName = "Season A" | "Season B" | "Season C" | "Off-season";
export type ActionPriorityLevel = "low" | "medium" | "high" | "critical";
export type ReportFormat = "pdf" | "xlsx" | "csv" | "json";

// ── Domain types ─────────────────────────────

export interface ReportKpi {
  id: string;
  label: string;
  value: number | string;
  unit?: string;
  trend?: { direction: TrendDirection; percent: number };
  icon?: string;
  hint?: string;
  target?: number;
}

export interface ReportTrendPoint {
  label: string;
  value: number;
  secondary?: number;
}

export interface ReportTableSection {
  heading: string;
  icon?: string;
  columns: {
    key: string;
    label: string;
    align?: "left" | "right" | "center";
  }[];
  rows: Array<Record<string, string | number | null | undefined>>;
  footnote?: string;
}

export interface ReportChartSection {
  heading: string;
  icon?: string;
  type: "line" | "bar" | "area" | "pie" | "doughnut";
  data: ReportTrendPoint[];
  xKey?: string;
  yKey?: string;
  yLabel?: string;
  unit?: string;
  description?: string;
}

export interface ReportRiskItem {
  level: RiskLevel;
  category: string;
  message: string;
  affected?: number;
  recommendation?: string;
}

export interface ReportRecommendation {
  priority: "low" | "medium" | "high" | "urgent";
  category: string;
  title: string;
  rationale: string;
  action: string;
  confidence: "low" | "medium" | "high";
  evidence?: string;
}

export interface ReportAlertItem {
  level: RiskLevel;
  category: string;
  message: string;
  timestamp?: string;
  affected?: number;
  recommendation?: string;
  acknowledged?: boolean;
}

export interface ReportComparisonSection {
  heading: string;
  type: "farmer" | "cooperative" | "regional" | "seasonal" | "period";
  data: Array<Record<string, string | number | null | undefined>>;
  metrics: { key: string; label: string }[];
  insight?: string;
}

export interface SignatoryInfo {
  name: string;
  role: string;
  organization: string;
  date: string;
  signatureHash?: string;
  signatureImagePath?: string;
}

export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  season?: SeasonName;
  cropType?: string;
  cropId?: string;
  cooperativeId?: string;
  district?: string;
  farmerId?: string;
  officerId?: string;
  search?: string;
}

export interface ReportContext {
  reportId: string;
  title: string;
  subtitle?: string;
  reportType: string;
  generatedAt: string;
  season?: SeasonName;
  filters: ReportFilters;
  scope: {
    roleScope: "farmer" | "officer" | "cooperative" | "admin" | "super_admin";
    targetId?: string;
    targetName?: string;
  };
  signatories?: SignatoryInfo[];
  systemName: string;
  organization: string;
  footer?: string;
}

export interface ReportDefinition {
  context: ReportContext;
  executiveSummary: string;
  kpis: ReportKpi[];
  insights: string[];
  alerts: ReportAlertItem[];
  recommendations: ReportRecommendation[];
  comparisons: ReportComparisonSection[];
  charts: ReportChartSection[];
  tables: ReportTableSection[];
  risks: ReportRiskItem[];
  riskScore: number;
  actionPriorityLevel: ActionPriorityLevel;
  metadata: {
    dataPoints: number;
    periodLabel: string;
    generatedBy?: string;
    hash: string;
    version: string;
  };
}

export interface ReportListItem {
  type: string;
  title: string;
  subtitle?: string;
  endpoints: { json: string; pdf: string; xlsx: string; csv: string };
}

export interface RenderedReport {
  filename: string;
  contentType: string;
  buffer: Uint8Array;
}
