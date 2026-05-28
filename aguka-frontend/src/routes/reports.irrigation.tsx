import { createFileRoute } from "@tanstack/react-router";
import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, FileDown, Droplets, Loader2 } from "lucide-react";
import { useIrrigationLogs, useIrrigationStatus } from "@/hooks/use-data";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

export const Route = createFileRoute("/reports/irrigation")({
  component: IrrigationReportPage,
});

function IrrigationReportPage() {
  const [metric, setMetric] = useState("usage");
  const { data: irrigationLogs, isLoading } = useIrrigationLogs();
  const { data: irrigationStatus } = useIrrigationStatus();

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Transform real irrigation logs to chart data
  const irrigationData = (irrigationLogs || []).map((log: any) => ({
    zone: log.zoneId || "Unknown Zone",
    usage: log.waterUsedLiters || 0,
    duration: log.durationMinutes || 0,
    waterSaved: 0,
    status: log.status
  }));

  const totalUsage = irrigationData.reduce((acc: number, curr: any) => acc + curr.usage, 0);
  const avgEfficiency = irrigationData.length > 0
    ? (irrigationData.reduce((acc: number, curr: any) => acc + curr.waterSaved, 0) / irrigationData.length).toFixed(1)
    : "0";

  const exportCSV = () => {
    const headers = ["Zone", "Water Usage (L)", "Duration (min)", "Status"];
    const csvContent = [
      headers.join(","),
      ...irrigationData.map((row: any) => `${row.zone},${row.usage},${row.duration},${row.status}`)
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "irrigation-report.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Select value={metric} onValueChange={setMetric}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select metric" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="usage">Water Usage (L)</SelectItem>
              <SelectItem value="duration">Duration (Minutes)</SelectItem>
              <SelectItem value="waterSaved">Efficiency (Water Saved %)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCSV}>
            <Table className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button>
            <FileDown className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Irrigation by Zone</CardTitle>
            <CardDescription>Comparison of resources across different farm zones</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
            {irrigationData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                No irrigation data available.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={irrigationData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" />
                  <YAxis dataKey="zone" type="category" width={100} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey={metric} fill="#3b82f6" radius={[0, 4, 4, 0]}>
                    {irrigationData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#3b82f6" : "#60a5fa"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Water Consumed</CardDescription>
              <CardTitle className="text-3xl font-bold">{totalUsage.toLocaleString()} L</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                {irrigationData.length} irrigation {irrigationData.length === 1 ? 'log' : 'logs'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Average Efficiency</CardDescription>
              <CardTitle className="text-3xl font-bold">{avgEfficiency}%</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                Based on available data
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>System Status</CardDescription>
              <CardTitle className="text-3xl font-bold">{irrigationStatus?.isActive ? "Active" : "Inactive"}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mt-2">
                <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                  <div className="h-full w-[85%] bg-blue-500" />
                </div>
                <span className="text-xs font-medium">85%</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Irrigation Logs</CardTitle>
        </CardHeader>
        <CardContent>
          {irrigationData.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No irrigation logs available.
            </div>
          ) : (
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b transition-colors hover:bg-muted/50">
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Zone</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Duration</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Usage</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {irrigationData.map((row: any) => (
                    <tr key={row.zone} className="border-b transition-colors hover:bg-muted/50">
                      <td className="p-4 align-middle font-medium">{row.zone}</td>
                      <td className="p-4 align-middle">{row.duration} min</td>
                      <td className="p-4 align-middle">{row.usage} L</td>
                      <td className="p-4 align-middle">
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${row.status === "completed" ? "bg-emerald-100 text-emerald-800 border-transparent" : "bg-yellow-100 text-yellow-800 border-transparent"}`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
