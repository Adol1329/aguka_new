export type RiskLevel = "low" | "moderate" | "high" | "critical";
export type TrendDirection = "up" | "down" | "flat";
export type SeasonName = string;

export interface Kpi {
  id: string;
  label: string;
  value: number | string;
  unit?: string;
  trend?: { direction: TrendDirection; percent: number };
  icon?: string;
  hint?: string;
  target?: number;
}

export interface TrendPoint {
  label: string;
  value: number;
  secondary?: number;
}

export interface TableSection {
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

export interface ChartSection {
  heading: string;
  icon?: string;
  type: "line" | "bar" | "area" | "pie" | "doughnut";
  data: TrendPoint[];
  xKey?: string;
  yKey?: string;
  yLabel?: string;
  unit?: string;
  description?: string;
}

export interface RiskItem {
  level: RiskLevel;
  category: string;
  message: string;
  affected?: number;
  recommendation?: string;
}

export type ActionPriorityLevel = "low" | "medium" | "high" | "critical";

export interface RecommendationItem {
  priority: "low" | "medium" | "high" | "urgent";
  category: string;
  title: string;
  rationale: string;
  action: string;
  confidence: "low" | "medium" | "high";
  evidence?: string;
}

export interface AlertItem {
  level: RiskLevel;
  category: string;
  message: string;
  timestamp?: Date;
  affected?: number;
  recommendation?: string;
  acknowledged?: boolean;
}

export interface ComparisonSection {
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
  date: Date;
  signatureHash?: string;
  signatureImagePath?: string;
}

export interface ReportFilters {
  startDate?: Date;
  endDate?: Date;
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
  generatedAt: Date;
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
  kpis: Kpi[];
  insights: string[];
  alerts: AlertItem[];
  recommendations: RecommendationItem[];
  comparisons: ComparisonSection[];
  charts: ChartSection[];
  tables: TableSection[];
  risks: RiskItem[];
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

export interface RenderedReport {
  filename: string;
  contentType: string;
  buffer: Buffer;
}
