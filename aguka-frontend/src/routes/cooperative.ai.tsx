import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard-ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BrainCircuit, TrendingDown, Users, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import { useAICooperativeAnalysis } from "@/hooks/use-data";
import { AIRecommendation } from "@/api/ai";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export const Route = createFileRoute("/cooperative/ai")({
  component: CooperativeAIDashboard,
});

function CooperativeAIDashboard() {
  // Using undefined cooperativeId means the backend will infer it from the user's token
  const { data: analysis, isLoading, isError } = useAICooperativeAnalysis();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p>Running cooperative-wide AI analysis...</p>
      </div>
    );
  }

  if (isError || !analysis) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-destructive">
        <AlertCircle className="h-8 w-8 mb-4" />
        <p>Failed to load AI analytics. Ensure you have the correct permissions.</p>
      </div>
    );
  }

  const { summary, recommendations, farmerRankings } = analysis;

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Performance Analytics"
        subtitle="Intelligent oversight of cooperative farming productivity and risks."
      />

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start">
              <span className="text-sm font-semibold text-muted-foreground uppercase">Total Farmers</span>
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div className="text-3xl font-bold mt-4">{summary.totalFarmers}</div>
          </CardContent>
        </Card>
        
        <Card className="border-warning/50 bg-warning/5">
          <CardContent className="p-6 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start">
              <span className="text-sm font-semibold text-warning uppercase">Underperforming</span>
              <TrendingDown className="h-4 w-4 text-warning" />
            </div>
            <div className="text-3xl font-bold mt-4 text-warning">{summary.underperforming}</div>
            <p className="text-xs text-warning/80 mt-2 font-medium">Require immediate extension support</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start">
              <span className="text-sm font-semibold text-muted-foreground uppercase">Avg Productivity</span>
              <BrainCircuit className="h-4 w-4 text-success" />
            </div>
            <div className="text-3xl font-bold mt-4">{summary.avgProductivity}/100</div>
            <div className="w-full bg-muted rounded-full h-1.5 mt-3">
              <div 
                className="bg-success h-1.5 rounded-full" 
                style={{ width: `${summary.avgProductivity}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className={summary.alertCount > 0 ? "border-destructive/50 bg-destructive/5" : ""}>
          <CardContent className="p-6 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start">
              <span className="text-sm font-semibold text-destructive uppercase">Active AI Alerts</span>
              <AlertCircle className="h-4 w-4 text-destructive" />
            </div>
            <div className="text-3xl font-bold mt-4 text-destructive">{summary.alertCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column: AI Recommendations */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            Priority Interventions
            <Badge variant="secondary">{recommendations.length}</Badge>
          </h3>
          
          {recommendations.length === 0 ? (
            <Card className="border-dashed bg-muted/10">
              <CardContent className="p-10 text-center text-muted-foreground">
                <BrainCircuit className="h-10 w-10 mx-auto mb-4 opacity-20" />
                <p>No critical interventions identified by the AI engine at this time.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {recommendations.map((rec: AIRecommendation, i: number) => (
                <Card key={i} className={`overflow-hidden border-l-4 ${
                  rec.severity === "high" ? "border-l-destructive bg-destructive/5" : 
                  rec.severity === "medium" ? "border-l-warning bg-warning/5" : 
                  "border-l-primary bg-primary/5"
                }`}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="font-bold text-lg">{rec.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{rec.message}</p>
                      </div>
                      <Badge variant={rec.severity === "high" ? "destructive" : "secondary"}>
                        {rec.severity}
                      </Badge>
                    </div>
                    <div className="mt-4 bg-background/60 p-3 rounded border text-sm font-medium">
                      <span className="text-xs uppercase text-muted-foreground font-bold tracking-wider block mb-1">
                        Recommended Action
                      </span>
                      {rec.recommendation}
                    </div>
                    <div className="mt-4 flex justify-end">
                      <Button size="sm" variant="outline" className="text-xs">
                        Schedule Officer Visit <ArrowRight className="ml-2 h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Rankings */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold">Farmer Leaderboard</h3>
          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase">
                Productivity Rankings
              </CardTitle>
            </CardHeader>
            <ScrollArea className="h-[500px]">
              <div className="p-0">
                {farmerRankings.length === 0 ? (
                  <div className="p-6 text-center text-sm text-muted-foreground">
                    No farmer data available
                  </div>
                ) : (
                  farmerRankings.map((farmer: any, index: number) => (
                    <div 
                      key={farmer.farmerId} 
                      className={`flex items-center justify-between p-4 border-b last:border-0 hover:bg-muted/50 transition-colors ${
                        index < 3 ? "bg-primary/5" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs ${
                          index === 0 ? "bg-yellow-500/20 text-yellow-600" :
                          index === 1 ? "bg-gray-400/20 text-gray-600" :
                          index === 2 ? "bg-amber-600/20 text-amber-700" :
                          "bg-muted text-muted-foreground"
                        }`}>
                          #{farmer.rank}
                        </div>
                        <div className="font-medium text-sm">{farmer.farmerName}</div>
                      </div>
                      <Badge variant={farmer.productivity >= 70 ? "outline" : farmer.productivity < 40 ? "destructive" : "secondary"} className={
                        farmer.productivity >= 70 ? "border-success text-success" : ""
                      }>
                        {farmer.productivity}/100
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </Card>
        </div>
      </div>
    </div>
  );
}
