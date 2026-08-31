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
  deriveRecommendations,
  deriveRisks,
  asNumber,
  percent,
  average,
  standardDeviation,
  aggregateByDay,
  computeRiskScore,
  computeActionPriorityLevel,
  extractAlerts,
  completeReport,
} from "./index.js";
import { Prisma } from "@prisma/client";

async function resolveFarmerId(userId: string): Promise<string | null> {
  const profile = await prisma.farmerProfile.findUnique({ where: { userId } });
  return profile?.id ?? null;
}

export interface FarmerReportSpec {
  type: string;
  title: string;
  subtitle?: string;
}

export const FARMER_REPORT_SPECS: FarmerReportSpec[] = [
  {
    type: "performance",
    title: "Farm Performance Report",
    subtitle: "Composite performance score with sub-metrics",
  },
  {
    type: "seasonal",
    title: "Seasonal Report",
    subtitle: "Season-aggregated performance and yield outlook",
  },
  {
    type: "ai-recommendation",
    title: "AI Recommendation Report",
    subtitle: "Personalized agronomic recommendations",
  },
  {
    type: "soil-irrigation",
    title: "Soil and Irrigation Analysis Report",
    subtitle: "Soil health and irrigation efficiency",
  },
  {
    type: "yield-productivity",
    title: "Yield and Productivity Report",
    subtitle: "Production history and yield forecast",
  },
];

export class FarmerReportsService {
  async buildReport(
    userId: string,
    spec: FarmerReportSpec,
    filters: ReportFilters,
    generatedBy?: string,
  ): Promise<ReportDefinition> {
    const farmerId = filters.farmerId ?? (await resolveFarmerId(userId));
    if (!farmerId) {
      throw new Error("Farmer profile not found for the current user");
    }
    const farmer = await prisma.farmerProfile.findUnique({
      where: { id: farmerId },
      include: { user: true, cooperative: true },
    });
    if (!farmer) throw new Error("Farmer not found");

    let definition: ReportDefinition;
    switch (spec.type) {
      case "performance":
        definition = await this.buildPerformance(
          farmer,
          filters,
          spec,
          generatedBy,
        );
        break;
      case "seasonal":
        definition = await this.buildSeasonal(
          farmer,
          filters,
          spec,
          generatedBy,
        );
        break;
      case "ai-recommendation":
        definition = await this.buildAiRecommendation(
          farmer,
          filters,
          spec,
          generatedBy,
        );
        break;
      case "soil-irrigation":
        definition = await this.buildSoilIrrigation(
          farmer,
          filters,
          spec,
          generatedBy,
        );
        break;
      case "yield-productivity":
        definition = await this.buildYieldProductivity(
          farmer,
          filters,
          spec,
          generatedBy,
        );
        break;
      default:
        throw new Error(`Unknown farmer report type: ${spec.type}`);
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

  private async loadPeriodData(farmerId: string, filters: ReportFilters) {
    const where = {
      farmerId,
      readingAt: dateRangeFilter(filters),
    } as Prisma.SoilReadingWhereInput;
    const [
      soil,
      irrigationLogs,
      schedules,
      activities,
      crops,
      weather,
      alerts,
      recommendations,
    ] = await Promise.all([
      prisma.soilReading.findMany({
        where,
        orderBy: { readingAt: "asc" },
        take: 500,
      }),
      prisma.irrigationLog.findMany({
        where: { farmerId, executedAt: dateRangeFilter(filters) },
        orderBy: { executedAt: "asc" },
        take: 500,
      }),
      prisma.irrigationSchedule.findMany({
        where: { farmerId, isActive: true },
      }),
      prisma.farmActivity.findMany({
        where: { farmerId, activityDate: dateRangeFilter(filters) },
        orderBy: { activityDate: "desc" },
        take: 100,
      }),
      prisma.farmerCrop.findMany({
        where: { farmerId },
        include: { crop: true },
        orderBy: { plantedDate: "desc" },
        take: 50,
      }),
      prisma.weatherReading.findMany({
        where: { farmerId, readingAt: dateRangeFilter(filters) },
        orderBy: { readingAt: "asc" },
        take: 200,
      }),
      prisma.alert.findMany({
        where: { farmerId, createdAt: dateRangeFilter(filters) },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.recommendation.findMany({
        where: { farmerId, generatedAt: dateRangeFilter(filters) },
        orderBy: { generatedAt: "desc" },
        take: 50,
      }),
    ]);
    return {
      soil,
      irrigationLogs,
      schedules,
      activities,
      crops,
      weather,
      alerts,
      recommendations,
    };
  }

  private computeMoistureMetrics(soil: { moisturePercent: Prisma.Decimal }[]) {
    const values = soil.map((s) => asNumber(s.moisturePercent));
    if (values.length === 0)
      return { average: 0, variability: 0, trend: "stable" as const, count: 0 };
    const avg = average(values);
    const sd = standardDeviation(values);
    const half = Math.max(1, Math.floor(values.length / 2));
    const early = average(values.slice(0, half));
    const late = average(values.slice(-half));
    const diff = late - early;
    const trend: "rising" | "falling" | "stable" =
      diff > 2 ? "rising" : diff < -2 ? "falling" : "stable";
    return { average: avg, variability: sd, trend, count: values.length };
  }

  private computeIrrigationMetrics(
    logs: { waterUsedLiters: Prisma.Decimal | null; executedAt: Date | null }[],
    schedules: { id: string }[],
  ) {
    const totalLiters = logs.reduce(
      (s, l) => s + asNumber(l.waterUsedLiters),
      0,
    );
    const expectedCycles = schedules.length * 4;
    const executed = logs.length;
    const compliance = percent(executed, Math.max(1, expectedCycles), 0);
    const skipped = Math.max(0, expectedCycles - executed);
    return { totalLiters, compliance, executed, expectedCycles, skipped };
  }

  private async buildPerformance(
    farmer: any,
    filters: ReportFilters,
    spec: FarmerReportSpec,
    generatedBy?: string,
  ): Promise<ReportDefinition> {
    const data = await this.loadPeriodData(farmer.id, filters);
    const moisture = this.computeMoistureMetrics(data.soil);
    const irrigation = this.computeIrrigationMetrics(
      data.irrigationLogs,
      data.schedules,
    );
    const cropProgress = data.crops.length > 0 ? 90 : 0;
    const score = Math.round(
      moisture.average * 0.4 + irrigation.compliance * 0.4 + cropProgress * 0.2,
    );

    const soilTrend: TrendPoint[] = aggregateByDay(
      data.soil.map((r) => ({ date: r.readingAt, value: asNumber(r.moisturePercent) })),
    ).slice(-12);
    const irrigationTrend: TrendPoint[] = aggregateByDay(
      data.irrigationLogs.map((l) => ({
        date: l.executedAt ?? new Date(),
        value: asNumber(l.waterUsedLiters),
      })),
      "sum",
    ).slice(-12);

    const kpis = [
      {
        id: "score",
        label: "Performance Score",
        value: score,
        unit: "/100",
        icon: "🏆",
        hint: "Composite weighted score",
      },
      {
        id: "moisture",
        label: "Avg. Soil Moisture",
        value: moisture.average.toFixed(1),
        unit: "%",
        icon: "💧",
        trend: {
          direction:
            moisture.trend === "rising"
              ? ("up" as const)
              : moisture.trend === "falling"
                ? ("down" as const)
                : ("flat" as const),
          percent: 0,
        },
      },
      {
        id: "compliance",
        label: "Irrigation Compliance",
        value: irrigation.compliance.toFixed(0),
        unit: "%",
        icon: "🚿",
      },
      {
        id: "alerts",
        label: "Active Alerts",
        value: data.alerts.filter((a) => !a.isRead).length,
        icon: "🔔",
      },
    ];

    const charts: ChartSection[] = [
      {
        heading: "Soil Moisture Trend",
        icon: "📈",
        type: "area",
        data: soilTrend,
        xKey: "label",
        yKey: "value",
        yLabel: "Moisture %",
        unit: "%",
      },
      {
        heading: "Irrigation Water Usage",
        icon: "💦",
        type: "bar",
        data: irrigationTrend,
        xKey: "label",
        yKey: "value",
        yLabel: "Liters",
        unit: "L",
      },
    ];

    const tables: TableSection[] = [
      {
        heading: "Recent Soil Readings",
        icon: "🌱",
        columns: [
          { key: "date", label: "Date" },
          { key: "moisture", label: "Moisture %" },
          { key: "temp", label: "Soil Temp °C" },
          { key: "ph", label: "pH" },
          { key: "score", label: "Health" },
        ],
        rows: data.soil
          .slice(-10)
          .reverse()
          .map((r) => ({
            date: r.readingAt.toISOString().slice(0, 10),
            moisture: asNumber(r.moisturePercent).toFixed(1),
            temp:
              r.temperatureCelsius !== null
                ? asNumber(r.temperatureCelsius).toFixed(1)
                : "—",
            ph: r.phLevel !== null ? asNumber(r.phLevel).toFixed(1) : "—",
            score: r.soilHealthScore ?? "—",
          })),
      },
      {
        heading: "Active Crops",
        icon: "🌾",
        columns: [
          { key: "crop", label: "Crop" },
          { key: "planted", label: "Planted" },
          { key: "harvest", label: "Expected Harvest" },
          { key: "status", label: "Status" },
          { key: "yield", label: "Estimated Yield (kg)" },
        ],
        rows: data.crops.map((c) => ({
          crop: c.crop.nameEn,
          planted: c.plantedDate.toISOString().slice(0, 10),
          harvest: c.expectedHarvestDate?.toISOString().slice(0, 10) ?? "—",
          status: c.status,
          yield:
            c.estimatedYieldKg !== null && c.estimatedYieldKg !== undefined
              ? asNumber(c.estimatedYieldKg).toFixed(0)
              : "—",
        })),
      },
    ];

    const recommendations = deriveRecommendations({
      moisture: {
        average: moisture.average,
        variability: moisture.variability,
        trend: moisture.trend,
      },
      irrigation: {
        compliance: irrigation.compliance,
        totalLiters: irrigation.totalLiters,
        scheduleCount: irrigation.expectedCycles,
        skippedCount: irrigation.skipped,
      },
      yield: {
        estimatedKg: data.crops.reduce(
          (s, c) => s + asNumber(c.estimatedYieldKg),
          0,
        ),
        actualKg: data.crops.reduce((s, c) => s + asNumber(c.actualYieldKg), 0),
        cropCount: data.crops.length,
        cropTypes: data.crops.map((c) => c.crop.nameEn),
      },
      alertCount: data.alerts.length,
      criticalAlertCount: data.alerts.filter((a) => a.severity === "critical")
        .length,
    });

    const risks = deriveRisks({
      performanceScore: score,
      complianceScore: irrigation.compliance,
      moistureStability: moisture.average,
      alertCount: data.alerts.length,
      criticalAlertCount: data.alerts.filter((a) => a.severity === "critical")
        .length,
      yieldRatio: (() => {
        const est = data.crops.reduce(
          (s, c) => s + asNumber(c.estimatedYieldKg),
          0,
        );
        const act = data.crops.reduce(
          (s, c) => s + asNumber(c.actualYieldKg),
          0,
        );
        return est > 0 ? act / est : 0;
      })(),
    });

    return completeReport({
      context: buildContext({
        reportType: `FARMER-${spec.type.toUpperCase()}`,
        title: spec.title,
        subtitle: farmer.fullName,
        roleScope: "farmer",
        filters,
        targetId: farmer.id,
        targetName: farmer.fullName,
        generatedBy,
        organizationName: farmer.cooperative?.name || "Independent Farmer",
      }),
      executiveSummary: `This report evaluates ${farmer.fullName}'s farm performance over the selected period. The composite performance score is ${score}/100, driven by ${moisture.average.toFixed(1)}% average soil moisture, ${irrigation.compliance.toFixed(0)}% irrigation compliance, and ${data.crops.length} active crop(s). ${data.alerts.filter((a) => a.severity === "critical").length} critical alert(s) require attention.`,
      kpis,
      charts,
      tables,
      recommendations,
      risks,
      metadata: {
        dataPoints:
          data.soil.length +
          data.irrigationLogs.length +
          data.activities.length +
          data.crops.length +
          data.weather.length,
        periodLabel: periodLabel(filters),
        generatedBy,
        hash: "",
        version: "2.0.0",
      },
    });
  }

  private async buildSeasonal(
    farmer: any,
    filters: ReportFilters,
    spec: FarmerReportSpec,
    generatedBy?: string,
  ): Promise<ReportDefinition> {
    const data = await this.loadPeriodData(farmer.id, filters);
    const moisture = this.computeMoistureMetrics(data.soil);
    const irrigation = this.computeIrrigationMetrics(
      data.irrigationLogs,
      data.schedules,
    );
    const totalRain = data.weather.reduce(
      (s, w) => s + asNumber(w.rainfallMm),
      0,
    );
    const totalYieldEst = data.crops.reduce(
      (s, c) => s + asNumber(c.estimatedYieldKg),
      0,
    );
    const totalYieldAct = data.crops.reduce(
      (s, c) => s + asNumber(c.actualYieldKg),
      0,
    );

    const monthlySoil: TrendPoint[] = groupByMonth(
      data.soil,
      (r) => r.readingAt,
    ).map((g) => ({
      label: g.label,
      value: average(g.items.map((r: any) => asNumber(r.moisturePercent))),
    }));
    const monthlyRain: TrendPoint[] = groupByMonth(
      data.weather,
      (r) => r.readingAt,
    ).map((g) => ({
      label: g.label,
      value: g.items.reduce(
        (s: number, r: any) => s + asNumber(r.rainfallMm),
        0,
      ),
    }));

    const kpis = [
      {
        id: "season",
        label: "Season",
        value: filters.season ?? "Current",
        icon: "🌦",
      },
      {
        id: "yield-est",
        label: "Estimated Yield",
        value: totalYieldEst.toFixed(0),
        unit: "kg",
        icon: "🌾",
      },
      {
        id: "yield-act",
        label: "Actual Yield",
        value: totalYieldAct.toFixed(0),
        unit: "kg",
        icon: "📦",
      },
      {
        id: "rain",
        label: "Total Rainfall",
        value: totalRain.toFixed(0),
        unit: "mm",
        icon: "🌧",
      },
    ];

    return completeReport({
      context: buildContext({
        reportType: `FARMER-${spec.type.toUpperCase()}`,
        title: spec.title,
        subtitle: `${farmer.fullName} · ${filters.season ?? "Current"}`,
        roleScope: "farmer",
        filters,
        targetId: farmer.id,
        targetName: farmer.fullName,
        generatedBy,
        organizationName: farmer.cooperative?.name || "Independent Farmer",
      }),
      executiveSummary: `Seasonal summary for ${farmer.fullName}. Rainfall totaled ${totalRain.toFixed(0)}mm with average soil moisture at ${moisture.average.toFixed(1)}%. Estimated yield of ${totalYieldEst.toFixed(0)}kg versus actual ${totalYieldAct.toFixed(0)}kg. ${data.activities.length} farm activities logged in the period.`,
      kpis,
      charts: [
        {
          heading: "Monthly Soil Moisture",
          icon: "📈",
          type: "line",
          data: monthlySoil,
          xKey: "label",
          yKey: "value",
          unit: "%",
        },
        {
          heading: "Monthly Rainfall (mm)",
          icon: "🌧",
          type: "bar",
          data: monthlyRain,
          xKey: "label",
          yKey: "value",
          unit: "mm",
        },
      ],
      tables: [
        {
          heading: "Seasonal Activities",
          icon: "📋",
          columns: [
            { key: "date", label: "Date" },
            { key: "type", label: "Type" },
            { key: "qty", label: "Quantity" },
            { key: "cost", label: "Cost (RWF)" },
            { key: "notes", label: "Notes" },
          ],
          rows: data.activities.slice(0, 20).map((a) => ({
            date: a.activityDate.toISOString().slice(0, 10),
            type: a.activityType,
            qty:
              a.quantity !== null && a.quantity !== undefined
                ? `${asNumber(a.quantity)} ${a.unit ?? ""}`
                : "—",
            cost:
              a.costRwf !== null && a.costRwf !== undefined
                ? asNumber(a.costRwf).toLocaleString()
                : "—",
            notes: a.notes ?? "—",
          })),
        },
      ],
      recommendations: deriveRecommendations({
        moisture: {
          average: moisture.average,
          variability: moisture.variability,
          trend: moisture.trend,
        },
        irrigation: {
          compliance: irrigation.compliance,
          totalLiters: irrigation.totalLiters,
          scheduleCount: irrigation.expectedCycles,
          skippedCount: irrigation.skipped,
        },
        yield: {
          estimatedKg: totalYieldEst,
          actualKg: totalYieldAct,
          cropCount: data.crops.length,
          cropTypes: data.crops.map((c) => c.crop.nameEn),
        },
        alertCount: data.alerts.length,
        criticalAlertCount: data.alerts.filter((a) => a.severity === "critical")
          .length,
      }),
      risks: [],
      metadata: {
        dataPoints:
          data.soil.length + data.weather.length + data.activities.length,
        periodLabel: periodLabel(filters),
        generatedBy,
        hash: "",
        version: "2.0.0",
      },
    });
  }

  private async buildAiRecommendation(
    farmer: any,
    filters: ReportFilters,
    spec: FarmerReportSpec,
    generatedBy?: string,
  ): Promise<ReportDefinition> {
    const data = await this.loadPeriodData(farmer.id, filters);
    const moisture = this.computeMoistureMetrics(data.soil);
    const irrigation = this.computeIrrigationMetrics(
      data.irrigationLogs,
      data.schedules,
    );
    const recs = deriveRecommendations({
      moisture: {
        average: moisture.average,
        variability: moisture.variability,
        trend: moisture.trend,
      },
      irrigation: {
        compliance: irrigation.compliance,
        totalLiters: irrigation.totalLiters,
        scheduleCount: irrigation.expectedCycles,
        skippedCount: irrigation.skipped,
      },
      yield: {
        estimatedKg: data.crops.reduce(
          (s, c) => s + asNumber(c.estimatedYieldKg),
          0,
        ),
        actualKg: data.crops.reduce((s, c) => s + asNumber(c.actualYieldKg), 0),
        cropCount: data.crops.length,
        cropTypes: data.crops.map((c) => c.crop.nameEn),
      },
      alertCount: data.alerts.length,
      criticalAlertCount: data.alerts.filter((a) => a.severity === "critical")
        .length,
    });

    const recsTable: TableSection = {
      heading: "Personalized Recommendations",
      icon: "🤖",
      columns: [
        { key: "priority", label: "Priority" },
        { key: "category", label: "Category" },
        { key: "title", label: "Title" },
        { key: "action", label: "Recommended Action" },
        { key: "confidence", label: "Confidence" },
      ],
      rows: recs.map((r) => ({
        priority: r.priority,
        category: r.category,
        title: r.title,
        action: r.action,
        confidence: r.confidence,
      })),
    };

    return completeReport({
      context: buildContext({
        reportType: `FARMER-${spec.type.toUpperCase()}`,
        title: spec.title,
        subtitle: farmer.fullName,
        roleScope: "farmer",
        filters,
        targetId: farmer.id,
        targetName: farmer.fullName,
        generatedBy,
        organizationName: farmer.cooperative?.name || "Independent Farmer",
      }),
      executiveSummary: `${recs.length} AI-driven recommendations were generated for ${farmer.fullName} based on ${data.soil.length} soil readings, ${data.irrigationLogs.length} irrigation events, and ${data.recommendations.length} prior recommendations. ${recs.filter((r) => r.priority === "urgent" || r.priority === "high").length} are urgent or high-priority.`,
      kpis: [
        {
          id: "recs",
          label: "Total Recommendations",
          value: recs.length,
          icon: "💡",
        },
        {
          id: "urgent",
          label: "Urgent",
          value: recs.filter((r) => r.priority === "urgent").length,
          icon: "🚨",
        },
        {
          id: "high",
          label: "High Priority",
          value: recs.filter((r) => r.priority === "high").length,
          icon: "⚠",
        },
        {
          id: "conf",
          label: "Avg Confidence",
          value: `${Math.round((recs.filter((r) => r.confidence === "high").length / Math.max(1, recs.length)) * 100)}%`,
          icon: "🎯",
        },
      ],
      charts: [],
      tables: [
        recsTable,
        {
          heading: "Prior Recommendations History",
          icon: "📜",
          columns: [
            { key: "date", label: "Generated" },
            { key: "type", label: "Type" },
            { key: "title", label: "Title" },
            { key: "priority", label: "Priority" },
            { key: "read", label: "Read" },
          ],
          rows: data.recommendations.slice(0, 20).map((r) => ({
            date: r.generatedAt.toISOString().slice(0, 10),
            type: r.type,
            title: r.title,
            priority: String(r.priority),
            read: r.isRead ? "Yes" : "No",
          })),
        },
      ],
      recommendations: recs,
      risks: deriveRisks({
        performanceScore: Math.round(
          moisture.average * 0.4 + irrigation.compliance * 0.4 + 18,
        ),
        complianceScore: irrigation.compliance,
        moistureStability: moisture.average,
        alertCount: data.alerts.length,
        criticalAlertCount: data.alerts.filter((a) => a.severity === "critical")
          .length,
        yieldRatio: 0,
      }),
      metadata: {
        dataPoints: data.soil.length + data.recommendations.length,
        periodLabel: periodLabel(filters),
        generatedBy,
        hash: "",
        version: "2.0.0",
      },
    });
  }

  private async buildSoilIrrigation(
    farmer: any,
    filters: ReportFilters,
    spec: FarmerReportSpec,
    generatedBy?: string,
  ): Promise<ReportDefinition> {
    const data = await this.loadPeriodData(farmer.id, filters);
    const moisture = this.computeMoistureMetrics(data.soil);
    const irrigation = this.computeIrrigationMetrics(
      data.irrigationLogs,
      data.schedules,
    );

    const moistureTrend: TrendPoint[] = aggregateByDay(
      data.soil.map((r) => ({
        date: r.readingAt,
        value: asNumber(r.moisturePercent),
        secondary:
          r.phLevel !== null && r.phLevel !== undefined
            ? asNumber(r.phLevel)
            : undefined,
      })),
    ).slice(-60);
    const irrigationTrend: TrendPoint[] = aggregateByDay(
      data.irrigationLogs.map((l) => ({
        date: l.executedAt ?? new Date(),
        value: asNumber(l.waterUsedLiters),
      })),
      "sum",
    ).slice(-60);

    const tables: TableSection[] = [
      {
        heading: "Soil Reading Statistics",
        icon: "🧪",
        columns: [
          { key: "metric", label: "Metric" },
          { key: "value", label: "Value" },
        ],
        rows: [
          { metric: "Total Readings", value: data.soil.length.toString() },
          { metric: "Avg. Moisture", value: `${moisture.average.toFixed(1)}%` },
          {
            metric: "Moisture Std Dev",
            value: moisture.variability.toFixed(2),
          },
          {
            metric: "Avg. pH",
            value: average(
              data.soil.map((r) => asNumber(r.phLevel)).filter((v) => v > 0),
            ).toFixed(2),
          },
          {
            metric: "Avg. Nitrogen (ppm)",
            value: average(
              data.soil
                .map((r) => asNumber(r.nitrogenPpm))
                .filter((v) => v > 0),
            ).toFixed(2),
          },
          {
            metric: "Avg. Phosphorus (ppm)",
            value: average(
              data.soil
                .map((r) => asNumber(r.phosphorusPpm))
                .filter((v) => v > 0),
            ).toFixed(2),
          },
          {
            metric: "Avg. Potassium (ppm)",
            value: average(
              data.soil
                .map((r) => asNumber(r.potassiumPpm))
                .filter((v) => v > 0),
            ).toFixed(2),
          },
        ],
      },
      {
        heading: "Irrigation Schedule Compliance",
        icon: "💧",
        columns: [
          { key: "metric", label: "Metric" },
          { key: "value", label: "Value" },
        ],
        rows: [
          {
            metric: "Active Schedules",
            value: data.schedules.length.toString(),
          },
          {
            metric: "Total Water Used",
            value: `${irrigation.totalLiters.toFixed(0)} L`,
          },
          { metric: "Executed Cycles", value: irrigation.executed.toString() },
          {
            metric: "Expected Cycles",
            value: irrigation.expectedCycles.toString(),
          },
          {
            metric: "Compliance",
            value: `${irrigation.compliance.toFixed(0)}%`,
          },
        ],
      },
    ];

    return completeReport({
      context: buildContext({
        reportType: `FARMER-${spec.type.toUpperCase()}`,
        title: spec.title,
        subtitle: farmer.fullName,
        roleScope: "farmer",
        filters,
        targetId: farmer.id,
        targetName: farmer.fullName,
        generatedBy,
        organizationName: farmer.cooperative?.name || "Independent Farmer",
      }),
      executiveSummary: `Soil and irrigation analysis for ${farmer.fullName}. Soil moisture averaged ${moisture.average.toFixed(1)}% with ${moisture.variability.toFixed(1)}% standard deviation. Irrigation compliance stands at ${irrigation.compliance.toFixed(0)}% across ${data.schedules.length} active schedule(s). ${irrigation.totalLiters.toFixed(0)} liters applied in the period.`,
      kpis: [
        {
          id: "moisture",
          label: "Avg. Moisture",
          value: moisture.average.toFixed(1),
          unit: "%",
          icon: "💧",
        },
        {
          id: "variability",
          label: "Moisture Variability",
          value: moisture.variability.toFixed(1),
          unit: "%",
          icon: "📏",
        },
        {
          id: "compliance",
          label: "Irrigation Compliance",
          value: irrigation.compliance.toFixed(0),
          unit: "%",
          icon: "🚿",
        },
        {
          id: "water",
          label: "Water Applied",
          value: irrigation.totalLiters.toFixed(0),
          unit: "L",
          icon: "💦",
        },
      ],
      charts: [
        {
          heading: "Soil Moisture & pH",
          icon: "📈",
          type: "line",
          data: moistureTrend,
          xKey: "label",
          yKey: "value",
          unit: "%",
        },
        {
          heading: "Daily Irrigation Volume",
          icon: "🚰",
          type: "bar",
          data: irrigationTrend,
          xKey: "label",
          yKey: "value",
          unit: "L",
        },
      ],
      tables,
      recommendations: deriveRecommendations({
        moisture: {
          average: moisture.average,
          variability: moisture.variability,
          trend: moisture.trend,
        },
        irrigation: {
          compliance: irrigation.compliance,
          totalLiters: irrigation.totalLiters,
          scheduleCount: irrigation.expectedCycles,
          skippedCount: irrigation.skipped,
        },
        yield: {
          estimatedKg: 0,
          actualKg: 0,
          cropCount: 0,
          cropTypes: [],
        },
        alertCount: data.alerts.length,
        criticalAlertCount: data.alerts.filter((a) => a.severity === "critical")
          .length,
      }),
      risks: deriveRisks({
        performanceScore: Math.round(
          moisture.average * 0.4 + irrigation.compliance * 0.4 + 18,
        ),
        complianceScore: irrigation.compliance,
        moistureStability: moisture.average,
        alertCount: data.alerts.length,
        criticalAlertCount: data.alerts.filter((a) => a.severity === "critical")
          .length,
        yieldRatio: 0,
      }),
      metadata: {
        dataPoints: data.soil.length + data.irrigationLogs.length,
        periodLabel: periodLabel(filters),
        generatedBy,
        hash: "",
        version: "2.0.0",
      },
    });
  }

  private async buildYieldProductivity(
    farmer: any,
    filters: ReportFilters,
    spec: FarmerReportSpec,
    generatedBy?: string,
  ): Promise<ReportDefinition> {
    const data = await this.loadPeriodData(farmer.id, filters);
    const totalEst = data.crops.reduce(
      (s, c) => s + asNumber(c.estimatedYieldKg),
      0,
    );
    const totalAct = data.crops.reduce(
      (s, c) => s + asNumber(c.actualYieldKg),
      0,
    );
    const ratio = totalEst > 0 ? totalAct / totalEst : 0;
    const farmSize = asNumber(farmer.farmSizeHectares, 0);
    const productivity = farmSize > 0 ? totalAct / farmSize : 0;

    const byCrop: TableSection = {
      heading: "Yield by Crop",
      icon: "🌾",
      columns: [
        { key: "crop", label: "Crop" },
        { key: "planted", label: "Planted" },
        { key: "harvested", label: "Harvested" },
        { key: "estimated", label: "Estimated (kg)" },
        { key: "actual", label: "Actual (kg)" },
        { key: "variance", label: "Variance" },
        { key: "status", label: "Status" },
      ],
      rows: data.crops.map((c) => {
        const est = asNumber(c.estimatedYieldKg);
        const act = asNumber(c.actualYieldKg);
        const variance =
          est > 0 ? `${(((act - est) / est) * 100).toFixed(1)}%` : "—";
        return {
          crop: c.crop.nameEn,
          planted: c.plantedDate.toISOString().slice(0, 10),
          harvested: c.actualHarvestDate?.toISOString().slice(0, 10) ?? "—",
          estimated: est.toFixed(0),
          actual: act.toFixed(0),
          variance,
          status: c.status,
        };
      }),
    };

    return completeReport({
      context: buildContext({
        reportType: `FARMER-${spec.type.toUpperCase()}`,
        title: spec.title,
        subtitle: farmer.fullName,
        roleScope: "farmer",
        filters,
        targetId: farmer.id,
        targetName: farmer.fullName,
        generatedBy,
        organizationName: farmer.cooperative?.name || "Independent Farmer",
      }),
      executiveSummary: `${farmer.fullName}'s yield totals ${totalAct.toFixed(0)}kg against ${totalEst.toFixed(0)}kg estimated (${(ratio * 100).toFixed(0)}%). Productivity is ${productivity.toFixed(0)} kg/ha on ${farmSize.toFixed(2)}ha. ${data.crops.filter((c) => c.status === "harvested").length} crop(s) harvested, ${data.crops.filter((c) => c.status !== "harvested").length} in progress.`,
      kpis: [
        {
          id: "total-est",
          label: "Estimated Yield",
          value: totalEst.toFixed(0),
          unit: "kg",
          icon: "📊",
        },
        {
          id: "total-act",
          label: "Actual Yield",
          value: totalAct.toFixed(0),
          unit: "kg",
          icon: "🌾",
        },
        {
          id: "ratio",
          label: "Yield Ratio",
          value: `${(ratio * 100).toFixed(0)}%`,
          icon: "🎯",
        },
        {
          id: "productivity",
          label: "Productivity",
          value: productivity.toFixed(0),
          unit: "kg/ha",
          icon: "📈",
        },
      ],
      charts: [],
      tables: [
        byCrop,
        {
          heading: "Production Cost Summary",
          icon: "💰",
          columns: [
            { key: "metric", label: "Metric" },
            { key: "value", label: "Value (RWF)" },
          ],
          rows: [
            {
              metric: "Total Activity Costs",
              value: data.activities
                .reduce((s, a) => s + asNumber(a.costRwf), 0)
                .toLocaleString(),
            },
            {
              metric: "Total Activities",
              value: data.activities.length.toString(),
            },
            {
              metric: "Cost per Hectare",
              value:
                farmSize > 0
                  ? (
                      data.activities.reduce(
                        (s, a) => s + asNumber(a.costRwf),
                        0,
                      ) / farmSize
                    ).toFixed(0)
                  : "—",
            },
          ],
        },
      ],
      recommendations: deriveRecommendations({
        moisture: { average: 0, variability: 0, trend: "stable" },
        irrigation: {
          compliance: 0,
          totalLiters: 0,
          scheduleCount: 0,
          skippedCount: 0,
        },
        yield: {
          estimatedKg: totalEst,
          actualKg: totalAct,
          cropCount: data.crops.length,
          cropTypes: data.crops.map((c) => c.crop.nameEn),
        },
        alertCount: 0,
        criticalAlertCount: 0,
      }),
      risks: deriveRisks({
        performanceScore: Math.round(ratio * 100),
        complianceScore: 0,
        moistureStability: 0,
        alertCount: 0,
        criticalAlertCount: 0,
        yieldRatio: ratio,
      }),
      metadata: {
        dataPoints: data.crops.length + data.activities.length,
        periodLabel: periodLabel(filters),
        generatedBy,
        hash: "",
        version: "2.0.0",
      },
    });
  }
}

function groupByMonth<T>(
  items: T[],
  getDate: (item: T) => Date,
): { label: string; items: T[] }[] {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const d = getDate(item);
    const key = d.toISOString().slice(0, 7);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(item);
  }
  return Array.from(groups.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, items]) => ({
      label: new Date(`${key}-01`).toLocaleDateString("en-US", {
        month: "short",
      }),
      items,
    }));
}

export const farmerReportsService = new FarmerReportsService();
