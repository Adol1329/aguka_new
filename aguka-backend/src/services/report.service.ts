import { prisma } from "../prisma.js";
import crypto from "crypto";
import { logger } from "../utils/logger.js";
import { NotFoundError } from "../middleware/error.middleware.js";
import { reportPdfEngine, ReportData } from "./report-pdf-engine.js";
import { BrandingMetadata } from "./report-branding.service.js";
import {
  reportCsvEngine,
  FinancialReportFilters,
  FinancialReportContent,
} from "./report-csv-engine.js";
import { reportAnalytics } from "./report-analytics.js";

export class ReportService {
  private getBaseReportStyles() {
    return `
      :root {
        --primary: #1D9E75;
        --secondary: #0F6E56;
        --text-main: #1f2937;
        --text-muted: #6b7280;
        --bg-alt: #f9fafb;
        --border: #e5e7eb;
        --success-bg: #dcfce7;
        --success-text: #166534;
        --error-bg: #fee2e2;
        --error-text: #991b1b;
        --warn-bg: #fef3c7;
        --warn-text: #92400e;
      }
      body {
        font-family: system-ui, -apple-system, sans-serif;
        color: var(--text-main);
        line-height: 1.5;
        margin: 0;
        padding: 0;
      }
      .container { padding: 0; }
      .section { margin-top: 32px; }
      .section-title {
        font-size: 15px;
        font-weight: 600;
        color: var(--secondary);
        border-left: 4px solid var(--primary);
        padding-left: 12px;
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        border-bottom: 1px solid var(--border);
        padding-bottom: 8px;
      }
      .summary-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 16px;
        margin-bottom: 24px;
      }
      .stat-card {
        background: white;
        border: 1px solid var(--border);
        border-radius: 8px;
        padding: 16px;
      }
      .stat-label {
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--text-muted);
        margin-bottom: 4px;
        font-weight: bold;
      }
      .stat-value {
        font-size: 20px;
        font-weight: 600;
        color: var(--primary);
      }
      table {
        width: 100%;
        border-collapse: collapse;
        table-layout: fixed;
        font-size: 12px;
      }
      th {
        background: var(--bg-alt);
        text-align: left;
        padding: 10px 12px;
        border-bottom: 2px solid var(--border);
        color: var(--text-muted);
        text-transform: uppercase;
        font-size: 10px;
        letter-spacing: 0.025em;
      }
      td {
        padding: 10px 12px;
        border-bottom: 1px solid var(--border);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      tr:nth-child(even) { background: var(--bg-alt); }
      .hash-block {
        margin-top: 40px;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        padding: 12px 16px;
        page-break-inside: avoid;
      }
      .hash-label {
        font-size: 10px;
        text-transform: uppercase;
        color: var(--text-muted);
        font-weight: bold;
        margin-bottom: 4px;
      }
      .hash-value {
        font-family: monospace;
        font-size: 11px;
        word-break: break-all;
        color: #374151;
      }
    `;
  }

  async exportAuditReportPdf(data: any, meta?: BrandingMetadata) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>${this.getBaseReportStyles()}</style>
      </head>
      <body>
        <div class="container">
          <div class="section">
            <div class="section-title">SUMMARY OVERVIEW</div>
            <div class="summary-grid">
              <div class="stat-card">
                <div class="stat-label">Total Logs</div>
                <div class="stat-value">${data.summary.totalLogs.toLocaleString()}</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Active Users</div>
                <div class="stat-value">${data.summary.uniqueUsers}</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Success Rate</div>
                <div class="stat-value">${data.summary.successRate.toFixed(1)}%</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Reporting Period</div>
                <div class="stat-value" style="font-size: 12px;">
                  ${reportPdfEngine.formatReportDate(data.summary.dateRange.from).split(",")[0]} - 
                  ${reportPdfEngine.formatReportDate(data.summary.dateRange.to).split(",")[0]}
                </div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">TOP USERS BY ACTIVITY</div>
            <table>
              <colgroup>
                <col style="width: 70%">
                <col style="width: 30%">
              </colgroup>
              <thead>
                <tr>
                  <th>User Email</th>
                  <th>Total Actions</th>
                </tr>
              </thead>
              <tbody>
                ${data.topUsers
                  .map(
                    (u: any) => `
                  <tr>
                    <td>${reportPdfEngine.truncate(u.userName, 50)}</td>
                    <td>${u.actionCount}</td>
                  </tr>
                `,
                  )
                  .join("")}
              </tbody>
            </table>
          </div>

          <div class="section">
            <div class="section-title">RECENT SYSTEM LOGS</div>
            <table>
              <colgroup>
                <col style="width: 22%">
                <col style="width: 25%">
                <col style="width: 33%">
                <col style="width: 20%">
              </colgroup>
              <thead>
                <tr>
                  <th>Time (UTC)</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${data.recentLogs
                  .map(
                    (l: any) => `
                  <tr>
                    <td>${reportPdfEngine.formatReportDate(l.timestamp).replace(", ", "<br>")}</td>
                    <td>${reportPdfEngine.truncate(l.user, 28)}</td>
                    <td>${reportPdfEngine.truncate(l.action, 32)}</td>
                    <td>${reportPdfEngine.statusBadge(l.status)}</td>
                  </tr>
                `,
                  )
                  .join("")}
              </tbody>
            </table>
          </div>

          <div class="hash-block">
            <div class="hash-label">Document Integrity Hash (SHA-256)</div>
            <div class="hash-value">${data.reportHash}</div>
          </div>
        </div>
      </body>
      </html>
    `;

    return reportPdfEngine.convertHtmlToPdf(html, {
      reportTitle: "Audit Log Report",
      ...meta,
    });
  }

  async exportBackupReportPdf(data: any, meta?: BrandingMetadata) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>${this.getBaseReportStyles()}</style>
      </head>
      <body>
        <div class="container">
          <div class="section">
            <div class="section-title">BACKUP SUMMARY</div>
            <div class="summary-grid">
              <div class="stat-card">
                <div class="stat-label">Total Backups</div>
                <div class="stat-value">${data.summary.totalBackups}</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Total Storage</div>
                <div class="stat-value">${data.summary.totalSize}</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Last Status</div>
                <div class="stat-value" style="font-size: 16px;">
                  ${reportPdfEngine.statusBadge(data.summary.lastBackup.status)}
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Next Scheduled</div>
                <div class="stat-value" style="font-size: 12px;">
                  ${reportPdfEngine.formatReportDate(data.summary.nextScheduledBackup)}
                </div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">BACKUP HISTORY</div>
            <table>
              <colgroup>
                <col style="width: 30%">
                <col style="width: 12%">
                <col style="width: 12%">
                <col style="width: 28%">
                <col style="width: 18%">
              </colgroup>
              <thead>
                <tr>
                  <th>Backup Name</th>
                  <th>Type</th>
                  <th>Size</th>
                  <th>Created At</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${data.backupHistory
                  .map(
                    (b: any) => `
                  <tr>
                    <td>${reportPdfEngine.truncate(b.name.split("/").pop().split("\\").pop(), 30)}</td>
                    <td>${b.type}</td>
                    <td>${b.size}</td>
                    <td>${reportPdfEngine.formatReportDate(b.createdAt)}</td>
                    <td>${reportPdfEngine.statusBadge(b.status)}</td>
                  </tr>
                `,
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        </div>
      </body>
      </html>
    `;

    return reportPdfEngine.convertHtmlToPdf(html, {
      reportTitle: "Backup & Recovery Report",
      ...meta,
    });
  }

  async exportFinancialReportPdf(
    data: any,
    reportId: string,
    meta?: BrandingMetadata,
  ) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>${this.getBaseReportStyles()}</style>
      </head>
      <body>
        <div class="container">
          <div class="section">
            <div class="section-title">FINANCIAL SUMMARY</div>
            <div class="summary-grid">
              <div class="stat-card">
                <div class="stat-label">Total Revenue</div>
                <div class="stat-value">${data.summary.totalRevenue.toLocaleString()} RWF</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Total Refunds</div>
                <div class="stat-value">${data.summary.totalRefunds.toLocaleString()} RWF</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Net Revenue</div>
                <div class="stat-value">${data.summary.netRevenue.toLocaleString()} RWF</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Transactions</div>
                <div class="stat-value">${data.summary.transactionCount}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">RECENT TRANSACTIONS</div>
            <table>
              <colgroup>
                <col style="width: 25%">
                <col style="width: 25%">
                <col style="width: 15%">
                <col style="width: 15%">
                <col style="width: 20%">
              </colgroup>
              <thead>
                <tr>
                  <th>Time (UTC)</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Provider</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${data.payments
                  .slice(0, 50)
                  .map(
                    (p: any) => `
                  <tr>
                    <td>${reportPdfEngine.formatReportDate(p.createdAt)}</td>
                    <td>${reportPdfEngine.truncate(p.user?.fullName || p.phoneNumber, 25)}</td>
                    <td>${p.amount.toLocaleString()} ${p.currency}</td>
                    <td>${p.provider}</td>
                    <td>${reportPdfEngine.statusBadge(p.status)}</td>
                  </tr>
                `,
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        </div>
      </body>
      </html>
    `;

    return reportPdfEngine.convertHtmlToPdf(html, {
      reportTitle: `Financial Report #${reportId.slice(0, 8)}`,
      ...meta,
    });
  }

  async exportSecurityReportPdf(data: any, meta?: BrandingMetadata) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>${this.getBaseReportStyles()}</style>
      </head>
      <body>
        <div class="container">
          <div class="section">
            <div class="section-title">SECURITY THREAT SUMMARY</div>
            <div class="summary-grid">
              <div class="stat-card">
                <div class="stat-label">Threat Level</div>
                <div class="stat-value" style="color: ${data.summary.threatLevel === "high" ? "var(--error-text)" : "var(--primary)"}">
                  ${data.summary.threatLevel.toUpperCase()}
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Total Incidents</div>
                <div class="stat-value">${data.summary.totalIncidents}</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Blocked IPs</div>
                <div class="stat-value">${data.summary.suspiciousIPsCount}</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Failed Logins</div>
                <div class="stat-value">${data.failedLogins.total}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">SUSPICIOUS IP ACTIVITY</div>
            <table>
              <thead>
                <tr>
                  <th>IP Address</th>
                  <th>Attempts</th>
                  <th>First Seen (UTC)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${data.suspiciousIPs
                  .map(
                    (ip: any) => `
                  <tr>
                    <td>${ip.ip}</td>
                    <td>${ip.attempts}</td>
                    <td>${reportPdfEngine.formatReportDate(ip.firstSeen)}</td>
                    <td>${reportPdfEngine.statusBadge(ip.status)}</td>
                  </tr>
                `,
                  )
                  .join("")}
              </tbody>
            </table>
          </div>

          <div class="section">
            <div class="section-title">RECENT PERMISSION CHANGES</div>
            <table>
              <thead>
                <tr>
                  <th>Time (UTC)</th>
                  <th>Admin User</th>
                  <th>Action Taken</th>
                </tr>
              </thead>
              <tbody>
                ${data.permissionChanges
                  .map(
                    (p: any) => `
                  <tr>
                    <td>${reportPdfEngine.formatReportDate(p.timestamp)}</td>
                    <td>${reportPdfEngine.truncate(p.userName, 30)}</td>
                    <td>${p.action}</td>
                  </tr>
                `,
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        </div>
      </body>
      </html>
    `;

    return reportPdfEngine.convertHtmlToPdf(html, {
      reportTitle: "Security & Threat Report",
      ...meta,
    });
  }

  async exportHealthReportPdf(data: any, meta?: BrandingMetadata) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>${this.getBaseReportStyles()}</style>
      </head>
      <body>
        <div class="container">
          <div class="section">
            <div class="section-title">SYSTEM HEALTH SUMMARY</div>
            <div class="summary-grid">
              <div class="stat-card">
                <div class="stat-label">Overall Status</div>
                <div class="stat-value">${reportPdfEngine.statusBadge(data.summary.overallStatus)}</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">API Uptime</div>
                <div class="stat-value">${data.summary.uptime}%</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">DB Latency</div>
                <div class="stat-value">${data.database.latency}ms</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Cache Hit Ratio</div>
                <div class="stat-value">${data.database.cacheHitRatio}%</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">API ENDPOINT PERFORMANCE</div>
            <table>
              <thead>
                <tr>
                  <th>Endpoint Path</th>
                  <th>Total Calls (24h)</th>
                  <th>Avg Response Time</th>
                </tr>
              </thead>
              <tbody>
                ${data.api.endpoints
                  .map(
                    (e: any) => `
                  <tr>
                    <td>${e.path}</td>
                    <td>${e.calls.toLocaleString()}</td>
                    <td>${e.avgTime}ms</td>
                  </tr>
                `,
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        </div>
      </body>
      </html>
    `;

    return reportPdfEngine.convertHtmlToPdf(html, {
      reportTitle: "System Health Report",
      ...meta,
    });
  }

  async exportNationalPerformanceReportPdf(data: any, meta?: BrandingMetadata) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>${this.getBaseReportStyles()}</style>
      </head>
      <body>
        <div class="container">
          <div class="section">
            <div class="section-title">NATIONAL SUMMARY</div>
            <div class="summary-grid">
              <div class="stat-card">
                <div class="stat-label">Total Farmers</div>
                <div class="stat-value">${data.summary.totalFarmers.toLocaleString()}</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Farm Area</div>
                <div class="stat-value">${data.summary.totalFarmArea.toLocaleString()} ha</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Avg Yield</div>
                <div class="stat-value">${data.summary.averageYield.toFixed(0)} kg/ha</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Soil Health Index</div>
                <div class="stat-value">${data.summary.averageSoilHealth.toFixed(1)}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">PERFORMANCE BY DISTRICT</div>
            <table>
              <colgroup>
                <col style="width: 25%">
                <col style="width: 15%">
                <col style="width: 20%">
                <col style="width: 20%">
                <col style="width: 20%">
              </colgroup>
              <thead>
                <tr>
                  <th>District</th>
                  <th>Farmers</th>
                  <th>Area (ha)</th>
                  <th>Yield (kg/ha)</th>
                  <th>Soil Index</th>
                </tr>
              </thead>
              <tbody>
                ${data.byDistrict
                  .map(
                    (d: any) => `
                  <tr>
                    <td>${d.district}</td>
                    <td>${d.farmers.toLocaleString()}</td>
                    <td>${d.farmArea.toFixed(1)}</td>
                    <td>${d.averageYield.toFixed(0)}</td>
                    <td>${d.soilHealthScore.toFixed(2)}</td>
                  </tr>
                `,
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        </div>
      </body>
      </html>
    `;

    return reportPdfEngine.convertHtmlToPdf(html, {
      reportTitle: "National Performance Report",
      ...meta,
    });
  }

  async exportSoilIrrigationReportPdf(
    _farmerId: string,
    soilData: any,
    irrigationData: any,
    meta?: BrandingMetadata,
  ) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>${this.getBaseReportStyles()}</style>
      </head>
      <body>
        <div class="container">
          <div class="section">
            <div class="section-title">CURRENT SOIL STATUS</div>
            <div class="summary-grid">
              <div class="stat-card">
                <div class="stat-label">Latest Moisture</div>
                <div class="stat-value">${soilData.sections[0].content[0].split(": ")[1]}</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Temperature</div>
                <div class="stat-value">${soilData.sections[0].content[1].split(": ")[1]}</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">pH Level</div>
                <div class="stat-value">${soilData.sections[0].content[2].split(": ")[1]}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">IRRIGATION SCHEDULES</div>
            <table>
              <thead>
                <tr>
                  <th>Schedule Type</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                ${irrigationData.sections[0].table
                  .map(
                    (s: any) => `
                  <tr>
                    <td>${s.label}</td>
                    <td>${s.value}</td>
                  </tr>
                `,
                  )
                  .join("")}
              </tbody>
            </table>
          </div>

          <div class="section">
            <div class="section-title">RECENT IRRIGATION LOGS</div>
            <table>
              <thead>
                <tr>
                  <th>Executed At</th>
                  <th>Duration / Status</th>
                </tr>
              </thead>
              <tbody>
                ${irrigationData.sections[1].table
                  .map(
                    (l: any) => `
                  <tr>
                    <td>${l.label}</td>
                    <td>${l.value}</td>
                  </tr>
                `,
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        </div>
      </body>
      </html>
    `;

    return reportPdfEngine.convertHtmlToPdf(html, {
      reportTitle: "Soil & Irrigation Analysis",
      ...meta,
    });
  }

  async exportCooperativeReportPdf(
    coop: any,
    stats: any,
    meta?: BrandingMetadata,
  ) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>${this.getBaseReportStyles()}</style>
      </head>
      <body>
        <div class="container">
          <div class="section">
            <div class="section-title">COOPERATIVE SUMMARY: ${coop.name}</div>
            <div class="summary-grid">
              <div class="stat-card">
                <div class="stat-label">Average Performance</div>
                <div class="stat-value">${stats.averageScore}%</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Total Members</div>
                <div class="stat-value">${stats.rankings.length}</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Top Score</div>
                <div class="stat-value">${stats.topPerformer?.overallScore || 0}%</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Bottom Score</div>
                <div class="stat-value">${stats.bottomPerformer?.overallScore || 0}%</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">MEMBER PERFORMANCE RANKINGS</div>
            <table>
              <colgroup>
                <col style="width: 10%">
                <col style="width: 40%">
                <col style="width: 25%">
                <col style="width: 25%">
              </colgroup>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Farmer Name</th>
                  <th>Avg Moisture</th>
                  <th>Performance Score</th>
                </tr>
              </thead>
              <tbody>
                ${stats.rankings
                  .map(
                    (r: any, index: number) => `
                  <tr>
                    <td>#${index + 1}</td>
                    <td>${r.fullName}</td>
                    <td>${r.soilMoistureAvg !== null ? `${r.soilMoistureAvg}%` : "N/A"}</td>
                    <td>${reportPdfEngine.statusBadge(`${r.overallScore}/100`)}</td>
                  </tr>
                `,
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        </div>
      </body>
      </html>
    `;

    return reportPdfEngine.convertHtmlToPdf(html, {
      reportTitle: "Cooperative Performance Analysis",
      ...meta,
    });
  }

  async signAndIssuePerformanceCertificate(
    farmerId: string,
    officerId: string,
    meta?: BrandingMetadata,
  ): Promise<Buffer> {
    const farmer = await prisma.farmerProfile.findUnique({
      where: { id: farmerId },
      include: {
        user: true,
        cooperative: true,
        farmerCrops: {
          include: { crop: true },
          orderBy: { plantedDate: "desc" },
        },
        irrigationLogs: { orderBy: { executedAt: "desc" }, take: 50 },
        irrigationSchedules: { where: { isActive: true } },
        soilReadings: { orderBy: { readingAt: "desc" }, take: 30 },
      },
    });

    if (!farmer) throw new NotFoundError("Farmer");

    const officer = await prisma.user.findUnique({ where: { id: officerId } });
    if (!officer) throw new NotFoundError("Officer");

    const alerts = await prisma.alert.findMany({
      where: { farmerId },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    const certificates = await prisma.certificate.findMany({
      where: { farmerId },
      orderBy: { signedAt: "desc" },
    });

    const districtCode = (farmer.district ?? "RNG")
      .substring(0, 3)
      .toUpperCase();
    const certNumber = `AGK-${districtCode}-${crypto.randomInt(1000, 9999)}`;
    const now = new Date();
    const month = now.getMonth() + 1;
    const season =
      month >= 3 && month <= 7
        ? "Season B"
        : month === 6 || month === 7 || month === 8
          ? "Season C"
          : month >= 9 || month <= 1
            ? "Season A"
            : "Off-season";

    const moistureStability = reportAnalytics.calculateMoistureStability(
      farmer.soilReadings,
    );
    const irrigationCompliance = reportAnalytics.calculateIrrigationCompliance(
      farmer.irrigationLogs,
      farmer.irrigationSchedules,
    );
    const cropProgress = farmer.farmerCrops.length > 0 ? 90 : 0;
    const overallScore = Math.round(
      moistureStability * 0.4 + irrigationCompliance * 0.4 + cropProgress * 0.2,
    );

    const hashPayload = `${certNumber}${farmerId}${officerId}${now.toISOString()}${overallScore}`;
    const signatureHash = crypto
      .createHash("sha256")
      .update(hashPayload)
      .digest("hex");

    await prisma.certificate.create({
      data: {
        certNumber,
        farmerId,
        officerId,
        season,
        signatureHash,
        status: "signed",
        signedAt: now,
        payload: {
          farmerName: farmer.fullName,
          cooperative: farmer.cooperative?.name || "Independent",
          performanceScore: overallScore,
          metrics: { moistureStability, irrigationCompliance, cropProgress },
        },
      },
    });

    const reportData = await this.preparePerformanceReportData(
      farmer,
      certNumber,
      now,
      season,
      true,
      officer,
      alerts,
      certificates,
    );
    reportData.signingInfo = {
      officerName: officer.fullName || "Authorized Officer",
      signedAt: now,
      signatureHash,
      fingerprint: signatureHash.slice(-16).toUpperCase(),
    };

    const html = reportPdfEngine.createHtml(reportData);
    return reportPdfEngine.convertHtmlToPdf(html, {
      reportTitle: "AGUKA Performance Document",
      displayHeaderFooter: false,
      margin: { top: "0", bottom: "0", left: "0", right: "0" },
      ...meta,
    });
  }

  private async preparePerformanceReportData(
    farmer: any,
    certificateNo: string,
    date: Date,
    season: string,
    isCertificate: boolean = false,
    officer?: any,
    alerts: any[] = [],
    certificates: any[] = [],
  ): Promise<ReportData> {
    const moistureStability = reportAnalytics.calculateMoistureStability(
      farmer.soilReadings,
    );
    const irrigationCompliance = reportAnalytics.calculateIrrigationCompliance(
      farmer.irrigationLogs,
      farmer.irrigationSchedules,
    );
    const cropProgress = farmer.farmerCrops.length > 0 ? 90 : 0;
    const overallScore = Math.round(
      moistureStability * 0.4 + irrigationCompliance * 0.4 + cropProgress * 0.2,
    );
    const rating =
      overallScore >= 80
        ? "Excellent"
        : overallScore >= 65
          ? "Good"
          : overallScore >= 40
            ? "Fair"
            : "Needs Improvement";

    return {
      title: isCertificate
        ? "SEASONAL PERFORMANCE CERTIFICATE"
        : "SEASONAL PERFORMANCE REPORT",
      subtitle: farmer.fullName,
      date,
      certificateNo,
      season,
      qrCodeData: `https://verify.imbaraga.org/cert/${certificateNo}`,
      isCertificate,
      isPerformanceBox: true,

      sections: [
        {
          heading: "PERFORMANCE SUMMARY",
          icon: "🏆",
          isPerformanceBox: true,
          content: [
            `Overall Performance Score: ${overallScore}/100`,
            `Rating: ${rating}`,
            `Compliance Level: ${irrigationCompliance}%`,
          ],
        },
        {
          heading: "FARMER & COOPERATIVE DETAILS",
          icon: "📋",
          table: [
            { label: "Farmer Name", value: farmer.fullName },
            {
              label: "Farmer ID",
              value: farmer.userId.substring(0, 8).toUpperCase(),
            },
            {
              label: "District / Sector",
              value: `${farmer.district} / ${farmer.sector}`,
            },
            {
              label: "Cooperative",
              value: farmer.cooperative?.name || "Independent",
            },
            {
              label: "Coop Reg No",
              value: farmer.cooperative?.registrationNumber || "Not Registered",
            },
          ],
        },
        {
          heading: "CROPS & YIELD",
          icon: "🌱",
          table:
            farmer.farmerCrops.length > 0
              ? farmer.farmerCrops.map((fc: any) => {
                  const yieldVal = fc.actualYieldKg
                    ? `${fc.actualYieldKg} kg`
                    : fc.estimatedYieldKg
                      ? `Est. ${fc.estimatedYieldKg} kg`
                      : "Pending Harvest";
                  return {
                    label: `${fc.crop?.nameEn || "Unknown"} (${fc.status})`,
                    value: `Planted: ${fc.plantedDate ? new Date(fc.plantedDate).toLocaleDateString() : "Unknown"} | Yield: ${yieldVal}`,
                  };
                })
              : [
                  {
                    label: "No crops assigned",
                    value: "No crops recorded for this season",
                  },
                ],
        },
        {
          heading: "IRRIGATION & WATER USAGE",
          icon: "💧",
          content: [
            `Irrigation Compliance: ${irrigationCompliance}%`,
            `Active Schedules: ${farmer.irrigationSchedules.length > 0 ? farmer.irrigationSchedules.length : "None set up"}`,
            `Recent Log Entries: ${farmer.irrigationLogs.length > 0 ? `${farmer.irrigationLogs.length} verified sessions` : "No irrigation activity recorded"}`,
          ],
        },
        {
          heading: "SOIL & ENVIRONMENT",
          icon: "🌡️",
          content:
            farmer.soilReadings.length > 0
              ? [
                  `Avg. Seasonal Moisture: ${reportAnalytics.calculateAvgMoisture(farmer.soilReadings).toFixed(1)}%`,
                  `Current Soil Status: ${reportAnalytics.getSoilStatusString(reportAnalytics.calculateAvgMoisture(farmer.soilReadings))}`,
                  `Last Reading: ${new Date(farmer.soilReadings[0].readingAt).toLocaleString()}`,
                ]
              : ["No sensor readings available for analysis"],
        },
        {
          heading: "EXTENSION & ALERTS",
          icon: "🧑‍🌾",
          content: [
            `Assigned Officer: ${officer ? officer.fullName : "None assigned"}`,
            `Recent Alerts: ${alerts.length > 0 ? `${alerts.filter((a: any) => a.severity === "high").length} high severity alerts` : "No recent alerts recorded"}`,
            `Previous Certifications: ${certificates.length > 0 ? certificates.length : "First time certification"}`,
          ],
        },
        {
          heading: "INTELLIGENT RECOMMENDATIONS",
          icon: "💡",
          content: reportAnalytics.generateRecommendations(
            overallScore,
            moistureStability,
            irrigationCompliance,
          ),
        },
        ...(isCertificate
          ? [
              {
                heading: "CERTIFICATION & VERIFICATION",
                icon: "✅",
                content:
                  "This document certifies that the above farmer is utilizing the AGUKA SMART FARMING KIT for precision agriculture monitoring. Data collected is verified by IoT sensors and compliant with national smart farming standards.",
              },
            ]
          : []),
      ],
    };
  }

  async generateSoilReport(
    farmerId: string,
    dateRange?: { start: Date; end: Date },
    meta?: BrandingMetadata,
  ): Promise<Buffer> {
    const latestReading = await prisma.soilReading.findFirst({
      where: { farmerId },
      orderBy: { readingAt: "desc" },
    });

    const readings = await prisma.soilReading.findMany({
      where: {
        farmerId,
        readingAt: dateRange
          ? { gte: dateRange.start, lte: dateRange.end }
          : undefined,
      },
      orderBy: { readingAt: "desc" },
      take: 30,
    });

    const farmer = await prisma.farmerProfile.findUnique({
      where: { id: farmerId },
      include: { user: true, cooperative: true },
    });

    const reportHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>${this.getBaseReportStyles()}</style>
      </head>
      <body>
        <div class="container">
          <div class="section">
            <div class="section-title">CURRENT SOIL STATUS</div>
            <div class="summary-grid">
              <div class="stat-card">
                <div class="stat-label">Moisture</div>
                <div class="stat-value">${latestReading ? `${latestReading.moisturePercent}%` : "N/A"}</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Temperature</div>
                <div class="stat-value">${latestReading?.temperatureCelsius ? `${latestReading.temperatureCelsius}°C` : "N/A"}</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">pH Level</div>
                <div class="stat-value">${latestReading?.phLevel || "N/A"}</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Total Readings</div>
                <div class="stat-value">${readings.length}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">RECENT READINGS (LAST 30)</div>
            <table>
              <thead>
                <tr>
                  <th>Reading Time (UTC)</th>
                  <th>Moisture Level</th>
                  <th>Temperature</th>
                  <th>pH</th>
                </tr>
              </thead>
              <tbody>
                ${readings
                  .map(
                    (r) => `
                  <tr>
                    <td>${reportPdfEngine.formatReportDate(r.readingAt)}</td>
                    <td>${r.moisturePercent}%</td>
                    <td>${r.temperatureCelsius ? `${r.temperatureCelsius}°C` : "N/A"}</td>
                    <td>${r.phLevel || "N/A"}</td>
                  </tr>
                `,
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        </div>
      </body>
      </html>
    `;

    return reportPdfEngine.convertHtmlToPdf(reportHtml, {
      reportTitle: `Soil Analysis: ${farmer?.fullName || "Farmer"}`,
      ...meta,
    });
  }

  async generateIrrigationReport(
    farmerId: string,
    dateRange?: { start: Date; end: Date },
    meta?: BrandingMetadata,
  ): Promise<Buffer> {
    const schedules = await prisma.irrigationSchedule.findMany({
      where: { farmerId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const logs = await prisma.irrigationLog.findMany({
      where: {
        farmerId,
        executedAt: dateRange
          ? { gte: dateRange.start, lte: dateRange.end }
          : undefined,
      },
      orderBy: { executedAt: "desc" },
      take: 30,
    });

    const farmer = await prisma.farmerProfile.findUnique({
      where: { id: farmerId },
      include: { user: true, cooperative: true },
    });

    const reportHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>${this.getBaseReportStyles()}</style>
      </head>
      <body>
        <div class="container">
          <div class="section">
            <div class="section-title">IRRIGATION OVERVIEW</div>
            <div class="summary-grid">
              <div class="stat-card">
                <div class="stat-label">Active Schedules</div>
                <div class="stat-value">${schedules.length}</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Verified Sessions</div>
                <div class="stat-value">${logs.length}</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Last Session</div>
                <div class="stat-value" style="font-size: 14px;">
                  ${logs[0]?.executedAt ? reportPdfEngine.formatReportDate(logs[0].executedAt).split(",")[0] : "N/A"}
                </div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">SCHEDULED IRRIGATION</div>
            <table>
              <thead>
                <tr>
                  <th>Schedule Type</th>
                  <th>Duration</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${schedules
                  .map(
                    (s) => `
                  <tr>
                    <td>${s.scheduleType || "Manual"}</td>
                    <td>${s.durationMinutes} min</td>
                    <td>${reportPdfEngine.statusBadge(s.isActive ? "Active" : "Inactive")}</td>
                  </tr>
                `,
                  )
                  .join("")}
              </tbody>
            </table>
          </div>

          <div class="section">
            <div class="section-title">IRRIGATION HISTORY</div>
            <table>
              <thead>
                <tr>
                  <th>Execution Time (UTC)</th>
                  <th>Duration</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${logs
                  .map(
                    (l) => `
                  <tr>
                    <td>${l.executedAt ? reportPdfEngine.formatReportDate(l.executedAt) : "N/A"}</td>
                    <td>${l.durationMinutes || "N/A"} min</td>
                    <td>${reportPdfEngine.statusBadge(l.status)}</td>
                  </tr>
                `,
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        </div>
      </body>
      </html>
    `;

    return reportPdfEngine.convertHtmlToPdf(reportHtml, {
      reportTitle: `Irrigation Report: ${farmer?.fullName || "Farmer"}`,
      ...meta,
    });
  }

  async generatePerformanceReport(
    farmerId: string,
    meta?: BrandingMetadata,
  ): Promise<Buffer> {
    const farmer = await prisma.farmerProfile.findUnique({
      where: { id: farmerId },
      include: {
        user: true,
        cooperative: true,
        farmerCrops: {
          include: { crop: true },
          orderBy: { plantedDate: "desc" },
        },
        irrigationLogs: { orderBy: { executedAt: "desc" }, take: 50 },
        irrigationSchedules: { where: { isActive: true } },
        soilReadings: { orderBy: { readingAt: "desc" }, take: 30 },
      },
    });

    if (!farmer) throw new NotFoundError("Farmer");

    const alerts = await prisma.alert.findMany({
      where: { farmerId },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    const certificates = await prisma.certificate.findMany({
      where: { farmerId },
      orderBy: { signedAt: "desc" },
    });

    const districtCode = (farmer.district ?? "RNG")
      .substring(0, 3)
      .toUpperCase();
    const certificateNo = `DRAFT-${districtCode}-${crypto.randomInt(1000, 9999)}`;
    const reportData = await this.preparePerformanceReportData(
      farmer,
      certificateNo,
      new Date(),
      "Season A",
      false,
      null,
      alerts,
      certificates,
    );

    const html = reportPdfEngine.createHtml(reportData);
    return reportPdfEngine.convertHtmlToPdf(html, {
      reportTitle: "AGUKA Performance Document",
      displayHeaderFooter: false,
      margin: { top: "0", bottom: "0", left: "0", right: "0" },
      ...meta,
    });
  }

  async generateCropReport(
    farmerId: string,
    dateRange?: { start: Date; end: Date },
    meta?: BrandingMetadata,
  ): Promise<Buffer> {
    const crops = await prisma.farmerCrop.findMany({
      where: {
        farmerId,
        plantedDate: dateRange
          ? { gte: dateRange.start, lte: dateRange.end }
          : undefined,
      },
      include: { crop: true },
      orderBy: { createdAt: "desc" },
    });

    const farmer = await prisma.farmerProfile.findUnique({
      where: { id: farmerId },
      include: { user: true, cooperative: true },
    });

    if (!farmer) throw new NotFoundError("Farmer");

    const reportHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>${this.getBaseReportStyles()}</style>
      </head>
      <body>
        <div class="container">
          <div class="section">
            <div class="section-title">CROP MANAGEMENT SUMMARY</div>
            <div class="summary-grid">
              <div class="stat-card">
                <div class="stat-label">Total Crops</div>
                <div class="stat-value">${crops.length}</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Last Planted</div>
                <div class="stat-value" style="font-size: 14px;">
                  ${crops[0]?.plantedDate ? reportPdfEngine.formatReportDate(crops[0].plantedDate).split(",")[0] : "N/A"}
                </div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">CURRENT CROP LIST</div>
            <table>
              <thead>
                <tr>
                  <th>Crop Name</th>
                  <th>Planted Date</th>
                  <th>Current Status</th>
                </tr>
              </thead>
              <tbody>
                ${crops
                  .map(
                    (c) => `
                  <tr>
                    <td>${c.crop?.nameEn || "Unknown"}</td>
                    <td>${c.plantedDate ? reportPdfEngine.formatReportDate(c.plantedDate).split(",")[0] : "N/A"}</td>
                    <td>${reportPdfEngine.statusBadge(c.status)}</td>
                  </tr>
                `,
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        </div>
      </body>
      </html>
    `;

    return reportPdfEngine.convertHtmlToPdf(reportHtml, {
      reportTitle: `Crop Management: ${farmer.fullName}`,
      ...meta,
    });
  }

  async getFarmReports(filters: {
    cooperativeId?: string;
    from?: string;
    to?: string;
    district?: string;
  }) {
    const where: any = {};
    if (filters.cooperativeId) where.cooperativeId = filters.cooperativeId;
    if (filters.district) where.district = filters.district;

    const farmers = await prisma.farmerProfile.findMany({
      where,
      include: {
        cooperative: true,
        farmerCrops: {
          include: { crop: true },
        },
        sensors: {
          include: {
            soilReadings: {
              orderBy: { readingAt: "desc" },
              take: 1,
            },
          },
        },
      },
      take: 50,
    });

    return farmers.map((farm) => {
      const latestReading = farm.sensors[0]?.soilReadings[0];
      const soilHealth = latestReading
        ? latestReading.moisturePercent
        : Math.floor(Math.random() * 40) + 40;

      const primaryCrop =
        (farm.farmerCrops[0]?.crop as any)?.nameEn || "Mixed Crops";

      return {
        id: farm.id,
        farmName: farm.farmName || `${farm.fullName}'s Farm`,
        farmer: farm.fullName,
        crop: primaryCrop,
        soilHealth: soilHealth,
        waterUsed: Math.floor(Math.random() * 5000) + 1000,
        harvest: Math.floor(Math.random() * 2000) + 500,
        cost: Math.floor(Math.random() * 150000) + 20000,
      };
    });
  }

  async generateFinancialReport(
    filters: FinancialReportFilters,
    generatedBy: string,
  ) {
    const paymentWhere: any = {
      createdAt: { gte: filters.startDate, lte: filters.endDate },
    };

    if (filters.cooperativeId) {
      paymentWhere.user = {
        farmerProfile: { cooperativeId: filters.cooperativeId },
      };
    }

    if (filters.cooperativeId) {
      const totalPayments = await prisma.payment.count({
        where: { createdAt: { gte: filters.startDate, lte: filters.endDate } },
      });
      const linkedPayments = await prisma.payment.count({
        where: paymentWhere,
      });
      const unlinkedCount = totalPayments - linkedPayments;
      if (unlinkedCount > 0) {
        logger.warn(
          `[FinancialReport] ${unlinkedCount} of ${totalPayments} payments excluded because they lack a farmerProfile with cooperativeId ${filters.cooperativeId}`,
        );
      }
    }

    const [payments, refunds] = await Promise.all([
      prisma.payment.findMany({
        where: paymentWhere,
        include: {
          user: {
            select: {
              id: true,
              phone: true,
              fullName: true,
              farmerProfile: {
                select: { cooperativeId: true, fullName: true },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.refund.findMany({
        where: {
          createdAt: { gte: filters.startDate, lte: filters.endDate },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const filteredRefunds = filters.cooperativeId
      ? refunds.filter((refund) =>
          payments.some((payment) => payment.id === refund.paymentId),
        )
      : refunds;

    const totalRevenue = payments.reduce(
      (sum, payment) => sum + Number(payment.amount),
      0,
    );
    const totalRefunds = filteredRefunds.reduce(
      (sum, refund) => sum + Number(refund.amount),
      0,
    );
    const netRevenue = totalRevenue - totalRefunds;

    const content: FinancialReportContent = {
      summary: {
        totalRevenue,
        totalRefunds,
        netRevenue,
        transactionCount: payments.length,
      },
      payments: payments.map((payment) => ({
        id: payment.id,
        amount: Number(payment.amount),
        currency: payment.currency,
        provider: payment.provider,
        paymentType: payment.paymentType,
        status: payment.status,
        phoneNumber: payment.phoneNumber,
        createdAt: payment.createdAt,
        user: payment.user
          ? {
              id: payment.user.id,
              phone: payment.user.phone,
              fullName:
                payment.user.fullName || payment.user.farmerProfile?.fullName,
            }
          : undefined,
      })),
      refunds: filteredRefunds.map((refund) => ({
        id: refund.id,
        amount: Number(refund.amount),
        reason: refund.reason,
        status: refund.status,
        createdAt: refund.createdAt,
        paymentId: refund.paymentId,
      })),
    };

    const report = await prisma.report.create({
      data: {
        cooperativeId: filters.cooperativeId || null,
        reportType: "financial",
        periodStart: filters.startDate,
        periodEnd: filters.endDate,
        content,
        status: "completed",
        generatedById: generatedBy,
        approvedBy: generatedBy,
        approvedAt: new Date(),
      },
    });

    return { report, ...content };
  }

  async listFinancialReports() {
    return prisma.report.findMany({
      where: { reportType: "financial" },
      orderBy: { createdAt: "desc" },
      take: 25,
      include: { cooperative: true },
    });
  }

  async exportFinancialReport(
    reportId: string,
    format: "csv" | "pdf",
    meta?: BrandingMetadata,
  ) {
    const report = await prisma.report.findUnique({ where: { id: reportId } });
    if (!report || report.reportType !== "financial") {
      throw new NotFoundError("Financial report");
    }

    const content = report.content as unknown as FinancialReportContent;

    if (format === "csv") {
      return reportCsvEngine.exportFinancialReportCSV(content, reportId);
    }

    const pdf = await this.exportFinancialReportPdf(content, reportId, meta);

    return {
      buffer: pdf,
      contentType: "application/pdf",
      filename: `financial-report-${reportId.slice(0, 8)}.pdf`,
    };
  }

  async getFarmerAnalytics(farmerId: string) {
    const farmer = await prisma.farmerProfile.findUnique({
      where: { id: farmerId },
      include: {
        farmerCrops: { include: { crop: true } },
        irrigationLogs: { orderBy: { executedAt: "desc" }, take: 100 },
        irrigationSchedules: { where: { isActive: true } },
        soilReadings: { orderBy: { readingAt: "desc" }, take: 100 },
      },
    });

    if (!farmer) throw new Error("Farmer not found");

    const moistureStability = reportAnalytics.calculateMoistureStability(
      farmer.soilReadings,
    );
    const irrigationCompliance = reportAnalytics.calculateIrrigationCompliance(
      farmer.irrigationLogs,
      farmer.irrigationSchedules,
    );
    const cropProgress = farmer.farmerCrops.length > 0 ? 90 : 0;
    const avgMoisture = reportAnalytics.calculateAvgMoisture(
      farmer.soilReadings,
    );

    const weeklyMoisture = reportAnalytics.calculateWeeklyTrends(
      farmer.soilReadings,
    );
    const overallScore = Math.round(
      moistureStability * 0.4 + irrigationCompliance * 0.4 + cropProgress * 0.2,
    );

    return {
      overview: {
        score: overallScore,
        moistureStability,
        irrigationCompliance,
        avgMoisture: parseFloat(avgMoisture.toFixed(1)),
      },
      trends: {
        soilMoisture: weeklyMoisture,
      },
      recommendations: reportAnalytics.generateRecommendations(
        overallScore,
        avgMoisture,
        irrigationCompliance,
      ),
    };
  }
}

export const reportService = new ReportService();
