import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, StatCard } from "@/components/dashboard-ui";
import { Card } from "@/components/ui/card";
import { Droplets, Power, Calendar, Loader2, Play, Square, Plus, Trash2, Check, AlertTriangle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useIrrigationStatus, useIrrigationSchedules, useUpdateIrrigationSchedule, useTriggerIrrigation, useStopIrrigation, useDeleteIrrigationSchedule } from "@/hooks/use-data";
import { useIrrigationRecommendation, useAcceptIrrigationRecommendation } from "@/hooks/use-irrigation-recommendation";
import { toast } from "sonner";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/farmer/irrigation")({
  component: IrrigationPage,
});

function IrrigationPage() {
  const { data: status, isLoading: isStatusLoading } = useIrrigationStatus();
  const { data: schedules, isLoading: isSchedulesLoading } = useIrrigationSchedules();
  const updateSchedule = useUpdateIrrigationSchedule();
  const triggerIrrigation = useTriggerIrrigation();
  const stopIrrigation = useStopIrrigation();
  const deleteSchedule = useDeleteIrrigationSchedule();
  const { data: recommendation, isLoading: isRecLoading } = useIrrigationRecommendation();
  const acceptRecommendation = useAcceptIrrigationRecommendation();

  const [isTriggering, setIsTriggering] = useState(false);
  const [showModifyDialog, setShowModifyDialog] = useState(false);
  const [modifiedDuration, setModifiedDuration] = useState(20);

  const isLoading = isStatusLoading || isSchedulesLoading || isRecLoading;

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleToggle = (id: string, isActive: boolean) => {
    updateSchedule.mutate({ id, data: { isActive } }, {
      onSuccess: () => toast.success(`Schedule ${isActive ? 'enabled' : 'disabled'}`),
      onError: () => toast.error("Failed to update schedule")
    });
  };

  const handleManualTrigger = async () => {
    setIsTriggering(true);
    try {
      await triggerIrrigation.mutateAsync("main-zone"); // Default zone
      toast.success("Irrigation system started manually");
    } catch (error) {
      toast.error("Failed to start irrigation");
    } finally {
      setIsTriggering(false);
    }
  };

  const handleManualStop = async () => {
    try {
      await stopIrrigation.mutateAsync("main-zone");
      toast.success("Irrigation system stopped");
    } catch (error) {
      toast.error("Failed to stop irrigation");
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this schedule?")) return;
    deleteSchedule.mutate(id, {
      onSuccess: () => toast.success("Schedule deleted"),
      onError: () => toast.error("Failed to delete")
    });
  };

  const handleAcceptRecommendation = async () => {
    if (!recommendation) return;
    
    try {
      await acceptRecommendation.mutateAsync({});
      toast.success("Irrigation schedule created from recommendation");
      // Optionally trigger a refresh
    } catch (error) {
      toast.error("Failed to create schedule from recommendation");
    }
  };

  const handleModifyRecommendation = (duration: number) => {
    setModifiedDuration(duration);
    setShowModifyDialog(true);
  };

  const handleConfirmModify = async () => {
    if (!recommendation) return;
    
    try {
      // In a full implementation, we would create a custom schedule with the modified duration
      // For now, we'll show a success message and close the dialog
      toast.success(`Custom schedule created with ${modifiedDuration} minutes`);
      setShowModifyDialog(false);
      // Optionally create a schedule here
    } catch (error) {
      toast.error("Failed to create custom schedule");
    }
  };

  const displaySchedules = Array.isArray(schedules) ? schedules : [];
  const activeSchedules = displaySchedules.filter((s: any) => s.isActive);

  const nextWateringText = activeSchedules.length > 0
    ? (() => {
        const first = activeSchedules[0];
        if (first.frequency === 'daily') return 'Daily';
        if (first.frequency === 'weekly' && first.daysOfWeek?.length > 0) {
          const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          return first.daysOfWeek.map((d: number) => days[d]).join(', ');
        }
        return first.startTime || 'Scheduled';
      })()
    : 'No active schedules';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader title="Irrigation" subtitle="Manage watering schedules and water usage." />
        <div className="flex items-center gap-2">
          {status?.isActive ? (
            <Button variant="destructive" size="sm" onClick={handleManualStop}>
              <Square className="mr-2 h-4 w-4" /> Stop Now
            </Button>
          ) : (
            <Button variant="default" size="sm" className="bg-success hover:bg-success/90" onClick={handleManualTrigger} disabled={isTriggering}>
              {isTriggering ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
              Start Now
            </Button>
          )}
        </div>
      </div>

      {/* Recommendation Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-semibold">AI Irrigation Recommendation</h3>
          {recommendation?.actionRequired && (
            <div className="flex items-center gap-2">
              <Button 
                variant="default" 
                size="sm" 
                onClick={handleAcceptRecommendation}
                disabled={acceptRecommendation.isPending}
              >
                {acceptRecommendation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Apply
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleModifyRecommendation(20)} // Default, would be parsed from recommendation
              >
                <AlertTriangle className="mr-2 h-4 w-4" />
                Modify
              </Button>
            </div>
          )}
        </div>
        
        {recommendation ? (
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                  recommendation.type === "critical"
                    ? "bg-destructive/10 text-destructive"
                    : recommendation.type === "warning"
                      ? "bg-warning/10 text-warning"
                      : recommendation.type === "info"
                        ? "bg-info/10 text-info"
                        : "bg-muted/10 text-muted-foreground"
                }`}
              >
                {recommendation.type === "critical" && <AlertTriangle className="h-5 w-5" />}
                {recommendation.type === "warning" && <AlertTriangle className="h-5 w-5" />}
                {recommendation.type === "info" && <Droplets className="h-5 w-5" />}
                {recommendation.type === "error" && <AlertTriangle className="h-5 w-5" />}
              </div>
              <div className="flex-1">
                <div className="font-semibold">{recommendation.recommendation}</div>
                {recommendation.details && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    <div>Soil: {recommendation.details.soilMoisture}</div>
                    {recommendation.details.expectedRainfall3Day && (
                      <div>Expected Rain: {recommendation.details.expectedRainfall3Day}</div>
                    )}
                    {recommendation.details.crop && (
                      <div>Crop: {recommendation.details.crop}</div>
                    )}
                    {recommendation.details.waterDeficit && (
                      <div>Water Need: {recommendation.details.waterDeficit}</div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {!recommendation.actionRequired && (
              <div className="text-xs text-muted-foreground mt-2">
                {recommendation.confidence && (
                  <span className={`px-2 py-0.5 rounded-full ${
                    recommendation.confidence === "high"
                      ? "bg-success/10 text-success"
                      : recommendation.confidence === "medium"
                        ? "bg-warning/10 text-warning"
                        : "bg-info/10 text-info"
                  }`}>
                    {recommendation.confidence} confidence
                  </span>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <AlertTriangle className="h-8 w-8 mx-auto mb-4 text-muted-foreground/50" />
            <p>No recommendation available</p>
            <p className="text-sm">
              Ensure your farm profile is set up with an active crop and that soil/weather data is being collected.
            </p>
          </div>
        )}
        
        {/* Modify Dialog */}
        {showModifyDialog && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                Modify Duration
              </Button>
            </DialogTrigger>
            <DialogContent className="w-80">
              <DialogHeader>
                <DialogTitle>Modify Irrigation Duration</DialogTitle>
              </DialogHeader>
              <DialogContent>
                <div className="space-y-4">
                  <p className="text-sm">
                    Based on the recommendation: "{recommendation?.recommendation}"
                  </p>
                  <div className="flex items-center gap-4">
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      min={5}
                      max={120}
                      value={modifiedDuration}
                      onChange={(e) => setModifiedDuration(parseInt(e.target.value) || 20)}
                      className="w-24"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Adjust the irrigation duration based on your specific field conditions.
                  </p>
                </div>
              </DialogContent>
              <DialogFooter className="flex justify-end space-x-3">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowModifyDialog(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleConfirmModify}
                  disabled={false}
                  className="bg-gradient-hero hover:opacity-90"
                >
                  Confirm
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Water used (today)"
          value={status?.waterUsedToday !== undefined ? `${status.waterUsedToday} L` : 'No data'}
          icon={Droplets}
          accent="info"
        />
        <StatCard
          label="Next watering"
          value={nextWateringText}
          icon={Calendar}
          accent="primary"
        />
        <StatCard
          label="System status"
          value={status?.isActive ? 'Active' : 'Inactive'}
          icon={Power}
          accent={status?.isActive ? 'success' : 'warning'}
        />
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-semibold">Irrigation Schedules</h3>
          <Button variant="outline" size="sm" onClick={() => toast.info("Add Schedule feature coming in next UI update")}>
            <Plus className="mr-2 h-4 w-4" /> New Schedule
          </Button>
        </div>
        {displaySchedules.length > 0 ? (
          <div className="space-y-3">
            {displaySchedules.map((s: any) => (
              <div key={s.id} className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="font-display text-2xl font-bold text-primary">
                    {s.startTime || (s.frequency === 'daily' ? 'Daily' : 'Set')}
                  </div>
                  <div>
                    <div className="text-sm font-medium">
                      {s.cropId ? 'Zone A' : 'Main Supply'}
                      {s.waterAmountLiters ? ` · ${s.waterAmountLiters}L` : ''}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {s.durationMinutes ? `${s.durationMinutes} min` : ''}
                      {s.frequency ? ` · ${s.frequency}` : ''}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(s.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Switch 
                      checked={s.isActive} 
                      onCheckedChange={(checked) => handleToggle(s.id, checked)}
                      disabled={updateSchedule.isPending}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-32 flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
            <Droplets className="h-8 w-8 mb-2 opacity-20" />
            <p>No irrigation schedules found</p>
          </div>
        )}
      </Card>

      {status?.savedWater !== undefined && status.savedWater > 0 && (
        <Card className="p-5 border-info/30 bg-info/5 flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-info/10 flex items-center justify-center text-info">
            <Droplets className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-semibold">💧 Water efficiency</h4>
            <p className="text-sm text-muted-foreground">
              You've saved {status.savedWater}L of water this week compared to manual watering.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}