import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/dashboard-ui";
import { Badge } from "@/components/ui/badge";
import { BrainCircuit, Droplets, ThermometerSun, CloudRain, Sprout, Loader2, Info, AlertTriangle, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { useAIAnalyzeFarm, useAIAnalyzePayload, useAIHistory } from "@/hooks/use-data";
import { AIRecommendation } from "@/api/ai";

export const Route = createFileRoute("/farmer/ai")({
  component: FarmerAIDashboard,
});

function FarmerAIDashboard() {
  const [activeTab, setActiveTab] = useState<"live" | "simulate">("live");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Aguka AI Advisory"
        subtitle="Intelligent rule-based recommendations for your farm"
      />

      <div className="flex gap-4 border-b">
        <button
          className={`pb-2 text-sm font-semibold transition-colors ${
            activeTab === "live"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("live")}
        >
          Live System Analysis
        </button>
        <button
          className={`pb-2 text-sm font-semibold transition-colors ${
            activeTab === "simulate"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("simulate")}
        >
          Simulate Scenario
        </button>
      </div>

      {activeTab === "live" ? <LiveAnalysisTab /> : <SimulationTab />}
    </div>
  );
}

function LiveAnalysisTab() {
  const analyzeMutation = useAIAnalyzeFarm();
  const { data: historyData, isLoading: historyLoading } = useAIHistory(5);
  
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  const handleAnalyze = () => {
    analyzeMutation.mutate(undefined, {
      onSuccess: (data: any) => {
        setRecommendations(data.recommendations || []);
        setHasAnalyzed(true);
        toast.success("AI analysis complete");
      },
      onError: () => toast.error("Failed to analyze farm data"),
    });
  };

  return (
    <div className="space-y-6">
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
          <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
            <BrainCircuit className="h-8 w-8 text-primary" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold">Smart Farming Engine</h3>
            <p className="text-muted-foreground max-w-lg">
              Click below to run a real-time analysis on your farm's latest soil and weather data. 
              Our rule-based engine will generate intelligent recommendations instantly.
            </p>
          </div>
          <Button 
            size="lg" 
            onClick={handleAnalyze} 
            disabled={analyzeMutation.isPending}
            className="w-full sm:w-auto"
          >
            {analyzeMutation.isPending ? (
              <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyzing...</>
            ) : (
              <><BrainCircuit className="mr-2 h-5 w-5" /> Run AI Analysis Now</>
            )}
          </Button>
        </CardContent>
      </Card>

      {hasAnalyzed && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h3 className="text-lg font-bold flex items-center gap-2">
            Analysis Results
            <Badge variant="outline">{recommendations.length} items</Badge>
          </h3>
          
          {recommendations.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center text-muted-foreground">
                No active issues detected. Your farm conditions are optimal!
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {recommendations.map((rec, i) => (
                <RecommendationCard key={i} recommendation={rec} />
              ))}
            </div>
          )}
        </div>
      )}

      {!hasAnalyzed && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold">Recent History</h3>
          {historyLoading ? (
            <div className="h-32 bg-muted animate-pulse rounded-xl"></div>
          ) : historyData?.length ? (
            <div className="grid gap-4">
              {historyData.map((rec: AIRecommendation, i: number) => (
                <RecommendationCard key={i} recommendation={rec} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground italic text-sm">No recent AI recommendations.</p>
          )}
        </div>
      )}
    </div>
  );
}

function SimulationTab() {
  const [formData, setFormData] = useState({
    soilMoisture: "28",
    temperature: "31",
    humidity: "90",
    rainfallProbability: "20",
    cropType: "maize",
  });

  const simulateMutation = useAIAnalyzePayload();
  const [results, setResults] = useState<AIRecommendation[] | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      soilMoisture: Number(formData.soilMoisture),
      temperature: Number(formData.temperature),
      humidity: Number(formData.humidity),
      rainfallProbability: Number(formData.rainfallProbability),
      cropType: formData.cropType,
    };

    simulateMutation.mutate(payload, {
      onSuccess: (data: any) => {
        setResults(data.recommendations || []);
        toast.success("Simulation complete");
      },
      onError: () => toast.error("Simulation failed"),
    });
  };

  return (
    <div className="grid md:grid-cols-12 gap-6">
      <Card className="md:col-span-4 h-fit">
        <CardHeader>
          <CardTitle>Input Parameters</CardTitle>
          <CardDescription>Simulate IoT sensor readings</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold">Soil Moisture (%)</label>
              <div className="relative">
                <Droplets className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  className="pl-9" 
                  type="number" 
                  value={formData.soilMoisture} 
                  onChange={(e) => setFormData({...formData, soilMoisture: e.target.value})} 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold">Temperature (°C)</label>
              <div className="relative">
                <ThermometerSun className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  className="pl-9" 
                  type="number" 
                  value={formData.temperature} 
                  onChange={(e) => setFormData({...formData, temperature: e.target.value})} 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold">Humidity (%)</label>
              <Input 
                type="number" 
                value={formData.humidity} 
                onChange={(e) => setFormData({...formData, humidity: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold">Rain Probability (%)</label>
              <div className="relative">
                <CloudRain className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  className="pl-9" 
                  type="number" 
                  value={formData.rainfallProbability} 
                  onChange={(e) => setFormData({...formData, rainfallProbability: e.target.value})} 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold">Crop Type</label>
              <div className="relative">
                <Sprout className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm pl-9"
                  value={formData.cropType}
                  onChange={(e) => setFormData({...formData, cropType: e.target.value})}
                >
                  <option value="maize">Maize</option>
                  <option value="beans">Beans</option>
                  <option value="rice">Rice</option>
                  <option value="banana">Banana</option>
                </select>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={simulateMutation.isPending}>
              {simulateMutation.isPending ? "Simulating..." : "Generate Advisory"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="md:col-span-8 space-y-4">
        {results === null ? (
          <Card className="h-full flex items-center justify-center border-dashed bg-muted/20 min-h-[300px]">
            <div className="text-center text-muted-foreground">
              <BrainCircuit className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>Adjust parameters and click Generate to see AI logic in action.</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <h3 className="text-lg font-bold">AI Outputs</h3>
            {results.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  No issues detected for these parameters.
                </CardContent>
              </Card>
            ) : (
              results.map((rec, i) => (
                <RecommendationCard key={i} recommendation={rec} />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function RecommendationCard({ recommendation: r }: { recommendation: AIRecommendation }) {
  const Icon = r.severity === "critical" ? ShieldAlert : r.severity === "high" ? AlertTriangle : Info;
  
  const colors = {
    critical: "border-destructive/50 bg-destructive/5",
    high: "border-warning/50 bg-warning/5",
    medium: "border-primary/30 bg-primary/5",
    low: "border-success/30 bg-success/5",
  };
  const iconColors = {
    critical: "text-destructive",
    high: "text-warning",
    medium: "text-primary",
    low: "text-success",
  };

  return (
    <Card className={`overflow-hidden transition-all hover:shadow-md ${colors[r.severity]}`}>
      <CardContent className="p-5 flex gap-4">
        <div className={`mt-1 shrink-0 ${iconColors[r.severity]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between gap-4">
            <h4 className="font-bold text-lg leading-tight">{r.title}</h4>
            <Badge variant="outline" className={`shrink-0 capitalize font-bold ${
              r.severity === "critical" ? "bg-destructive text-white border-destructive" : ""
            }`}>
              {r.severity} Priority
            </Badge>
          </div>
          <p className="text-sm text-foreground/80 leading-relaxed">{r.message}</p>
          <div className="bg-background/80 p-3 rounded-lg border text-sm mt-3 font-medium text-primary">
            <span className="font-bold uppercase text-[10px] tracking-wider text-muted-foreground block mb-1">
              Action Required
            </span>
            {r.recommendation}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
