import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard-ui";
import { Card } from "@/components/ui/card";
import { useAdvisories, useAssignedFarmers, useCreateAdvisory } from "@/hooks/use-data";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { AlertCircle, Inbox, Loader2, MessageSquare, Send, Smartphone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/officer/advisories")({
  component: AdvisoriesPage,
});

const severityOptions = {
  info: { label: "Information", className: "bg-blue-500", chip: "bg-blue-100 text-blue-700" },
  warning: { label: "Warning", className: "bg-amber-500", chip: "bg-amber-100 text-amber-700" },
  critical: { label: "Critical", className: "bg-red-500", chip: "bg-red-100 text-red-700" },
};

type AdvisoryFarmer = {
  id: string;
  fullName?: string | null;
  user?: { phone?: string | null };
};

type AdvisoryHistoryItem = {
  id: string;
  title: string;
  message: string;
  severity?: keyof typeof severityOptions;
  createdAt: string;
  farmer?: { fullName?: string | null };
};

function AdvisoriesPage() {
  const { data: advisories, isLoading } = useAdvisories();
  const { data: farmers } = useAssignedFarmers({ page: 1, limit: 100 });
  const createAdvisory = useCreateAdvisory();

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState<keyof typeof severityOptions>("info");
  const [selectedFarmerId, setSelectedFarmerId] = useState("all");
  const [deliveryTime, setDeliveryTime] = useState("now");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const farmerList = (farmers?.data || []) as AdvisoryFarmer[];
  const selectedFarmer = farmerList.find((f) => f.id === selectedFarmerId);
  const recipientCount = selectedFarmerId === "all" ? farmerList.length : selectedFarmer ? 1 : 0;
  const smsText = [title, message].filter(Boolean).join(": ");
  const smsChars = smsText.length;
  const smsSegments = Math.max(1, Math.ceil(smsChars / 160));
  const overSmsLimit = smsChars > 160;

  const sendAdvisory = async () => {
    try {
      await createAdvisory.mutateAsync({
        title,
        message,
        severity,
        farmerIds: selectedFarmerId === "all" ? [] : [selectedFarmerId],
      });
      toast.success("Advisory sent successfully");
      setTitle("");
      setMessage("");
      setSelectedFarmerId("all");
      setSeverity("info");
      setDeliveryTime("now");
      setConfirmOpen(false);
    } catch (error) {
      toast.error("Failed to send advisory");
    }
  };

  const handleSend = () => {
    if (!title.trim() || !message.trim()) {
      toast.error("Please provide both title and message");
      return;
    }
    if (deliveryTime !== "now") {
      toast.error("Scheduled advisory sending is not connected yet");
      return;
    }
    setConfirmOpen(true);
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
        title="Advisories"
        subtitle="Send recommendations to farmers via SMS, USSD or app push."
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <Card className="p-6">
          <h3 className="mb-4 font-display text-lg font-semibold">New advisory</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Recipient</label>
              <Select value={selectedFarmerId} onValueChange={setSelectedFarmerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select farmer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Assigned Farmers ({farmerList.length})</SelectItem>
                  {farmerList.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.fullName || f.user?.phone || "Unnamed farmer"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Severity Level</label>
              <Select
                value={severity}
                onValueChange={(value) => setSeverity(value as keyof typeof severityOptions)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(severityOptions).map(([value, option]) => (
                    <SelectItem key={value} value={value}>
                      <span className="inline-flex items-center gap-2">
                        <span className={`h-2.5 w-2.5 rounded-full ${option.className}`} />
                        {option.label}
                        {value === "critical" ? " - sends SMS" : ""}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                placeholder="e.g. Irrigation Recommended"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <label className="text-sm font-medium">Message</label>
                <span
                  className={`text-xs font-semibold ${overSmsLimit ? "text-red-600" : "text-muted-foreground"}`}
                >
                  {smsChars}/160 SMS chars · {smsSegments} segment{smsSegments === 1 ? "" : "s"}
                </span>
              </div>
              <Textarea
                placeholder="Provide specific recommendations..."
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Delivery time</label>
              <Select value={deliveryTime} onValueChange={setDeliveryTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Delivery time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="now">Send now</SelectItem>
                  <SelectItem value="scheduled">Schedule for later</SelectItem>
                </SelectContent>
              </Select>
              {deliveryTime === "scheduled" && (
                <Input type="datetime-local" disabled className="text-muted-foreground" />
              )}
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-lg border bg-muted/20 p-3">
                <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase text-muted-foreground">
                  <MessageSquare className="h-3.5 w-3.5" />
                  SMS preview
                </div>
                <p className="text-sm leading-relaxed">
                  {smsText || "Your SMS message preview will appear here."}
                </p>
              </div>
              <div className="rounded-lg border bg-muted/20 p-3">
                <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase text-muted-foreground">
                  <Smartphone className="h-3.5 w-3.5" />
                  Push preview
                </div>
                <div className="rounded-md bg-background p-3 shadow-sm">
                  <div className="text-sm font-semibold">{title || "Notification title"}</div>
                  <p className="mt-1 line-clamp-3 text-xs text-muted-foreground">
                    {message || "Notification message preview will appear here."}
                  </p>
                </div>
              </div>
            </div>

            <Button
              className="w-full bg-gradient-hero"
              onClick={handleSend}
              disabled={createAdvisory.isPending}
            >
              {createAdvisory.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Send Recommendation
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="mb-4 font-display text-lg font-semibold">Sent History</h3>
          <div className="space-y-3">
            {(advisories as AdvisoryHistoryItem[] | undefined)?.map((a) => {
              const severity = severityOptions[a.severity || "info"] || severityOptions.info;
              return (
                <div key={a.id} className="rounded-lg border bg-muted/20 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-sm font-semibold">{a.title}</div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${severity.chip}`}
                    >
                      {a.severity}
                    </span>
                  </div>
                  <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">{a.message}</div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
                      <AlertCircle className="h-3 w-3" />
                      Sent to: {a.farmer?.fullName || "Selected Farmers"}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {new Date(a.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              );
            })}
            {(!advisories || advisories.length === 0) && (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-14 text-center">
                <Inbox className="mb-3 h-10 w-10 text-muted-foreground opacity-40" />
                <h4 className="text-sm font-semibold">No advisories sent yet</h4>
                <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                  Compose a recommendation and send it to one farmer or all assigned farmers.
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send advisory?</AlertDialogTitle>
            <AlertDialogDescription>
              This will send a {severityOptions[severity].label.toLowerCase()} advisory to{" "}
              {recipientCount} farmer{recipientCount === 1 ? "" : "s"}.
              {selectedFarmerId === "all" ? " You are broadcasting to all assigned farmers." : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="rounded-lg border bg-muted/20 p-3 text-sm">
            <div className="font-semibold">{title}</div>
            <p className="mt-1 text-muted-foreground">{message}</p>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={createAdvisory.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={sendAdvisory} disabled={createAdvisory.isPending}>
              {createAdvisory.isPending ? "Sending..." : "Confirm Send"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
