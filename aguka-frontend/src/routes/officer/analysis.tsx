import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/dashboard-ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, AlertTriangle, Users, TrendingUp, Activity, MapPin, Monitor, Coffee } from "lucide-react";
import { officerApi } from "@/api";

export const Route = createFileRoute("/officer/analysis")({
  component: OfficerAnalysisPage,
});

function OfficerAnalysisPage() {
  
  // Get officer analysis data
  const { data: analysisData, isLoading: analysisLoading, error: analysisError } = useQuery({
    queryKey: ["officer-analysis"],
    queryFn: () => officerApi.getAnalysis().then(r => r.data),
  });
  
  // Get performance analysis data (for assigned farmers performance)
  const { data: performanceData, isLoading: performanceLoading, error: performanceError, refetch: refetchPerformance } = useQuery({
    queryKey: ["officer-performance-analysis"],
    queryFn: () => officerApi.getPerformanceAnalysis().then(r => r.data),
  });
  
  // Date range filters for performance analysis
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [limit, setLimit] = useState(10);
  
  const handlePerformanceFilter = async () => {
    // In a real implementation, we would refetch the performance data with filters
    // For now, we'll just refetch all data
    refetchPerformance();
  };
  
  const resetFilters = () => {
    setStartDate("");
    setEndDate("");
    setLimit(10);
    refetchPerformance();
  };
  
  if (analysisLoading || performanceLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (analysisError) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <AlertTriangle className="h-10 w-10 text-destructive mb-4" />
        <h2 className="text-xl font-bold text-destructive">
          Failed to load officer analysis
        </h2>
        <p className="text-muted-foreground text-center max-w-md">
          {analysisError instanceof Error ? analysisError.message : "An unknown error occurred"}
        </p>
      </div>
    );
  }
  
  const analysis = analysisData || {};
  const performance = performanceData || {};
  
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <PageHeader title="Officer Analysis Dashboard" subtitle="Overview of your assigned farmers and their performance" />
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <a href="#" onClick={() => window.print()}>
              <Monitor className="mr-2 h-4 w-4" />
              Print Dashboard
            </a>
          </Button>
          <Button variant="outline" onClick={resetFilters}>
            <Loader2 className="mr-2 h-4 w-4" />
            Reset Filters
          </Button>
        </div>
      </div>
      
      {/* Overview Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Assigned Farmers
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-3xl font-bold">{analysis.totalFarmers || 0}</div>
            <p className="text-muted-foreground text-sm">
              {analysis.activeFarmers || 0} active farmers
            </p>
          </CardContent>
        </Card>
        
        <Card className="p-6">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-success" />
              Performance Score
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-3xl font-bold">
              {analysis.performanceSummary?.avgScore !== null && analysis.performanceSummary?.avgScore !== undefined
                ? `${analysis.performanceSummary.avgScore}%`
                : "0%"}
            </div>
            <p className="text-muted-foreground text-sm">
              Average across all farmers
            </p>
          </CardContent>
        </Card>
        
        <Card className="p-6">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Activity className="h-5 w-5 text-info" />
              Activities
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-3xl font-bold">
              {analysis.performanceSummary?.totalActivities || 0}
            </div>
            <p className="text-muted-foreground text-sm">
              Total activities recorded
            </p>
          </CardContent>
        </Card>
        
        <Card className="p-6">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <MapPin className="h-5 w-5 text-warning" />
              Coverage Area
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-2xl font-bold">
              {analysis.cooperativeInfo?.name || "Not assigned"}
            </div>
            <p className="text-muted-foreground text-sm">
              {analysis.cooperativeInfo?.district || "No cooperative"}
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Performance Analysis Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Farmer Performance Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {/* Filters */}
          <div className="mb-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[200px]">
                <Label className="mb-2 text-sm font-medium" htmlFor="start-date">
                  Start Date
                </Label>
                <Input
                  type="date"
                  id="start-date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <div className="flex-1 min-w-[200px]">
                <Label className="mb-2 text-sm font-medium" htmlFor="end-date">
                  End Date
                </Label>
                <Input
                  type="date"
                  id="end-date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <div className="flex-1 min-w-[150px]">
                <Label className="mb-2 text-sm font-medium" htmlFor="limit">
                  Limit Results
                </Label>
                <Select
                  value={String(limit)}
                  onValueChange={(v) => setLimit(Number(v))}
                >
                  <SelectTrigger id="limit">
                    <SelectValue placeholder="Select limit" />
                  </SelectTrigger>
                  <SelectContent>
                    {[5, 10, 15, 20, 50, 100].map((val) => (
                      <SelectItem key={val} value={val.toString()}>
                        {val} farmers
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex-1 min-w-[100px] flex items-end">
                <Button onClick={handlePerformanceFilter}>
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>
          
          {/* Performance Table */}
          {performance.rankings && performance.rankings.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted">
                    <TableHead className="h-12 px-4 text-left text-xs font-bold text-muted-foreground uppercase">Rank</TableHead>
                    <TableHead className="h-12 px-4 text-left text-xs font-bold text-muted-foreground uppercase">Farmer Name</TableHead>
                    <TableHead className="h-12 px-4 text-left text-xs font-bold text-muted-foreground uppercase">Farm / Cooperative</TableHead>
                    <TableHead className="h-12 px-4 text-left text-xs font-bold text-muted-foreground uppercase">District</TableHead>
                    <TableHead className="h-12 px-4 text-center text-xs font-bold text-muted-foreground uppercase">Soil Moisture (%)</TableHead>
                    <TableHead className="h-12 px-4 text-center text-xs font-bold text-muted-foreground uppercase">Activities</TableHead>
                    <TableHead className="h-12 px-4 text-center text-xs font-bold text-muted-foreground uppercase">Irrigation</TableHead>
                    <TableHead className="h-12 px-4 text-center text-xs font-bold text-muted-foreground uppercase">Crops</TableHead>
                    <TableHead className="h-12 px-4 text-center text-xs font-bold text-muted-foreground uppercase">Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {performance.rankings.map((farmer: any, index: number) => (
                    <TableRow key={farmer.id} className="border-b">
                      <TableCell className="px-4 py-4 text-sm font-medium text-center">
                        {index + 1}
                      </TableCell>
                      <TableCell className="px-4 py-4 text-sm font-medium">
                        {farmer.fullName || "Unknown Farmer"}
                      </TableCell>
                      <TableCell className="px-4 py-4 text-sm">
                        <div className="flex flex-col">
                          <div className="font-medium">{farmer.farmName || "No farm name"}</div>
                          {farmer.cooperativeName && farmer.cooperativeName !== "Not assigned to cooperative" ? (
                            <div className="text-xs text-muted-foreground">
                              {farmer.cooperativeName}
                            </div>
                          ) : (
                            <div className="text-xs text-muted-foreground">
                              Independent Farmer
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-4 text-sm">
                        {farmer.district || "Not specified"}
                      </TableCell>
                      <TableCell className="px-4 py-4 text-sm text-center">
                        {farmer.soilMoistureAvg !== null ? (
                          <div className={`font-medium ${
                            farmer.soilMoistureAvg >= 40 && farmer.soilMoistureAvg <= 60
                              ? "text-success"
                              : farmer.soilMoistureAvg >= 30 && farmer.soilMoistureAvg <= 70
                                ? "text-warning"
                                : "text-destructive"
                          }`}
                          >
                            {farmer.soilMoistureAvg.toFixed(1)}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell className="px-4 py-4 text-sm text-center">
                        {farmer.activitiesCount}
                      </TableCell>
                      <TableCell className="px-4 py-4 text-sm text-center">
                        {farmer.irrigationCount}
                      </TableCell>
                      <TableCell className="px-4 py-4 text-sm text-center">
                        {farmer.cropsCount}
                      </TableCell>
                      <TableCell className="px-4 py-4 text-sm text-center font-bold">
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          farmer.overallScore >= 80 ? 'bg-success/20 text-success' :
                          farmer.overallScore >= 60 ? 'bg-warning/20 text-warning' :
                                                        'bg-destructive/20 text-destructive'
                        }`}
                        >
                          {farmer.overallScore.toFixed(1)}%
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <AlertTriangle className="h-10 w-10 text-muted-foreground mb-4" />
              <h2 className="text-xl font-bold text-muted-foreground">
                No performance data available
              </h2>
              <p className="text-muted-foreground text-center max-w-md">
                No farmers assigned to you yet, or no data available for the selected period.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Recommendations Section */}
      {analysis.recommendations && analysis.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Coffee className="h-5 w-5 text-primary" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {analysis.recommendations.map((rec, index) => (
              <div key={index} className="border-l-4 pl-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-lg">{rec.title}</h3>
                    <p className="text-muted-foreground mt-1">{rec.description}</p>
                  </div>
                  <div className={`text-xs px-2.5 py-0.5 rounded-full ${
                    rec.priority === "high" ? "bg-destructive/20 text-destructive" :
                    rec.priority === "medium" ? "bg-warning/20 text-warning" :
                                                "bg-info/20 text-info"
                  }`}
                  >
                    {rec.priority.charAt(0).toUpperCase() + rec.priority.slice(1)}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}