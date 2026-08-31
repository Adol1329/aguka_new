import { prisma } from "../prisma.js";
import {
  ReportDefinition,
  ReportFilters,
  dateRangeFilter,
  buildSpatialFilter,
  periodLabel,
  reportHash,
  buildContext,
  asNumber,
  percent,
  computeRiskScore,
  computeActionPriorityLevel,
  extractAlerts,
  completeReport,
} from "./index.js";

export interface AdminReportSpec {
  type: string;
  title: string;
  subtitle?: string;
}

export const ADMIN_REPORT_SPECS: AdminReportSpec[] = [
  {
    type: "system-usage",
    title: "System Usage Report",
    subtitle: "Active users, sessions, and feature adoption",
  },
  {
    type: "financial",
    title: "Financial Report",
    subtitle: "Payments, refunds, and revenue",
  },
  {
    type: "data-validation",
    title: "Farm Data Validation Report",
    subtitle: "Pending farm validations and quality",
  },
  {
    type: "analytics-dashboard",
    title: "Analytics Dashboard Report",
    subtitle: "Top-level KPIs across the platform",
  },
  {
    type: "user-activity",
    title: "User Activity Report",
    subtitle: "User activity and engagement",
  },
];

export class AdminReportsService {
  async buildReport(
    spec: AdminReportSpec,
    filters: ReportFilters,
    generatedBy?: string,
  ): Promise<ReportDefinition> {
    let definition: ReportDefinition;
    switch (spec.type) {
      case "system-usage":
        definition = await this.buildSystemUsage(filters, spec, generatedBy);
        break;
      case "financial":
        definition = await this.buildFinancial(filters, spec, generatedBy);
        break;
      case "data-validation":
        definition = await this.buildDataValidation(filters, spec, generatedBy);
        break;
      case "analytics-dashboard":
        definition = await this.buildAnalyticsDashboard(
          filters,
          spec,
          generatedBy,
        );
        break;
      case "user-activity":
        definition = await this.buildUserActivity(filters, spec, generatedBy);
        break;
      default:
        throw new Error(`Unknown admin report type: ${spec.type}`);
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

  private async buildSystemUsage(
    filters: ReportFilters,
    spec: AdminReportSpec,
    generatedBy?: string,
  ): Promise<ReportDefinition> {
    const spatialFilter = buildSpatialFilter(filters);

    const [
      totalUsers,
      activeUsers,
      pending,
      sessions,
      devices,
      payments,
      recommendations,
    ] = await Promise.all([
      prisma.user.count({ where: { farmerProfile: spatialFilter } }),
      prisma.user.count({
        where: { isActive: true, farmerProfile: spatialFilter },
      }),
      prisma.user.count({
        where: { status: "pending_verification", farmerProfile: spatialFilter },
      }),
      prisma.session.count({
        where: {
          lastUsedAt: dateRangeFilter(filters),
          user: { farmerProfile: spatialFilter },
        },
      }),
      prisma.device.count({
        where: { user: { farmerProfile: spatialFilter } },
      }),
      prisma.payment.count({
        where: {
          createdAt: dateRangeFilter(filters),
          user: { farmerProfile: spatialFilter },
        },
      }),
      prisma.recommendation.count({
        where: { generatedAt: dateRangeFilter(filters), farmer: spatialFilter },
      }),
    ]);

    const byRole = await prisma.user.groupBy({
      by: ["role"],
      where: { farmerProfile: spatialFilter },
      _count: { role: true },
    });

    return completeReport({
      context: buildContext({
        reportType: `ADMIN-${spec.type.toUpperCase()}`,
        title: spec.title,
        roleScope: "admin",
        filters,
        targetName: "System",
        generatedBy,
        signatoryRole: "System Administrator",
      }),
      executiveSummary: `Total ${totalUsers} users (${activeUsers} active, ${pending} pending). ${sessions} active sessions in the period. ${devices} device(s) registered. ${payments} payment(s) and ${recommendations} recommendation(s) recorded.`,
      kpis: [
        { id: "users", label: "Total Users", value: totalUsers, icon: "👥" },
        { id: "active", label: "Active", value: activeUsers, icon: "✅" },
        { id: "sessions", label: "Sessions", value: sessions, icon: "🔐" },
        { id: "devices", label: "Devices", value: devices, icon: "📱" },
      ],
      charts: [
        {
          heading: "Users by Role",
          icon: "👥",
          type: "bar",
          data: byRole.map((r) => ({ label: r.role, value: r._count.role })),
        },
      ],
      tables: [
        {
          heading: "Role Distribution",
          icon: "👥",
          columns: [
            { key: "role", label: "Role" },
            { key: "count", label: "Users", align: "right" },
            { key: "share", label: "Share", align: "right" },
          ],
          rows: byRole.map((r) => ({
            role: r.role,
            count: r._count.role.toString(),
            share: `${percent(r._count.role, totalUsers, 0).toFixed(0)}%`,
          })),
        },
      ],
      recommendations: [],
      risks:
        pending > 5
          ? [
              {
                level: "moderate",
                category: "Onboarding",
                message: `${pending} accounts pending verification.`,
                affected: pending,
                recommendation:
                  "Review and approve/reject pending accounts to reduce backlog.",
              },
            ]
          : [],
      metadata: {
        dataPoints: totalUsers + sessions + devices,
        periodLabel: periodLabel(filters),
        generatedBy,
        hash: "",
        version: "2.0.0",
      },
    });
  }

  private async buildFinancial(
    filters: ReportFilters,
    spec: AdminReportSpec,
    generatedBy?: string,
  ): Promise<ReportDefinition> {
    const spatialFilter = buildSpatialFilter(filters);

    const payments = await prisma.payment.findMany({
      where: {
        createdAt: dateRangeFilter(filters),
        user: { farmerProfile: spatialFilter },
      },
    });
    const refunds = await prisma.refund.findMany({
      where: {
        createdAt: dateRangeFilter(filters),
        payment: { user: { farmerProfile: spatialFilter } },
      },
    });
    const totalRevenue = payments
      .filter((p) => p.status === "completed")
      .reduce((s, p) => s + asNumber(p.amount), 0);
    const totalRefunds = refunds
      .filter((r) => r.status === "completed")
      .reduce((s, r) => s + asNumber(r.amount), 0);
    const net = totalRevenue - totalRefunds;
    const txCount = payments.length;
    const byStatus: Record<string, number> = {};
    for (const p of payments)
      byStatus[p.status] = (byStatus[p.status] ?? 0) + 1;
    const byProvider: Record<string, number> = {};
    for (const p of payments)
      byProvider[p.provider] = (byProvider[p.provider] ?? 0) + 1;

    return completeReport({
      context: buildContext({
        reportType: `ADMIN-${spec.type.toUpperCase()}`,
        title: spec.title,
        roleScope: "admin",
        filters,
        targetName: "System",
        generatedBy,
        signatoryRole: "System Administrator",
      }),
      executiveSummary: `Financial summary: ${totalRevenue.toLocaleString()} RWF revenue, ${totalRefunds.toLocaleString()} RWF refunds, net ${net.toLocaleString()} RWF across ${txCount} transactions.`,
      kpis: [
        {
          id: "rev",
          label: "Revenue (RWF)",
          value: totalRevenue.toLocaleString(),
          icon: "💰",
        },
        {
          id: "ref",
          label: "Refunds (RWF)",
          value: totalRefunds.toLocaleString(),
          icon: "↩",
        },
        {
          id: "net",
          label: "Net (RWF)",
          value: net.toLocaleString(),
          icon: "📊",
        },
        { id: "tx", label: "Transactions", value: txCount, icon: "💳" },
      ],
      charts: [
        {
          heading: "Revenue by Provider",
          icon: "💳",
          type: "pie",
          data: Object.entries(byProvider).map(([label, value]) => ({
            label,
            value,
          })),
        },
      ],
      tables: [
        {
          heading: "Payments by Status",
          icon: "📋",
          columns: [
            { key: "status", label: "Status" },
            { key: "count", label: "Count", align: "right" },
            { key: "share", label: "Share", align: "right" },
          ],
          rows: Object.entries(byStatus).map(([status, count]) => ({
            status,
            count: count.toString(),
            share: `${percent(count, txCount, 0).toFixed(0)}%`,
          })),
        },
      ],
      recommendations: [],
      risks: [],
      metadata: {
        dataPoints: txCount + refunds.length,
        periodLabel: periodLabel(filters),
        generatedBy,
        hash: "",
        version: "2.0.0",
      },
    });
  }

  private async buildDataValidation(
    filters: ReportFilters,
    spec: AdminReportSpec,
    generatedBy?: string,
  ): Promise<ReportDefinition> {
    const spatialFilter = buildSpatialFilter(filters);

    const [pendingVerified, verified, rejected, totalFarmers] =
      await Promise.all([
        prisma.farmerProfile.count({
          where: { verificationStatus: "pending", ...spatialFilter },
        }),
        prisma.farmerProfile.count({
          where: { verificationStatus: "verified", ...spatialFilter },
        }),
        prisma.farmerProfile.count({
          where: { verificationStatus: "rejected", ...spatialFilter },
        }),
        prisma.farmerProfile.count({ where: spatialFilter }),
      ]);
    const dataQuality = await prisma.farmerProfile.findMany({
      where: spatialFilter,
      select: {
        gpsLatitude: true,
        gpsLongitude: true,
        farmSizeHectares: true,
        soilType: true,
        irrigationType: true,
      },
    });
    const withGps = dataQuality.filter(
      (p) => p.gpsLatitude !== null && p.gpsLongitude !== null,
    ).length;
    const withSize = dataQuality.filter(
      (p) => p.farmSizeHectares !== null,
    ).length;
    const withSoil = dataQuality.filter((p) => p.soilType !== null).length;
    const withIrrigation = dataQuality.filter(
      (p) => p.irrigationType !== null,
    ).length;

    return completeReport({
      context: buildContext({
        reportType: `ADMIN-${spec.type.toUpperCase()}`,
        title: spec.title,
        roleScope: "admin",
        filters,
        targetName: "System",
        generatedBy,
        signatoryRole: "System Administrator",
      }),
      executiveSummary: `${pendingVerified} of ${totalFarmers} farm profiles pending verification. Data quality: ${percent(withGps, totalFarmers, 0).toFixed(0)}% have GPS, ${percent(withSize, totalFarmers, 0).toFixed(0)}% have farm size, ${percent(withSoil, totalFarmers, 0).toFixed(0)}% have soil type, ${percent(withIrrigation, totalFarmers, 0).toFixed(0)}% have irrigation type.`,
      kpis: [
        {
          id: "pending",
          label: "Pending Validation",
          value: pendingVerified,
          icon: "⏳",
        },
        { id: "verified", label: "Verified", value: verified, icon: "✅" },
        { id: "rejected", label: "Rejected", value: rejected, icon: "❌" },
        {
          id: "gps",
          label: "GPS Coverage",
          value: `${percent(withGps, totalFarmers, 0).toFixed(0)}%`,
          icon: "📍",
        },
      ],
      charts: [
        {
          heading: "Data Completeness",
          icon: "📋",
          type: "bar",
          data: [
            { label: "GPS", value: percent(withGps, totalFarmers, 0) },
            { label: "Farm Size", value: percent(withSize, totalFarmers, 0) },
            { label: "Soil Type", value: percent(withSoil, totalFarmers, 0) },
            {
              label: "Irrigation",
              value: percent(withIrrigation, totalFarmers, 0),
            },
          ],
          unit: "%",
        },
      ],
      tables: [
        {
          heading: "Validation Status",
          icon: "📋",
          columns: [
            { key: "status", label: "Status" },
            { key: "count", label: "Count", align: "right" },
          ],
          rows: [
            { status: "Pending", count: pendingVerified.toString() },
            { status: "Verified", count: verified.toString() },
            { status: "Rejected", count: rejected.toString() },
          ],
        },
      ],
      recommendations: [
        {
          priority: pendingVerified > 10 ? "high" : "medium",
          category: "Data Quality",
          title: "Clear pending validation backlog",
          rationale: `${pendingVerified} farm profiles await verification.`,
          action: "Assign admin reviewer and document verification criteria.",
          confidence: "high",
        },
      ],
      risks: [],
      metadata: {
        dataPoints: totalFarmers,
        periodLabel: periodLabel(filters),
        generatedBy,
        hash: "",
        version: "2.0.0",
      },
    });
  }

  private async buildAnalyticsDashboard(
    filters: ReportFilters,
    spec: AdminReportSpec,
    generatedBy?: string,
  ): Promise<ReportDefinition> {
    const spatialFilter = buildSpatialFilter(filters);

    const [
      farmers,
      officers,
      cooperatives,
      activeSessions,
      sensorCount,
      activeSensors,
      soilReadings,
      alerts,
      recommendations,
    ] = await Promise.all([
      prisma.user.count({
        where: { role: "farmer", farmerProfile: spatialFilter },
      }),
      prisma.user.count({ where: { role: "officer" } }),
      prisma.cooperative.count({
        where: {
          isActive: true,
          ...(spatialFilter.district
            ? { district: spatialFilter.district }
            : {}),
        },
      }),
      prisma.session.count({
        where: {
          lastUsedAt: dateRangeFilter(filters),
          user: { farmerProfile: spatialFilter },
        },
      }),
      prisma.sensor.count({ where: { farmer: spatialFilter } }),
      prisma.sensor.count({ where: { isActive: true, farmer: spatialFilter } }),
      prisma.soilReading.count({
        where: { readingAt: dateRangeFilter(filters), farmer: spatialFilter },
      }),
      prisma.alert.count({
        where: { createdAt: dateRangeFilter(filters), farmer: spatialFilter },
      }),
      prisma.recommendation.count({
        where: { generatedAt: dateRangeFilter(filters), farmer: spatialFilter },
      }),
    ]);

    const farmersByDistrict = await prisma.farmerProfile.groupBy({
      by: ["district"],
      where: spatialFilter,
      _count: { district: true },
      orderBy: { _count: { district: "desc" } },
      take: 10,
    });

    return completeReport({
      context: buildContext({
        reportType: `ADMIN-${spec.type.toUpperCase()}`,
        title: spec.title,
        roleScope: "admin",
        filters,
        targetName: "System",
        generatedBy,
        signatoryRole: "System Administrator",
      }),
      executiveSummary: `Platform overview: ${farmers} farmers, ${officers} officers, ${cooperatives} cooperatives. ${soilReadings} soil readings and ${alerts} alerts in the period. ${activeSensors} of ${sensorCount} sensors active.`,
      kpis: [
        { id: "farmers", label: "Farmers", value: farmers, icon: "🌾" },
        { id: "officers", label: "Officers", value: officers, icon: "👮" },
        { id: "coops", label: "Cooperatives", value: cooperatives, icon: "🏛" },
        { id: "alerts", label: "Alerts", value: alerts, icon: "🔔" },
      ],
      charts: [
        {
          heading: "Top Districts by Farmers",
          icon: "📍",
          type: "bar",
          data: farmersByDistrict.map((d) => ({
            label: d.district,
            value: d._count.district,
          })),
        },
      ],
      tables: [
        {
          heading: "Key Indicators",
          icon: "📊",
          columns: [
            { key: "metric", label: "Metric" },
            { key: "value", label: "Value" },
          ],
          rows: [
            {
              metric: "Active Sensors",
              value: `${activeSensors} / ${sensorCount}`,
            },
            { metric: "Active Sessions", value: activeSessions.toString() },
            {
              metric: "Soil Readings (Period)",
              value: soilReadings.toString(),
            },
            {
              metric: "Recommendations (Period)",
              value: recommendations.toString(),
            },
            { metric: "Alerts (Period)", value: alerts.toString() },
          ],
        },
      ],
      recommendations: [],
      risks: [],
      metadata: {
        dataPoints: farmers + sensorCount,
        periodLabel: periodLabel(filters),
        generatedBy,
        hash: "",
        version: "2.0.0",
      },
    });
  }

  private async buildUserActivity(
    filters: ReportFilters,
    spec: AdminReportSpec,
    generatedBy?: string,
  ): Promise<ReportDefinition> {
    const spatialFilter = buildSpatialFilter(filters);

    const recentUsers = await prisma.user.findMany({
      where: { farmerProfile: spatialFilter },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        phone: true,
        fullName: true,
        role: true,
        status: true,
        isActive: true,
        createdAt: true,
      },
    });
    const auditLogs = await prisma.auditLog.count({
      where: {
        createdAt: dateRangeFilter(filters),
        user: { farmerProfile: spatialFilter },
      },
    });
    const sessions = await prisma.session.count({
      where: {
        lastUsedAt: dateRangeFilter(filters),
        user: { farmerProfile: spatialFilter },
      },
    });

    return completeReport({
      context: buildContext({
        reportType: `ADMIN-${spec.type.toUpperCase()}`,
        title: spec.title,
        roleScope: "admin",
        filters,
        targetName: "System",
        generatedBy,
        signatoryRole: "System Administrator",
      }),
      executiveSummary: `${sessions} active sessions and ${auditLogs} audit events in the period. ${recentUsers.length} most recent accounts shown below.`,
      kpis: [
        {
          id: "sessions",
          label: "Active Sessions",
          value: sessions,
          icon: "🔐",
        },
        { id: "audit", label: "Audit Events", value: auditLogs, icon: "📜" },
        {
          id: "users",
          label: "Recent Accounts",
          value: recentUsers.length,
          icon: "👥",
        },
      ],
      charts: [],
      tables: [
        {
          heading: "Recent Accounts",
          icon: "🆕",
          columns: [
            { key: "name", label: "Name" },
            { key: "phone", label: "Phone" },
            { key: "role", label: "Role" },
            { key: "status", label: "Status" },
            { key: "active", label: "Active" },
            { key: "created", label: "Created" },
          ],
          rows: recentUsers.map((u) => ({
            name: u.fullName ?? "—",
            phone: u.phone,
            role: u.role,
            status: u.status,
            active: u.isActive ? "Yes" : "No",
            created: u.createdAt.toISOString().slice(0, 10),
          })),
        },
      ],
      recommendations: [],
      risks: [],
      metadata: {
        dataPoints: recentUsers.length + auditLogs,
        periodLabel: periodLabel(filters),
        generatedBy,
        hash: "",
        version: "2.0.0",
      },
    });
  }
}

export const adminReportsService = new AdminReportsService();
