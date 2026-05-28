import { PageHeader } from "@/components/dashboard-ui";
import { Card } from "@/components/ui/card";
import { useCooperativeActivities, useCreateCooperativeActivity } from "@/hooks/use-data";
import { Button } from "@/components/ui/button";
import { Calendar, Plus, Users, Loader2, MapPin, Clock } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";

export function GroupActivitiesComponent() {
  const { user } = useAuth();
  const coopId = user?.cooperativeId;
  const { data: activities, isLoading } = useCooperativeActivities(coopId || "");
  const createActivity = useCreateCooperativeActivity();

  if (!coopId) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <Calendar className="h-16 w-16 text-muted-foreground/20" />
        <h2 className="text-2xl font-bold">No Cooperative Assigned</h2>
        <p className="text-muted-foreground max-w-md text-center">
          You must be assigned to a cooperative to manage group activities.
        </p>
      </div>
    );
  }

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("meeting");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async () => {
    if (!title || !date) {
      toast.error("Please provide title and date");
      return;
    }

    try {
      await createActivity.mutateAsync({
        coopId,
        data: {
          title,
          activityType: type,
          scheduledAt: new Date(date).toISOString(),
          location,
          description,
        },
      });
      toast.success("Event scheduled successfully");
      setOpen(false);
      resetForm();
    } catch (error) {
      toast.error("Failed to schedule event");
    }
  };

  const resetForm = () => {
    setTitle("");
    setType("meeting");
    setDate("");
    setLocation("");
    setDescription("");
  };

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Group Activities"
        subtitle="Schedule meetings, training and community events."
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-hero">
                <Plus className="mr-2 h-4 w-4" />
                Schedule Event
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Schedule New Activity</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Activity Title</label>
                  <Input placeholder="e.g. Monthly General Assembly" value={title} onChange={e => setTitle(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Type</label>
                    <Select value={type} onValueChange={setType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="meeting">Meeting</SelectItem>
                        <SelectItem value="training">Training</SelectItem>
                        <SelectItem value="harvest">Harvest</SelectItem>
                        <SelectItem value="planting">Planting</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Date & Time</label>
                    <Input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Location</label>
                  <Input placeholder="e.g. Sector Office Hall" value={location} onChange={e => setLocation(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea placeholder="Agenda and details..." value={description} onChange={e => setDescription(e.target.value)} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={handleSubmit} disabled={createActivity.isPending}>
                  {createActivity.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Event
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />
      <div className="grid gap-6 md:grid-cols-2">
        {activities?.map((e: any) => (
          <Card key={e.id} className="overflow-hidden hover:shadow-md transition-shadow group border-border/50">
            <div className="flex items-stretch">
              <div className="w-16 bg-primary/5 flex flex-col items-center justify-center border-r border-border/50 p-2">
                <div className="text-[10px] uppercase font-bold text-muted-foreground">
                  {new Date(e.scheduledAt).toLocaleString('default', { month: 'short' })}
                </div>
                <div className="text-2xl font-black text-primary">
                  {new Date(e.scheduledAt).getDate()}
                </div>
              </div>
              <div className="flex-1 p-5">
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="outline" className="capitalize text-[10px] font-bold tracking-wider">
                    {e.activityType}
                  </Badge>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-success uppercase">
                    {e.status}
                  </div>
                </div>
                <h3 className="font-bold text-lg mb-3">{e.title}</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {new Date(e.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {e.location || "Cooperative HQ"}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium pt-1">
                    <Users className="h-3 w-3" />
                    {e.expectedParticipants || 0} Members expected
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
        {(!activities || activities.length === 0) && (
          <div className="col-span-2 py-20 flex flex-col items-center justify-center text-center bg-muted/20 rounded-2xl border-2 border-dashed">
            <Calendar className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="font-bold text-lg">No activities found</h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              You haven't scheduled any group events or training sessions for this month.
            </p>
            <Button variant="link" onClick={() => setOpen(true)} className="mt-2">
              Schedule your first event
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function Badge({ children, variant = "default", className = "" }: any) {
  const variants: any = {
    default: "bg-primary text-primary-foreground",
    outline: "border border-border text-muted-foreground",
    success: "bg-success/10 text-success border-success/20",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
