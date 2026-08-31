import { prisma } from "../prisma.js";
import {
  ReportDefinition,
  ReportFilters,
  TrendPoint,
  TableSection,
  ChartSection,
  dateRangeFilter,
  periodLabel,
  reportHash,
  buildContext,
  asNumber,
  percent,
  average,
  standardDeviation,
  computeRiskScore,
  computeActionPriorityLevel,
  extractAlerts,
  completeReport,
} from "./index.js";
import { Prisma } from "@prisma/client";

export interface OfficerReportSpec {
  type: string;
  title: string;
  subtitle?: string;
}

export const OFFICER_REPORT_SPECS: OfficerReportSpec[] = [
  {
    type: "assigned-farmers",
    title: "Assigned Farmers Monitoring Report",
    subtitle: "Status and health of all assigned farmers",
  },
  {
    type: "advisory",
    title: "Advisory and Recommendation Report",
    subtitle: "Advisory impact and recommendation delivery",
  },
  {
    type: "risk",
    title: "Farm Risk Assessment Report",
    subtitle: "Risk distribution across the assigned portfolio",
  },
  {
    type: "performance-comparison",
    title: "Farmer Performance Comparison Report",
    subtitle: "Side-by-side scoring of assigned farmers",
  },
  {
    type: "monthly-summary",
    title: "Monthly Monitoring Summary",
    subtitle: "Month-over-month operational summary",
  },
];

export class OfficerReportsService {
  async buildReport(
    officerId: string,
    spec: OfficerReportSpec,
    filters: ReportFilters,
    generatedBy?: string,
  ): Promise<ReportDefinition> {
    const officer = await prisma.user.findUnique({
      where: { id: officerId },
      include: { officerProfile: true },
    });
    if (!officer) throw new Error("Officer not found");

    const officerName = officer.fullName ?? "Officer";
    const assignedIds = await this.getAssignedFarmerIds(officerId);

    let definition: ReportDefinition;
    switch (spec.type) {
      case "assigned-farmers":
        definition = await this.buildAssignedFarmers(
          officerId,
          officerName,
          filters,
          spec,
          generatedBy,
        );
        break;
      case "advisory":
        definition = await this.buildAdvisory(
          officerId,
          officerName,
          assignedIds,
          filters,
          spec,
          generatedBy,
        );
        break;
      case "risk":
        definition = await this.buildRisk(
          officerId,
          officerName,
          filters,
          spec,
          generatedBy,
        );
        break;
      case "performance-comparison":
        definition = await this.buildPerformanceComparison(
          officerId,
          officerName,
          filters,
          spec,
          generatedBy,
        );
        break;
      case "monthly-summary":
        definition = await this.buildMonthlySummary(
          officerId,
          officerName,
          assignedIds,
          filters,
          spec,
          generatedBy,
        );
        break;
      default:
        throw new Error(`Unknown officer report type: ${spec.type}`);
    }
    definition.insights ??= [definition.executiveSummary];
    definition.alerts ??= extractAlerts(definition.risks);
    definition.comparisons ??= [];
    definition.riskScore ??= computeRiskScore(definition.risks);
    definition.actionPriorityLevel ??= computeActionPriorityLevel(
      definition.risks,
      definition.recommendations,
    );
    definition.metadata.hash = reportHash(definition);
    return definition;
  }

  private async getAssignedFarmerIds(officerId: string): Promise<string[]> {
    const assignments = await prisma.extensionOfficerAssignment.findMany({
      where: { extensionOfficerId: officerId },
      select: { farmerId: true },
    });
    if (assignments.length === 0) return [];
    const users = await prisma.user.findMany({
      where: { id: { in: assignments.map((a) => a.farmerId) } },
      select: { id: true, farmerProfile: { select: { id: true } } },
    });
    return users
      .map((u) => u.farmerProfile?.id)
      .filter((id): id is string => Boolean(id));
  }

  private async loadAssignedFarmers(
    officerId: string,
    filters: ReportFilters,
    extraWhere: Prisma.FarmerProfileWhereInput = {},
  ) {
    const farmerIds = await this.getAssignedFarmerIds(officerId);
    if (farmerIds.length === 0) return [];
    const where: Prisma.FarmerProfileWhereInput = {
      id: { in: farmerIds },
      ...(filters.district ? { district: filters.district } : {}),
      ...(filters.cooperativeId
        ? { cooperativeId: filters.cooperativeId }
        : {}),
      ...extraWhere,
    };
    return prisma.farmerProfile.findMany({
      where,
      include: {
        cooperative: true,
        soilReadings: {
          where: { readingAt: dateRangeFilter(filters) },
          orderBy: { readingAt: "desc" },
          take: 30,
        },
        irrigationLogs: {
          where: { executedAt: dateRangeFilter(filters) },
          orderBy: { executedAt: "desc" },
          take: 30,
        },
        irrigationSchedules: { where: { isActive: true } },
        alerts: {
          where: { createdAt: dateRangeFilter(filters) },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        farmerCrops: { include: { crop: true } },
      },
    });
  }

  private scoreFarmer(farmer: any): number {
    const moisture = average(
      farmer.soilReadings.map((r: any) => asNumber(r.moisturePercent)),
    );
    const executed = farmer.irrigationLogs.length;
    const expected = farmer.irrigationSchedules.length * 4 || 1;
    const compliance = percent(executed, expected, 0);
    const cropProgress = farmer.farmerCrops.length > 0 ? 90 : 0;
    return Math.round(moisture * 0.4 + compliance * 0.4 + cropProgress * 0.2);
  }

  private async buildAssignedFarmers(
    officerId: string,
    officerName: string,
    filters: ReportFilters,
    spec: OfficerReportSpec,
    generatedBy?: string,
  ): Promise<ReportDefinition> {
    const farmers = await this.loadAssignedFarmers(officerId, filters);

    const farmersByStatus = {
      active: farmers.length,
      withAlerts: farmers.filter((f) => f.alerts.length > 0).length,
      critical: farmers.filter((f) =>
        f.alerts.some((a: any) => a.severity === "critical"),
      ).length,
      irrigationIssues: farmers.filter((f) => {
        const executed = f.irrigationLogs.length;
        const expected = f.irrigationSchedules.length * 4 || 1;
        return percent(executed, expected) < 70;
      }).length,
    };

    const moistureTrend: TrendPoint[] = farmers
      .map((f) => ({
        label: (f.fullName ?? "Farmer").split(" ")[0],
        value: average(
          f.soilReadings.map((r: any) => asNumber(r.moisturePercent)),
        ),
      }))
      .filter((p) => p.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 12);

    const complianceTrend: TrendPoint[] = farmers
      .map((f) => {
        const executed = f.irrigationLogs.length;
        const expected = f.irrigationSchedules.length * 4 || 1;
        return {
          label: (f.fullName ?? "Farmer").split(" ")[0],
          value: Math.round(percent(executed, expected, 0)),
        };
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 12);

    const table: TableSection = {
      heading: "Assigned Farmers Detail",
      icon: "👨‍🌾",
      columns: [
        { key: "name", label: "Farmer" },
        { key: "district", label: "District" },
        { key: "cooperative", label: "Cooperative" },
        { key: "score", label: "Score", align: "right" },
        { key: "moisture", label: "Moisture %", align: "right" },
        { key: "compliance", label: "Compliance %", align: "right" },
        { key: "alerts", label: "Alerts", align: "right" },
      ],
      rows: farmers.map((f) => {
        const score = this.scoreFarmer(f);
        const moisture = average(
          f.soilReadings.map((r: any) => asNumber(r.moisturePercent)),
        );
        const executed = f.irrigationLogs.length;
        const expected = f.irrigationSchedules.length * 4 || 1;
        const compliance = Math.round(percent(executed, expected, 0));
        return {
          name: f.fullName,
          district: f.district,
          cooperative: f.cooperative?.name ?? "Independent",
          score: score.toString(),
          moisture: moisture.toFixed(1),
          compliance: compliance.toString(),
          alerts: f.alerts.length.toString(),
        };
      }),
    };

    return completeReport({
      context: buildContext({
        reportType: `OFFICER-${spec.type.toUpperCase()}`,
        title: spec.title,
        subtitle: officerName,
        roleScope: "officer",
        filters,
        targetId: officerId,
        targetName: officerName,
        generatedBy,
        signatoryRole: "Extension Officer",
      }),
      executiveSummary: `Officer ${officerName} is assigned to ${farmers.length} farmer(s). ${farmersByStatus.critical} have at least one critical alert, ${farmersByStatus.irrigationIssues} are below 70% irrigation compliance. Average soil moisture across the portfolio is ${average(farmers.map((f) => average(f.soilReadings.map((r: any) => asNumber(r.moisturePercent))))).toFixed(1)}%.`,
      kpis: [
        {
          id: "assigned",
          label: "Assigned Farmers",
          value: farmers.length,
          icon: "👥",
        },
        {
          id: "alerts",
          label: "Farmers w/ Alerts",
          value: farmersByStatus.withAlerts,
          icon: "🔔",
        },
        {
          id: "critical",
          label: "Critical Cases",
          value: farmersByStatus.critical,
          icon: "🚨",
        },
        {
          id: "irrigation",
          label: "Irrigation Issues",
          value: farmersByStatus.irrigationIssues,
          icon: "💧",
        },
      ],
      charts: [
        {
          heading: "Top Farmers by Soil Moisture",
          icon: "💧",
          type: "bar",
          data: moistureTrend,
          xKey: "label",
          yKey: "value",
          unit: "%",
        },
        {
          heading: "Top Farmers by Irrigation Compliance",
          icon: "🚿",
          type: "bar",
          data: complianceTrend,
          xKey: "label",
          yKey: "value",
          unit: "%",
        },
      ],
      tables: [table],
      recommendations: [
        {
          priority: farmersByStatus.critical > 0 ? "urgent" : "medium",
          category: "Monitoring",
          title: `Follow up on ${farmersByStatus.critical} critical case(s)`,
          rationale:
            "Critical alerts indicate immediate intervention is required.",
          action:
            "Schedule field visits within 48 hours and document outcomes.",
          confidence: "high",
        },
        {
          priority: "medium",
          category: "Irrigation",
          title: `Address ${farmersByStatus.irrigationIssues} underperforming irrigation system(s)`,
          rationale:
            "Irrigation compliance below 70% correlates with lower yield outcomes.",
          action:
            "Verify pump availability, schedule integrity, and sensor calibration.",
          confidence: "high",
        },
      ],
      risks: [],
      metadata: {
        dataPoints: farmers.length,
        periodLabel: periodLabel(filters),
        generatedBy,
        hash: "",
        version: "2.0.0",
      },
    });
  }

  private async buildAdvisory(
    officerId: string,
    officerName: string,
    assignedIds: string[],
    filters: ReportFilters,
    spec: OfficerReportSpec,
    generatedBy?: string,
  ): Promise<ReportDefinition> {
    const recommendations = await prisma.recommendation.findMany({
      where: {
        farmerId: { in: assignedIds },
        generatedAt: dateRangeFilter(filters),
      },
      include: { farmer: { select: { fullName: true, district: true } } },
      orderBy: { generatedAt: "desc" },
      take: 200,
    });

    const byType: Record<string, number> = {};
    const byPriority: Record<string, number> = {
      urgent: 0,
      high: 0,
      medium: 0,
      low: 0,
    };
    let readCount = 0;
    for (const r of recommendations) {
      byType[r.type] = (byType[r.type] ?? 0) + 1;
      const key =
        r.priority >= 4
          ? "urgent"
          : r.priority >= 3
            ? "high"
            : r.priority >= 2
              ? "medium"
              : "low";
      byPriority[key]++;
      if (r.isRead) readCount++;
    }
    const readRate = percent(readCount, recommendations.length, 0);

    const advisoryTrend: TrendPoint[] = buildMonthlyBuckets(
      recommendations,
      (r) => r.generatedAt,
      () => 1,
    ).map((b) => ({ label: b.label, value: b.count }));

    const advisoryTypeChart: ChartSection = {
      heading: "Advisories by Type",
      icon: "📋",
      type: "bar",
      data: Object.entries(byType).map(([label, value]) => ({ label, value })),
      xKey: "label",
      yKey: "value",
    };

    return completeReport({
      context: buildContext({
        reportType: `OFFICER-${spec.type.toUpperCase()}`,
        title: spec.title,
        subtitle: officerName,
        roleScope: "officer",
        filters,
        targetId: officerId,
        targetName: officerName,
        generatedBy,
        signatoryRole: "Extension Officer",
      }),
      executiveSummary: `Officer ${officerName} generated ${recommendations.length} advisories in the period, with a ${readRate.toFixed(0)}% read-rate. ${byPriority.urgent} are urgent, ${byPriority.high} high-priority. Most common type: ${Object.entries(byType).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "n/a"}.`,
      kpis: [
        {
          id: "total",
          label: "Total Advisories",
          value: recommendations.length,
          icon: "💬",
        },
        { id: "urgent", label: "Urgent", value: byPriority.urgent, icon: "🚨" },
        {
          id: "high",
          label: "High Priority",
          value: byPriority.high,
          icon: "⚠",
        },
        {
          id: "read",
          label: "Read Rate",
          value: `${readRate.toFixed(0)}%`,
          icon: "👁",
        },
      ],
      charts: [
        advisoryTypeChart,
        {
          heading: "Monthly Advisory Volume",
          icon: "📅",
          type: "line",
          data: advisoryTrend,
          xKey: "label",
          yKey: "value",
        },
      ],
      tables: [
        {
          heading: "Recent Advisories",
          icon: "📜",
          columns: [
            { key: "date", label: "Date" },
            { key: "farmer", label: "Farmer" },
            { key: "type", label: "Type" },
            { key: "title", label: "Title" },
            { key: "priority", label: "Priority" },
            { key: "read", label: "Read" },
          ],
          rows: recommendations.slice(0, 25).map((r) => ({
            date: r.generatedAt.toISOString().slice(0, 10),
            farmer: r.farmer?.fullName ?? "—",
            type: r.type,
            title: r.title,
            priority: String(r.priority),
            read: r.isRead ? "Yes" : "No",
          })),
        },
      ],
      recommendations: [
        {
          priority: "medium",
          category: "Engagement",
          title: "Improve advisory read rate",
          rationale: `Only ${readRate.toFixed(0)}% of advisories were read by farmers.`,
          action:
            "Send follow-up SMS reminders for unread advisories after 48 hours.",
          confidence: "high",
        },
      ],
      risks: [],
      metadata: {
        dataPoints: recommendations.length,
        periodLabel: periodLabel(filters),
        generatedBy,
        hash: "",
        version: "2.0.0",
      },
    });
  }

  private async buildRisk(
    officerId: string,
    officerName: string,
    filters: ReportFilters,
    spec: OfficerReportSpec,
    generatedBy?: string,
  ): Promise<ReportDefinition> {
    const farmers = await this.loadAssignedFarmers(officerId, filters);
    const farmersByRisk: {
      low: any[];
      moderate: any[];
      high: any[];
      critical: any[];
    } = {
      low: [],
      moderate: [],
      high: [],
      critical: [],
    };
    for (const f of farmers) {
      const score = this.scoreFarmer(f);
      if (score < 30) farmersByRisk.critical.push(f);
      else if (score < 60) farmersByRisk.high.push(f);
      else if (score < 80) farmersByRisk.moderate.push(f);
      else farmersByRisk.low.push(f);
    }

    const risks: TableSection = {
      heading: "Risk Distribution",
      icon: "🛡",
      columns: [
        { key: "level", label: "Level" },
        { key: "count", label: "Farmers", align: "right" },
        { key: "share", label: "Share", align: "right" },
        { key: "examples", label: "Examples" },
      ],
      rows: (
        Object.entries(farmersByRisk) as [keyof typeof farmersByRisk, any[]][]
      ).map(([level, list]) => ({
        level: level.toUpperCase(),
        count: list.length.toString(),
        share: `${percent(list.length, farmers.length, 0).toFixed(0)}%`,
        examples:
          list
            .slice(0, 3)
            .map((f) => f.fullName)
            .join(", ") || "—",
      })),
    };

    const riskChart: ChartSection = {
      heading: "Risk by Level",
      icon: "🚦",
      type: "bar",
      data: (
        Object.entries(farmersByRisk) as [keyof typeof farmersByRisk, any[]][]
      ).map(([label, list]) => ({
        label,
        value: list.length,
      })),
      xKey: "label",
      yKey: "value",
    };

    return completeReport({
      context: buildContext({
        reportType: `OFFICER-${spec.type.toUpperCase()}`,
        title: spec.title,
        subtitle: officerName,
        roleScope: "officer",
        filters,
        targetId: officerId,
        targetName: officerName,
        generatedBy,
        signatoryRole: "Extension Officer",
      }),
      executiveSummary: `Risk distribution across ${farmers.length} assigned farmers: ${farmersByRisk.critical.length} critical, ${farmersByRisk.high.length} high, ${farmersByRisk.moderate.length} moderate, ${farmersByRisk.low.length} low. ${farmersByRisk.critical.length + farmersByRisk.high.length} farmers require priority intervention.`,
      kpis: [
        {
          id: "critical",
          label: "Critical",
          value: farmersByRisk.critical.length,
          icon: "🚨",
        },
        {
          id: "high",
          label: "High",
          value: farmersByRisk.high.length,
          icon: "⚠",
        },
        {
          id: "moderate",
          label: "Moderate",
          value: farmersByRisk.moderate.length,
          icon: "🟡",
        },
        {
          id: "low",
          label: "Low",
          value: farmersByRisk.low.length,
          icon: "🟢",
        },
      ],
      charts: [riskChart],
      tables: [risks],
      recommendations: [
        {
          priority: farmersByRisk.critical.length > 0 ? "urgent" : "high",
          category: "Risk",
          title: `Escalate ${farmersByRisk.critical.length} critical case(s) to admin`,
          rationale: "Critical-risk farmers exceed acceptable thresholds.",
          action: "Open ticket per farmer, set 7-day follow-up cadence.",
          confidence: "high",
        },
      ],
      risks: [
        {
          level: "high",
          category: "Portfolio",
          message: `${farmersByRisk.critical.length + farmersByRisk.high.length} of ${farmers.length} farmers in critical or high risk.`,
          affected: farmersByRisk.critical.length + farmersByRisk.high.length,
          recommendation:
            "Prioritize field visits and create intervention plans.",
        },
      ],
      metadata: {
        dataPoints: farmers.length,
        periodLabel: periodLabel(filters),
        generatedBy,
        hash: "",
        version: "2.0.0",
      },
    });
  }

  private async buildPerformanceComparison(
    officerId: string,
    officerName: string,
    filters: ReportFilters,
    spec: OfficerReportSpec,
    generatedBy?: string,
  ): Promise<ReportDefinition> {
    const farmers = await this.loadAssignedFarmers(officerId, filters);
    const ranked = farmers
      .map((f) => {
        const score = this.scoreFarmer(f);
        const moisture = average(
          f.soilReadings.map((r: any) => asNumber(r.moisturePercent)),
        );
        const executed = f.irrigationLogs.length;
        const expected = f.irrigationSchedules.length * 4 || 1;
        const compliance = Math.round(percent(executed, expected, 0));
        return { farmer: f, score, moisture, compliance };
      })
      .sort((a, b) => b.score - a.score);

    const scores = ranked.map((r) => r.score);
    const avgScore = average(scores);
    const top = ranked[0];
    const bottom = ranked[ranked.length - 1];

    const comparisonTable: TableSection = {
      heading: "Performance Ranking",
      icon: "🏅",
      columns: [
        { key: "rank", label: "#", align: "right" },
        { key: "name", label: "Farmer" },
        { key: "score", label: "Score", align: "right" },
        { key: "moisture", label: "Moisture %", align: "right" },
        { key: "compliance", label: "Compliance %", align: "right" },
        { key: "crops", label: "Crops", align: "right" },
        { key: "alerts", label: "Alerts", align: "right" },
      ],
      rows: ranked.map((r, i) => ({
        rank: (i + 1).toString(),
        name: r.farmer.fullName,
        score: r.score.toString(),
        moisture: r.moisture.toFixed(1),
        compliance: r.compliance.toString(),
        crops: r.farmer.farmerCrops.length.toString(),
        alerts: r.farmer.alerts.length.toString(),
      })),
    };

    const comparisonChart: ChartSection = {
      heading: "Top vs Bottom Performers",
      icon: "📊",
      type: "bar",
      data: ranked.slice(0, 10).map((r) => ({
        label: (r.farmer.fullName ?? "Farmer").split(" ")[0],
        value: r.score,
        secondary: r.moisture,
      })),
      xKey: "label",
      yKey: "value",
      yLabel: "Score",
    };

    return completeReport({
      context: buildContext({
        reportType: `OFFICER-${spec.type.toUpperCase()}`,
        title: spec.title,
        subtitle: officerName,
        roleScope: "officer",
        filters,
        targetId: officerId,
        targetName: officerName,
        generatedBy,
        signatoryRole: "Extension Officer",
      }),
      executiveSummary: `Performance comparison across ${ranked.length} farmers. Average score ${avgScore.toFixed(1)}. Top performer: ${top?.farmer.fullName ?? "n/a"} (${top?.score ?? 0}). Bottom: ${bottom?.farmer.fullName ?? "n/a"} (${bottom?.score ?? 0}). Standard deviation ${standardDeviation(scores).toFixed(1)} indicates ${standardDeviation(scores) > 20 ? "high" : "low"} variance.`,
      kpis: [
        {
          id: "avg",
          label: "Avg. Score",
          value: avgScore.toFixed(1),
          icon: "📊",
        },
        { id: "top", label: "Top Score", value: top?.score ?? 0, icon: "🏆" },
        {
          id: "bottom",
          label: "Bottom Score",
          value: bottom?.score ?? 0,
          icon: "⚠",
        },
        {
          id: "count",
          label: "Farmers Compared",
          value: ranked.length,
          icon: "👥",
        },
      ],
      charts: [comparisonChart],
      tables: [comparisonTable],
      recommendations: [
        {
          priority: "high",
          category: "Performance",
          title: "Pair top and bottom performers for peer learning",
          rationale: "Knowledge transfer accelerates improvement.",
          action: "Organize farm-visit exchange within the next 14 days.",
          confidence: "high",
        },
      ],
      risks: [],
      metadata: {
        dataPoints: ranked.length,
        periodLabel: periodLabel(filters),
        generatedBy,
        hash: "",
        version: "2.0.0",
      },
    });
  }

  private async buildMonthlySummary(
    officerId: string,
    officerName: string,
    assignedIds: string[],
    filters: ReportFilters,
    spec: OfficerReportSpec,
    generatedBy?: string,
  ): Promise<ReportDefinition> {
    const start =
      filters.startDate ??
      new Date(new Date().setMonth(new Date().getMonth() - 1));
    const end = filters.endDate ?? new Date();
    const months = buildMonthRange(start, end);

    const advisories = await prisma.recommendation.findMany({
      where: {
        farmerId: { in: assignedIds },
        generatedAt: dateRangeFilter(filters),
      },
      select: { generatedAt: true, type: true, priority: true },
    });
    const alerts = await prisma.alert.findMany({
      where: {
        farmerId: { in: assignedIds },
        createdAt: dateRangeFilter(filters),
      },
      select: { createdAt: true, severity: true },
    });
    const activities = await prisma.farmActivity.findMany({
      where: {
        farmerId: { in: assignedIds },
        activityDate: dateRangeFilter(filters),
      },
      select: { activityDate: true, activityType: true },
    });

    const advisoryByMonth = bucketByMonth(advisories, (a) => a.generatedAt);
    const alertsByMonth = bucketByMonth(alerts, (a) => a.createdAt);
    const activitiesByMonth = bucketByMonth(activities, (a) => a.activityDate);

    const charts: ChartSection[] = months.map((m) => ({
      heading: `Activity in ${m}`,
      icon: "📅",
      type: "bar",
      data: [
        { label: "Advisories", value: advisoryByMonth.get(m) ?? 0 },
        { label: "Alerts", value: alertsByMonth.get(m) ?? 0 },
        { label: "Activities", value: activitiesByMonth.get(m) ?? 0 },
      ],
      xKey: "label",
      yKey: "value",
    }));

    return completeReport({
      context: buildContext({
        reportType: `OFFICER-${spec.type.toUpperCase()}`,
        title: spec.title,
        subtitle: `${officerName} · ${months[0]} → ${months[months.length - 1]}`,
        roleScope: "officer",
        filters,
        targetId: officerId,
        targetName: officerName,
        generatedBy,
        signatoryRole: "Extension Officer",
      }),
      executiveSummary: `Monthly summary for ${officerName}: ${advisories.length} advisories, ${alerts.length} alerts, ${activities.length} farm activities across ${months.length} month(s).`,
      kpis: [
        {
          id: "advisories",
          label: "Advisories",
          value: advisories.length,
          icon: "💬",
        },
        { id: "alerts", label: "Alerts", value: alerts.length, icon: "🔔" },
        {
          id: "activities",
          label: "Activities",
          value: activities.length,
          icon: "📋",
        },
        {
          id: "months",
          label: "Months Covered",
          value: months.length,
          icon: "📆",
        },
      ],
      charts,
      tables: [
        {
          heading: "Monthly Breakdown",
          icon: "📅",
          columns: [
            { key: "month", label: "Month" },
            { key: "advisories", label: "Advisories", align: "right" },
            { key: "alerts", label: "Alerts", align: "right" },
            { key: "activities", label: "Activities", align: "right" },
          ],
          rows: months.map((m) => ({
            month: m,
            advisories: String(advisoryByMonth.get(m) ?? 0),
            alerts: String(alertsByMonth.get(m) ?? 0),
            activities: String(activitiesByMonth.get(m) ?? 0),
          })),
        },
      ],
      recommendations: [],
      risks: [],
      metadata: {
        dataPoints: advisories.length + alerts.length + activities.length,
        periodLabel: periodLabel(filters),
        generatedBy,
        hash: "",
        version: "2.0.0",
      },
    });
  }
}

function buildMonthlyBuckets<T>(
  items: T[],
  getDate: (item: T) => Date,
  getValue: (item: T) => number,
) {
  const map = new Map<string, number>();
  for (const item of items) {
    const key = getDate(item).toISOString().slice(0, 7);
    map.set(key, (map.get(key) ?? 0) + getValue(item));
  }
  return Array.from(map.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, count]) => ({
      label: new Date(`${key}-01`).toLocaleDateString("en-US", {
        month: "short",
      }),
      count,
    }));
}

function bucketByMonth<T>(
  items: T[],
  getDate: (item: T) => Date,
): Map<string, number> {
  const map = new Map<string, number>();
  for (const item of items) {
    const key = getDate(item).toISOString().slice(0, 7);
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return map;
}

function buildMonthRange(start: Date, end: Date): string[] {
  const months: string[] = [];
  const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
  const last = new Date(end.getFullYear(), end.getMonth(), 1);
  while (cursor <= last) {
    months.push(cursor.toISOString().slice(0, 7));
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return months;
}

export const officerReportsService = new OfficerReportsService();
