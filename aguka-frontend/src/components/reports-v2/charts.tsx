import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, LineChart as LineIcon, PieChart as PieIcon } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart as RechartsPie,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ReportChartSection } from "@/api/reports-v2";

const PIE_COLORS = [
  "#1a6b2a",
  "#0ea5e9",
  "#f59e0b",
  "#dc2626",
  "#8b5cf6",
  "#22c55e",
  "#0f4a1d",
  "#0284c7",
];

export function isChartEmpty(chart: ReportChartSection): boolean {
  return (
    chart.data.length === 0 ||
    chart.data.every((d) => !d.value && !d.secondary)
  );
}

export function ChartGrid({ charts }: { charts: ReportChartSection[] }) {
  const visibleCharts = charts.filter((c) => !isChartEmpty(c));
  if (visibleCharts.length === 0) return null;
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {visibleCharts.map((chart, i) => (
        <ChartCard key={`${chart.heading}-${i}`} chart={chart} />
      ))}
    </div>
  );
}

function ChartCard({ chart }: { chart: ReportChartSection }) {
  const Icon =
    chart.type === "bar"
      ? BarChart3
      : chart.type === "pie" || chart.type === "doughnut"
        ? PieIcon
        : LineIcon;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="h-4 w-4 text-primary" />
          {chart.icon && <span>{chart.icon}</span>}
          {chart.heading}
        </CardTitle>
        {chart.description && <CardDescription>{chart.description}</CardDescription>}
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart(chart)}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function renderChart(chart: ReportChartSection) {
  const hasSecondary = chart.data.some((d) => d.secondary !== undefined);
  if (chart.type === "pie" || chart.type === "doughnut") {
    return (
      <RechartsPie>
        <Tooltip />
        <Legend />
        <Pie data={chart.data} dataKey="value" nameKey="label" outerRadius={90} label>
          {chart.data.map((_, i) => (
            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
          ))}
        </Pie>
      </RechartsPie>
    );
  }
  if (chart.type === "bar") {
    return (
      <BarChart data={chart.data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} unit={chart.unit ?? ""} />
        <Tooltip />
        <Legend />
        <Bar dataKey="value" name={chart.yLabel ?? "Value"} fill="#1a6b2a" radius={[4, 4, 0, 0]} />
        {hasSecondary && (
          <Bar
            dataKey="secondary"
            name={`${chart.yLabel ?? "Value"} (2nd)`}
            fill="#0ea5e9"
            radius={[4, 4, 0, 0]}
          />
        )}
      </BarChart>
    );
  }
  return (
    <LineChart data={chart.data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="label" tick={{ fontSize: 11 }} />
      <YAxis tick={{ fontSize: 11 }} unit={chart.unit ?? ""} />
      <Tooltip />
      <Legend />
      <Line
        type="monotone"
        dataKey="value"
        name={chart.yLabel ?? "Value"}
        stroke="#1a6b2a"
        strokeWidth={2}
        dot={{ r: 3 }}
      />
      {hasSecondary && (
        <Line
          type="monotone"
          dataKey="secondary"
          name={`${chart.yLabel ?? "Value"} (2nd)`}
          stroke="#0ea5e9"
          strokeWidth={2}
          dot={{ r: 3 }}
        />
      )}
    </LineChart>
  );
}
