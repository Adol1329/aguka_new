import { ReportDefinition, RenderedReport } from "./types.js";
import { renderReportPdf } from "./pdf-renderer.js";
import { renderReportXlsx } from "./excel-renderer.js";
import { renderReportCsv } from "./csv-renderer.js";

export type ReportFormat = "pdf" | "xlsx" | "csv";

const EXTENSIONS: Record<ReportFormat, { ext: string; contentType: string }> = {
  pdf: { ext: "pdf", contentType: "application/pdf" },
  xlsx: {
    ext: "xlsx",
    contentType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  },
  csv: { ext: "csv", contentType: "text/csv; charset=utf-8" },
};

export async function renderReport(
  report: ReportDefinition,
  format: ReportFormat,
): Promise<RenderedReport> {
  const meta = EXTENSIONS[format];
  const safeTitle = report.context.title
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .slice(0, 60);
  const filename = `${safeTitle}-${report.context.reportId}.${meta.ext}`;

  if (format === "pdf") {
    return {
      filename,
      contentType: meta.contentType,
      buffer: await renderReportPdf(report),
    };
  }
  if (format === "xlsx") {
    return {
      filename,
      contentType: meta.contentType,
      buffer: await renderReportXlsx(report),
    };
  }
  return {
    filename,
    contentType: meta.contentType,
    buffer: renderReportCsv(report),
  };
}
