import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { useCooperativeJoinRequests, useApproveJoinRequest, useRejectJoinRequest } from "@/hooks/use-data";
import { PageHeader } from "@/components/dashboard-ui";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, UserCheck, UserX, Users, Phone, MapPin } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/cooperative/join-requests")({
  component: JoinRequestsPage,
});

function JoinRequestsPage() {
  const { user } = useAuth();
  const coopId = user?.cooperativeId;
  const { data: requests, isLoading } = useCooperativeJoinRequests(coopId || "");
  const approve = useApproveJoinRequest();
  const reject = useRejectJoinRequest();

  if (!coopId) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <Users className="h-16 w-16 text-muted-foreground/20" />
        <h2 className="text-2xl font-bold">No Cooperative Assigned</h2>
        <p className="text-muted-foreground max-w-md text-center">
          You must be assigned to a cooperative to manage join requests.
        </p>
      </div>
    );
  }

  const handleApprove = async (requestId: string) => {
    try {
      await approve.mutateAsync({ coopId, requestId });
      toast.success("Member approved and added to cooperative");
    } catch {
      toast.error("Failed to approve request");
    }
  };

  const handleReject = async (requestId: string) => {
    if (!confirm("Reject this join request?")) return;
    try {
      await reject.mutateAsync({ coopId, requestId });
      toast.success("Request rejected");
    } catch {
      toast.error("Failed to reject request");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const pending = (requests || []).filter((r: any) => r.status === "pending");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Join Requests"
        subtitle={`${pending.length} pending request${pending.length !== 1 ? "s" : ""} to review`}
      />

      {pending.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-muted/20 rounded-2xl border-2 border-dashed">
          <Users className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <h3 className="font-bold text-lg">No pending requests</h3>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-1">
            When farmers request to join your cooperative, they will appear here for review.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pending.map((r: any) => {
            const profile = r.user?.farmerProfile || r.farmer || {};
            const name = profile.fullName || r.user?.phone || "Unknown Farmer";
            const district = profile.district || "";
            const phone = r.user?.phone || "";

            return (
              <Card key={r.id} className="p-5 space-y-4 border-border/50 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary font-black text-lg shrink-0">
                    {name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold truncate">{name}</div>
                    {district && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                        <MapPin className="h-3 w-3" />
                        {district}
                      </div>
                    )}
                    {phone && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                        <Phone className="h-3 w-3" />
                        {phone}
                      </div>
                    )}
                  </div>
                </div>

                {r.message && (
                  <p className="text-xs text-muted-foreground italic border-l-2 border-border pl-3">
                    "{r.message}"
                  </p>
                )}

                <div className="text-[10px] text-muted-foreground">
                  Requested {new Date(r.createdAt || r.requestedAt).toLocaleDateString()}
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 bg-success hover:bg-success/90 text-white"
                    onClick={() => handleApprove(r.id)}
                    disabled={approve.isPending || reject.isPending}
                  >
                    {approve.isPending ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <UserCheck className="h-3 w-3 mr-1" />
                    )}
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-destructive border-destructive/30 hover:bg-destructive/5"
                    onClick={() => handleReject(r.id)}
                    disabled={approve.isPending || reject.isPending}
                  >
                    {reject.isPending ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <UserX className="h-3 w-3 mr-1" />
                    )}
                    Reject
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Processed requests section */}
      {(requests || []).filter((r: any) => r.status !== "pending").length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
            Recently Processed
          </h3>
          <div className="divide-y divide-border/40">
            {(requests || [])
              .filter((r: any) => r.status !== "pending")
              .slice(0, 5)
              .map((r: any) => {
                const profile = r.user?.farmerProfile || r.farmer || {};
                const name = profile.fullName || r.user?.phone || "Unknown";
                return (
                  <div key={r.id} className="flex items-center justify-between py-3">
                    <span className="text-sm font-medium">{name}</span>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        r.status === "approved"
                          ? "bg-success/10 text-success"
                          : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
