import { createFileRoute } from "@tanstack/react-router";
import React from "react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, FileDown, CheckCircle2, Clock, AlertCircle, Loader2 } from "lucide-react";
import { useActivities } from "@/hooks/use-data";

export const Route = createFileRoute("/reports/activities")({
  component: ActivitiesReportPage,
});

function ActivitiesReportPage() {
  const { data: activities, isLoading } = useActivities();

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Aggregate data for pie chart
  const types = ["Planting", "Irrigation", "Fertilizing", "Harvesting", "Pruning", "Pest Control"];
  const typeColors: Record<string, string> = {
    Planting: "#10b981",
    Irrigation: "#3b82f6",
    Fertilizing: "#f59e0b",
    Harvesting: "#ef4444",
    Pruning: "#8b5cf6",
    "Pest Control": "#06b6d4"
  };

  const activityStats = types.map(type => ({
    name: type,
    value: (activities?.data || []).filter((a: any) => a.activityType === type).length,
    color: typeColors[type] || "#cbd5e1"
  })).filter(t => t.value > 0);

  // If no activities yet, show a placeholder for the pie
  const displayStats = activityStats.length > 0 ? activityStats : [{ name: "No Data", value: 1, color: "#f1f5f9" }];

  const exportCSV = () => {
    const headers = ["ID", "Task", "Date", "Notes"];
    const csvContent = [
      headers.join(","),
      ...(activities?.data || []).map((row: any) => `${row.id},${row.activityType},${row.activityDate},${row.notes?.replace(/,/g, ' ')}`)
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "activities-report.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold">Activity Summary</h3>
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

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="flex items-center p-4">
          <div className="mr-4 rounded-full bg-emerald-100 p-2 text-emerald-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
            <h3 className="text-2xl font-bold">{activities?.data?.length || 0}</h3>
          </div>
        </Card>
        <Card className="flex items-center p-4">
          <div className="mr-4 rounded-full bg-blue-100 p-2 text-blue-600">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">This Month</p>
            <h3 className="text-2xl font-bold">{(activities?.data || []).length}</h3>
          </div>
        </Card>
        <Card className="flex items-center p-4">
          <div className="mr-4 rounded-full bg-amber-100 p-2 text-amber-600">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
            <h3 className="text-2xl font-bold">0</h3>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Work Distribution</CardTitle>
            <CardDescription>Breakdown of activity types</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={displayStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {displayStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daily Activity Load</CardTitle>
            <CardDescription>Tasks recorded per day</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={(activities?.data || []).slice(0, 7)}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="activityDate" tickFormatter={(v) => new Date(v).toLocaleDateString([], { day: 'numeric', month: 'short' })} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="id" fill="#10b981" name="Task ID" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detailed Task History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Task</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Date</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Notes</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {(activities?.data || []).map((row: any) => (
                  <tr key={row.id} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-4 align-middle font-medium">{row.activityType}</td>
                    <td className="p-4 align-middle text-muted-foreground">{new Date(row.activityDate).toLocaleDateString()}</td>
                    <td className="p-4 align-middle max-w-[200px] truncate">{row.notes}</td>
                    <td className="p-4 align-middle">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-transparent bg-emerald-100 text-emerald-800`}>
                        Recorded
                      </span>
                    </td>
                  </tr>
                ))}
                {(!activities?.data || activities.data.length === 0) && (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-muted-foreground">No activity records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
