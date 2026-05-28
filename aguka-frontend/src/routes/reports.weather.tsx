import { createFileRoute } from "@tanstack/react-router";
import React, { useState } from "react";
import { 
  ComposedChart,
  Line,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  LineChart
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, FileDown, CloudRain, Thermometer, Wind, Loader2 } from "lucide-react";
import { useWeatherForecast } from "@/hooks/use-data";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

export const Route = createFileRoute("/reports/weather")({
  component: WeatherReportPage,
});

function WeatherReportPage() {
  const [period, setPeriod] = useState("week");
  const { data: forecast, isLoading } = useWeatherForecast();

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const weatherData = (forecast || []).map((w: any) => ({
    date: new Date(w.forecastDate).toLocaleDateString([], { weekday: 'short' }),
    temp: Number(w.highCelsius),
    rainfall: Number(w.precipitationProbability), // Using prob as rainfall mm proxy for demo
    humidity: Number(w.humidityPercent || 60),
    wind: Number(w.windSpeedKmh || 10),
  }));

  const totalRain = weatherData.reduce((acc: number, w: any) => acc + w.rainfall, 0);
  const avgTemp = weatherData.length 
    ? (weatherData.reduce((acc: number, w: any) => acc + w.temp, 0) / weatherData.length).toFixed(1)
    : 0;
  const avgWind = weatherData.length
    ? (weatherData.reduce((acc: number, w: any) => acc + w.wind, 0) / weatherData.length).toFixed(1)
    : 0;

  const exportCSV = () => {
    const headers = ["Date", "Temperature (C)", "Rainfall (mm)", "Humidity (%)", "Wind Speed (km/h)"];
    const csvContent = [
      headers.join(","),
      ...weatherData.map((row: any) => `${row.date},${row.temp},${row.rainfall},${row.humidity},${row.wind}`)
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "weather-report.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
              <SelectItem value="season">Last Season</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
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

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="flex items-center p-4">
          <div className="mr-4 rounded-full bg-blue-100 p-2 text-blue-600">
            <CloudRain className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Precipitation Prob</p>
            <h3 className="text-2xl font-bold">{totalRain}%</h3>
          </div>
        </Card>
        <Card className="flex items-center p-4">
          <div className="mr-4 rounded-full bg-orange-100 p-2 text-orange-600">
            <Thermometer className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Avg High Temperature</p>
            <h3 className="text-2xl font-bold">{avgTemp} °C</h3>
          </div>
        </Card>
        <Card className="flex items-center p-4">
          <div className="mr-4 rounded-full bg-sky-100 p-2 text-sky-600">
            <Wind className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Avg Wind Speed</p>
            <h3 className="text-2xl font-bold">{avgWind} km/h</h3>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Temperature & Rainfall Overlay</CardTitle>
          <CardDescription>Correlation between precipitation and daily temperatures</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={weatherData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" orientation="left" stroke="#ef4444" label={{ value: 'Temp (°C)', angle: -90, position: 'insideLeft' }} />
              <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" label={{ value: 'Prob (%)', angle: 90, position: 'insideRight' }} />
              <Tooltip />
              <Legend />
              <Bar yAxisId="right" dataKey="rainfall" fill="#3b82f6" name="Rain Prob %" />
              <Line yAxisId="left" type="monotone" dataKey="temp" stroke="#ef4444" strokeWidth={3} name="Temperature (°C)" />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Humidity Levels</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weatherData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis unit="%" />
                <Tooltip />
                <Line type="step" dataKey="humidity" stroke="#10b981" strokeWidth={2} name="Humidity" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Wind Conditions</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weatherData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis unit=" km/h" />
                <Tooltip />
                <Line type="monotone" dataKey="wind" stroke="#64748b" strokeWidth={2} name="Wind Speed" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
