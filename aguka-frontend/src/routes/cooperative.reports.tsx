import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/dashboard-ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Download, Loader2, AlertCircle, AlertTriangle, CheckCircle2, Calendar, List, Package } from "lucide-react";
import { cooperativeApi } from "@/api";

export const Route = createFileRoute("/cooperative/reports")({
  component: CooperativeReportsPage,
});

function CooperativeReportsPage() {
  const queryClient = useQueryClient();
  
  // Get cooperative ID
  const { data: coopData, isLoading: coopLoading } = useQuery({
    queryKey: ["cooperative-me"],
    queryFn: () => cooperativeApi.getMy().then(r => r.data),
  });
  
  const coopId = (coopData as any)?.id;
  
  // Get existing reports
  const { data: reportsData, isLoading: reportsLoading, error: reportsError, refetch: refetchReports } = useQuery({
    queryKey: ["cooperative-reports", coopId],
    queryFn: () => 
      coopId ? 
        cooperativeApi.getReports(coopId).then(r => r.data || []) : 
        Promise.resolve([]),
    enabled: !!coopId,
  });
  
  // Mutation for generating new reports
  const { mutate: generateReport, isLoading: generating } = useMutation({
    mutationFn: (data: { 
      title: string; 
      reportType: string; 
      periodStart: string; 
      periodEnd: string 
    }) => 
      cooperativeApi.generateReport(coopId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cooperative-reports", coopId] });
    },
  });
  
  // Report types that the backend actually supports
  const reportTypes = [
    { value: "performance", label: "Performance" },
    { value: "yield", label: "Yield" },
    { value: "soil", label: "Soil Analysis" },
    { value: "activity", label: "Activity" },
    { value: "financial", label: "Financial" },
    { value: "membership", label: "Membership" },
  ];
  
  // Default date range (last 30 days)
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);
  
  const formattedStartDate = startDate.toISOString().split('T')[0];
  const formattedEndDate = endDate.toISOString().split('T')[0];
  
  // Handle form state
  const [reportType, setReportType] = useState<reportTypes[0]["value"] | "">("");
  const [periodStart, setPeriodStart] = useState<string>(formattedStartDate);
  const [periodEnd, setPeriodEnd] = useState<string>(formattedEndDate);
  
  const isFormValid = !!reportType && !!periodStart && !!periodEnd;
  
  const handleGenerateReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || !coopId) return;
    
    generateReport({
      title: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report - ${periodStart} to ${periodEnd}`,
      reportType,
      periodStart,
      periodEnd,
    });
    
    // Reset form
    setReportType("");
    setPeriodStart(formattedStartDate);
    setPeriodEnd(formattedEndDate);
  };
  
  if (coopLoading || reportsLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (reportsError) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <AlertCircle className="h-10 w-10 text-destructive mb-4" />
        <h2 className="text-xl font-bold text-destructive">
          Failed to load reports
        </h2>
        <p className="text-muted-foreground text-center max-w-md">
          {reportsError instanceof Error ? reportsError.message : "An unknown error occurred"}
        </p>
        <Button variant="outline" onClick={() => refetchReports()}>
          <Loader2 className="mr-2 h-4 w-4" /> Retry
        </Button>
      </div>
    );
  }
  
  if (!coopId) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <Package className="h-16 w-16 text-muted-foreground/20" />
        <h2 className="text-2xl font-bold">No Cooperative Assigned</h2>
        <p className="text-muted-foreground max-w-md text-center">
          You are logged in as a cooperative manager, but you haven't been assigned to a specific cooperative yet. Please contact the system administrator.
        </p>
      </div>
    );
  }
  
  const reports = Array.isArray(reportsData) ? reportsData : [];
  
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <PageHeader title="Cooperative Reports" subtitle="Generate and view reports based on real cooperative data" />
        <Button variant="outline" asChild>
          <a href="#" onClick={() => window.print()}>
            <List className="mr-2 h-4 w-4" />
            Print Reports
          </a>
        </Button>
      </div>
      
      {/* Report Generation Form */}
      <Card className="p-6">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Generate New Report</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <form onSubmit={handleGenerateReport} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="mb-2 text-sm font-medium" htmlFor="report-type">
                  Report Type
                </Label>
                <Select
                  value={reportType}
                  onValueChange={setReportType}
                  id="report-type"
                  disabled={generating}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a report type" />
                  </SelectTrigger>
                  <SelectContent>
                    {reportTypes.map((type) => (
                      <DropdownMenuItem
                        key={type.value}
                        value={type.value}
                      >
                        {type.label}
                      </DropdownMenuItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="mb-2 text-sm font-medium" htmlFor="period-start">
                  Start Date
                </Label>
                <Input
                  type="date"
                  id="period-start"
                  value={periodStart}
                  onChange={(e) => setPeriodStart(e.target.value)}
                  min="2020-01-01"
                  max={formattedEndDate}
                  disabled={generating}
                  required
                />
              </div>
              
              <div>
                <Label className="mb-2 text-sm font-medium" htmlFor="period-end">
                  End Date
                </Label>
                <Input
                  type="date"
                  id="period-end"
                  value={periodEnd}
                  onChange={(e) => setPeriodEnd(e.target.value)}
                  min={periodStart}
                  max={formattedEndDate}
                  disabled={generating}
                  required
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button variant="outline" type="button" onClick={() => {
                setReportType("");
                setPeriodStart(formattedStartDate);
                setPeriodEnd(formattedEndDate);
              }}>
                Reset
              </Button>
              <Button 
                type="submit" 
                disabled={!isFormValid || generating}
                className="btn-primary"
              >
                {generating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4" />
                    Generating...
                  </>
                ) : (
                  "Generate Report"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      {/* Reports List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold">
            Generated Reports
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {reports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <AlertTriangle className="h-10 w-10 text-muted-foreground mb-4" />
              <h2 className="text-xl font-bold text-muted-foreground">
                No reports generated yet
              </h2>
              <p className="text-muted-foreground text-center max-w-md">
                Select a report type and date range above to generate your first report.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted">
                    <TableHeader className="h-12 px-4 text-left text-xs font-bold text-muted-foreground uppercase">
                      Title
                    </TableHeader>
                    <TableHeader className="h-12 px-4 text-left text-xs font-bold text-muted-foreground uppercase">
                      Type
                    </TableHeader>
                    <TableHeader className="h-12 px-4 text-left text-xs font-bold text-muted-foreground uppercase">
                      Generated
                    </TableHeader>
                    <TableHeader className="h-12 px-4 text-center text-xs font-bold text-muted-foreground uppercase">
                      Status
                    </TableHeader>
                    <TableHeader className="h-12 px-4 text-center text-xs font-bold text-muted-foreground uppercase">
                      Actions
                    </TableHeader>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id} hover className="border-b">
                      <TableCell className="px-4 py-4 text-sm font-medium">
                        {report.title}
                      </TableCell>
                      <TableCell className="px-4 py-4 text-sm">
                        {report.reportType.charAt(0).toUpperCase() + report.reportType.slice(1)}
                      </TableCell>
                      <TableCell className="px-4 py-4 text-sm">
                        {new Date(report.generatedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="px-4 py-4 text-sm text-center">
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          report.status === "completed" ? 'bg-success/20 text-success' :
                          report.status === "failed" ? 'bg-destructive/20 text-destructive' : 'bg-warning/20 text-warning'
                        }`}
                        >
                          {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-4 text-sm text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sq">
                              <List className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => {
                              // In a real app, this would trigger a download
                              alert(`Downloading report: ${report.title}`);
                            }}>
                              Download PDF
                            </DropdownMenuItem>
                            {report.status === "completed" && (
                              <>
                                <DropdownMenuItem onClick={() => {
                                  alert(`Viewing report details for: ${report.title}`);
                                }}>
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive" onClick={() => {
                                  if (window.confirm(`Are you sure you want to delete "${report.title}"?`)) {
                                    // In a real app, this would call delete API
                                    alert(`Deleted report: ${report.title}`);
                                  }
                                }}>
                                  Delete
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}