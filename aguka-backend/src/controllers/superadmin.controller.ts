import { Request, Response, NextFunction } from "express";
import { superAdminService } from "../services/superAdmin.service.js";
import { reportService } from "../services/report.service.js";
import { reportsImplementationService } from "../services/superAdminReportsImplementation.service.js";
import { convertToCSV, generatePDFReport } from "../utils/reportExports.js";
import { RequestWithUser } from "../types/index.js";

export const getDashboardStats = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const stats = await superAdminService.getDashboardStats();
    return res.json({ success: true, data: stats });
  } catch (error: any) {
    return next(error);
  }
};

export const getAllUsers = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { page, limit, role, search, status } = req.query;
    const result = await superAdminService.getAllUsers({
      page: Number(page) || 1,
      limit: Number(limit) || 20,
      role: role as string,
      search: search as string,
      status: status as string,
    });
    return res.json({ success: true, data: result });
  } catch (error: any) {
    return next(error);
  }
};

export const createUser = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await superAdminService.createUser(req.body);
    return res
      .status(201)
      .json({ success: true, data: { id: user.id, phone: user.phone } });
  } catch (error: any) {
    return next(error);
  }
};

export const updateUser = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await superAdminService.updateUser(
      req.params.id,
      req.body,
      req.user!.sub,
    );
    return res.json({ success: true, data: user });
  } catch (error: any) {
    return next(error);
  }
};

export const deleteUser = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    await superAdminService.deleteUser(req.params.id, req.user!.sub);
    return res.json({ success: true, message: "User deleted" });
  } catch (error: any) {
    return next(error);
  }
};

export const getAuditLogs = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { page, limit, userId, action } = req.query;
    const result = await superAdminService.getAuditLogs({
      page: Number(page) || 1,
      limit: Number(limit) || 50,
      userId: userId as string,
      action: action as string,
    });
    return res.json({ success: true, data: result });
  } catch (error: any) {
    return next(error);
  }
};

export const getSystemHealth = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const health = await superAdminService.getSystemHealth();
    return res.json({ success: true, data: health });
  } catch (error: any) {
    return next(error);
  }
};

export const getReports = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const reports = await superAdminService.getReports();
    return res.json({ success: true, data: reports });
  } catch (error: any) {
    return next(error);
  }
};

export const getCooperatives = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const coops = await superAdminService.getCooperatives();
    return res.json({ success: true, data: coops });
  } catch (error: any) {
    return next(error);
  }
};

export const getBackups = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const backups = await superAdminService.getBackups();
    return res.json({ success: true, data: backups });
  } catch (error: any) {
    return next(error);
  }
};

export const createBackup = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const backup = await superAdminService.createBackup(req.user!.sub);
    return res.status(201).json({ success: true, data: backup });
  } catch (error: any) {
    return next(error);
  }
};

export const deleteBackup = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await superAdminService.deleteBackup(req.params.id);
    return res.json({ success: true, data: result });
  } catch (error: any) {
    return next(error);
  }
};

export const restoreBackup = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await superAdminService.restoreBackup(req.params.id);
    return res.json({ success: true, data: result });
  } catch (error: any) {
    return next(error);
  }
};

export const downloadBackup = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const backup = await superAdminService.getBackupDownload(req.params.id);
    return res.download(backup.filePath, backup.filename);
  } catch (error: any) {
    return next(error);
  }
};

export const getSettings = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const settings = await superAdminService.getSystemSettings();
    return res.json({ success: true, data: settings });
  } catch (error: any) {
    return next(error);
  }
};

export const updateSetting = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { value } = req.body;
    const setting = await superAdminService.updateSystemSetting(
      req.params.key,
      value,
      req.user!.sub,
    );
    return res.json({ success: true, data: setting });
  } catch (error: any) {
    return next(error);
  }
};

export const updateSettings = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const settings = await superAdminService.updateSystemSettings(
      req.body,
      req.user!.sub,
    );
    return res.json({ success: true, data: settings });
  } catch (error: any) {
    return next(error);
  }
};

export const getRoles = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const roles = await superAdminService.getRoles();
    return res.json({ success: true, data: roles });
  } catch (error: any) {
    return next(error);
  }
};

export const getBackupSchedule = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const schedule = await superAdminService.getBackupSchedule();
    return res.json({ success: true, data: schedule });
  } catch (error: any) {
    return next(error);
  }
};

export const saveBackupSchedule = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const schedule = await superAdminService.saveBackupSchedule(req.body);
    return res.json({ success: true, data: schedule });
  } catch (error: any) {
    return next(error);
  }
};

export const getCustomRoles = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const roles = await superAdminService.getCustomRoles();
    return res.json({ success: true, data: roles });
  } catch (error: any) {
    return next(error);
  }
};

export const saveCustomRoles = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const roles = await superAdminService.saveCustomRoles(req.body);
    return res.json({ success: true, data: roles });
  } catch (error: any) {
    return next(error);
  }
};

export const updateRolePermissions = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { role } = req.params;
    const { permissions } = req.body;
    const result = await superAdminService.updateRolePermissions(
      role,
      permissions,
    );
    return res.json({ success: true, data: result });
  } catch (error: any) {
    return next(error);
  }
};

// ─── FEATURE 1: MERGE ACCOUNTS ───────────────

export const mergeUsers = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { primaryUserId, secondaryUserId } = req.body;
    const result = await superAdminService.mergeUsers({
      primaryUserId,
      secondaryUserId,
      adminId: req.user!.sub,
    });
    return res.json({ success: true, data: result });
  } catch (error: any) {
    return next(error);
  }
};

// ─── FEATURE 2: RESET PASSWORD ───────────────

export const resetUserPassword = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await superAdminService.resetUserPassword(
      req.params.id,
      req.user!.sub,
    );
    return res.json({ success: true, data: result });
  } catch (error: any) {
    return next(error);
  }
};

// ─── FEATURE 3: FEATURE FLAGS ────────────────

export const getFeatureFlags = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const flags = await superAdminService.getFeatureFlags();
    return res.json({ success: true, data: flags });
  } catch (error: any) {
    return next(error);
  }
};

export const updateFeatureFlags = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { flags } = req.body;
    const result = await superAdminService.updateFeatureFlags(
      flags,
      req.user!.sub,
    );
    return res.json({ success: true, data: result });
  } catch (error: any) {
    return next(error);
  }
};

// ─── FEATURE 4: PASSWORD POLICY ──────────────

export const getPasswordPolicy = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const policy = await superAdminService.getPasswordPolicy();
    return res.json({ success: true, data: policy });
  } catch (error: any) {
    return next(error);
  }
};

export const updatePasswordPolicy = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await superAdminService.updatePasswordPolicy(
      req.body,
      req.user!.sub,
    );
    return res.json({ success: true, data: result });
  } catch (error: any) {
    return next(error);
  }
};

// ─── FEATURE 5: AUDIT RETENTION ──────────────

export const getAuditRetention = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const retention = await superAdminService.getAuditRetention();
    return res.json({ success: true, data: retention });
  } catch (error: any) {
    return next(error);
  }
};

export const updateAuditRetention = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await superAdminService.updateAuditRetention(
      req.body,
      req.user!.sub,
    );
    return res.json({ success: true, data: result });
  } catch (error: any) {
    return next(error);
  }
};

export const cleanupAuditLogs = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await superAdminService.cleanupAuditLogs(req.user!.sub);
    return res.json({ success: true, data: result });
  } catch (error: any) {
    return next(error);
  }
};

// ─── FEATURE 6: FORCE LOGOUT ─────────────────

export const forceLogoutUser = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await superAdminService.forceLogoutUser(
      req.params.id,
      req.user!.sub,
    );
    return res.json({ success: true, data: result });
  } catch (error: any) {
    return next(error);
  }
};

// ─── SUPER ADMIN REPORTS IMPLEMENTATION ─────────────────

export const getAuditReportData = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await reportsImplementationService.getAuditReportData();
    return res.json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

export const getHealthReportData = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await reportsImplementationService.getHealthReportData();
    return res.json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

export const getBackupReportData = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await reportsImplementationService.getBackupReportData();
    return res.json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

export const getSecurityReportData = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await reportsImplementationService.getSecurityReportData();
    return res.json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

export const getNationalReportData = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await reportsImplementationService.getNationalReportData();
    return res.json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

import {
  reportExcelEngine,
  ExcelSheetData,
} from "../services/report-excel-engine.js";
import { BrandingMetadata } from "../services/report-branding.service.js";

const handleExport = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
  title: string,
  getDataFn: () => Promise<any>,
  mapTables: (data: any) => any[],
) => {
  try {
    const { format } = req.body;
    const data = await getDataFn();
    const tables = mapTables(data);

    const metadata: BrandingMetadata = {
      reportTitle: title,
      userRole: req.user?.role?.toUpperCase(),
      generatedBy: req.user?.sub, // Using sub as placeholder, ideally fullName if available in req.user
      generatedAt: new Date(),
    };

    if (format === "csv") {
      const csvData = tables.flatMap((t) =>
        t.rows.map((r: any) => {
          const rowObj: any = {};
          t.headers.forEach((h: any, i: number) => {
            rowObj[h] = r[i];
          });
          return { Table: t.title, ...rowObj };
        }),
      );
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${title.replace(/ /g, "_")}.csv`,
      );
      return res.send(convertToCSV(csvData, metadata));
    } else if (format === "excel") {
      const sheets: ExcelSheetData[] = tables.map((t) => ({
        name: t.title.substring(0, 30),
        headers: t.headers,
        rows: t.rows,
      }));

      const excelBuffer = await reportExcelEngine.generateBrandedExcel(
        sheets,
        metadata,
      );

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${title.replace(/ /g, "_")}.xlsx`,
      );
      return res.send(excelBuffer);
    } else {
      let pdfBuffer: Buffer;
      if (title === "Audit Log Report") {
        pdfBuffer = await reportService.exportAuditReportPdf(data, metadata);
      } else if (title === "Backup & Recovery Report") {
        pdfBuffer = await reportService.exportBackupReportPdf(data, metadata);
      } else if (title === "National Performance Report") {
        pdfBuffer = await reportService.exportNationalPerformanceReportPdf(
          data,
          metadata,
        );
      } else if (title === "Security & Threat Report") {
        pdfBuffer = await reportService.exportSecurityReportPdf(data, metadata);
      } else if (title === "System Health Report") {
        pdfBuffer = await reportService.exportHealthReportPdf(data, metadata);
      } else {
        return generatePDFReport(
          res,
          title,
          JSON.stringify(data.summary, null, 2),
          tables,
          data.reportHash,
        );
      }

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${title.replace(/ /g, "_")}.pdf`,
      );
      return res.send(pdfBuffer);
    }
  } catch (error) {
    return next(error);
  }
};

export const exportAuditReport = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  return handleExport(
    req,
    res,
    next,
    "Audit Log Report",
    () => reportsImplementationService.getAuditReportData(),
    (data) => [
      {
        title: "Top Users",
        headers: ["User", "Actions"],
        rows: data.topUsers.map((u: any) => [
          u.userName,
          String(u.actionCount),
        ]),
      },
      {
        title: "Recent Logs",
        headers: ["Time", "User", "Action", "Status"],
        rows: data.recentLogs.map((l: any) => [
          l.timestamp,
          l.user,
          l.action,
          l.status,
        ]),
      },
    ],
  );
};

export const exportHealthReport = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  return handleExport(
    req,
    res,
    next,
    "System Health Report",
    () => reportsImplementationService.getHealthReportData(),
    (data) => [
      {
        title: "API Endpoints",
        headers: ["Path", "Calls", "Avg Time (ms)"],
        rows: data.api.endpoints.map((e: any) => [
          e.path,
          String(e.calls),
          String(e.avgTime),
        ]),
      },
    ],
  );
};

export const exportBackupReport = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  return handleExport(
    req,
    res,
    next,
    "Backup & Recovery Report",
    () => reportsImplementationService.getBackupReportData(),
    (data) => [
      {
        title: "Backup History",
        headers: ["Name", "Type", "Size", "Created", "Status"],
        rows: data.backupHistory.map((b: any) => [
          b.name,
          b.type,
          b.size,
          b.createdAt,
          b.status,
        ]),
      },
    ],
  );
};

export const exportSecurityReport = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  return handleExport(
    req,
    res,
    next,
    "Security & Threat Report",
    () => reportsImplementationService.getSecurityReportData(),
    (data) => [
      {
        title: "Suspicious IPs",
        headers: ["IP", "Attempts", "First Seen", "Status"],
        rows: data.suspiciousIPs.map((ip: any) => [
          ip.ip,
          String(ip.attempts),
          ip.firstSeen,
          ip.status,
        ]),
      },
      {
        title: "Permission Changes",
        headers: ["Time", "User", "Action", "IP"],
        rows: data.permissionChanges.map((p: any) => [
          p.timestamp,
          p.userName,
          p.action,
          p.ip,
        ]),
      },
    ],
  );
};

export const exportNationalReport = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  return handleExport(
    req,
    res,
    next,
    "National Performance Report",
    () => reportsImplementationService.getNationalReportData(),
    (data) => [
      {
        title: "By District",
        headers: [
          "District",
          "Farmers",
          "Area (ha)",
          "Avg Yield",
          "Soil Score",
        ],
        rows: data.byDistrict.map((d: any) => [
          d.district,
          String(d.farmers),
          String(d.farmArea),
          String(d.averageYield.toFixed(2)),
          String(d.soilHealthScore.toFixed(2)),
        ]),
      },
      {
        title: "By Crop",
        headers: ["Crop", "Total Prod (kg)", "Avg Yield (kg/ha)"],
        rows: data.byCrop.map((c: any) => [
          c.crop,
          String(c.totalProduction),
          String(c.averageYield.toFixed(2)),
        ]),
      },
    ],
  );
};
