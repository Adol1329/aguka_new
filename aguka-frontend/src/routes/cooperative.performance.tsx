import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { PageHeader } from "@/components/dashboard-ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, AlertCircle, Download, Award, ArrowUpDown, ArrowUp, ArrowDown, Search } from "lucide-react";
import { cooperativeApi } from "@/api";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/cooperative/performance")({
  component: CooperativePerformancePage,
});

type SortField = "overallScore" | "soilMoistureAvg" | "activitiesCount" | "irrigationCount" | "fullName";
type SortDirection = "asc" | "desc";

function CooperativePerformancePage() {
  const [sortField, setSortField] = useState<SortField>("overallScore");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");
  const [searchTerm, setSearchTerm] = useState("");

  // Get cooperative ID
  const { data: coopData, isLoading: coopLoading } = useQuery({
    queryKey: ["cooperative-me"],
    queryFn: () => cooperativeApi.getMy().then(r => r.data),
  });
  
  const coopId = (coopData as any)?.id;
  
  // Get performance data
  const { data: performanceRes, isLoading: perfLoading, error: perfError, refetch } = useQuery({
    queryKey: ["cooperative-performance", coopId],
    queryFn: () => 
      coopId ? 
        cooperativeApi.getPerformance(coopId).then(r => r.data) : 
        Promise.resolve(null),
    enabled: !!coopId,
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="ml-1 h-3 w-3 text-muted-foreground opacity-50" />;
    return sortDir === "asc" ? <ArrowUp className="ml-1 h-3 w-3 text-primary" /> : <ArrowDown className="ml-1 h-3 w-3 text-primary" />;
  };

  if (coopLoading || perfLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (perfError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-2xl font-bold text-destructive mb-2">Failed to load performance data</h2>
        <p className="text-muted-foreground text-center max-w-md mb-6">
          {perfError instanceof Error ? perfError.message : "An unknown error occurred while fetching the performance data."}
        </p>
        <Button onClick={() => refetch()}>
          <Loader2 className="mr-2 h-4 w-4" /> Retry Connection
        </Button>
      </div>
    );
  }

  const data = performanceRes as any;
  const rankings = data?.rankings || [];
  
  // Filter and sort rankings
  const filteredRankings = rankings.filter((farmer: any) => 
    farmer.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    farmer.district?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const sortedRankings = [...filteredRankings].sort((a, b) => {
    const valA = a[sortField];
    const valB = b[sortField];
    
    if (valA === null || valA === undefined) return sortDir === "asc" ? -1 : 1;
    if (valB === null || valB === undefined) return sortDir === "asc" ? 1 : -1;
    
    if (typeof valA === "string" && typeof valB === "string") {
      return sortDir === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    
    return sortDir === "asc" ? valA - valB : valB - valA;
  });

  const getScoreColor = (score: number) => {
    if (score >= 70) return "bg-success/20 text-success border-success/30";
    if (score >= 40) return "bg-warning/20 text-warning border-warning/30";
    return "bg-destructive/20 text-destructive border-destructive/30";
  };

  const handleExportCSV = () => {
    if (!rankings.length) return;
    
    const headers = ["Rank", "Farmer Name", "Location", "Soil Moisture (%)", "Activities", "Irrigation Events", "Overall Score"];
    const csvContent = [
      headers.join(","),
      ...sortedRankings.map((f: any, i) => [
        i + 1,
        `"${f.fullName || 'Unknown'}"`,
        `"${f.district || ''}"`,
        f.soilMoistureAvg?.toFixed(1) || '0.0',
        f.activitiesCount || 0,
        f.irrigationCount || 0,
        f.overallScore?.toFixed(1) || '0.0'
      ].join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `cooperative_performance_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <PageHeader 
          title="Member Performance" 
          subtitle="Detailed analytics and rankings for all cooperative members." 
        />
        <Button 
          variant="outline" 
          onClick={handleExportCSV}
          disabled={!rankings.length}
          className="bg-white hover:bg-muted"
        >
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {!rankings.length ? (
        <Card className="border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="bg-muted/50 p-6 rounded-full mb-4">
              <Award className="h-12 w-12 text-muted-foreground opacity-50" />
            </div>
            <h2 className="text-xl font-bold mb-2">No Performance Data</h2>
            <p className="text-muted-foreground max-w-md">
              There is currently no performance data available for members of this cooperative. 
              As farmers record activities and soil readings, their scores will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid gap-6 sm:grid-cols-3">
            <Card className="border-border/50 shadow-sm">
              <CardContent className="p-6">
                <div className="text-sm font-medium text-muted-foreground mb-1 uppercase tracking-wider">Total Evaluated</div>
                <div className="text-3xl font-black">{rankings.length}</div>
                <div className="text-xs text-muted-foreground mt-1">Active farmers in network</div>
              </CardContent>
            </Card>
            
            <Card className="border-border/50 shadow-sm bg-gradient-to-br from-primary/5 to-transparent">
              <CardContent className="p-6">
                <div className="text-sm font-medium text-primary mb-1 uppercase tracking-wider">Network Average</div>
                <div className="text-3xl font-black text-primary">{data?.averageScore?.toFixed(1) || 0}%</div>
                <div className="text-xs text-primary/70 mt-1">Overall yield efficiency score</div>
              </CardContent>
            </Card>
            
            <Card className="border-amber-500/20 shadow-sm bg-amber-50/50">
              <CardContent className="p-6">
                <div className="text-sm font-medium text-amber-600 mb-1 uppercase tracking-wider flex items-center">
                  <Award className="h-3 w-3 mr-1" /> Top Performer
                </div>
                <div className="text-xl font-black text-amber-700 truncate">
                  {data?.topPerformer?.fullName || "None"}
                </div>
                <div className="text-xs text-amber-600/70 mt-1">Highest ranking member</div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/50 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border/50 bg-muted/20 flex flex-col sm:flex-row justify-between gap-4">
              <div className="relative max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search farmers..."
                  className="pl-9 bg-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border/50">
                    <TableHead className="w-[80px] text-center font-bold">Rank</TableHead>
                    <TableHead 
                      className="cursor-pointer hover:text-primary transition-colors font-bold"
                      onClick={() => handleSort("fullName")}
                    >
                      <div className="flex items-center">Farmer <SortIcon field="fullName" /></div>
                    </TableHead>
                    <TableHead className="font-bold text-muted-foreground">Location</TableHead>
                    <TableHead 
                      className="cursor-pointer hover:text-primary transition-colors text-right font-bold"
                      onClick={() => handleSort("soilMoistureAvg")}
                    >
                      <div className="flex items-center justify-end">Soil Avg <SortIcon field="soilMoistureAvg" /></div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:text-primary transition-colors text-center font-bold"
                      onClick={() => handleSort("activitiesCount")}
                    >
                      <div className="flex items-center justify-center">Activities <SortIcon field="activitiesCount" /></div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:text-primary transition-colors text-center font-bold"
                      onClick={() => handleSort("irrigationCount")}
                    >
                      <div className="flex items-center justify-center">Irrigation <SortIcon field="irrigationCount" /></div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:text-primary transition-colors text-right font-bold"
                      onClick={() => handleSort("overallScore")}
                    >
                      <div className="flex items-center justify-end">Score <SortIcon field="overallScore" /></div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedRankings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                        No farmers found matching your search.
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedRankings.map((farmer: any, index: number) => {
                      const actualRank = rankings.findIndex((r: any) => r.id === farmer.id) + 1;
                      
                      return (
                        <TableRow key={farmer.id} className="border-border/50 hover:bg-muted/30">
                          <TableCell className="text-center">
                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold
                              ${actualRank === 1 ? 'bg-amber-100 text-amber-600' : 
                                actualRank === 2 ? 'bg-slate-100 text-slate-500' : 
                                actualRank === 3 ? 'bg-orange-100 text-orange-600' : 'text-muted-foreground'}
                            `}>
                              {actualRank}
                            </span>
                          </TableCell>
                          <TableCell className="font-medium">{farmer.fullName || "Unknown"}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {farmer.district || "-"} {farmer.farmName ? `· ${farmer.farmName}` : ""}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {farmer.soilMoistureAvg?.toFixed(1) || "0.0"}%
                          </TableCell>
                          <TableCell className="text-center">
                            {farmer.activitiesCount || 0}
                          </TableCell>
                          <TableCell className="text-center">
                            {farmer.irrigationCount || 0}
                          </TableCell>
                          <TableCell className="text-right">
                            <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-md text-xs font-bold border ${getScoreColor(farmer.overallScore || 0)}`}>
                              {farmer.overallScore?.toFixed(1) || "0.0"}
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
