import { ReportDefinition } from "./types.js";

const NEWLINE = "\r\n";

function csvField(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (
    s.includes(",") ||
    s.includes('"') ||
    s.includes("\n") ||
    s.includes("\r")
  ) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function csvRow(values: unknown[]): string {
  return values.map(csvField).join(",");
}

export function renderReportCsv(report: ReportDefinition): Buffer {
  const lines: string[] = [];
  lines.push(csvRow(["# AGUKA SMART FARMING REPORT"]));
  lines.push(csvRow(["Field", "Value"]));
  lines.push(csvRow(["Report ID", report.context.reportId]));
  lines.push(csvRow(["Title", report.context.title]));
  lines.push(csvRow(["Subtitle", report.context.subtitle ?? ""]));
  lines.push(csvRow(["Report Type", report.context.reportType]));
  lines.push(
    csvRow(["Generated At", report.context.generatedAt.toISOString()]),
  );
  lines.push(csvRow(["Season", report.context.season ?? ""]));
  lines.push(csvRow(["Scope", report.context.scope.roleScope]));
  lines.push(
    csvRow([
      "Target",
      report.context.scope.targetName ?? report.context.scope.targetId ?? "",
    ]),
  );
  lines.push(csvRow(["Period", report.metadata.periodLabel]));
  lines.push(csvRow(["Data Points", String(report.metadata.dataPoints)]));
  lines.push(csvRow(["Hash", report.metadata.hash]));
  lines.push(csvRow(["Version", report.metadata.version]));
  lines.push("");

  lines.push("# Executive Summary");
  lines.push(csvRow([report.executiveSummary.replace(/\n/g, " ")]));
  lines.push("");

  lines.push("# Key Performance Indicators");
  lines.push(csvRow(["Indicator", "Value", "Unit", "Hint"]));
  for (const k of report.kpis) {
    lines.push(csvRow([k.label, k.value, k.unit ?? "", k.hint ?? ""]));
  }
  lines.push("");

  report.tables.forEach((table, i) => {
    lines.push(`# Table ${i + 1}: ${table.heading}`);
    lines.push(csvRow(table.columns.map((c) => c.label)));
    if (table.rows.length === 0) {
      lines.push(csvRow(table.columns.map(() => "—")));
    } else {
      for (const row of table.rows) {
        lines.push(csvRow(table.columns.map((c) => row[c.key] ?? "")));
      }
    }
    if (table.footnote) {
      lines.push(csvRow([table.footnote]));
    }
    lines.push("");
  });

  if (report.recommendations.length > 0) {
    lines.push("# AI Recommendations");
    lines.push(
      csvRow(["Priority", "Category", "Title", "Action", "Confidence"]),
    );
    for (const r of report.recommendations) {
      lines.push(
        csvRow([r.priority, r.category, r.title, r.action, r.confidence]),
      );
    }
    lines.push("");
  }

  if (report.risks.length > 0) {
    lines.push("# Risk Assessment");
    lines.push(
      csvRow(["Level", "Category", "Affected", "Message", "Recommendation"]),
    );
    for (const r of report.risks) {
      lines.push(
        csvRow([
          r.level,
          r.category,
          r.affected ?? "",
          r.message,
          r.recommendation ?? "",
        ]),
      );
    }
    lines.push("");
  }

  return Buffer.from(lines.join(NEWLINE) + NEWLINE, "utf-8");
}
