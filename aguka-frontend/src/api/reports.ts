import { apiClient } from "./client";

export interface FinancialReportSummary {
  totalRevenue: number;
  totalRefunds: number;
  netRevenue: number;
  transactionCount: number;
}

export interface FinancialPayment {
  id: string;
  amount: number;
  currency: string;
  provider: string;
  paymentType: string;
  status: string;
  phoneNumber: string;
  createdAt: string;
  user?: { id: string; phone: string; fullName?: string };
}

export interface FinancialReportResult {
  report: {
    id: string;
    createdAt: string;
    periodStart?: string;
    periodEnd?: string;
  };
  summary: FinancialReportSummary;
  payments: FinancialPayment[];
}

export interface GeneratedFinancialReport {
  id: string;
  createdAt: string;
  periodStart?: string;
  periodEnd?: string;
  content?: { summary?: FinancialReportSummary };
}

const toDownloadParams = (params?: Record<string, string | undefined>) => {
  if (!params) return undefined;
  return Object.fromEntries(
    Object.entries(params).filter((entry): entry is [string, string] => Boolean(entry[1])),
  );
};

export const reportsApi = {
  downloadSoilReport: (params?: { start?: string; end?: string; farmerId?: string }) =>
    apiClient.download("/reports/soil", toDownloadParams(params), "soil-report.pdf"),

  downloadIrrigationReport: (params?: { farmerId?: string }) =>
    apiClient.download("/reports/irrigation", toDownloadParams(params), "irrigation-report.pdf"),

  downloadCropReport: (params?: { farmerId?: string }) =>
    apiClient.download("/reports/crops", toDownloadParams(params), "crop-report.pdf"),

  downloadPerformanceReport: (params?: { farmerId?: string }) =>
    apiClient.download("/reports/performance", toDownloadParams(params), "performance-report.pdf"),

  downloadCertificate: (farmerId: string) =>
    apiClient.download(
      `/reports/sign/${farmerId}`,
      {},
      `aguka-certificate-${farmerId.substring(0, 8)}.pdf`,
    ),

  generateFinancialReport: (data: { startDate: string; endDate: string; cooperativeId?: string }) =>
    apiClient.post<FinancialReportResult>("/reports/financial", data),

  listFinancialReports: () => apiClient.get<GeneratedFinancialReport[]>("/reports/financial"),

  exportFinancialReport: (reportId: string, format: "pdf" | "csv") =>
    apiClient.download(
      `/reports/${reportId}/export`,
      { format },
      `financial-report-${reportId.substring(0, 8)}.${format}`,
    ),
};
