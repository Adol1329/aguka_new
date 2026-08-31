import { Request, Response, NextFunction } from "express";
import { ReportFormat, ReportError, renderReport } from "./index.js";
import {
  farmerReportsService,
  FARMER_REPORT_SPECS,
} from "./farmer-reports.service.js";
import {
  officerReportsService,
  OFFICER_REPORT_SPECS,
} from "./officer-reports.service.js";
import {
  cooperativeReportsService,
  COOPERATIVE_REPORT_SPECS,
} from "./cooperative-reports.service.js";
import {
  adminReportsService,
  ADMIN_REPORT_SPECS,
} from "./admin-reports.service.js";
import {
  superAdminReportsService,
  SUPER_ADMIN_REPORT_SPECS,
} from "./superadmin-reports.service.js";
import { UserRole } from "../types/index.js";
import { parseReportFilters } from "./filter-parser.js";

interface SpecLookup {
  type: string;
  title: string;
  subtitle?: string;
}

const SPECS_BY_ROLE: Record<string, SpecLookup[]> = {
  farmer: FARMER_REPORT_SPECS,
  officer: OFFICER_REPORT_SPECS,
  cooperative: COOPERATIVE_REPORT_SPECS,
  admin: ADMIN_REPORT_SPECS,
  super_admin: SUPER_ADMIN_REPORT_SPECS,
};

function listSpecs(role: string) {
  return SPECS_BY_ROLE[role] ?? [];
}

function getSpec(role: string, type: string) {
  return listSpecs(role).find((s) => s.type === type);
}

export const listReports = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const role = req.user!.role as UserRole;
    const specs = listSpecs(role);
    res.json({
      success: true,
      data: {
        role,
        reports: specs.map((s) => ({
          type: s.type,
          title: s.title,
          subtitle: s.subtitle,
          endpoints: {
            json: `/api/v1/reports-v2/${role}/${s.type}`,
            pdf: `/api/v1/reports-v2/${role}/${s.type}.pdf`,
            xlsx: `/api/v1/reports-v2/${role}/${s.type}.xlsx`,
            csv: `/api/v1/reports-v2/${role}/${s.type}.csv`,
          },
        })),
      },
    });
  } catch (err) {
    next(err);
  }
};

async function runReport(
  req: Request,
  res: Response,
  next: NextFunction,
  role: string,
  type: string,
  format: ReportFormat,
) {
  try {
    const spec = getSpec(role, type);
    if (!spec) {
      return res.status(404).json({
        success: false,
        error: {
          code: "REPORT_NOT_FOUND",
          message: `Report type '${type}' not found for role '${role}'`,
        },
      });
    }
    const filters = await parseReportFilters(req);
    const generatedBy = req.user!.phone ?? req.user!.sub;
    const userId = req.user!.sub;

    let definition;
    switch (role) {
      case "farmer":
        definition = await farmerReportsService.buildReport(
          userId,
          spec,
          filters,
          generatedBy,
        );
        break;
      case "officer":
        definition = await officerReportsService.buildReport(
          userId,
          spec,
          filters,
          generatedBy,
        );
        break;
      case "cooperative":
        definition = await cooperativeReportsService.buildReport(
          userId,
          spec,
          filters,
          generatedBy,
        );
        break;
      case "admin":
        definition = await adminReportsService.buildReport(
          spec,
          filters,
          generatedBy,
        );
        break;
      case "super_admin":
        definition = await superAdminReportsService.buildReport(
          spec,
          filters,
          generatedBy,
        );
        break;
      default:
        return res.status(403).json({
          success: false,
          error: { code: "FORBIDDEN", message: "Role not allowed" },
        });
    }

    if (
      format === "pdf" &&
      req.query.format !== "json" &&
      req.path.endsWith(".pdf")
    ) {
      const rendered = await renderReport(definition, "pdf");
      res.setHeader("Content-Type", rendered.contentType);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${rendered.filename}"`,
      );
      return res.send(rendered.buffer);
    }

    if (req.query.format === "json" || !req.path.match(/\.(pdf|xlsx|csv)$/)) {
      return res.json({ success: true, data: definition });
    }

    const ext: ReportFormat = req.path.endsWith(".xlsx")
      ? "xlsx"
      : req.path.endsWith(".csv")
        ? "csv"
        : format;
    const rendered = await renderReport(definition, ext);
    res.setHeader("Content-Type", rendered.contentType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${rendered.filename}"`,
    );
    return res.send(rendered.buffer);
  } catch (err) {
    if (err instanceof ReportError) {
      return res.status(err.status).json({
        success: false,
        error: { code: err.code, message: err.message },
      });
    }
    return next(err);
  }
}

function makeHandler(role: UserRole) {
  return async (req: Request, res: Response, next: NextFunction) => {
    let type = req.params.type ?? "";
    let format: ReportFormat = "pdf";
    if (type.endsWith(".pdf")) {
      format = "pdf";
      type = type.slice(0, -4);
    } else if (type.endsWith(".xlsx")) {
      format = "xlsx";
      type = type.slice(0, -5);
    } else if (type.endsWith(".csv")) {
      format = "csv";
      type = type.slice(0, -4);
    }
    if (req.query.format === "json") format = "pdf";
    return runReport(req, res, next, role, type, format);
  };
}

export const farmerReportHandler = makeHandler(UserRole.FARMER);
export const officerReportHandler = makeHandler(UserRole.OFFICER);
export const cooperativeReportHandler = makeHandler(UserRole.COOPERATIVE);
export const adminReportHandler = makeHandler(UserRole.ADMIN);
export const superAdminReportHandler = makeHandler(UserRole.SUPER_ADMIN);
