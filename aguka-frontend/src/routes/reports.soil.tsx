import { createFileRoute } from "@tanstack/react-router";
import React, { useState } from "react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Filter, Table, FileDown, Loader2 } from "lucide-react";
import { useSoilReadings } from "@/hooks/use-data";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

export const Route = createFileRoute("/reports/soil")({
  component: SoilReportPage,
});

function SoilReportPage() {
  const [timeRange, setTimeRange] = useState("7d");
  const { data: soilReadings, isLoading } = useSoilReadings();

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const soilData = ((soilReadings as any)?.data || soilReadings || []).map((r: any) => ({
    date: r.readingAt ? new Date(r.readingAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'N/A',
    moisture: Number(r.moisture || 0),
    ph: Number(r.ph || 6.5),
    n: Number(r.nitrogen || 0),
    p: Number(r.phosphorus || 0),
    k: Number(r.potassium || 0),
  }));

  const exportCSV = () => {
    const headers = ["Date", "Moisture (%)", "pH", "Nitrogen (mg/kg)", "Phosphorus (mg/kg)", "Potassium (mg/kg)"];
    const csvContent = [
      headers.join(","),
      ...soilData.map((row: any) => `${row.date},${row.moisture},${row.ph},${row.n},${row.p},${row.k}`)
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "soil-report.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 3 Months</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
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

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Soil Moisture Trends</CardTitle>
            <CardDescription>Percentage of volumetric water content</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={soilData}>
                <defs>
                  <linearGradient id="colorMoisture" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis unit="%" />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="moisture" 
                  stroke="#3b82f6" 
                  fillOpacity={1} 
                  fill="url(#colorMoisture)" 
                  name="Moisture %"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Nutrient Levels (NPK)</CardTitle>
            <CardDescription>Nitrogen, Phosphorus, and Potassium levels</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={soilData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="n" stroke="#ef4444" name="Nitrogen" />
                <Line type="monotone" dataKey="p" stroke="#22c55e" name="Phosphorus" />
                <Line type="monotone" dataKey="k" stroke="#8b5cf6" name="Potassium" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Soil pH Stability</CardTitle>
          <CardDescription>Historical soil acidity levels</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={soilData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 14]} />
              <Tooltip />
              <Line type="monotone" dataKey="ph" stroke="#f59e0b" strokeWidth={2} name="pH Level" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
