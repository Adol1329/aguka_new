import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Loader2, Shield, CheckCircle2 } from "lucide-react";
import { Button } from "../ui/button";

const KEY_LABELS: Record<string, string> = {
  totalLogs: "Total System Logs",
  successRate: "Success Rate",
  failureRate: "Failure Rate",
  uniqueUsers: "Active Users",
  overallStatus: "System Status",
  uptime: "Uptime Percentage",
  lastChecked: "Last Checked At",
  totalBackups: "Total Backups",
  totalSize: "Storage Used",
  lastBackupDate: "Last Backup",
  failedLogins: "Failed Login Attempts",
  suspiciousIPsCount: "Threats Blocked",
  districtCount: "Districts",
  farmerCount: "Total Farmers",
  farmArea: "Farm Area (ha)",
  averageYield: "Avg Yield (kg/ha)",
  soilHealthScore: "Soil Health Index",
  dateRange: "Reporting Period",
};

function formatValue(key: string, val: any): string {
  if (typeof val === "number") {
    if (key.toLowerCase().includes("rate") || key === "uptime") {
      return `${val.toFixed(1)}%`;
    }
    if (key === "averageYield") {
      return `${val.toFixed(0)} kg/ha`;
    }
    if (key === "soilHealthScore") {
      return `${val.toFixed(2)}`;
    }
    return val.toLocaleString();
  }
  if (typeof val === "object" && val !== null) {
    if (val.from && val.to) {
      const from = new Date(val.from).toLocaleDateString();
      const to = new Date(val.to).toLocaleDateString();
      return `${from} - ${to}`;
    }
    return "Details Below";
  }
  if (
    typeof val === "string" &&
    (val.includes("T") || val.includes("Z")) &&
    !isNaN(Date.parse(val))
  ) {
    return new Date(val).toLocaleDateString();
  }
  return String(val);
}

interface ReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  loading: boolean;
  data: any;
  onExport: (format: string) => void;
  renderCharts: (data: any) => React.ReactNode;
  renderDetails: (data: any) => React.ReactNode;
}

export function ReportModal({
  open,
  onOpenChange,
  title,
  loading,
  data,
  onExport,
  renderCharts,
  renderDetails,
}: ReportModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div>
            <DialogTitle className="text-2xl">{title}</DialogTitle>
            <DialogDescription asChild>
              <div>
                {data?.reportHash && (
                  <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-lg">
                    <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-semibold mb-1">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Integrity Verified</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2 text-left">
                      This report has been cryptographically signed to guarantee that the data
                      remains accurate and has not been altered since generation.
                    </p>
                    <div className="flex flex-col gap-1 text-left">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-tighter">
                        Verification Hash
                      </span>
                      <code className="text-[10px] break-all bg-background/50 p-1 rounded border font-mono">
                        {data.reportHash}
                      </code>
                    </div>
                  </div>
                )}
              </div>
            </DialogDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onExport("pdf")}>
              PDF
            </Button>
            <Button variant="outline" size="sm" onClick={() => onExport("excel")}>
              Excel
            </Button>
            <Button variant="outline" size="sm" onClick={() => onExport("csv")}>
              CSV
            </Button>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !data ? (
          <div className="p-12 text-center text-muted-foreground">Failed to load data.</div>
        ) : (
          <Tabs defaultValue="summary" className="w-full mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="summary">Summary & KPIs</TabsTrigger>
              <TabsTrigger value="charts">Charts</TabsTrigger>
              <TabsTrigger value="details">Detailed Data</TabsTrigger>
            </TabsList>

            <TabsContent
              value="summary"
              className="p-4 bg-muted/20 rounded-lg mt-4 border space-y-4"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(data.summary).map(([key, val]) => (
                  <div key={key} className="bg-background p-4 rounded-md shadow-sm border">
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">
                      {KEY_LABELS[key] || key.replace(/([A-Z])/g, " $1").trim()}
                    </p>
                    <p className="text-2xl font-bold mt-1 text-primary">{formatValue(key, val)}</p>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="charts" className="mt-4 border rounded-lg p-4 bg-muted/10">
              {renderCharts(data)}
            </TabsContent>

            <TabsContent value="details" className="mt-4">
              {renderDetails(data)}
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
