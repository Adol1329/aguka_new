import {
  TrendingUp,
  Calendar,
  BrainCircuit,
  Droplets,
  Sprout,
  Users,
  Bell,
  AlertTriangle,
  Scale,
  ListChecks,
  BarChart3,
  Building2,
  Shield,
  Database,
  Activity,
  ScrollText,
  HardDrive,
  ShieldCheck,
  Globe,
  Award,
  Package,
  Wallet,
  Bug,
  Zap,
  ClipboardCheck,
  type LucideIcon,
} from "lucide-react";

export type ReportRole = "farmer" | "officer" | "cooperative" | "admin" | "super_admin";

export type ReportType =
  | "performance"
  | "seasonal"
  | "ai-recommendation"
  | "soil-irrigation"
  | "yield-productivity"
  | "assigned-farmers"
  | "advisory"
  | "risk"
  | "performance-comparison"
  | "monthly-summary"
  | "farmer-comparison"
  | "resource-distribution"
  | "recommendation"
  | "production"
  | "system-usage"
  | "financial"
  | "data-validation"
  | "analytics-dashboard"
  | "user-activity"
  | "audit"
  | "system-health"
  | "backup"
  | "security"
  | "national";

export interface ReportConfig {
  role: ReportRole;
  type: ReportType;
  slug: string;
  titleKey: string;
  subtitleKey: string;
  icon: LucideIcon;
  accent: "primary" | "success" | "warning" | "info" | "destructive";
  showCrop: boolean;
  showSeason: boolean;
}

export const REPORT_REGISTRY: Record<string, ReportConfig> = {
  "farmer.performance": {
    role: "farmer",
    type: "performance",
    slug: "performance",
    titleKey: "reports_v2.farmer.performance.title",
    subtitleKey: "reports_v2.farmer.performance.subtitle",
    icon: TrendingUp,
    accent: "primary",
    showCrop: true,
    showSeason: true,
  },
  "farmer.seasonal": {
    role: "farmer",
    type: "seasonal",
    slug: "seasonal",
    titleKey: "reports_v2.farmer.seasonal.title",
    subtitleKey: "reports_v2.farmer.seasonal.subtitle",
    icon: Calendar,
    accent: "info",
    showCrop: true,
    showSeason: true,
  },
  "farmer.ai-recommendation": {
    role: "farmer",
    type: "ai-recommendation",
    slug: "ai-recommendation",
    titleKey: "reports_v2.farmer.ai.title",
    subtitleKey: "reports_v2.farmer.ai.subtitle",
    icon: BrainCircuit,
    accent: "warning",
    showCrop: true,
    showSeason: true,
  },
  "farmer.soil-irrigation": {
    role: "farmer",
    type: "soil-irrigation",
    slug: "soil-irrigation",
    titleKey: "reports_v2.farmer.soil_irrigation.title",
    subtitleKey: "reports_v2.farmer.soil_irrigation.subtitle",
    icon: Droplets,
    accent: "info",
    showCrop: false,
    showSeason: true,
  },
  "farmer.yield-productivity": {
    role: "farmer",
    type: "yield-productivity",
    slug: "yield-productivity",
    titleKey: "reports_v2.farmer.yield.title",
    subtitleKey: "reports_v2.farmer.yield.subtitle",
    icon: Sprout,
    accent: "success",
    showCrop: true,
    showSeason: true,
  },

  "officer.assigned-farmers": {
    role: "officer",
    type: "assigned-farmers",
    slug: "assigned-farmers",
    titleKey: "reports_v2.officer.assigned.title",
    subtitleKey: "reports_v2.officer.assigned.subtitle",
    icon: Users,
    accent: "primary",
    showCrop: false,
    showSeason: false,
  },
  "officer.advisory": {
    role: "officer",
    type: "advisory",
    slug: "advisory",
    titleKey: "reports_v2.officer.advisory.title",
    subtitleKey: "reports_v2.officer.advisory.subtitle",
    icon: Bell,
    accent: "info",
    showCrop: true,
    showSeason: true,
  },
  "officer.risk": {
    role: "officer",
    type: "risk",
    slug: "risk",
    titleKey: "reports_v2.officer.risk.title",
    subtitleKey: "reports_v2.officer.risk.subtitle",
    icon: AlertTriangle,
    accent: "destructive",
    showCrop: false,
    showSeason: true,
  },
  "officer.performance-comparison": {
    role: "officer",
    type: "performance-comparison",
    slug: "performance-comparison",
    titleKey: "reports_v2.officer.comparison.title",
    subtitleKey: "reports_v2.officer.comparison.subtitle",
    icon: Scale,
    accent: "primary",
    showCrop: true,
    showSeason: true,
  },
  "officer.monthly-summary": {
    role: "officer",
    type: "monthly-summary",
    slug: "monthly-summary",
    titleKey: "reports_v2.officer.monthly.title",
    subtitleKey: "reports_v2.officer.monthly.subtitle",
    icon: ListChecks,
    accent: "success",
    showCrop: false,
    showSeason: true,
  },

  "cooperative.performance": {
    role: "cooperative",
    type: "performance",
    slug: "performance",
    titleKey: "reports_v2.coop.performance.title",
    subtitleKey: "reports_v2.coop.performance.subtitle",
    icon: BarChart3,
    accent: "primary",
    showCrop: true,
    showSeason: true,
  },
  "cooperative.farmer-comparison": {
    role: "cooperative",
    type: "farmer-comparison",
    slug: "farmer-comparison",
    titleKey: "reports_v2.coop.farmer_comparison.title",
    subtitleKey: "reports_v2.coop.farmer_comparison.subtitle",
    icon: Users,
    accent: "info",
    showCrop: true,
    showSeason: true,
  },
  "cooperative.resource-distribution": {
    role: "cooperative",
    type: "resource-distribution",
    slug: "resource-distribution",
    titleKey: "reports_v2.coop.resources.title",
    subtitleKey: "reports_v2.coop.resources.subtitle",
    icon: Package,
    accent: "warning",
    showCrop: false,
    showSeason: true,
  },
  "cooperative.recommendation": {
    role: "cooperative",
    type: "recommendation",
    slug: "recommendation",
    titleKey: "reports_v2.coop.recommendation.title",
    subtitleKey: "reports_v2.coop.recommendation.subtitle",
    icon: BrainCircuit,
    accent: "success",
    showCrop: true,
    showSeason: true,
  },
  "cooperative.production": {
    role: "cooperative",
    type: "production",
    slug: "production",
    titleKey: "reports_v2.coop.production.title",
    subtitleKey: "reports_v2.coop.production.subtitle",
    icon: Award,
    accent: "success",
    showCrop: true,
    showSeason: true,
  },

  "admin.system-usage": {
    role: "admin",
    type: "system-usage",
    slug: "system-usage",
    titleKey: "reports_v2.admin.usage.title",
    subtitleKey: "reports_v2.admin.usage.subtitle",
    icon: Activity,
    accent: "primary",
    showCrop: false,
    showSeason: false,
  },
  "admin.financial": {
    role: "admin",
    type: "financial",
    slug: "financial",
    titleKey: "reports_v2.admin.financial.title",
    subtitleKey: "reports_v2.admin.financial.subtitle",
    icon: Wallet,
    accent: "success",
    showCrop: false,
    showSeason: true,
  },
  "admin.data-validation": {
    role: "admin",
    type: "data-validation",
    slug: "data-validation",
    titleKey: "reports_v2.admin.validation.title",
    subtitleKey: "reports_v2.admin.validation.subtitle",
    icon: ClipboardCheck,
    accent: "warning",
    showCrop: false,
    showSeason: true,
  },
  "admin.analytics-dashboard": {
    role: "admin",
    type: "analytics-dashboard",
    slug: "analytics-dashboard",
    titleKey: "reports_v2.admin.analytics.title",
    subtitleKey: "reports_v2.admin.analytics.subtitle",
    icon: BarChart3,
    accent: "info",
    showCrop: false,
    showSeason: true,
  },
  "admin.user-activity": {
    role: "admin",
    type: "user-activity",
    slug: "user-activity",
    titleKey: "reports_v2.admin.user_activity.title",
    subtitleKey: "reports_v2.admin.user_activity.subtitle",
    icon: Users,
    accent: "primary",
    showCrop: false,
    showSeason: true,
  },

  "super_admin.audit": {
    role: "super_admin",
    type: "audit",
    slug: "audit",
    titleKey: "reports_v2.super.audit.title",
    subtitleKey: "reports_v2.super.audit.subtitle",
    icon: ScrollText,
    accent: "primary",
    showCrop: false,
    showSeason: true,
  },
  "super_admin.system-health": {
    role: "super_admin",
    type: "system-health",
    slug: "system-health",
    titleKey: "reports_v2.super.health.title",
    subtitleKey: "reports_v2.super.health.subtitle",
    icon: Zap,
    accent: "success",
    showCrop: false,
    showSeason: false,
  },
  "super_admin.backup": {
    role: "super_admin",
    type: "backup",
    slug: "backup",
    titleKey: "reports_v2.super.backup.title",
    subtitleKey: "reports_v2.super.backup.subtitle",
    icon: HardDrive,
    accent: "info",
    showCrop: false,
    showSeason: true,
  },
  "super_admin.security": {
    role: "super_admin",
    type: "security",
    slug: "security",
    titleKey: "reports_v2.super.security.title",
    subtitleKey: "reports_v2.super.security.subtitle",
    icon: ShieldCheck,
    accent: "destructive",
    showCrop: false,
    showSeason: true,
  },
  "super_admin.national": {
    role: "super_admin",
    type: "national",
    slug: "national",
    titleKey: "reports_v2.super.national.title",
    subtitleKey: "reports_v2.super.national.subtitle",
    icon: Globe,
    accent: "primary",
    showCrop: true,
    showSeason: true,
  },
};

export const REPORTS_BY_ROLE: Record<ReportRole, ReportConfig[]> = {
  farmer: [
    REPORT_REGISTRY["farmer.performance"],
    REPORT_REGISTRY["farmer.seasonal"],
    REPORT_REGISTRY["farmer.ai-recommendation"],
    REPORT_REGISTRY["farmer.soil-irrigation"],
    REPORT_REGISTRY["farmer.yield-productivity"],
  ],
  officer: [
    REPORT_REGISTRY["officer.assigned-farmers"],
    REPORT_REGISTRY["officer.advisory"],
    REPORT_REGISTRY["officer.risk"],
    REPORT_REGISTRY["officer.performance-comparison"],
    REPORT_REGISTRY["officer.monthly-summary"],
  ],
  cooperative: [
    REPORT_REGISTRY["cooperative.performance"],
    REPORT_REGISTRY["cooperative.farmer-comparison"],
    REPORT_REGISTRY["cooperative.resource-distribution"],
    REPORT_REGISTRY["cooperative.recommendation"],
    REPORT_REGISTRY["cooperative.production"],
  ],
  admin: [
    REPORT_REGISTRY["admin.system-usage"],
    REPORT_REGISTRY["admin.financial"],
    REPORT_REGISTRY["admin.data-validation"],
    REPORT_REGISTRY["admin.analytics-dashboard"],
    REPORT_REGISTRY["admin.user-activity"],
  ],
  super_admin: [
    REPORT_REGISTRY["super_admin.audit"],
    REPORT_REGISTRY["super_admin.system-health"],
    REPORT_REGISTRY["super_admin.backup"],
    REPORT_REGISTRY["super_admin.security"],
    REPORT_REGISTRY["super_admin.national"],
  ],
};

export const ROLE_SEGMENT: Record<ReportRole, string> = {
  farmer: "farmer",
  officer: "officer",
  cooperative: "cooperative",
  admin: "admin",
  super_admin: "super-admin",
};

export const HUB_TITLE_KEY: Record<ReportRole, string> = {
  farmer: "reports_v2.hub.farmer.title",
  officer: "reports_v2.hub.officer.title",
  cooperative: "reports_v2.hub.coop.title",
  admin: "reports_v2.hub.admin.title",
  super_admin: "reports_v2.hub.super.title",
};

export const HUB_SUBTITLE_KEY: Record<ReportRole, string> = {
  farmer: "reports_v2.hub.farmer.subtitle",
  officer: "reports_v2.hub.officer.subtitle",
  cooperative: "reports_v2.hub.coop.subtitle",
  admin: "reports_v2.hub.admin.subtitle",
  super_admin: "reports_v2.hub.super.subtitle",
};
