import ExcelJS from "exceljs";
import {
  ReportDefinition,
  TableSection,
  RecommendationItem,
  RiskItem,
} from "./types.js";

const HEADER_FILL: ExcelJS.Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FF1A6B2A" },
};
const HEADER_FONT: Partial<ExcelJS.Font> = {
  bold: true,
  color: { argb: "FFFFFFFF" },
};
const SUBHEAD_FILL: ExcelJS.Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFE7F3EA" },
};
const MUTED: Partial<ExcelJS.Font> = {
  color: { argb: "FF6B7280" },
  italic: true,
};

function styleHeader(row: ExcelJS.Row) {
  row.eachCell((cell) => {
    cell.fill = HEADER_FILL;
    cell.font = HEADER_FONT;
    cell.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
    cell.border = {
      top: { style: "thin", color: { argb: "FFD1D5DB" } },
      bottom: { style: "thin", color: { argb: "FFD1D5DB" } },
      left: { style: "thin", color: { argb: "FFD1D5DB" } },
      right: { style: "thin", color: { argb: "FFD1D5DB" } },
    };
  });
  row.height = 22;
}

function styleBody(cell: ExcelJS.Cell) {
  cell.border = {
    top: { style: "thin", color: { argb: "FFE5E7EB" } },
    bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
    left: { style: "thin", color: { argb: "FFE5E7EB" } },
    right: { style: "thin", color: { argb: "FFE5E7EB" } },
  };
  cell.alignment = { vertical: "middle", wrapText: true };
}

function addKpiSheet(wb: ExcelJS.Workbook, report: ReportDefinition) {
  const ws = wb.addWorksheet("KPIs");
  ws.columns = [
    { header: "Indicator", key: "label", width: 32 },
    { header: "Value", key: "value", width: 18 },
    { header: "Unit", key: "unit", width: 12 },
    { header: "Hint", key: "hint", width: 36 },
  ];
  styleHeader(ws.getRow(1));
  for (const k of report.kpis) {
    const row = ws.addRow({
      label: `${k.icon ?? ""} ${k.label}`.trim(),
      value: k.value,
      unit: k.unit ?? "",
      hint: k.hint ?? "",
    });
    row.getCell("value").font = { bold: true, color: { argb: "FF0F4A1D" } };
    row.eachCell(styleBody);
  }
  ws.getColumn("label").alignment = { vertical: "middle" };
}

function addTableSheet(
  wb: ExcelJS.Workbook,
  table: TableSection,
  name: string,
) {
  const ws = wb.addWorksheet(name.replace(/[^a-zA-Z0-9 -]/g, "").slice(0, 31));
  const headerRow = ws.addRow(table.columns.map((c) => c.label));
  styleHeader(headerRow);

  // Track max lengths for auto-sizing
  const colWidths: Record<number, number> = {};
  table.columns.forEach((c, i) => {
    colWidths[i + 1] = Math.max(10, c.label.length + 2);
  });

  if (table.rows.length === 0) {
    const empty = ws.addRow(table.columns.map(() => "—"));
    empty.eachCell((c) => {
      c.font = MUTED;
      styleBody(c);
    });
  } else {
    for (const r of table.rows) {
      const row = ws.addRow(table.columns.map((c) => r[c.key] ?? ""));
      row.eachCell((cell, colNumber) => {
        styleBody(cell);

        // Formatting logic
        const val = cell.value;
        if (typeof val === "number") {
          const header = table.columns[colNumber - 1].label.toLowerCase();
          if (
            header.includes("rwf") ||
            header.includes("cost") ||
            header.includes("revenue") ||
            header.includes("price")
          ) {
            cell.numFmt = '#,##0 "RWF"';
          } else if (
            header.includes("%") ||
            header.includes("rate") ||
            header.includes("percent")
          ) {
            cell.numFmt = '0.0"%"';
          } else {
            cell.numFmt = "#,##0.00";
          }
        } else if (typeof val === "string") {
          const strLen = val.length;
          if (strLen > colWidths[colNumber]) {
            colWidths[colNumber] = Math.min(strLen + 2, 50); // Cap width at 50
          }
        }
      });
    }
  }

  // Apply widths
  ws.columns.forEach((col, index) => {
    col.width = colWidths[index + 1] || 18;
  });

  if (table.footnote) {
    const note = ws.addRow([table.footnote]);
    note.getCell(1).font = MUTED;
    ws.mergeCells(note.number, 1, note.number, table.columns.length);
  }
}

function addRecsSheet(wb: ExcelJS.Workbook, items: RecommendationItem[]) {
  const ws = wb.addWorksheet("Recommendations");
  ws.columns = [
    { header: "Priority", key: "priority", width: 10 },
    { header: "Category", key: "category", width: 16 },
    { header: "Title", key: "title", width: 32 },
    { header: "Rationale", key: "rationale", width: 42 },
    { header: "Action", key: "action", width: 36 },
    { header: "Confidence", key: "confidence", width: 12 },
  ];
  styleHeader(ws.getRow(1));
  for (const r of items) {
    const row = ws.addRow({
      priority: r.priority,
      category: r.category,
      title: r.title,
      rationale: r.rationale,
      action: r.action,
      confidence: r.confidence,
    });
    row.eachCell(styleBody);
  }
}

function addRisksSheet(wb: ExcelJS.Workbook, items: RiskItem[]) {
  const ws = wb.addWorksheet("Risks");
  ws.columns = [
    { header: "Level", key: "level", width: 12 },
    { header: "Category", key: "category", width: 18 },
    { header: "Affected", key: "affected", width: 12 },
    { header: "Message", key: "message", width: 48 },
    { header: "Recommendation", key: "recommendation", width: 40 },
  ];
  styleHeader(ws.getRow(1));
  for (const r of items) {
    const row = ws.addRow({
      level: r.level,
      category: r.category,
      affected: r.affected ?? "",
      message: r.message,
      recommendation: r.recommendation ?? "",
    });
    row.eachCell(styleBody);
  }
}

function addSummarySheet(wb: ExcelJS.Workbook, report: ReportDefinition) {
  const ws = wb.addWorksheet("Summary", {
    views: [{ state: "frozen", ySplit: 4 }],
  });
  ws.mergeCells("A1:D1");
  const title = ws.getCell("A1");
  title.value = report.context.title;
  title.font = { size: 16, bold: true, color: { argb: "FF0F4A1D" } };
  title.alignment = { vertical: "middle" };
  title.fill = SUBHEAD_FILL;
  ws.getRow(1).height = 30;

  const meta: [string, string][] = [
    ["Report ID", report.context.reportId],
    ["Report Type", report.context.reportType],
    ["Generated At", report.context.generatedAt.toISOString()],
    ["Season", report.context.season ?? "—"],
    ["Scope", report.context.scope.roleScope],
    [
      "Target",
      report.context.scope.targetName ?? report.context.scope.targetId ?? "—",
    ],
    ["Data Points", String(report.metadata.dataPoints)],
    ["Hash", report.metadata.hash],
    ["Version", report.metadata.version],
  ];
  let row = 3;
  for (const [k, v] of meta) {
    const a = ws.getCell(`A${row}`);
    const b = ws.getCell(`B${row}`);
    a.value = k;
    a.font = { bold: true };
    b.value = v;
    row += 1;
  }
  row += 1;
  ws.getCell(`A${row}`).value = "Executive Summary";
  ws.getCell(`A${row}`).font = { bold: true, size: 12 };
  row += 1;
  ws.mergeCells(`A${row}:D${row + 4}`);
  const cell = ws.getCell(`A${row}`);
  cell.value = report.executiveSummary;
  cell.alignment = { wrapText: true, vertical: "top" };
  ws.getColumn(1).width = 22;
  ws.getColumn(2).width = 48;
}

export async function renderReportXlsx(
  report: ReportDefinition,
): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "AGUKA SMART FARMING KIT";
  wb.created = report.context.generatedAt;
  wb.title = report.context.title;
  wb.subject = report.context.subtitle ?? "";
  addSummarySheet(wb, report);
  addKpiSheet(wb, report);
  report.tables.forEach((t, i) =>
    addTableSheet(wb, t, `Data-${i + 1}-${t.heading}`),
  );
  if (report.recommendations.length > 0)
    addRecsSheet(wb, report.recommendations);
  if (report.risks.length > 0) addRisksSheet(wb, report.risks);
  const buffer = await wb.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
