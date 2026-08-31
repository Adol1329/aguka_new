import puppeteer from "puppeteer-core";
import {
  reportBrandingService,
  BrandingMetadata,
} from "./report-branding.service.js";

export interface ReportSection {
  heading: string;
  icon?: string;
  content?: string | string[];
  table?: Array<{ label: string; value: string }>;
  isPerformanceBox?: boolean;
}

export interface ReportData {
  title: string;
  subtitle: string;
  date: Date;
  certificateNo: string;
  season: string;
  qrCodeData: string;
  sections: ReportSection[];
  isCertificate?: boolean;
  isPerformanceBox?: boolean;
  signingInfo?: {
    officerName: string;
    signedAt: Date;
    signatureHash: string;
    fingerprint: string;
  };
}

function resolveChromePath(): string {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  if (process.platform === "linux") return "/usr/bin/chromium-browser";
  if (process.platform === "darwin")
    return "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  return "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
}

const CHROME_PATH = resolveChromePath();

export interface ReportPdfOptions extends Partial<BrandingMetadata> {
  margin?: { top: string; bottom: string; left: string; right: string };
  displayHeaderFooter?: boolean;
}

export class ReportPdfEngine {
  async convertHtmlToPdf(
    html: string,
    options: ReportPdfOptions = {
      reportTitle: "AGUKA Report",
      generatedAt: new Date(),
    },
  ): Promise<Buffer> {
    const browser = await puppeteer.launch({
      executablePath: CHROME_PATH,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    try {
      const page = await browser.newPage();

      const wrappedHtml = html.includes('class="watermark"')
        ? html
        : `
          <style>${reportBrandingService.getWatermarkCSS()}</style>
          <div class="watermark">AGUKA SMART FARMING KIT</div>
          ${html}
        `;

      await page.setContent(wrappedHtml, { waitUntil: "domcontentloaded" });

      const headerTemplate = reportBrandingService.getPDFHeaderTemplate({
        reportTitle: options.reportTitle || "AGUKA Report",
        generatedAt: options.generatedAt || new Date(),
        userRole: options.userRole,
        generatedBy: options.generatedBy,
        season: options.season,
      });

      const footerTemplate = reportBrandingService.getPDFFooterTemplate();

      const pdf = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: options.margin || {
          top: "100px",
          bottom: "70px",
          left: "24px",
          right: "24px",
        },
        displayHeaderFooter: options.displayHeaderFooter ?? true,
        headerTemplate,
        footerTemplate,
      });
      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
  }

  formatReportDate(isoString: string | Date): string {
    return reportBrandingService.formatDate(isoString);
  }

  truncate(str: string, max: number): string {
    return reportBrandingService.truncate(str, max);
  }

  statusBadge(status: string): string {
    return reportBrandingService.statusBadge(status);
  }

  getLogoBase64(): string {
    return reportBrandingService.getLogoBase64();
  }

  private getSignatureBase64(): string {
    return reportBrandingService.getSignatureBase64();
  }

  createHtml(data: ReportData): string {
    const score = parseInt(
      data.sections
        .find((s) => s.isPerformanceBox)
        ?.content?.[0].match(/\d+/)?.[0] || "0",
    );
    const compliance = parseInt(
      data.sections
        .find((s) => s.heading.includes("IRRIGATION"))
        ?.content?.[0].match(/\d+/)?.[0] || "0",
    );

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.title}</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
    <style>
        :root {
            --primary: ${data.isCertificate ? "#1D9E75" : "#555555"};
            --primary-light: ${data.isCertificate ? "#eaf6f2" : "#f0f0f0"};
            --text: #1f2937;
            --border: #e5e7eb;
            --red: #ef4444;
            --amber: #f59e0b;
            --blue: #3b82f6;
        }

        @page {
            size: A4;
            margin: 0;
        }

        html, body {
            font-family: system-ui, -apple-system, sans-serif;
            margin: 0;
            padding: 0;
            color: var(--text);
            background: #f5f5f5;
            word-wrap: break-word;
            overflow-wrap: break-word;
            width: 210mm;
            height: 297mm;
            max-height: 297mm;
            overflow: hidden;
        }

        .certificate {
            width: 210mm;
            height: 297mm;
            max-height: 297mm;
            margin: 0 auto;
            background: white;
            padding: 15mm;
            box-sizing: border-box;
            position: relative;
            border: ${data.isCertificate ? "12px solid var(--primary-light)" : "1px solid #ddd"};
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
            overflow: hidden;
            page-break-inside: avoid;
            break-inside: avoid;
        }

        .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 100px;
            color: ${data.isCertificate ? "rgba(29, 158, 117, 0.05)" : "rgba(153, 153, 153, 0.05)"};
            font-weight: bold;
            pointer-events: none;
            z-index: 0;
            white-space: nowrap;
        }

        .header {
            display: flex;
            justify-content: ${data.isCertificate ? "space-between" : "flex-start"};
            align-items: center;
            border-bottom: 2px solid var(--primary);
            padding-bottom: 10px;
            margin-bottom: 15px;
            position: relative;
            z-index: 1;
            gap: 15px;
        }

        .logo-box { width: 80px; flex-shrink: 0; }
        .logo-box img {
            width: 100%;
            height: auto;
            display: block;
            filter: ${data.isCertificate ? "none" : "grayscale(100%) opacity(60%)"};
        }

        .title-box {
            text-align: ${data.isCertificate ? "center" : "left"};
            flex-grow: 1;
        }

        .title-box h1 {
            color: var(--primary);
            font-size: 20px;
            margin: 0;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .title-box p {
            color: #666;
            font-size: 12px;
            margin: 2px 0 0 0;
            font-weight: 500;
        }

        .meta-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
            margin-top: 15px;
            padding: 10px;
            background: #fdfdfd;
            border: 1px solid #eee;
            border-radius: 8px;
        }

        .meta-item {
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }

        .meta-label {
            font-size: 9px;
            text-transform: uppercase;
            color: #999;
            font-weight: bold;
            margin-bottom: 3px;
        }

        .meta-value {
            font-size: 12px;
            font-weight: 600;
            color: #333;
            word-break: break-word;
            overflow-wrap: break-word;
            white-space: normal;
        }

        .section {
            margin-top: 10px;
        }

        .section-header {
            display: flex;
            align-items: center;
            gap: 8px;
            border-bottom: 2px solid var(--primary-light);
            padding-bottom: 3px;
            margin-bottom: 5px;
            color: var(--primary);
            font-weight: bold;
            text-transform: uppercase;
            font-size: 12px;
        }

        .performance-container {
            display: flex;
            gap: 20px;
            margin-bottom: 10px;
            background: var(--primary-light);
            padding: 10px 15px;
            border-radius: 8px;
            position: relative;
            z-index: 1;
            page-break-inside: avoid;
            break-inside: avoid;
        }

        .gauge-box {
            position: relative;
            width: 100px;
            height: 60px;
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .gauge-svg {
            width: 100px;
            height: 50px;
        }

        .gauge-text {
            font-weight: bold;
            font-size: 16px;
            margin-top: -20px;
            color: var(--primary);
        }

        .compliance-box {
            flex: 1;
        }

        .progress-bar {
            width: 100%;
            height: 12px;
            background: #ddd;
            border-radius: 6px;
            margin-top: 10px;
            overflow: hidden;
        }

        .progress-fill {
            height: 100%;
            background: var(--primary);
            width: ${compliance}%;
        }

        .footer-signatures {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-top: 15px;
            position: relative;
            z-index: 1;
            page-break-inside: avoid;
            break-inside: avoid;
        }

        .stamp-circle {
            width: 80px;
            height: 80px;
            border: 2px double var(--primary);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 8px;
            color: var(--primary);
            text-align: center;
            padding: 5px;
            font-weight: bold;
            text-transform: uppercase;
        }

        .certificate-footer {
            position: absolute;
            bottom: 5mm;
            left: 15mm;
            right: 15mm;
            text-align: center;
            font-size: 9px;
            color: #999;
            border-top: 1px solid var(--border);
            padding-top: 10px;
            page-break-inside: avoid;
            break-inside: avoid;
        }

        @media print {
            body, html {
                background: white;
                margin: 0 !important;
                padding: 0 !important;
                width: 210mm !important;
                height: 297mm !important;
                max-height: 297mm !important;
                overflow: hidden !important;
            }
            .certificate {
                box-shadow: none;
                margin: 0 !important;
                padding: 10mm !important;
                border: ${data.isCertificate ? "10px solid var(--primary-light)" : "none"} !important;
                width: 100% !important;
                height: 100% !important;
                max-height: 297mm !important;
                overflow: hidden !important;
                page-break-inside: avoid !important;
                break-inside: avoid !important;
                transform: scale(0.99);
                transform-origin: top left;
            }
            * {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
            }
        }
    </style>
</head>
<body>
    <div class="certificate">
        <div class="watermark">${data.isCertificate ? "CERTIFIED" : "REPORT ONLY"}</div>
        
        <div class="header">
            <div class="logo-box">
                <img src="${this.getLogoBase64()}" alt="AGUKA Logo" />
            </div>
            <div class="title-box">
                <h1>${data.title}</h1>
                <p>${data.subtitle}</p>
            </div>
        </div>

        <div class="meta-grid">
            <div class="meta-item">
                <span class="meta-label">Farmer Name</span>
                <span class="meta-value">${data.subtitle}</span>
            </div>
            <div class="meta-item">
                <span class="meta-label">Reference ID</span>
                <span class="meta-value">${data.certificateNo}</span>
            </div>
            <div class="meta-item">
                <span class="meta-label">Date Issued</span>
                <span class="meta-value">${data.date.toLocaleDateString()}</span>
            </div>
        </div>

        ${
          data.isPerformanceBox
            ? `
        <div class="performance-container">
            <div class="gauge-box">
                <svg class="gauge-svg" viewBox="0 0 120 60">
                    <path d="M 10 50 A 40 40 0 0 1 110 50" fill="none" stroke="#ddd" stroke-width="12" />
                    <path d="M 10 50 A 40 40 0 0 1 110 50" fill="none" stroke="#1D9E75" stroke-width="12" 
                          stroke-dasharray="${(score / 100) * 126}, 126" />
                </svg>
                <div class="gauge-text">${score}%</div>
                <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 1px; font-weight: bold; margin-top: 5px;">Performance</div>
            </div>
            <div class="compliance-box">
                <div style="font-size: 13px; font-weight: bold; text-transform: uppercase; color: var(--primary);">Seasonal Compliance</div>
                <div class="progress-bar">
                    <div class="progress-fill"></div>
                </div>
                <div style="font-size: 11px; margin-top: 8px; color: #555;">
                    This farmer achieved <strong>${compliance}%</strong> irrigation and monitoring compliance verified by IoT sensors.
                </div>
            </div>
        </div>
        `
            : ""
        }

        ${data.sections
          .filter((s) => !s.isPerformanceBox && !s.heading.includes("DETAILS"))
          .map((section) => {
            const hasContent = Array.isArray(section.content)
              ? section.content.length > 0
              : !!section.content;
            const hasTable = section.table && section.table.length > 0;

            if (!hasContent && !hasTable) return "";

            return `
            <div class="section">
                <div class="section-header">
                    <span>${section.icon || "•"}</span>
                    <span>${section.heading}</span>
                </div>
                <div style="padding-left: 30px;">
                    ${
                      section.table
                        ? `
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px 20px;">
                            ${section.table
                              .map(
                                (r) => `
                                <div style="font-size: 11px; display: flex; flex-direction: column; border-bottom: 1px solid #f9f9f9; padding: 4px 0;">
                                    <span style="color: #888; font-size: 9px; text-transform: uppercase; margin-bottom: 2px;">${r.label}</span>
                                    <span style="font-weight: 500; font-size: 11px;">${r.value}</span>
                                </div>
                            `,
                              )
                              .join("")}
                        </div>
                    `
                        : ""
                    }
                    ${
                      section.content
                        ? `
                        <div style="font-size: 12px; color: #444; line-height: 1.6; margin-top: 10px;">
                            ${Array.isArray(section.content) ? section.content.map((line) => `• ${line}`).join("<br>") : section.content}
                        </div>
                    `
                        : ""
                    }
                </div>
            </div>
            `;
          })
          .join("")}

        ${
          data.isCertificate
            ? `
        <div class="footer-signatures">
            <div>
                <div id="qrcode"></div>
                <div style="font-size: 8px; color: #888; margin-top: 4px; text-transform: uppercase;">Certificate Verification</div>
            </div>
            <div style="text-align: right;">
                <div style="display: flex; flex-direction: column; align-items: center; border-bottom: 1px solid #333; padding-bottom: 5px;">
                    <img src="${this.getSignatureBase64()}" style="height: 35px; margin-bottom: 5px; filter: grayscale(100%); mix-blend-mode: multiply;" alt="Signature" onerror="this.style.display='none'" />
                    <span style="font-size: 12px; font-weight: bold;">${data.signingInfo?.officerName || "Authorized Officer"}</span>
                </div>
                <div style="font-size: 11px; color: #666; margin-top: 5px;">
                    Digital Verification Date: ${data.signingInfo ? data.signingInfo.signedAt.toLocaleDateString() : data.date.toLocaleDateString()}
                </div>
                ${
                  data.signingInfo
                    ? `
                <div style="font-size: 9px; color: #999; margin-top: 5px; font-family: monospace; letter-spacing: 1px;">
                    CERT FINGERPRINT: ${data.signingInfo.fingerprint}
                </div>
                `
                    : ""
                }
            </div>
            <div class="stamp-circle">
                AGUKA PLATFORM<br>OFFICIAL STAMP
            </div>
        </div>
        `
            : ""
        }
    </div>

    <script>
        ${
          data.isCertificate
            ? `
        new QRCode(document.getElementById("qrcode"), {
            text: "https://verify.imbaraga.org/cert/${data.certificateNo}",
            width: 80,
            height: 80,
            colorDark : "#004D40",
            colorLight : "#ffffff",
            correctLevel : QRCode.CorrectLevel.H
        });
        `
            : ""
        }
    </script>
</body>
</html>`;
  }
}

export const reportPdfEngine = new ReportPdfEngine();
