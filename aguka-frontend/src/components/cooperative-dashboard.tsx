import { Link } from "@tanstack/react-router";
import { PageHeader, StatCard } from "@/components/dashboard-ui";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Sprout, TrendingUp, Calendar, Loader2, Package, Droplets, Award } from "lucide-react";
import { useFarmers, useCooperativeActivities, useCooperativeResources } from "@/hooks/use-data";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export function CooperativeDashboardComponent() {
  const { user } = useAuth();
  const coopId = user?.cooperativeId;
  const { data: farmers, isLoading: loadingFarmers } = useFarmers();
  const { data: activities, isLoading: loadingActivities } = useCooperativeActivities(coopId || "");
  const { data: resources, isLoading: loadingResources } = useCooperativeResources(coopId || "");

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

  if (loadingFarmers || loadingActivities || loadingResources) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const farmerList = (farmers as any)?.data || (farmers as any) || [];
  const avgYield = farmerList.length 
    ? Math.round(farmerList.reduce((acc: number, f: any) => acc + (f.yieldScore || 0), 0) / farmerList.length) 
    : 0;
  
  const topPerformers = [...farmerList]
    .sort((a: any, b: any) => (b.yieldScore || 0) - (a.yieldScore || 0))
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <PageHeader title="Cooperative Command Center" subtitle="Aggregated oversight of network performance and resources." />
        <Button className="bg-primary shadow-lg shadow-primary/20" asChild>
          <Link to="/reports">
            <TrendingUp className="mr-2 h-4 w-4" />
            Generate Network Report
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Members" value={farmerList.length} icon={Users} accent="primary" />
        <StatCard label="Active Hectares" value={(farmerList.length * 1.5).toFixed(1)} icon={Sprout} accent="success" />
        <StatCard label="Network Yield" value={`${avgYield}%`} icon={TrendingUp} accent="info" trend="+4.2%" trendUp={true} />
        <StatCard label="Shared Assets" value={resources?.length || 0} icon={Package} accent="warning" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Performance Leaderboard */}
        <Card className="lg:col-span-2 overflow-hidden border-border/50">
          <div className="p-6 border-b border-border/50 flex items-center justify-between">
            <h3 className="font-display text-xl font-bold flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" />
              Member Performance Rankings
            </h3>
            <Button variant="ghost" size="sm" className="text-xs font-bold uppercase tracking-tight" asChild>
              <Link to="/cooperative/farmers">View All Members</Link>
            </Button>
          </div>
          <CardContent className="p-0">
            <div className="divide-y divide-border/50">
              {topPerformers.map((f: any, i: number) => (
                <div key={f.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl font-black text-sm
                      ${i === 0 ? 'bg-amber-100 text-amber-600' : 
                        i === 1 ? 'bg-slate-100 text-slate-500' : 
                        i === 2 ? 'bg-orange-100 text-orange-600' : 'bg-muted text-muted-foreground'}
                    `}>
                      {i + 1}
                    </div>
                    <div>
                      <div className="font-bold">{f.fullName}</div>
                      <div className="text-xs text-muted-foreground">{f.district} · {f.farmName || 'Assigned Plot'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <div className="text-[10px] text-muted-foreground uppercase font-bold">Soil Health</div>
                      <div className="text-xs font-bold text-success flex items-center gap-1 justify-end">
                        <Droplets className="h-3 w-3" />
                        {(f.soilReadings?.[0]?.moisturePercent || 45)}%
                      </div>
                    </div>
                    <div className="bg-primary/5 px-4 py-2 rounded-xl text-center min-w-[70px]">
                      <div className="text-[10px] text-primary uppercase font-black">Score</div>
                      <div className="font-black text-primary text-lg">{f.yieldScore || 85}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sidebar Status */}
      <div className="space-y-6">
        {/* Quick Stats Aggregation */}
        <Card className="p-6 bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Network Health
          </h3>
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold mb-1">
                <span>Avg Soil Moisture</span>
                <span className="text-primary">48.5%</span>
              </div>
              <div className="h-2 w-full bg-primary/10 rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: '48.5%' }}></div>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold mb-1">
                <span>Resource Utilization</span>
                <span className="text-success">72%</span>
              </div>
              <div className="h-2 w-full bg-success/10 rounded-full overflow-hidden">
                <div className="h-full bg-success" style={{ width: '72%' }}></div>
              </div>
            </div>
          </div>
        </Card>

        {/* Performance Link */}
        <Card className="p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Award className="h-4 w-4 text-primary" />
            Performance Analysis
          </h3>
          <div className="space-y-3">
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link to="/cooperative/performance">
                View Full Performance &rarr;
              </Link>
            </Button>
          </div>
        </Card>

        {/* Pending Actions */}
        <Card className="p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-warning" />
            Upcoming Events
          </h3>
          <div className="space-y-3">
            {activities?.slice(0, 3).map((e: any) => (
              <div key={e.id} className="group cursor-pointer">
                <div className="text-sm font-bold group-hover:text-primary transition-colors">{e.title}</div>
                <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
                  <Clock className="h-3 w-3" />
                  {new Date(e.scheduledAt).toLocaleDateString()} · {e.location || 'HQ'}
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full mt-2" asChild>
              <Link to="/cooperative/events">Schedule More</Link>
            </Button>
          </div>
        </Card>
      </div>
      </div>
    </div>
  );
}

function Clock({ className, ...props }: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
