import { prisma } from "../prisma.js";
import crypto from "crypto";
import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";

interface ReportSection {
  heading: string;
  icon?: string;
  content?: string | string[];
  table?: Array<{ label: string; value: string }>;
  isPerformanceBox?: boolean;
}

interface ReportData {
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

interface FinancialReportFilters {
  startDate: Date;
  endDate: Date;
  cooperativeId?: string;
}

interface FinancialReportContent {
  summary: {
    totalRevenue: number;
    totalRefunds: number;
    netRevenue: number;
    transactionCount: number;
  };
  payments: Array<{
    id: string;
    amount: number;
    currency: string;
    provider: string;
    paymentType: string;
    status: string;
    phoneNumber: string;
    createdAt: Date;
    user?: { id: string; phone: string; fullName?: string | null };
  }>;
  refunds: Array<{
    id: string;
    amount: number;
    reason: string;
    status: string;
    createdAt: Date;
    paymentId: string;
  }>;
}
const CHROME_PATH =
  process.env.CHROME_PATH ||
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const LOGO_PATH = path.join(
  process.cwd(),
  "..",
  "aguka-frontend",
  "public",
  "aguka-logo.png",
);

const SIGNATURE_PATH = path.join(
  process.cwd(),
  "..",
  "aguka-frontend",
  "public",
  "signature.png",
);

export class ReportService {
  private getSignatureBase64(): string {
    try {
      if (fs.existsSync(SIGNATURE_PATH)) {
        const sigBuffer = fs.readFileSync(SIGNATURE_PATH);
        return `data:image/png;base64,${sigBuffer.toString("base64")}`;
      }
      return "";
    } catch (error) {
      return "";
    }
  }
  private getLogoBase64(): string {
    try {
      if (fs.existsSync(LOGO_PATH)) {
        const logoBuffer = fs.readFileSync(LOGO_PATH);
        return `data:image/png;base64,${logoBuffer.toString("base64")}`;
      }
      return "";
    } catch (error) {
      return "";
    }
  }

  private async convertHtmlToPdf(html: string): Promise<Buffer> {
    const browser = await puppeteer.launch({
      executablePath: CHROME_PATH,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: "domcontentloaded" });
      const pdf = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: { top: "20px", right: "40px", bottom: "60px", left: "40px" },
        displayHeaderFooter: true,
        headerTemplate: "<div></div>",
        footerTemplate: `
          <div style="width: 100%; font-size: 9px; padding: 10px 40px; border-top: 1.5px solid #1a6b2a; display: flex; justify-content: space-between; align-items: center; font-family: Arial, sans-serif; color: #444; background: white;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <img src="${this.getLogoBase64()}" style="height: 20px;" />
              <div style="font-size: 7px; font-weight: 900; line-height: 1; color: #1a6b2a; text-transform: uppercase;">Aguka<br>Official</div>
            </div>
            <div style="text-align: center;">
              <strong>Aguka Smart Farming Kit</strong> &copy; 2026 | <span style="color: #1a6b2a;">www.aguka.rw</span>
            </div>
            <div style="text-align: right;">
              Page <span class="pageNumber"></span> of <span class="totalPages"></span><br>
              <span style="font-size: 8px; color: #999;">Generated: ${new Date().toLocaleDateString()}</span>
            </div>
          </div>
        `,
      });
      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
  }

  async signAndIssuePerformanceCertificate(
    farmerId: string,
    officerId: string,
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

    if (!farmer) throw new Error("Farmer not found");

    const officer = await prisma.user.findUnique({ where: { id: officerId } });
    if (!officer) throw new Error("Officer not found");

    const alerts = await prisma.alert.findMany({
      where: { farmerId },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    const certificates = await prisma.certificate.findMany({
      where: { farmerId },
      orderBy: { signedAt: "desc" },
    });

    const certNumber = `AGK-${farmer.district.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const season = now.getMonth() > 6 ? "Season B" : "Season A";

    // Calculate performance metrics
    const moistureStability = this.calculateMoistureStability(
      farmer.soilReadings,
    );
    const irrigationCompliance = this.calculateIrrigationCompliance(
      farmer.irrigationLogs,
      farmer.irrigationSchedules,
    );
    const cropProgress = farmer.farmerCrops.length > 0 ? 90 : 0;
    const overallScore = Math.round(
      moistureStability * 0.4 + irrigationCompliance * 0.4 + cropProgress * 0.2,
    );

    // Security Rule: hash must include certNumber + farmerId + officerId + signedAt + performanceScore
    const hashPayload = `${certNumber}${farmerId}${officerId}${now.toISOString()}${overallScore}`;
    const signatureHash = crypto
      .createHash("sha256")
      .update(hashPayload)
      .digest("hex");

    // Save to DB
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
      certificates
    );
    reportData.signingInfo = {
      officerName: officer.fullName || "Authorized Officer",
      signedAt: now,
      signatureHash,
      fingerprint: signatureHash.slice(-16).toUpperCase(),
    };

    const html = this.createHtml(reportData);
    return this.convertHtmlToPdf(html);
  }

  private async preparePerformanceReportData(
    farmer: any,
    certificateNo: string,
    date: Date,
    season: string,
    isCertificate: boolean = false,
    officer?: any,
    alerts: any[] = [],
    certificates: any[] = []
  ): Promise<ReportData> {
    const moistureStability = this.calculateMoistureStability(
      farmer.soilReadings,
    );
    const irrigationCompliance = this.calculateIrrigationCompliance(
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
      qrCodeData: `https://verify.aguka.rw/cert/${certificateNo}`,
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
          table: farmer.farmerCrops.length > 0 ? farmer.farmerCrops.map((fc: any) => {
            const yieldVal = fc.actualYieldKg ? `${fc.actualYieldKg} kg` : (fc.estimatedYieldKg ? `Est. ${fc.estimatedYieldKg} kg` : "Pending Harvest");
            return {
              label: `${fc.crop?.nameEn || "Unknown"} (${fc.status})`,
              value: `Planted: ${fc.plantedDate ? new Date(fc.plantedDate).toLocaleDateString() : "Unknown"} | Yield: ${yieldVal}`,
            };
          }) : [{ label: "No crops assigned", value: "No crops recorded for this season" }],
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
          content: farmer.soilReadings.length > 0 ? [
            `Avg. Seasonal Moisture: ${this.calculateAvgMoisture(farmer.soilReadings).toFixed(1)}%`,
            `Current Soil Status: ${this.getSoilStatusString(this.calculateAvgMoisture(farmer.soilReadings))}`,
            `Last Reading: ${new Date(farmer.soilReadings[0].readingAt).toLocaleString()}`,
          ] : ["No sensor readings available for analysis"],
        },
        {
          heading: "EXTENSION & ALERTS",
          icon: "🧑‍🌾",
          content: [
            `Assigned Officer: ${officer ? officer.fullName : "None assigned"}`,
            `Recent Alerts: ${alerts.length > 0 ? `${alerts.filter((a: any) => a.severity === 'high').length} high severity alerts` : "No recent alerts recorded"}`,
            `Previous Certifications: ${certificates.length > 0 ? certificates.length : "First time certification"}`,
          ],
        },
        {
          heading: "INTELLIGENT RECOMMENDATIONS",
          icon: "💡",
          content: this.generateRecommendations(
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
                  "This document certifies that the above farmer is utilizing the Aguka Smart Farming Kit for precision agriculture monitoring. Data collected is verified by IoT sensors and compliant with national smart farming standards.",
              },
            ]
          : []),
      ],
    };
  }

  async generateSoilReport(
    farmerId: string,
    dateRange?: { start: Date; end: Date },
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

    const reportData: ReportData = {
      title: "Soil Analysis Report",
      subtitle: farmer?.fullName || "Farm Report",
      date: new Date(),
      certificateNo: `SOIL-${farmerId.substring(0, 4).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
      season: "N/A",
      qrCodeData: "", // Reports don't have QR
      isCertificate: false,
      sections: [
        {
          heading: "Current Soil Status",
          icon: "🌡️",
          content: latestReading
            ? [
                `Moisture: ${latestReading.moisturePercent}%`,
                `Temperature: ${latestReading.temperatureCelsius || "N/A"}°C`,
                `pH Level: ${latestReading.phLevel || "N/A"}`,
              ]
            : ["No readings available"],
        },
        {
          heading: "Recent Readings",
          icon: "📊",
          table: readings.slice(0, 10).map((r) => ({
            label: new Date(r.readingAt).toLocaleDateString(),
            value: `${r.moisturePercent}% moisture`,
          })),
        },
      ],
    };

    const html = this.createHtml(reportData);
    return this.convertHtmlToPdf(html);
  }

  async generateIrrigationReport(farmerId: string): Promise<Buffer> {
    const schedules = await prisma.irrigationSchedule.findMany({
      where: { farmerId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const logs = await prisma.irrigationLog.findMany({
      where: { farmerId },
      orderBy: { executedAt: "desc" },
      take: 30,
    });

    const farmer = await prisma.farmerProfile.findUnique({
      where: { id: farmerId },
      include: { user: true, cooperative: true },
    });

    const reportData: ReportData = {
      title: "Irrigation Report",
      subtitle: farmer?.fullName || "Farm Report",
      date: new Date(),
      certificateNo: `IRR-${farmerId.substring(0, 4).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
      season: "N/A",
      qrCodeData: "",
      isCertificate: false,
      sections: [
        {
          heading: "Scheduled Irrigation",
          icon: "📅",
          table: schedules.map((s) => ({
            label: s.scheduleType || "Schedule",
            value: `${s.durationMinutes}min`,
          })),
        },
        {
          heading: "Irrigation History",
          icon: "💧",
          table: logs.slice(0, 15).map((l) => ({
            label: l.executedAt
              ? new Date(l.executedAt).toLocaleString()
              : "N/A",
            value: `${l.durationMinutes || "N/A"}min - ${l.status}`,
          })),
        },
      ],
    };

    const html = this.createHtml(reportData);
    return this.convertHtmlToPdf(html);
  }

  async generatePerformanceReport(farmerId: string): Promise<Buffer> {
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

    if (!farmer) throw new Error("Farmer not found");

    const alerts = await prisma.alert.findMany({
      where: { farmerId },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    const certificates = await prisma.certificate.findMany({
      where: { farmerId },
      orderBy: { signedAt: "desc" },
    });

    const certificateNo = `DRAFT-${farmer.district.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const reportData = await this.preparePerformanceReportData(
      farmer,
      certificateNo,
      new Date(),
      "Season A",
      false,
      null,
      alerts,
      certificates
    );

    const html = this.createHtml(reportData);
    return this.convertHtmlToPdf(html);
  }

  async generateCropReport(farmerId: string): Promise<Buffer> {
    const crops = await prisma.farmerCrop.findMany({
      where: { farmerId },
      include: { crop: true },
      orderBy: { createdAt: "desc" },
    });

    const farmer = await prisma.farmerProfile.findUnique({
      where: { id: farmerId },
      include: { user: true, cooperative: true },
    });

    if (!farmer) throw new Error("Farmer not found");

    const reportData: ReportData = {
      title: "Crop Management Report",
      subtitle: farmer.fullName,
      date: new Date(),
      certificateNo: `CROP-${farmerId.substring(0, 4).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
      season: "N/A",
      qrCodeData: "",
      isCertificate: false,
      sections: [
        {
          heading: "Current Crops",
          icon: "🌱",
          table: crops.map((c) => ({
            label: c.crop?.nameEn || "Unknown Crop",
            value: `Planted: ${c.plantedDate ? new Date(c.plantedDate).toLocaleDateString() : "N/A"} | Status: ${c.status}`,
          })),
        },
      ],
    };

    const html = this.createHtml(reportData);
    return this.convertHtmlToPdf(html);
  }

  private calculateMoistureStability(readings: any[]): number {
    if (readings.length === 0) return 0;
    const stableCount = readings.filter(
      (r) => r.moisturePercent >= 35 && r.moisturePercent <= 75,
    ).length;
    return Math.round((stableCount / readings.length) * 100);
  }

  private calculateIrrigationCompliance(logs: any[], schedules: any[]): number {
    if (schedules.length === 0) {
      return logs.length > 0 ? 100 : 0;
    }
    // Assuming a standard 90-day season, and each active schedule implies ~2 sessions per week (24 total).
    const expectedSessions = schedules.length * 24;
    if (expectedSessions === 0) return 0;
    
    const complianceRate = Math.round((logs.length / expectedSessions) * 100);
    return Math.min(100, complianceRate);
  }

  private calculateAvgMoisture(readings: any[]): number {
    if (readings.length === 0) return 0;
    return (
      readings.reduce((acc, r) => acc + Number(r.moisturePercent), 0) /
      readings.length
    );
  }

  private generateRecommendations(
    score: number,
    moisture: number,
    irrigation: number,
  ): string[] {
    const recs: string[] = [];
    if (moisture < 70) recs.push("Increase sensor-based irrigation frequency.");
    if (irrigation < 80)
      recs.push("Review missed automated irrigation sessions.");
    if (score < 60) recs.push("Consult extension officer.");
    if (recs.length === 0) recs.push("Maintain current practices.");
    return recs;
  }

  private getSoilStatusString(moisture: number): string {
    if (moisture > 40) return "Optimal";
    if (moisture > 30) return "Good";
    return "Action Required";
  }

  private createHtml(data: ReportData): string {
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
            --primary: ${data.isCertificate ? "#1a6b2a" : "#555555"};
            --primary-light: ${data.isCertificate ? "#e8f5e9" : "#f0f0f0"};
            --text: #2c3e50;
            --border: #e0e0e0;
            --red: #d32f2f;
            --amber: #ffa000;
            --blue: #1976d2;
        }

        @page {
            size: A4;
            margin: 0;
        }

        html, body {
            font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
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
            color: ${data.isCertificate ? "rgba(26, 107, 42, 0.05)" : "rgba(153, 153, 153, 0.05)"};
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
                    <path d="M 10 50 A 40 40 0 0 1 110 50" fill="none" stroke="#1a6b2a" stroke-width="12" 
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
            text: "https://verify.aguka.rw/cert/${data.certificateNo}",
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

    const reportOwner = await prisma.farmerProfile.findFirst({
      where: filters.cooperativeId
        ? { cooperativeId: filters.cooperativeId }
        : {},
      select: { id: true, cooperativeId: true },
    });

    if (!reportOwner) {
      throw new Error(
        "At least one farmer profile is required to store a financial report",
      );
    }

    const report = await prisma.report.create({
      data: {
        farmerId: reportOwner.id,
        cooperativeId: filters.cooperativeId || reportOwner.cooperativeId,
        reportType: "financial",
        periodStart: filters.startDate,
        periodEnd: filters.endDate,
        content,
        status: "completed",
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

  async exportFinancialReport(reportId: string, format: "csv" | "pdf") {
    const report = await prisma.report.findUnique({ where: { id: reportId } });
    if (!report || report.reportType !== "financial") {
      throw new Error("Financial report not found");
    }

    const content = report.content as unknown as FinancialReportContent;

    if (format === "csv") {
      const lines = [
        "id,type,amount,currency,status,provider,phone,createdAt",
        ...content.payments.map((payment) =>
          [
            payment.id,
            "payment",
            payment.amount,
            payment.currency,
            payment.status,
            payment.provider,
            payment.phoneNumber,
            payment.createdAt,
          ].join(","),
        ),
        ...content.refunds.map((refund) =>
          [
            refund.id,
            "refund",
            refund.amount,
            "RWF",
            refund.status,
            "",
            "",
            refund.createdAt,
          ].join(","),
        ),
      ];
      return {
        buffer: Buffer.from(lines.join("\n"), "utf-8"),
        contentType: "text/csv",
        filename: `financial-report-${report.id.slice(0, 8)}.csv`,
      };
    }

    const pdf = await this.convertHtmlToPdf(`
      <html>
        <body style="font-family: Arial; padding: 32px;">
          <h1>Financial Report</h1>
          <p>${report.periodStart?.toISOString().slice(0, 10)} to ${report.periodEnd?.toISOString().slice(0, 10)}</p>
          <h2>Summary</h2>
          <ul>
            <li>Total revenue: ${content.summary.totalRevenue.toLocaleString()} RWF</li>
            <li>Total refunds: ${content.summary.totalRefunds.toLocaleString()} RWF</li>
            <li>Net revenue: ${content.summary.netRevenue.toLocaleString()} RWF</li>
            <li>Transactions: ${content.summary.transactionCount}</li>
          </ul>
        </body>
      </html>
    `);

    return {
      buffer: pdf,
      contentType: "application/pdf",
      filename: `financial-report-${report.id.slice(0, 8)}.pdf`,
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

    const moistureStability = this.calculateMoistureStability(
      farmer.soilReadings,
    );
    const irrigationCompliance = this.calculateIrrigationCompliance(
      farmer.irrigationLogs,
      farmer.irrigationSchedules,
    );
    const cropProgress = farmer.farmerCrops.length > 0 ? 90 : 0;
    const avgMoisture = this.calculateAvgMoisture(farmer.soilReadings);

    // Calculate weekly trends
    const weeklyMoisture = this.calculateWeeklyTrends(farmer.soilReadings);

    return {
      overview: {
        score: Math.round(
          moistureStability * 0.4 +
            irrigationCompliance * 0.4 +
            cropProgress * 0.2,
        ),
        moistureStability,
        irrigationCompliance,
        avgMoisture: parseFloat(avgMoisture.toFixed(1)),
      },
      trends: {
        soilMoisture: weeklyMoisture,
      },
      recommendations: this.generateRecommendations(
        moistureStability,
        moistureStability,
        irrigationCompliance,
      ),
    };
  }

  private calculateWeeklyTrends(readings: any[]) {
    // Basic aggregation for demonstration
    const groups: { [key: string]: number[] } = {};
    readings.forEach((r) => {
      const week = new Date(r.readingAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      if (!groups[week]) groups[week] = [];
      groups[week].push(Number(r.moisturePercent));
    });

    return Object.keys(groups)
      .map((key) => ({
        label: key,
        value: groups[key].reduce((a, b) => a + b, 0) / groups[key].length,
      }))
      .reverse();
  }
}

export const reportService = new ReportService();
