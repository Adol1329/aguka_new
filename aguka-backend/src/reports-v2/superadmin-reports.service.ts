import { prisma } from "../prisma.js";
import {
  ReportDefinition,
  ReportFilters,
  TableSection,
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

export interface SuperAdminReportSpec {
  type: string;
  title: string;
  subtitle?: string;
}

export const SUPER_ADMIN_REPORT_SPECS: SuperAdminReportSpec[] = [
  {
    type: "audit",
    title: "Audit Report",
    subtitle: "Comprehensive system audit trail",
  },
  {
    type: "system-health",
    title: "System Health Report",
    subtitle: "Service uptime, response times, error rates",
  },
  {
    type: "backup",
    title: "Backup and Recovery Report",
    subtitle: "Backup history and recovery readiness",
  },
  {
    type: "security",
    title: "Security Report",
    subtitle: "Auth, sessions, suspicious activity",
  },
  {
    type: "national",
    title: "National Agriculture Intelligence Report",
    subtitle: "Cross-district agricultural intelligence",
  },
];

export class SuperAdminReportsService {
  async buildReport(
    spec: SuperAdminReportSpec,
    filters: ReportFilters,
    generatedBy?: string,
  ): Promise<ReportDefinition> {
    let definition: ReportDefinition;
    switch (spec.type) {
      case "audit":
        definition = await this.buildAudit(filters, spec, generatedBy);
        break;
      case "system-health":
        definition = await this.buildSystemHealth(filters, spec, generatedBy);
        break;
      case "backup":
        definition = await this.buildBackup(filters, spec, generatedBy);
        break;
      case "security":
        definition = await this.buildSecurity(filters, spec, generatedBy);
        break;
      case "national":
        definition = await this.buildNational(filters, spec, generatedBy);
        break;
      default:
        throw new Error(`Unknown super admin report type: ${spec.type}`);
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

  private async buildAudit(
    filters: ReportFilters,
    spec: SuperAdminReportSpec,
    generatedBy?: string,
  ): Promise<ReportDefinition> {
    const spatialFilter = buildSpatialFilter(filters);
    const userFilter =
      Object.keys(spatialFilter).length > 0
        ? { user: { farmerProfile: spatialFilter } }
        : {};

    const [total, byAction, recent] = await Promise.all([
      prisma.auditLog.count({
        where: { createdAt: dateRangeFilter(filters), ...userFilter },
      }),
      prisma.auditLog.groupBy({
        by: ["action"],
        where: { createdAt: dateRangeFilter(filters), ...userFilter },
        _count: { action: true },
        orderBy: { _count: { action: "desc" } },
        take: 10,
      }),
      prisma.auditLog.findMany({
        where: { createdAt: dateRangeFilter(filters), ...userFilter },
        orderBy: { createdAt: "desc" },
        take: 25,
        include: { user: { select: { fullName: true, role: true } } },
      }),
    ]);

    return completeReport({
      context: buildContext({
        reportType: `SUPERADMIN-${spec.type.toUpperCase()}`,
        title: spec.title,
        roleScope: "super_admin",
        filters,
        targetName: "System",
        generatedBy,
        signatoryRole: "Super Administrator",
      }),
      executiveSummary: `${total} audit events recorded in the period. Top action: ${byAction[0]?.action ?? "n/a"} (${byAction[0]?._count.action ?? 0} events).`,
      kpis: [
        { id: "total", label: "Total Events", value: total, icon: "📜" },
        {
          id: "actions",
          label: "Unique Actions",
          value: byAction.length,
          icon: "🏷",
        },
        {
          id: "users",
          label: "Distinct Users",
          value: new Set(recent.map((r) => r.userId)).size,
          icon: "👥",
        },
      ],
      charts: [
        {
          heading: "Top Actions",
          icon: "📊",
          type: "bar",
          data: byAction.map((a) => ({
            label: a.action,
            value: a._count.action,
          })),
        },
      ],
      tables: [
        {
          heading: "Recent Audit Events",
          icon: "📋",
          columns: [
            { key: "time", label: "Time" },
            { key: "user", label: "User" },
            { key: "role", label: "Role" },
            { key: "action", label: "Action" },
            { key: "resource", label: "Resource" },
            { key: "ip", label: "IP" },
          ],
          rows: recent.map((r) => ({
            time: r.createdAt.toISOString().slice(0, 19).replace("T", " "),
            user: r.user?.fullName ?? r.userId.slice(0, 8),
            role: r.user?.role ?? "—",
            action: r.action,
            resource: r.resourceType ?? "—",
            ip: r.ipAddress ?? "—",
          })),
        },
      ],
      recommendations: [],
      risks: [],
      metadata: {
        dataPoints: total,
        periodLabel: periodLabel(filters),
        generatedBy,
        hash: "",
        version: "2.0.0",
      },
    });
  }

  private async buildSystemHealth(
    filters: ReportFilters,
    spec: SuperAdminReportSpec,
    generatedBy?: string,
  ): Promise<ReportDefinition> {
    const spatialFilter = buildSpatialFilter(filters);
    const userFilter =
      Object.keys(spatialFilter).length > 0
        ? { user: { farmerProfile: spatialFilter } }
        : {};

    const [services, totalUsers, sessions, devices, payments, errors] =
      await Promise.all([
        prisma.systemHealth.findMany(),
        prisma.user.count({
          where: { isActive: true, farmerProfile: spatialFilter },
        }),
        prisma.session.count({ where: userFilter }),
        prisma.device.count({ where: userFilter }),
        prisma.payment.count({
          where: {
            createdAt: dateRangeFilter(filters),
            status: "failed",
            ...userFilter,
          },
        }),
        prisma.auditLog.count({
          where: {
            createdAt: dateRangeFilter(filters),
            action: { contains: "error" },
            ...userFilter,
          },
        }),
      ]);

    const serviceTable: TableSection = {
      heading: "Service Status",
      icon: "🖥",
      columns: [
        { key: "service", label: "Service" },
        { key: "status", label: "Status" },
        { key: "uptime", label: "Uptime %" },
        { key: "response", label: "Response (ms)" },
        { key: "errors", label: "Errors" },
      ],
      rows: services.map((s) => ({
        service: s.serviceName,
        status: s.status,
        uptime:
          s.uptimePercent !== null && s.uptimePercent !== undefined
            ? `${s.uptimePercent}%`
            : "—",
        response:
          s.responseTimeMs !== null && s.responseTimeMs !== undefined
            ? s.responseTimeMs.toString()
            : "—",
        errors:
          s.errorCount !== null && s.errorCount !== undefined
            ? s.errorCount.toString()
            : "—",
      })),
    };

    return completeReport({
      context: buildContext({
        reportType: `SUPERADMIN-${spec.type.toUpperCase()}`,
        title: spec.title,
        roleScope: "super_admin",
        filters,
        targetName: "System",
        generatedBy,
        signatoryRole: "Super Administrator",
      }),
      executiveSummary: `${services.length} services monitored. ${totalUsers} active users, ${sessions} sessions, ${devices} devices. ${payments} failed payments and ${errors} error events in the period.`,
      kpis: [
        {
          id: "services",
          label: "Services",
          value: services.length,
          icon: "🖥",
        },
        {
          id: "uptime",
          label: "Avg Uptime",
          value: `${average(services.map((s) => asNumber(s.uptimePercent))).toFixed(2)}%`,
          icon: "📈",
        },
        { id: "errors", label: "Failed Payments", value: payments, icon: "❌" },
        { id: "users", label: "Active Users", value: totalUsers, icon: "👥" },
      ],
      charts: [
        {
          heading: "Service Uptime",
          icon: "📈",
          type: "bar",
          data: services.map((s) => ({
            label: s.serviceName,
            value: asNumber(s.uptimePercent),
          })),
          unit: "%",
        },
      ],
      tables: [serviceTable],
      recommendations: services.some((s) => asNumber(s.uptimePercent) < 99)
        ? [
            {
              priority: "high",
              category: "Reliability",
              title: "Investigate services below 99% uptime",
              rationale: "Sustained downtime impacts user trust.",
              action: "Open incident reports and review deployment logs.",
              confidence: "high",
            },
          ]
        : [],
      risks: [],
      metadata: {
        dataPoints: services.length + sessions,
        periodLabel: periodLabel(filters),
        generatedBy,
        hash: "",
        version: "2.0.0",
      },
    });
  }

  private async buildBackup(
    filters: ReportFilters,
    spec: SuperAdminReportSpec,
    generatedBy?: string,
  ): Promise<ReportDefinition> {
    const backups = await prisma.backup.findMany({
      orderBy: { createdAt: "desc" },
      take: 30,
    });
    const completed = backups.filter((b) => b.status === "COMPLETED").length;
    const failed = backups.filter((b) => b.status === "FAILED").length;
    const totalSize = backups.reduce((s, b) => s + (b.sizeBytes ?? 0), 0);

    const table: TableSection = {
      heading: "Recent Backups",
      icon: "💾",
      columns: [
        { key: "name", label: "Name" },
        { key: "type", label: "Type" },
        { key: "status", label: "Status" },
        { key: "size", label: "Size (MB)" },
        { key: "created", label: "Created" },
        { key: "completed", label: "Completed" },
      ],
      rows: backups.map((b) => ({
        name: b.name,
        type: b.type,
        status: b.status,
        size: b.sizeBytes ? (b.sizeBytes / 1024 / 1024).toFixed(2) : "—",
        created: b.createdAt.toISOString().slice(0, 19).replace("T", " "),
        completed:
          b.completedAt?.toISOString().slice(0, 19).replace("T", " ") ?? "—",
      })),
    };

    return completeReport({
      context: buildContext({
        reportType: `SUPERADMIN-${spec.type.toUpperCase()}`,
        title: spec.title,
        roleScope: "super_admin",
        filters,
        targetName: "System",
        generatedBy,
        signatoryRole: "Super Administrator",
      }),
      executiveSummary: `${backups.length} backup(s) in history. ${completed} completed, ${failed} failed. Total size ${(totalSize / 1024 / 1024).toFixed(0)}MB.`,
      kpis: [
        { id: "total", label: "Backups", value: backups.length, icon: "💾" },
        { id: "completed", label: "Completed", value: completed, icon: "✅" },
        { id: "failed", label: "Failed", value: failed, icon: "❌" },
        {
          id: "size",
          label: "Total (MB)",
          value: (totalSize / 1024 / 1024).toFixed(0),
          icon: "📦",
        },
      ],
      charts: [
        {
          heading: "Backup Status",
          icon: "💾",
          type: "pie",
          data: [
            { label: "Completed", value: completed },
            { label: "Failed", value: failed },
            {
              label: "In Progress",
              value: backups.filter((b) => b.status === "IN_PROGRESS").length,
            },
          ],
        },
      ],
      tables: [table],
      recommendations:
        failed > 0
          ? [
              {
                priority: "high",
                category: "Backup",
                title: `Investigate ${failed} failed backup(s)`,
                rationale: "Backup failure jeopardizes disaster recovery.",
                action: "Verify storage credentials and rerun failed backups.",
                confidence: "high",
              },
            ]
          : [],
      risks:
        failed > 0
          ? [
              {
                level: "high",
                category: "Recovery",
                message: `${failed} failed backup(s) detected.`,
                affected: failed,
                recommendation:
                  "Trigger manual backup and audit storage pipeline.",
              },
            ]
          : [],
      metadata: {
        dataPoints: backups.length,
        periodLabel: periodLabel(filters),
        generatedBy,
        hash: "",
        version: "2.0.0",
      },
    });
  }

  private async buildSecurity(
    filters: ReportFilters,
    spec: SuperAdminReportSpec,
    generatedBy?: string,
  ): Promise<ReportDefinition> {
    const spatialFilter = buildSpatialFilter(filters);
    const userFilter =
      Object.keys(spatialFilter).length > 0
        ? { user: { farmerProfile: spatialFilter } }
        : {};

    const [
      totalSessions,
      activeSessions,
      revokedTokens,
      suspendedUsers,
      failedPayments,
      newUsers,
    ] = await Promise.all([
      prisma.session.count({ where: userFilter }),
      prisma.session.count({
        where: { lastUsedAt: dateRangeFilter(filters), ...userFilter },
      }),
      prisma.revokedToken.count({
        where: { revokedAt: dateRangeFilter(filters), ...userFilter },
      }),
      prisma.user.count({
        where: { status: "suspended", farmerProfile: spatialFilter },
      }),
      prisma.payment.count({
        where: {
          createdAt: dateRangeFilter(filters),
          status: "failed",
          ...userFilter,
        },
      }),
      prisma.user.count({
        where: {
          createdAt: dateRangeFilter(filters),
          farmerProfile: spatialFilter,
        },
      }),
    ]);

    return completeReport({
      context: buildContext({
        reportType: `SUPERADMIN-${spec.type.toUpperCase()}`,
        title: spec.title,
        roleScope: "super_admin",
        filters,
        targetName: "System",
        generatedBy,
        signatoryRole: "Super Administrator",
      }),
      executiveSummary: `${totalSessions} sessions, ${activeSessions} active. ${revokedTokens} token revocations and ${suspendedUsers} suspended users. ${failedPayments} failed payments in the period.`,
      kpis: [
        { id: "sessions", label: "Sessions", value: totalSessions, icon: "🔐" },
        { id: "active", label: "Active", value: activeSessions, icon: "🟢" },
        {
          id: "revoked",
          label: "Revoked Tokens",
          value: revokedTokens,
          icon: "🚫",
        },
        {
          id: "suspended",
          label: "Suspended Users",
          value: suspendedUsers,
          icon: "⛔",
        },
      ],
      charts: [],
      tables: [
        {
          heading: "Security Indicators",
          icon: "🔐",
          columns: [
            { key: "metric", label: "Metric" },
            { key: "value", label: "Value" },
          ],
          rows: [
            { metric: "New Users (Period)", value: newUsers.toString() },
            {
              metric: "Failed Payments (Period)",
              value: failedPayments.toString(),
            },
            {
              metric: "Active Session Share",
              value: `${percent(activeSessions, totalSessions, 0).toFixed(0)}%`,
            },
          ],
        },
      ],
      recommendations:
        failedPayments > 5
          ? [
              {
                priority: "medium",
                category: "Security",
                title: "Monitor failed payment rate",
                rationale: `${failedPayments} failed payments may indicate payment gateway issues or abuse.`,
                action: "Review payment logs and enable anomaly detection.",
                confidence: "medium",
              },
            ]
          : [],
      risks: [],
      metadata: {
        dataPoints: totalSessions + revokedTokens,
        periodLabel: periodLabel(filters),
        generatedBy,
        hash: "",
        version: "2.0.0",
      },
    });
  }

  private async buildNational(
    filters: ReportFilters,
    spec: SuperAdminReportSpec,
    generatedBy?: string,
  ): Promise<ReportDefinition> {
    const spatialFilter = buildSpatialFilter(filters);
    const cooperativeFilter =
      Object.keys(spatialFilter).length > 0 && spatialFilter.district
        ? { district: spatialFilter.district }
        : {};

    const farmersByDistrict = await prisma.farmerProfile.groupBy({
      by: ["district"],
      where: spatialFilter,
      _count: { district: true },
      _avg: { farmSizeHectares: true },
    });
    const cooperativesByDistrict = await prisma.cooperative.groupBy({
      by: ["district"],
      where: cooperativeFilter,
      _count: { district: true },
    });
    const soilReadings = await prisma.soilReading.count({
      where: { readingAt: dateRangeFilter(filters), farmer: spatialFilter },
    });
    const crops = await prisma.farmerCrop.count({
      where: { plantedDate: dateRangeFilter(filters), farmer: spatialFilter },
    });
    const totalFarmers = farmersByDistrict.reduce(
      (s, d) => s + d._count.district,
      0,
    );
    const totalCoops = cooperativesByDistrict.reduce(
      (s, d) => s + d._count.district,
      0,
    );

    return completeReport({
      context: buildContext({
        reportType: `SUPERADMIN-${spec.type.toUpperCase()}`,
        title: spec.title,
        roleScope: "super_admin",
        filters,
        targetName: "System",
        generatedBy,
        signatoryRole: "Super Administrator",
      }),
      executiveSummary: `National overview: ${totalFarmers} farmers across ${farmersByDistrict.length} districts, ${totalCoops} cooperatives, ${soilReadings} soil readings and ${crops} crop records in the period.`,
      kpis: [
        {
          id: "farmers",
          label: "Total Farmers",
          value: totalFarmers,
          icon: "🌾",
        },
        {
          id: "districts",
          label: "Districts",
          value: farmersByDistrict.length,
          icon: "📍",
        },
        { id: "coops", label: "Cooperatives", value: totalCoops, icon: "🏛" },
        { id: "crops", label: "Crops (Period)", value: crops, icon: "🌱" },
      ],
      charts: [
        {
          heading: "Farmers by District (Top 15)",
          icon: "📊",
          type: "bar",
          data: farmersByDistrict
            .sort((a, b) => b._count.district - a._count.district)
            .slice(0, 15)
            .map((d) => ({ label: d.district, value: d._count.district })),
        },
      ],
      tables: [
        {
          heading: "District-level Snapshot",
          icon: "📋",
          columns: [
            { key: "district", label: "District" },
            { key: "farmers", label: "Farmers", align: "right" },
            { key: "avgSize", label: "Avg Farm Size (ha)", align: "right" },
            { key: "coops", label: "Coops", align: "right" },
          ],
          rows: farmersByDistrict.map((d) => {
            const coopCount =
              cooperativesByDistrict.find((c) => c.district === d.district)
                ?._count.district ?? 0;
            return {
              district: d.district,
              farmers: d._count.district.toString(),
              avgSize:
                d._avg.farmSizeHectares !== null &&
                d._avg.farmSizeHectares !== undefined
                  ? Number(d._avg.farmSizeHectares).toFixed(2)
                  : "—",
              coops: coopCount.toString(),
            };
          }),
        },
      ],
      recommendations: [],
      risks: [],
      metadata: {
        dataPoints: totalFarmers + soilReadings,
        periodLabel: periodLabel(filters),
        generatedBy,
        hash: "",
        version: "2.0.0",
      },
    });
  }
}

export const superAdminReportsService = new SuperAdminReportsService();
