import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard-ui";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import {
  useFarmerProfile,
  useCooperatives,
  useMyJoinRequest,
  useSubmitJoinRequest,
  useMyCooperative,
} from "@/hooks/use-data";
import { Building2, MapPin, Loader2, Send, Clock, CheckCircle2, XCircle } from "lucide-react";

export const Route = createFileRoute("/farmer/cooperative")({
  component: FarmerCooperativePage,
});

function FarmerCooperativePage() {
  const { user } = useAuth();

  if (user?.cooperativeId) {
    return <AlreadyMemberView />;
  }
  return <BrowseCooperativesView />;
}

function AlreadyMemberView() {
  const { data: cooperative, isLoading } = useMyCooperative();

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const c = cooperative as any;

  return (
    <div className="space-y-6">
      <PageHeader title="My Cooperative" subtitle="Your cooperative membership" />
      <Card className="p-6 max-w-lg space-y-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Building2 className="h-7 w-7" />
        </div>
        <div>
          <h3 className="text-lg font-bold">{c?.name || "Your Cooperative"}</h3>
          {c && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
              <MapPin className="h-3.5 w-3.5" />
              {c.sector}, {c.district}
            </div>
          )}
        </div>
        <Badge className="bg-emerald-100 text-emerald-800">Member</Badge>
      </Card>
    </div>
  );
}

function BrowseCooperativesView() {
  const { data: farmerProfile } = useFarmerProfile();
  const district = (farmerProfile as any)?.district;
  const { data: cooperatives, isLoading } = useCooperatives(
    { district },
    { enabled: !!district },
  );
  const { data: myRequest, isLoading: loadingRequest } = useMyJoinRequest();
  const submitJoinRequest = useSubmitJoinRequest();

  const list = useMemo(() => cooperatives || [], [cooperatives]);

  const handleRequest = async (id: string, name: string) => {
    try {
      await submitJoinRequest.mutateAsync(id);
      toast.success(`Join request sent to "${name}" ✓`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit join request.");
    }
  };

  const statusBadge = (status: string) => {
    if (status === "pending")
      return (
        <Badge className="bg-amber-100 text-amber-800 gap-1">
          <Clock className="h-3 w-3" /> Pending
        </Badge>
      );
    if (status === "approved")
      return (
        <Badge className="bg-emerald-100 text-emerald-800 gap-1">
          <CheckCircle2 className="h-3 w-3" /> Approved
        </Badge>
      );
    return (
      <Badge className="bg-red-100 text-red-700 gap-1">
        <XCircle className="h-3 w-3" /> Rejected
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Join a Cooperative"
        subtitle={
          district
            ? `Cooperatives in your district (${district})`
            : "Complete your farm profile to see cooperatives near you"
        }
      />

      {myRequest && (myRequest as any).status !== "rejected" && (
        <Card className="p-4 border-primary/30 bg-primary/5 flex items-center justify-between">
          <div className="text-sm">
            <span className="font-semibold">{(myRequest as any).cooperativeName}</span> — your request is{" "}
            {(myRequest as any).status}.
          </div>
          {statusBadge((myRequest as any).status)}
        </Card>
      )}

      {!district ? (
        <Card className="p-8 text-center text-sm text-muted-foreground italic">
          Your farm's district isn't set yet. Update your profile to browse nearby cooperatives.
        </Card>
      ) : isLoading || loadingRequest ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : list.length === 0 ? (
        <Card className="p-8 text-center text-sm text-muted-foreground italic">
          No cooperatives found in {district} yet.
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((c: any) => {
            const isMine = (myRequest as any)?.cooperativeId === c.id;
            return (
              <Card key={c.id} className="p-5 space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold">{c.name}</h4>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <MapPin className="h-3 w-3" />
                    {c.sector}, {c.district}
                  </div>
                </div>
                {c.description && <p className="text-xs text-muted-foreground line-clamp-2">{c.description}</p>}
                {isMine ? (
                  statusBadge((myRequest as any).status)
                ) : (
                  <Button
                    size="sm"
                    className="w-full"
                    disabled={
                      submitJoinRequest.isPending ||
                      ((myRequest as any) && (myRequest as any).status === "pending")
                    }
                    onClick={() => handleRequest(c.id, c.name)}
                  >
                    <Send className="mr-1.5 h-3.5 w-3.5" />
                    Request to Join
                  </Button>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
