import { prisma } from "../prisma.js";
import {
  ReportDefinition,
  ReportFilters,
  TableSection,
  ChartSection,
  dateRangeFilter,
  buildSpatialFilter,
  periodLabel,
  reportHash,
  buildContext,
  asNumber,
  average,
  percent,
  computeRiskScore,
  computeActionPriorityLevel,
  extractAlerts,
  completeReport,
} from "./index.js";

export interface CooperativeReportSpec {
  type: string;
  title: string;
  subtitle?: string;
}

export const COOPERATIVE_REPORT_SPECS: CooperativeReportSpec[] = [
  {
    type: "performance",
    title: "Cooperative Performance Report",
    subtitle: "Member-level performance and engagement",
  },
  {
    type: "farmer-comparison",
    title: "Farmer Comparison Report",
    subtitle: "Side-by-side member comparison",
  },
  {
    type: "resource-distribution",
    title: "Resource Distribution Report",
    subtitle: "Resource allocation and utilization",
  },
  {
    type: "recommendation",
    title: "Cooperative Recommendation Report",
    subtitle: "AI recommendations for the cooperative",
  },
  {
    type: "production",
    title: "Production and Yield Summary",
    subtitle: "Aggregate production and yield",
  },
];

export class CooperativeReportsService {
  async buildReport(
    userId: string,
    spec: CooperativeReportSpec,
    filters: ReportFilters,
    generatedBy?: string,
  ): Promise<ReportDefinition> {
    const coopId =
      filters.cooperativeId ??
      (await prisma.cooperativeMember.findFirst({ where: { userId } }))
        ?.cooperativeId;
    if (!coopId) throw new Error("Cooperative not found for the current user");
    const coop = await prisma.cooperative.findUnique({ where: { id: coopId } });
    if (!coop) throw new Error("Cooperative not found");
    const coopName = coop.name;

    // Set the cooperative id into the filters so it acts correctly as a bound spatial filter
    filters.cooperativeId = coopId;

    let definition: ReportDefinition;
    switch (spec.type) {
      case "performance":
        definition = await this.buildPerformance(
          coopId,
          coopName,
          filters,
          spec,
          generatedBy,
        );
        break;
      case "farmer-comparison":
        definition = await this.buildFarmerComparison(
          coopId,
          coopName,
          filters,
          spec,
          generatedBy,
        );
        break;
      case "resource-distribution":
        definition = await this.buildResourceDistribution(
          coopId,
          coopName,
          filters,
          spec,
          generatedBy,
        );
        break;
      case "recommendation":
        definition = await this.buildRecommendation(
          coopId,
          coopName,
          filters,
          spec,
          generatedBy,
        );
        break;
      case "production":
        definition = await this.buildProduction(
          coopId,
          coopName,
          filters,
          spec,
          generatedBy,
        );
        break;
      default:
        throw new Error(`Unknown cooperative report type: ${spec.type}`);
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

  private async loadMemberData(coopId: string, filters: ReportFilters) {
    const spatialFilter = buildSpatialFilter(filters);

    return prisma.farmerProfile.findMany({
      where: { ...spatialFilter, cooperativeId: coopId },
      include: {
        user: true,
        soilReadings: {
          where: { readingAt: dateRangeFilter(filters) },
          orderBy: { readingAt: "desc" },
          take: 20,
        },
        irrigationLogs: { where: { executedAt: dateRangeFilter(filters) } },
        irrigationSchedules: { where: { isActive: true } },
        farmerCrops: { include: { crop: true } },
        farmActivities: { where: { activityDate: dateRangeFilter(filters) } },
        alerts: { where: { createdAt: dateRangeFilter(filters) } },
      },
    });
  }

  private scoreMember(f: any): number {
    const moisture = average(
      f.soilReadings.map((r: any) => asNumber(r.moisturePercent)),
    );
    const executed = f.irrigationLogs.length;
    const expected = f.irrigationSchedules.length * 4 || 1;
    const compliance = percent(executed, expected, 0);
    const cropProgress = f.farmerCrops.length > 0 ? 90 : 0;
    return Math.round(moisture * 0.4 + compliance * 0.4 + cropProgress * 0.2);
  }

  private async buildPerformance(
    coopId: string,
    coopName: string,
    filters: ReportFilters,
    spec: CooperativeReportSpec,
    generatedBy?: string,
  ): Promise<ReportDefinition> {
    const members = await this.loadMemberData(coopId, filters);
    const scores = members.map((m) => this.scoreMember(m));
    const avgScore = average(scores);
    const active = members.filter(
      (m) => m.farmActivities.length > 0 || m.soilReadings.length > 0,
    ).length;
    const critical = members.filter((m) =>
      m.alerts.some((a: any) => a.severity === "critical"),
    ).length;

    const scoreDist: ChartSection = {
      heading: "Member Score Distribution",
      icon: "📊",
      type: "bar",
      data: [
        { label: "0-39", value: scores.filter((s) => s < 40).length },
        {
          label: "40-59",
          value: scores.filter((s) => s >= 40 && s < 60).length,
        },
        {
          label: "60-79",
          value: scores.filter((s) => s >= 60 && s < 80).length,
        },
        { label: "80-100", value: scores.filter((s) => s >= 80).length },
      ],
      xKey: "label",
      yKey: "value",
    };

    const topMembersTable: TableSection = {
      heading: "Top 10 Members",
      icon: "🏅",
      columns: [
        { key: "name", label: "Farmer" },
        { key: "score", label: "Score", align: "right" },
        { key: "moisture", label: "Avg. Moisture %", align: "right" },
        { key: "compliance", label: "Compliance %", align: "right" },
        { key: "crops", label: "Crops", align: "right" },
      ],
      rows: members
        .map((m) => ({
          member: m,
          score: this.scoreMember(m),
          moisture: average(
            m.soilReadings.map((r: any) => asNumber(r.moisturePercent)),
          ),
          compliance: Math.round(
            percent(
              m.irrigationLogs.length,
              m.irrigationSchedules.length * 4 || 1,
              0,
            ),
          ),
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)
        .map((r) => ({
          name: r.member.fullName,
          score: r.score.toString(),
          moisture: r.moisture.toFixed(1),
          compliance: r.compliance.toString(),
          crops: r.member.farmerCrops.length.toString(),
        })),
    };

    return completeReport({
      context: buildContext({
        reportType: `COOP-${spec.type.toUpperCase()}`,
        title: spec.title,
        subtitle: coopName,
        roleScope: "cooperative",
        filters,
        targetId: coopId,
        targetName: coopName,
        generatedBy,
        organizationName: coopName,
        signatoryRole: "Cooperative Manager",
      }),
      executiveSummary: `Cooperative ${coopName} has ${members.length} member(s), with ${active} active in the period. Average score ${avgScore.toFixed(1)}; ${critical} members carry critical alerts. ${members.filter((m) => m.farmerCrops.length > 0).length} member(s) are actively cultivating.`,
      kpis: [
        { id: "members", label: "Members", value: members.length, icon: "👥" },
        { id: "active", label: "Active", value: active, icon: "✅" },
        {
          id: "avg",
          label: "Avg. Score",
          value: avgScore.toFixed(1),
          icon: "📊",
        },
        {
          id: "critical",
          label: "Critical Cases",
          value: critical,
          icon: "🚨",
        },
      ],
      charts: [scoreDist],
      tables: [topMembersTable],
      recommendations: [
        {
          priority: critical > 0 ? "urgent" : "medium",
          category: "Performance",
          title: "Address critical cases",
          rationale: `${critical} members have unresolved critical alerts.`,
          action: "Coordinate with extension officers for field visits.",
          confidence: "high",
        },
        {
          priority: "medium",
          category: "Engagement",
          title: "Re-engage inactive members",
          rationale: `${members.length - active} members are inactive in the period.`,
          action: "Run outreach campaign and onboarding reminders.",
          confidence: "high",
        },
      ],
      risks: [
        {
          level: critical > 0 ? "high" : "moderate",
          category: "Membership",
          message: `${critical} critical alert(s) in the cooperative.`,
          affected: critical,
          recommendation: "Activate emergency response protocol.",
        },
      ],
      metadata: {
        dataPoints: members.length,
        periodLabel: periodLabel(filters),
        generatedBy,
        hash: "",
        version: "2.0.0",
      },
    });
  }

  private async buildFarmerComparison(
    coopId: string,
    coopName: string,
    filters: ReportFilters,
    spec: CooperativeReportSpec,
    generatedBy?: string,
  ): Promise<ReportDefinition> {
    const members = await this.loadMemberData(coopId, filters);
    const comparisonTable: TableSection = {
      heading: "Member Comparison",
      icon: "🔍",
      columns: [
        { key: "name", label: "Farmer" },
        { key: "district", label: "District" },
        { key: "score", label: "Score", align: "right" },
        { key: "moisture", label: "Moisture %", align: "right" },
        { key: "compliance", label: "Compliance %", align: "right" },
        { key: "alerts", label: "Alerts", align: "right" },
      ],
      rows: members
        .map((m) => ({
          member: m,
          score: this.scoreMember(m),
          moisture: average(
            m.soilReadings.map((r: any) => asNumber(r.moisturePercent)),
          ),
          compliance: Math.round(
            percent(
              m.irrigationLogs.length,
              m.irrigationSchedules.length * 4 || 1,
              0,
            ),
          ),
        }))
        .sort((a, b) => b.score - a.score)
        .map((r) => ({
          name: r.member.fullName,
          district: r.member.district,
          score: r.score.toString(),
          moisture: r.moisture.toFixed(1),
          compliance: r.compliance.toString(),
          alerts: r.member.alerts.length.toString(),
        })),
    };

    return completeReport({
      context: buildContext({
        reportType: `COOP-${spec.type.toUpperCase()}`,
        title: spec.title,
        subtitle: coopName,
        roleScope: "cooperative",
        filters,
        targetId: coopId,
        targetName: coopName,
        generatedBy,
        organizationName: coopName,
        signatoryRole: "Cooperative Manager",
      }),
      executiveSummary: `Side-by-side comparison of ${members.length} members in ${coopName}. Use the score column to identify the strongest and weakest performers for targeted intervention.`,
      kpis: [
        {
          id: "members",
          label: "Members Compared",
          value: members.length,
          icon: "👥",
        },
        {
          id: "top",
          label: "Top Score",
          value: Math.max(...members.map((m) => this.scoreMember(m)), 0),
          icon: "🏆",
        },
        {
          id: "low",
          label: "Lowest Score",
          value: Math.min(...members.map((m) => this.scoreMember(m)), 100),
          icon: "⚠",
        },
        {
          id: "avg",
          label: "Avg. Score",
          value: average(members.map((m) => this.scoreMember(m))).toFixed(1),
          icon: "📊",
        },
      ],
      charts: [],
      tables: [comparisonTable],
      recommendations: [],
      risks: [],
      metadata: {
        dataPoints: members.length,
        periodLabel: periodLabel(filters),
        generatedBy,
        hash: "",
        version: "2.0.0",
      },
    });
  }

  private async buildResourceDistribution(
    coopId: string,
    coopName: string,
    filters: ReportFilters,
    spec: CooperativeReportSpec,
    generatedBy?: string,
  ): Promise<ReportDefinition> {
    const resources = await prisma.resource.findMany({
      where: { cooperativeId: coopId },
      include: { distributions: true },
    });
    const utilizationByType: Record<string, { total: number; used: number }> =
      {};
    for (const r of resources) {
      const key = r.resourceType;
      if (!utilizationByType[key])
        utilizationByType[key] = { total: 0, used: 0 };
      utilizationByType[key].total += asNumber(r.quantity);
      utilizationByType[key].used += r.distributions
        .filter((d) => d.status === "distributed")
        .reduce((s, d) => s + asNumber(d.quantity), 0);
    }

    const utilizationTable: TableSection = {
      heading: "Resource Utilization",
      icon: "📦",
      columns: [
        { key: "type", label: "Type" },
        { key: "total", label: "Total Qty", align: "right" },
        { key: "used", label: "Distributed", align: "right" },
        { key: "utilization", label: "Utilization", align: "right" },
      ],
      rows: Object.entries(utilizationByType).map(([type, v]) => ({
        type,
        total: v.total.toString(),
        used: v.used.toString(),
        utilization: `${percent(v.used, v.total, 0).toFixed(0)}%`,
      })),
    };

    const resourcesTable: TableSection = {
      heading: "Resource Inventory",
      icon: "🗂",
      columns: [
        { key: "name", label: "Name" },
        { key: "type", label: "Type" },
        { key: "qty", label: "Quantity", align: "right" },
        { key: "available", label: "Available", align: "right" },
        { key: "condition", label: "Condition" },
      ],
      rows: resources.map((r) => ({
        name: r.name,
        type: r.resourceType,
        qty: r.quantity !== null ? r.quantity.toString() : "—",
        available:
          r.availableQuantity !== null ? r.availableQuantity.toString() : "—",
        condition: r.condition ?? "—",
      })),
    };

    return completeReport({
      context: buildContext({
        reportType: `COOP-${spec.type.toUpperCase()}`,
        title: spec.title,
        subtitle: coopName,
        roleScope: "cooperative",
        filters,
        targetId: coopId,
        targetName: coopName,
        generatedBy,
        organizationName: coopName,
        signatoryRole: "Cooperative Manager",
      }),
      executiveSummary: `${coopName} manages ${resources.length} resource(s) across ${Object.keys(utilizationByType).length} type(s). Overall utilization ${percent(
        Object.values(utilizationByType).reduce((s, v) => s + v.used, 0),
        Object.values(utilizationByType).reduce((s, v) => s + v.total, 0),
        0,
      ).toFixed(0)}%.`,
      kpis: [
        {
          id: "resources",
          label: "Resources",
          value: resources.length,
          icon: "📦",
        },
        {
          id: "types",
          label: "Types",
          value: Object.keys(utilizationByType).length,
          icon: "🗂",
        },
        {
          id: "distributions",
          label: "Active Distributions",
          value: resources.reduce(
            (s, r) =>
              s + r.distributions.filter((d) => d.status === "distributed").length,
            0,
          ),
          icon: "📋",
        },
        {
          id: "utilization",
          label: "Utilization",
          value: `${percent(
            Object.values(utilizationByType).reduce((s, v) => s + v.used, 0),
            Object.values(utilizationByType).reduce((s, v) => s + v.total, 0),
            0,
          ).toFixed(0)}%`,
          icon: "📈",
        },
      ],
      charts: [
        {
          heading: "Utilization by Type",
          icon: "📊",
          type: "bar",
          data: Object.entries(utilizationByType).map(([label, v]) => ({
            label,
            value: v.total === 0 ? 0 : Math.round(percent(v.used, v.total, 0)),
          })),
          xKey: "label",
          yKey: "value",
          unit: "%",
        },
      ],
      tables: [utilizationTable, resourcesTable],
      recommendations: [
        {
          priority: "medium",
          category: "Operations",
          title: "Balance resource allocation",
          rationale:
            "Some resource types may be under-booked while others are saturated.",
          action:
            "Run a quarterly allocation review with the management committee.",
          confidence: "medium",
        },
      ],
      risks: [],
      metadata: {
        dataPoints: resources.length,
        periodLabel: periodLabel(filters),
        generatedBy,
        hash: "",
        version: "2.0.0",
      },
    });
  }

  private async buildRecommendation(
    coopId: string,
    coopName: string,
    filters: ReportFilters,
    spec: CooperativeReportSpec,
    generatedBy?: string,
  ): Promise<ReportDefinition> {
    const spatialFilter = buildSpatialFilter(filters);
    const memberIds = (
      await prisma.farmerProfile.findMany({
        where: { ...spatialFilter, cooperativeId: coopId },
        select: { id: true },
      })
    ).map((m) => m.id);
    const recs = await prisma.recommendation.findMany({
      where: {
        farmerId: { in: memberIds },
        generatedAt: dateRangeFilter(filters),
      },
      include: { farmer: { select: { fullName: true } } },
      orderBy: { generatedAt: "desc" },
      take: 200,
    });
    const byType: Record<string, number> = {};
    for (const r of recs) byType[r.type] = (byType[r.type] ?? 0) + 1;
    const unread = recs.filter((r) => !r.isRead).length;
    const readRate = percent(recs.length - unread, recs.length, 0);

    return completeReport({
      context: buildContext({
        reportType: `COOP-${spec.type.toUpperCase()}`,
        title: spec.title,
        subtitle: coopName,
        roleScope: "cooperative",
        filters,
        targetId: coopId,
        targetName: coopName,
        generatedBy,
        organizationName: coopName,
        signatoryRole: "Cooperative Manager",
      }),
      executiveSummary: `${coopName} produced ${recs.length} recommendations in the period with a ${readRate.toFixed(0)}% read-rate. ${unread} remain unread.`,
      kpis: [
        { id: "total", label: "Total", value: recs.length, icon: "💡" },
        { id: "unread", label: "Unread", value: unread, icon: "📩" },
        {
          id: "read",
          label: "Read Rate",
          value: `${readRate.toFixed(0)}%`,
          icon: "👁",
        },
        {
          id: "types",
          label: "Types",
          value: Object.keys(byType).length,
          icon: "🏷",
        },
      ],
      charts: [
        {
          heading: "By Type",
          icon: "🏷",
          type: "bar",
          data: Object.entries(byType).map(([label, value]) => ({
            label,
            value,
          })),
        },
      ],
      tables: [
        {
          heading: "Recent Recommendations",
          icon: "📜",
          columns: [
            { key: "date", label: "Date" },
            { key: "farmer", label: "Farmer" },
            { key: "type", label: "Type" },
            { key: "title", label: "Title" },
            { key: "priority", label: "Priority" },
          ],
          rows: recs.slice(0, 25).map((r) => ({
            date: r.generatedAt.toISOString().slice(0, 10),
            farmer: r.farmer?.fullName ?? "—",
            type: r.type,
            title: r.title,
            priority: String(r.priority),
          })),
        },
      ],
      recommendations: [
        {
          priority: unread > 0 ? "medium" : "low",
          category: "Engagement",
          title: "Push unread recommendations to farmers",
          rationale: `${unread} recommendations are unread.`,
          action: "Send SMS digest and in-app push for unread items.",
          confidence: "high",
        },
      ],
      risks: [],
      metadata: {
        dataPoints: recs.length,
        periodLabel: periodLabel(filters),
        generatedBy,
        hash: "",
        version: "2.0.0",
      },
    });
  }

  private async buildProduction(
    coopId: string,
    coopName: string,
    filters: ReportFilters,
    spec: CooperativeReportSpec,
    generatedBy?: string,
  ): Promise<ReportDefinition> {
    const spatialFilter = buildSpatialFilter(filters);
    const crops = await prisma.farmerCrop.findMany({
      where: {
        farmer: { ...spatialFilter, cooperativeId: coopId },
        plantedDate: dateRangeFilter(filters),
      },
      include: { crop: true, farmer: { select: { fullName: true } } },
    });
    const totalEst = crops.reduce(
      (s, c) => s + asNumber(c.estimatedYieldKg),
      0,
    );
    const totalAct = crops.reduce((s, c) => s + asNumber(c.actualYieldKg), 0);
    const byCrop: Record<string, { est: number; act: number; count: number }> =
      {};
    for (const c of crops) {
      const key = c.crop.nameEn;
      if (!byCrop[key]) byCrop[key] = { est: 0, act: 0, count: 0 };
      byCrop[key].est += asNumber(c.estimatedYieldKg);
      byCrop[key].act += asNumber(c.actualYieldKg);
      byCrop[key].count += 1;
    }

    return completeReport({
      context: buildContext({
        reportType: `COOP-${spec.type.toUpperCase()}`,
        title: spec.title,
        subtitle: coopName,
        roleScope: "cooperative",
        filters,
        targetId: coopId,
        targetName: coopName,
        generatedBy,
        organizationName: coopName,
        signatoryRole: "Cooperative Manager",
      }),
      executiveSummary: `${coopName} reports ${crops.length} crop record(s) with total estimated yield ${totalEst.toFixed(0)}kg and actual ${totalAct.toFixed(0)}kg. Yield ratio ${totalEst > 0 ? ((totalAct / totalEst) * 100).toFixed(0) : "0"}%.`,
      kpis: [
        { id: "crops", label: "Crop Records", value: crops.length, icon: "🌾" },
        {
          id: "est",
          label: "Estimated (kg)",
          value: totalEst.toFixed(0),
          icon: "📊",
        },
        {
          id: "act",
          label: "Actual (kg)",
          value: totalAct.toFixed(0),
          icon: "📦",
        },
        {
          id: "ratio",
          label: "Yield Ratio",
          value:
            totalEst > 0 ? `${((totalAct / totalEst) * 100).toFixed(0)}%` : "—",
          icon: "🎯",
        },
      ],
      charts: [
        {
          heading: "Production by Crop",
          icon: "🌾",
          type: "bar",
          data: Object.entries(byCrop).map(([label, v]) => ({
            label,
            value: v.act,
            secondary: v.est,
          })),
          xKey: "label",
          yKey: "value",
          unit: "kg",
        },
      ],
      tables: [
        {
          heading: "Production by Crop",
          icon: "🌾",
          columns: [
            { key: "crop", label: "Crop" },
            { key: "count", label: "Records", align: "right" },
            { key: "est", label: "Estimated (kg)", align: "right" },
            { key: "act", label: "Actual (kg)", align: "right" },
          ],
          rows: Object.entries(byCrop).map(([crop, v]) => ({
            crop,
            count: v.count.toString(),
            est: v.est.toFixed(0),
            act: v.act.toFixed(0),
          })),
        },
      ],
      recommendations: [],
      risks: [],
      metadata: {
        dataPoints: crops.length,
        periodLabel: periodLabel(filters),
        generatedBy,
        hash: "",
        version: "2.0.0",
      },
    });
  }
}

export const cooperativeReportsService = new CooperativeReportsService();
