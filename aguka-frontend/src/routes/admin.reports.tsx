import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, StatCard } from "@/components/dashboard-ui";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Download,
  DollarSign,
  FileBarChart,
  CalendarRange,
  Loader2,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  reportsApi,
  type FinancialPayment,
  type FinancialReportResult,
  type GeneratedFinancialReport,
} from "@/api/reports";
import { superAdminApi } from "@/api/superadmin";

export const Route = createFileRoute("/admin/reports")({
  component: AdminReports,
});

interface CooperativeOption {
  id: string;
  name: string;
}

function AdminReports() {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [cooperativeId, setCooperativeId] = useState("");
  const [cooperatives, setCooperatives] = useState<CooperativeOption[]>([]);
  const [generating, setGenerating] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);
  const [financialReport, setFinancialReport] = useState<FinancialReportResult | null>(null);
  const [generatedReports, setGeneratedReports] = useState<GeneratedFinancialReport[]>([]);

  useEffect(() => {
    Promise.all([
      reportsApi.listFinancialReports().then((response) => response.data || []),
      superAdminApi.getCooperatives().then((response) => response.data || []),
    ])
      .then(([reports, coops]) => {
        setGeneratedReports(reports);
        setCooperatives(
          coops.map((coop: { id: string; name: string }) => ({
            id: coop.id,
            name: coop.name,
          })),
        );
      })
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : "Failed to load report data");
      });
  }, []);

  const handleGenerate = async () => {
    if (!dateFrom || !dateTo) {
      toast.error("Please select a start and end date");
      return;
    }

    setGenerating(true);
    try {
      const response = await reportsApi.generateFinancialReport({
        startDate: dateFrom,
        endDate: dateTo,
        cooperativeId: cooperativeId || undefined,
      });
      if (response.data) {
        setFinancialReport(response.data);
        setGeneratedReports((current) => [response.data!.report, ...current]);
      }
      toast.success("Financial report generated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate report");
    } finally {
      setGenerating(false);
    }
  };

  const handleExport = async (reportId: string, format: "pdf" | "csv") => {
    setExporting(`${reportId}-${format}`);
    try {
      await reportsApi.exportFinancialReport(reportId, format);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : `Failed to export ${format.toUpperCase()}`,
      );
    } finally {
      setExporting(null);
    }
  };

  const summary = financialReport?.summary;
  const payments = financialReport?.payments || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader title="System Reports" subtitle="Generate system-wide and financial reports." />
        <Button onClick={handleGenerate} disabled={generating}>
          {generating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Generate Financial Report
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex items-center gap-2 pb-2">
            <CalendarRange className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Financial Period
            </span>
          </div>
          <DateInput label="From" value={dateFrom} onChange={setDateFrom} />
          <DateInput label="To" value={dateTo} onChange={setDateTo} />
          <div className="flex min-w-56 flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Cooperative
            </label>
            <select
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={cooperativeId}
              onChange={(event) => setCooperativeId(event.target.value)}
            >
              <option value="">All cooperatives</option>
              {cooperatives.map((coop) => (
                <option key={coop.id} value={coop.id}>
                  {coop.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard
          label="Total Revenue"
          value={`${(summary?.totalRevenue || 0).toLocaleString()} RWF`}
          icon={DollarSign}
          accent="success"
        />
        <StatCard
          label="Total Refunds"
          value={`${(summary?.totalRefunds || 0).toLocaleString()} RWF`}
          icon={RefreshCw}
          accent="warning"
        />
        <StatCard
          label="Net Revenue"
          value={`${(summary?.netRevenue || 0).toLocaleString()} RWF`}
          icon={FileBarChart}
          accent="primary"
        />
        <StatCard
          label="Transactions"
          value={summary?.transactionCount || 0}
          icon={FileBarChart}
          accent="info"
        />
      </div>

      {financialReport && (
        <Card className="p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-bold">Generated Financial Report</h3>
              <p className="text-xs text-muted-foreground">
                {dateFrom} to {dateTo}
              </p>
            </div>
            <div className="flex gap-2">
              <ExportButton
                label="Export PDF"
                loading={exporting === `${financialReport.report.id}-pdf`}
                onClick={() => handleExport(financialReport.report.id, "pdf")}
              />
              <ExportButton
                label="Export CSV"
                loading={exporting === `${financialReport.report.id}-csv`}
                onClick={() => handleExport(financialReport.report.id, "csv")}
              />
            </div>
          </div>
          <TransactionTable payments={payments} />
        </Card>
      )}

      <Card className="p-6">
        <h3 className="mb-4 font-display text-lg font-semibold">Previously Generated Reports</h3>
        <div className="space-y-2">
          {generatedReports.map((report) => (
            <div
              key={report.id}
              className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="text-sm font-bold">
                  Financial Report {report.periodStart?.slice(0, 10) || ""}
                  {report.periodEnd ? ` to ${report.periodEnd.slice(0, 10)}` : ""}
                </div>
                <div className="text-xs text-muted-foreground">
                  Generated {new Date(report.createdAt).toLocaleString()}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleExport(report.id, "pdf")}>
                  <Download className="mr-1.5 h-3.5 w-3.5" />
                  PDF
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleExport(report.id, "csv")}>
                  <Download className="mr-1.5 h-3.5 w-3.5" />
                  CSV
                </Button>
              </div>
            </div>
          ))}
          {generatedReports.length === 0 && (
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              No financial reports generated yet.
            </div>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="mb-4 font-display text-lg font-semibold">Interactive Reports</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            {
              title: "Soil Analysis Report",
              href: "/reports/soil",
              description: "Moisture, pH, and nutrient trends",
            },
            {
              title: "Weather History",
              href: "/reports/weather",
              description: "Temperature and rainfall patterns",
            },
            {
              title: "Farmer Activity Log",
              href: "/reports/activities",
              description: "Task completion and distribution",
            },
          ].map((report) => (
            <Link
              key={report.href}
              to={report.href}
              className="group flex flex-col gap-2 rounded-lg border p-4 transition-colors hover:border-primary/50 hover:bg-muted/50"
            >
              <div className="text-sm font-bold transition-colors group-hover:text-primary">
                {report.title}
              </div>
              <div className="text-xs text-muted-foreground">{report.description}</div>
              <span className="mt-1 flex items-center gap-1 text-[10px] font-bold text-primary">
                <ExternalLink className="h-3 w-3" /> View Report
              </span>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}

function DateInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      <input
        type="date"
        className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

function ExportButton({
  label,
  loading,
  onClick,
}: {
  label: string;
  loading: boolean;
  onClick: () => void;
}) {
  return (
    <Button variant="outline" size="sm" onClick={onClick} disabled={loading}>
      {loading ? (
        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
      ) : (
        <Download className="mr-1.5 h-3.5 w-3.5" />
      )}
      {label}
    </Button>
  );
}

function TransactionTable({ payments }: { payments: FinancialPayment[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
          <tr>
            <th className="px-3 py-2">Payer</th>
            <th className="px-3 py-2">Type</th>
            <th className="px-3 py-2">Provider</th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment) => (
            <tr key={payment.id} className="border-t">
              <td className="px-3 py-2">
                <div className="font-medium">{payment.user?.fullName || payment.phoneNumber}</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(payment.createdAt).toLocaleString()}
                </div>
              </td>
              <td className="px-3 py-2">{payment.paymentType}</td>
              <td className="px-3 py-2">{payment.provider}</td>
              <td className="px-3 py-2">{payment.status}</td>
              <td className="px-3 py-2 text-right font-bold">
                {payment.amount.toLocaleString()} {payment.currency}
              </td>
            </tr>
          ))}
          {payments.length === 0 && (
            <tr>
              <td colSpan={5} className="px-3 py-8 text-center text-muted-foreground">
                No payment transactions found for this period.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
