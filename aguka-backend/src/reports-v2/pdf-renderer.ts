import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";
import {
  ReportDefinition,
  Kpi,
  ChartSection,
  TableSection,
  RecommendationItem,
  RiskItem,
} from "./types.js";

const CHROME_PATH =
  process.env.CHROME_PATH ||
  (process.platform === "win32"
    ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
    : process.platform === "darwin"
      ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
      : "/usr/bin/google-chrome");

const FALLBACK_LOGO_PATH = path.join(process.cwd(), "public", "imbaraga-logo.png");
const FRONTEND_LOGO_PATH = path.join(
  process.cwd(),
  "..",
  "aguka-frontend",
  "public",
  "imbaraga-logo.png",
);

function readLogoBase64(): string {
  for (const p of [FRONTEND_LOGO_PATH, FALLBACK_LOGO_PATH]) {
    try {
      if (fs.existsSync(p)) {
        return `data:image/png;base64,${fs.readFileSync(p).toString("base64")}`;
      }
    } catch {
      // continue
    }
  }
  return "";
}

const PRIMARY = "#1a6b2a";
const ACCENT = "#0f4a1d";
const MUTED = "#6b7280";
const SOFT = "#f3f6f4";
const CARD_BORDER = "#e5e7eb";
const RISK_COLORS: Record<string, string> = {
  low: "#16a34a",
  moderate: "#eab308",
  high: "#f97316",
  critical: "#dc2626",
};
const PRIORITY_COLORS: Record<string, string> = {
  urgent: "#dc2626",
  high: "#f97316",
  medium: "#eab308",
  low: "#16a34a",
};

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function kpiCard(kpi: Kpi): string {
  const trend = kpi.trend
    ? `<span style="color:${
        kpi.trend.direction === "up"
          ? "#16a34a"
          : kpi.trend.direction === "down"
            ? "#dc2626"
            : "#6b7280"
      };font-size:11px;">${kpi.trend.direction === "up" ? "▲" : kpi.trend.direction === "down" ? "▼" : "—"} ${
        kpi.trend.percent
      }%</span>`
    : "";
  return `
    <div style="background:#fff;border:1px solid ${CARD_BORDER};border-radius:10px;padding:14px 16px;display:flex;flex-direction:column;gap:6px;">
      <div style="display:flex;align-items:center;gap:8px;color:${MUTED};font-size:11px;text-transform:uppercase;letter-spacing:0.05em;font-weight:600;">
        <span>${kpi.icon ?? ""}</span>
        <span>${escapeHtml(kpi.label)}</span>
      </div>
      <div style="display:flex;align-items:baseline;gap:6px;">
        <span style="font-size:24px;font-weight:700;color:${ACCENT};">${escapeHtml(kpi.value)}</span>
        ${kpi.unit ? `<span style="font-size:13px;color:${MUTED};">${escapeHtml(kpi.unit)}</span>` : ""}
        ${trend}
      </div>
      ${kpi.hint ? `<div style="font-size:10px;color:${MUTED};">${escapeHtml(kpi.hint)}</div>` : ""}
    </div>
  `;
}

const CHART_COLORS = [
  "#1a6b2a",
  "#10b981",
  "#3b82f6",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
];

function truncateLabel(label: unknown, maxChars: number): string {
  const str = String(label ?? "");
  if (str.length <= maxChars) return str;
  return str.slice(0, Math.max(1, maxChars - 1)) + "…";
}

// Fewer categories can afford longer labels; once a chart gets crowded, labels
// need to shrink so they don't run into their neighbors.
function labelCharBudget(count: number): number {
  if (count <= 4) return 14;
  if (count <= 6) return 10;
  if (count <= 10) return 7;
  return 5;
}

// Rounds a raw axis max up to a clean gridline value with headroom, so bars
// never sit flush against the top of the chart.
function roundUpAxisMax(rawMax: number): number {
  if (rawMax <= 0) return 10;
  let step = 10;
  if (rawMax > 500) step = 100;
  else if (rawMax > 100) step = 50;
  else if (rawMax > 50) step = 25;
  return Math.ceil(rawMax / step) * step;
}

// Percentage metrics must always scale against a fixed 0-100 axis, never the
// dataset's own (possibly tiny) max — otherwise a 1% value next to a 2% value
// renders as if it were "half full" instead of nearly empty. This is correct
// for BAR charts, where a bar's height is only meaningful measured from a
// shared zero baseline.
function computeAxisMax(chart: ChartSection): number {
  const rawMax = Math.max(
    0,
    ...chart.data.map((p) => Math.max(p.value, p.secondary ?? 0)),
  );
  if (chart.unit === "%") return Math.max(100, rawMax);
  return roundUpAxisMax(rawMax);
}

// Line/area charts plot a TREND, not a proportion — forcing them onto the
// same 0-100 (or 0-max) baseline as bar charts flattens real variation when
// the metric naturally sits in a narrow band (e.g. soil moisture at
// 55-70%). Zoom to the data's own min/max with headroom instead, like any
// normal trend chart (a stock chart doesn't start its y-axis at $0 either).
function computeLineAxisRange(chart: ChartSection): { min: number; max: number } {
  const values = chart.data.map((p) => p.value);
  const dataMin = Math.min(...values);
  const dataMax = Math.max(...values);

  if (dataMin === dataMax) {
    // Flat data: pad symmetrically so the line still renders mid-chart
    // instead of collapsing to a zero-height range.
    const pad = Math.max(1, Math.abs(dataMin) * 0.1);
    return { min: dataMin - pad, max: dataMax + pad };
  }

  const range = dataMax - dataMin;
  const padding = range * 0.15;
  let min = dataMin - padding;
  let max = dataMax + padding;

  // Percentages and other naturally non-negative metrics shouldn't show a
  // padded axis dipping below 0.
  if (chart.unit === "%" || dataMin >= 0) {
    min = Math.max(0, min);
  }
  return { min, max };
}

function isChartEmpty(chart: ChartSection): boolean {
  return (
    chart.data.length === 0 ||
    chart.data.every((p) => !p.value && !p.secondary)
  );
}

function chartSection(chart: ChartSection): string {
  // No chart-shaped placeholder for something that isn't a chart — when
  // there's no data, render nothing at all and let the grid reflow around
  // the gap, same rule as the live UI (charts.tsx's ChartGrid).
  if (isChartEmpty(chart)) return "";

  let content = "";

  if (chart.type === "pie" || chart.type === "doughnut") {
    const total = chart.data.reduce((sum, p) => sum + p.value, 0);
    let startAngle = 0;
    const items = chart.data.map((p, i) => {
      const sliceAngle = (p.value / total) * 360;
      const x1 = 50 + 40 * Math.cos((Math.PI * startAngle) / 180);
      const y1 = 80 + 40 * Math.sin((Math.PI * startAngle) / 180);
      const x2 =
        50 + 40 * Math.cos((Math.PI * (startAngle + sliceAngle)) / 180);
      const y2 =
        80 + 40 * Math.sin((Math.PI * (startAngle + sliceAngle)) / 180);
      const largeArc = sliceAngle > 180 ? 1 : 0;
      const path = `M 50 80 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`;
      const color = CHART_COLORS[i % CHART_COLORS.length];
      startAngle += sliceAngle;
      return `<path d="${path}" fill="${color}" stroke="#fff" stroke-width="0.5" />`;
    });

    const legend = chart.data
      .map((p, i) => {
        const color = CHART_COLORS[i % CHART_COLORS.length];
        return `
        <div style="display:flex;align-items:center;gap:6px;font-size:9px;color:${MUTED};">
          <span style="width:8px;height:8px;background:${color};border-radius:2px;"></span>
          <span style="flex:1;">${escapeHtml(p.label)}</span>
          <span style="font-weight:600;color:${ACCENT};">${p.value}${chart.unit ?? ""}</span>
        </div>`;
      })
      .join("");

    content = `
      <div style="display:flex;align-items:center;gap:20px;">
        <svg viewBox="0 0 100 160" style="width:140px;height:140px;flex-shrink:0;">
          ${items.join("")}
          ${chart.type === "doughnut" ? `<circle cx="50" cy="80" r="20" fill="#fff" />` : ""}
        </svg>
        <div style="flex:1;display:grid;grid-template-columns:1fr;gap:4px;">${legend}</div>
      </div>
    `;
  } else if (chart.type === "line" || chart.type === "area") {
    const { min, max } = computeLineAxisRange(chart);
    const points = chart.data
      .map((p, i) => {
        const x = (i / (chart.data.length - 1 || 1)) * 100;
        const y = 130 - ((p.value - min) / (max - min || 1)) * 110;
        return `${x},${y}`;
      })
      .join(" ");

    const line = `<polyline points="${points}" fill="none" stroke="${PRIMARY}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />`;
    const area =
      chart.type === "area"
        ? `<polygon points="0,130 ${points} 100,130" fill="${PRIMARY}" fill-opacity="0.1" />`
        : "";

    // Show at most 6 tick labels, evenly spaced (including both endpoints), so
    // dense date axes never stack labels on top of each other. A modulo-based
    // step can leave the last two labels awkwardly close together — even
    // sampling avoids that.
    const maxVisibleLabels = 6;
    const targetLabelCount = Math.min(maxVisibleLabels, chart.data.length);
    const sampledIndices = Array.from(
      { length: targetLabelCount },
      (_, k) => Math.round((k * (chart.data.length - 1)) / Math.max(1, targetLabelCount - 1)),
    ).filter((v, idx, arr) => arr.indexOf(v) === idx);
    // Defensive: even with upstream data already aggregated to one point per
    // day, never show the same label text twice in a row (e.g. if a caller
    // passes raw multi-reading-per-day data directly).
    const visibleIndices = sampledIndices.filter((i, idx, arr) => {
      if (idx === 0) return true;
      return chart.data[i].label !== chart.data[arr[idx - 1]].label;
    });
    // With more than a few labels left, horizontal text won't fit — rotate instead.
    const rotateLabels = visibleIndices.length > 4;
    const labelMaxChars = labelCharBudget(visibleIndices.length);
    const labels = visibleIndices
      .map((i) => {
        const p = chart.data[i];
        const x = (i / (chart.data.length - 1 || 1)) * 100;
        const text = escapeHtml(truncateLabel(p.label, labelMaxChars));
        return rotateLabels
          ? `<text x="${x.toFixed(2)}" y="145" text-anchor="end" font-size="8" fill="${MUTED}" transform="rotate(-40 ${x.toFixed(2)} 145)">${text}</text>`
          : `<text x="${x.toFixed(2)}" y="145" text-anchor="middle" font-size="8" fill="${MUTED}">${text}</text>`;
      })
      .join("");

    content = `
      <svg viewBox="0 0 100 160" preserveAspectRatio="none" style="width:100%;height:180px;overflow:visible;">
        <line x1="0" y1="130" x2="100" y2="130" stroke="${CARD_BORDER}" stroke-width="0.4" />
        <line x1="0" y1="20" x2="0" y2="130" stroke="${CARD_BORDER}" stroke-width="0.4" />
        ${area}
        ${line}
        ${labels}
      </svg>
    `;
  } else {
    // Default: Bar Chart
    const max = computeAxisMax(chart);
    const barW = 100 / Math.max(1, chart.data.length);
    // Once there are more than ~6 categories, horizontal labels can't fit —
    // rotate and shrink them instead of letting them run into their neighbors.
    const rotate = chart.data.length > 6;
    const labelMaxChars = labelCharBudget(chart.data.length);
    const bars = chart.data
      .map((p, i) => {
        const h = (p.value / max) * 110;
        const h2 = p.secondary !== undefined ? (p.secondary / max) * 110 : 0;
        const x = i * barW + barW * 0.15;
        const w = barW * 0.4;
        const x2 = i * barW + barW * 0.45;
        const cx = i * barW + barW / 2;
        const labelText = escapeHtml(truncateLabel(p.label, labelMaxChars));
        const categoryLabel = rotate
          ? `<text x="${cx.toFixed(2)}" y="145" text-anchor="end" font-size="8" fill="${MUTED}" transform="rotate(-40 ${cx.toFixed(2)} 145)">${labelText}</text>`
          : `<text x="${cx.toFixed(2)}" y="145" text-anchor="middle" font-size="8" fill="${MUTED}">${labelText}</text>`;
        return `
        <g>
          <rect x="${x.toFixed(2)}%" y="${130 - h}" width="${w.toFixed(2)}%" height="${h}" fill="${PRIMARY}" rx="2" />
          ${p.secondary !== undefined ? `<rect x="${x2.toFixed(2)}%" y="${130 - h2}" width="${w.toFixed(2)}%" height="${h2}" fill="#0ea5e9" rx="2" />` : ""}
          ${categoryLabel}
          <text x="${cx.toFixed(2)}" y="${130 - h - 4}" text-anchor="middle" font-size="8" fill="${ACCENT}" font-weight="600">${escapeHtml(p.value)}${chart.unit ?? ""}</text>
        </g>
      `;
      })
      .join("");

    content = `
      <svg viewBox="0 0 100 160" preserveAspectRatio="none" style="width:100%;height:180px;overflow:visible;">
        <line x1="0" y1="130" x2="100" y2="130" stroke="${CARD_BORDER}" stroke-width="0.4" />
        ${bars}
      </svg>
    `;
  }

  return `
    <div style="background:#fff;border:1px solid ${CARD_BORDER};border-radius:10px;padding:16px;">
      <h3 style="margin:0 0 6px;font-size:13px;font-weight:700;color:${ACCENT};">${chart.icon ?? ""} ${escapeHtml(chart.heading)}</h3>
      ${chart.description ? `<p style="margin:0 0 10px;font-size:11px;color:${MUTED};">${escapeHtml(chart.description)}</p>` : ""}
      ${content}
    </div>
  `;
}

function tableSection(table: TableSection): string {
  const head = table.columns
    .map(
      (c) =>
        `<th style="text-align:${c.align ?? "left"};padding:8px 10px;border-bottom:2px solid ${CARD_BORDER};background:${SOFT};font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:${MUTED};">${escapeHtml(c.label)}</th>`,
    )
    .join("");
  const rows = table.rows
    .map(
      (r) =>
        `<tr>${table.columns
          .map(
            (c) =>
              `<td style="text-align:${c.align ?? "left"};padding:7px 10px;border-bottom:1px solid ${CARD_BORDER};font-size:11px;">${escapeHtml(r[c.key] ?? "")}</td>`,
          )
          .join("")}</tr>`,
    )
    .join("");
  return `
    <div style="background:#fff;border:1px solid ${CARD_BORDER};border-radius:10px;padding:16px;margin-top:14px;">
      <h3 style="margin:0 0 10px;font-size:13px;font-weight:700;color:${ACCENT};">${table.icon ?? ""} ${escapeHtml(table.heading)}</h3>
      <table style="width:100%;border-collapse:collapse;">
        <thead><tr>${head}</tr></thead>
        <tbody>${rows || `<tr><td colspan="${table.columns.length}" style="padding:12px;text-align:center;color:${MUTED};font-size:11px;">No data</td></tr>`}</tbody>
      </table>
      ${table.footnote ? `<p style="margin:8px 0 0;font-size:10px;color:${MUTED};">${escapeHtml(table.footnote)}</p>` : ""}
    </div>
  `;
}

function riskItem(r: RiskItem): string {
  return `
    <div style="display:flex;gap:10px;align-items:flex-start;padding:10px;border-left:4px solid ${RISK_COLORS[r.level] ?? MUTED};background:#fff;border-radius:6px;border-top:1px solid ${CARD_BORDER};border-right:1px solid ${CARD_BORDER};border-bottom:1px solid ${CARD_BORDER};margin-bottom:8px;">
      <span style="background:${RISK_COLORS[r.level] ?? MUTED};color:#fff;padding:2px 8px;border-radius:4px;font-size:9px;font-weight:700;text-transform:uppercase;">${escapeHtml(r.level)}</span>
      <div style="flex:1;">
        <div style="font-size:11px;font-weight:700;color:${ACCENT};">${escapeHtml(r.category)}${r.affected !== undefined ? ` · ${r.affected} affected` : ""}</div>
        <div style="font-size:11px;color:#374151;margin-top:2px;">${escapeHtml(r.message)}</div>
        ${r.recommendation ? `<div style="font-size:10px;color:${MUTED};margin-top:4px;font-style:italic;">${escapeHtml(r.recommendation)}</div>` : ""}
      </div>
    </div>
  `;
}

function recommendationItem(r: RecommendationItem): string {
  return `
    <div style="padding:10px;background:#fff;border:1px solid ${CARD_BORDER};border-radius:6px;margin-bottom:8px;">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
        <span style="background:${PRIORITY_COLORS[r.priority] ?? MUTED};color:#fff;padding:2px 8px;border-radius:4px;font-size:9px;font-weight:700;text-transform:uppercase;">${escapeHtml(r.priority)}</span>
        <span style="font-size:11px;font-weight:700;color:${ACCENT};">${escapeHtml(r.title)}</span>
        <span style="margin-left:auto;font-size:9px;color:${MUTED};text-transform:uppercase;">confidence: ${escapeHtml(r.confidence)}</span>
      </div>
      <div style="font-size:11px;color:#374151;margin-bottom:4px;">${escapeHtml(r.rationale)}</div>
      <div style="font-size:11px;color:${PRIMARY};font-weight:600;">→ ${escapeHtml(r.action)}</div>
      ${r.evidence ? `<div style="font-size:10px;color:${MUTED};margin-top:4px;">${escapeHtml(r.evidence)}</div>` : ""}
    </div>
  `;
}

// Rendered once by Puppeteer's headerTemplate and repeated on every page — see renderReportPdf().
// Must stay self-contained (inline styles only, no external CSS/JS) since header/footer templates
// run in an isolated context separate from the main page.
function buildHeaderTemplate(report: ReportDefinition): string {
  const logo = readLogoBase64();
  const ctx = report.context;
  return `
    <div style="width:100%;box-sizing:border-box;background:${PRIMARY};color:#fff;padding:18px 32px;display:flex;align-items:center;gap:16px;font-family:Arial,Helvetica,sans-serif;">
      ${logo ? `<img src="${logo}" style="height:48px;background:#fff;border-radius:6px;padding:4px;" />` : ""}
      <div style="flex:1;">
        <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.1em;opacity:0.85;">${escapeHtml(ctx.organization)}</div>
        <div style="font-size:20px;font-weight:700;margin-top:2px;">${escapeHtml(ctx.title)}</div>
        ${ctx.subtitle ? `<div style="font-size:12px;opacity:0.9;">${escapeHtml(ctx.subtitle)}</div>` : ""}
      </div>
      <div style="text-align:right;font-size:10px;">
        <div><strong>Report ID:</strong> ${escapeHtml(ctx.reportId)}</div>
        <div><strong>Generated:</strong> ${ctx.generatedAt.toISOString().slice(0, 19).replace("T", " ")}</div>
        <div><strong>Season:</strong> ${escapeHtml(ctx.season ?? "—")}</div>
        <div><strong>Scope:</strong> ${escapeHtml(ctx.scope.roleScope)}</div>
      </div>
    </div>
  `;
}

function buildHtml(report: ReportDefinition): string {
  const ctx = report.context;
  const kpiGrid = report.kpis.map(kpiCard).join("");
  const charts = report.charts.map(chartSection).join("");
  const tables = report.tables.map(tableSection).join("");
  const recs = report.recommendations.map(recommendationItem).join("");
  const risks = report.risks.map(riskItem).join("");

  return `
  <!doctype html>
  <html><head><meta charset="utf-8" />
  <title>${escapeHtml(ctx.title)}</title>
  </head><body style="font-family:Arial,Helvetica,sans-serif;color:#111827;background:#fff;margin:0;padding:0;">
    <div style="padding:24px 32px;">
      <section style="margin-bottom:20px;">
        <h2 style="font-size:13px;text-transform:uppercase;letter-spacing:0.08em;color:${MUTED};margin:0 0 8px;">Executive Summary</h2>
        <p style="font-size:12px;line-height:1.55;color:#1f2937;margin:0;">${escapeHtml(report.executiveSummary)}</p>
      </section>
      <section style="margin-bottom:20px;">
        <h2 style="font-size:13px;text-transform:uppercase;letter-spacing:0.08em;color:${MUTED};margin:0 0 8px;">Key Performance Indicators</h2>
        <div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;">${kpiGrid}</div>
      </section>
      ${charts ? `<section style="margin-bottom:20px;"><h2 style="font-size:13px;text-transform:uppercase;letter-spacing:0.08em;color:${MUTED};margin:0 0 8px;">Trends &amp; Analysis</h2><div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;">${charts}</div></section>` : ""}
      ${tables}
      <div style="break-inside:avoid;page-break-inside:avoid;padding-top:1px;">
        <section style="margin-top:20px;">
          <h2 style="font-size:13px;text-transform:uppercase;letter-spacing:0.08em;color:${MUTED};margin:0 0 8px;">Risk Assessment</h2>
          ${risks || `<p style="color:${MUTED};font-size:11px;">No active risks identified in the reporting period.</p>`}
        </section>
        <section style="margin-top:20px;">
          <h2 style="font-size:13px;text-transform:uppercase;letter-spacing:0.08em;color:${MUTED};margin:0 0 8px;">AI Recommendations</h2>
          ${recs || `<p style="color:${MUTED};font-size:11px;">No AI recommendations generated for this period.</p>`}
        </section>
        <section style="margin-top:24px;padding-top:14px;border-top:1px solid ${CARD_BORDER};display:flex;justify-content:space-between;align-items:flex-end;gap:24px;">
          <div style="font-size:10px;color:${MUTED};">
            <div><strong>Data Points:</strong> ${report.metadata.dataPoints}</div>
            <div><strong>Period:</strong> ${escapeHtml(report.metadata.periodLabel)}</div>
            <div><strong>Generated By:</strong> ${escapeHtml(report.metadata.generatedBy ?? "System")}</div>
            <div><strong>Hash:</strong> <code>${escapeHtml(report.metadata.hash)}</code></div>
            <div><strong>Version:</strong> ${escapeHtml(report.metadata.version)}</div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:11px;color:${MUTED};">Authorized Signatory</div>
            ${
              ctx.signatories && ctx.signatories[0]
                ? `<div style="margin-top:6px;font-style:italic;font-weight:600;color:${ACCENT};border-top:1px solid ${CARD_BORDER};padding-top:6px;">${escapeHtml(ctx.signatories[0].name)}</div>
                <div style="font-size:10px;color:${MUTED};">${escapeHtml(ctx.signatories[0].role)}</div>
                <div style="font-size:10px;color:${MUTED};">${escapeHtml(ctx.signatories[0].organization)}</div>`
                : ""
            }
          </div>
        </section>
      </div>
    </div>
  </body></html>`;
}

// Rendered once by Puppeteer's footerTemplate and repeated on every page — see renderReportPdf().
// pageNumber/totalPages are special classes Puppeteer auto-populates per page.
function buildFooterTemplate(report: ReportDefinition): string {
  return `
    <div style="width:100%;box-sizing:border-box;font-size:9px;padding:10px 32px;border-top:1.5px solid ${PRIMARY};display:flex;justify-content:space-between;font-family:Arial;color:#444;background:#fff;">
      <span>${escapeHtml(report.context.footer ?? "")}</span>
      <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span> · ${escapeHtml(report.context.reportId)}</span>
    </div>
  `;
}

export async function renderReportPdf(
  report: ReportDefinition,
): Promise<Buffer> {
  if (
    !fs.existsSync(CHROME_PATH) &&
    !process.env.PUPPETEER_SKIP_CHROMIUM_CHECK
  ) {
    throw new Error(
      `Chrome/Chromium executable not found at ${CHROME_PATH}. Set CHROME_PATH environment variable.`,
    );
  }
  const browser = await puppeteer.launch({
    executablePath: fs.existsSync(CHROME_PATH) ? CHROME_PATH : undefined,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  try {
    const page = await browser.newPage();
    const html = buildHtml(report);
    await page.setContent(html, { waitUntil: "domcontentloaded" });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      // top reserves space for the repeating header (~18px*2 padding + 48px logo ≈ 92px, +8px breathing room)
      margin: { top: "100px", right: "0", bottom: "60px", left: "0" },
      displayHeaderFooter: true,
      headerTemplate: buildHeaderTemplate(report),
      footerTemplate: buildFooterTemplate(report),
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
