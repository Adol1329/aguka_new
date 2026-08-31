import { apiClient } from "./client";

export interface ReportKpi {
  id: string;
  label: string;
  value: number | string;
  unit?: string;
  trend?: { direction: "up" | "down" | "flat"; percent: number };
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
  columns: { key: string; label: string; align?: "left" | "right" | "center" }[];
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
  level: "low" | "moderate" | "high" | "critical";
  category: string;
  message: string;
  affected?: number;
  recommendation?: string;
}

export type ActionPriorityLevel = "low" | "medium" | "high" | "critical";

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
  level: "low" | "moderate" | "high" | "critical";
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

export interface ReportDefinition {
  context: {
    reportId: string;
    title: string;
    subtitle?: string;
    reportType: string;
    generatedAt: string;
    season?: string;
    filters: Record<string, unknown>;
    scope: {
      roleScope: "farmer" | "officer" | "cooperative" | "admin" | "super_admin";
      targetId?: string;
      targetName?: string;
    };
    systemName: string;
    organization: string;
    footer?: string;
  };
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

export type ReportFormat = "pdf" | "xlsx" | "csv" | "json";

export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  seasonId?: string;
  cropType?: string;
  cropId?: string;
  cooperativeId?: string;
  district?: string;
  farmerId?: string;
  officerId?: string;
  search?: string;
}

function toQuery(filters: ReportFilters): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(filters)) {
    if (v !== undefined && v !== null && v !== "") out[k] = String(v);
  }
  return out;
}

const ROLE_BASE: Record<string, string> = {
  farmer: "farmer",
  officer: "officer",
  cooperative: "cooperative",
  admin: "admin",
  super_admin: "super_admin",
};

function roleBase(role: string): string {
  return ROLE_BASE[role] ?? role;
}

export const reportsV2Api = {
  list(role: string) {
    return apiClient.get<{ role: string; reports: ReportListItem[] }>(`/reports-v2`, {
      role: roleBase(role),
    });
  },

  fetch(role: string, type: string, filters: ReportFilters = {}) {
    return apiClient.get<ReportDefinition>(
      `/reports-v2/${roleBase(role)}/${type}`,
      toQuery(filters),
    );
  },

  download(
    role: string,
    type: string,
    format: Exclude<ReportFormat, "json">,
    filters: ReportFilters = {},
  ) {
    const ext = format === "xlsx" ? "xlsx" : format;
    const params = toQuery(filters);
    return apiClient.download(
      `/reports-v2/${roleBase(role)}/${type}.${ext}`,
      params,
      `${type}.${ext}`,
    );
  },
};
