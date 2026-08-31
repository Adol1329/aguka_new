import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard-ui";
import { Card, CardContent } from "@/components/ui/card";
import { useMyDistributions } from "@/hooks/use-data";
import { Loader2, Package, MapPin, Calendar, Tag, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/farmer/resources")({
  component: FarmerResourcesPage,
});

function FarmerResourcesPage() {
  const { data: distributions, isLoading } = useMyDistributions();

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
        title="My Resources"
        subtitle="Inputs and equipment allocated to you by the cooperative."
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {(distributions || []).map((d: any) => {
          const isEquipment = d.resource.resourceType === "equipment";
          
          return (
            <Card
              key={d.id}
              className={cn(
                "overflow-hidden hover:shadow-md transition-all border-l-4",
                isEquipment ? "border-l-blue-500" : "border-l-emerald-500"
              )}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-xl transition-colors",
                      isEquipment ? "bg-blue-100 text-blue-600" : "bg-emerald-100 text-emerald-600"
                    )}
                  >
                    {isEquipment ? <Shield className="h-6 w-6" /> : <Package className="h-6 w-6" />}
                  </div>
                  <Badge variant="secondary" className="capitalize">
                    {d.status}
                  </Badge>
                </div>

                <div className="mb-4">
                  <h3 className="font-bold text-lg">{d.resource.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Tag className="h-3 w-3 text-muted-foreground" />
                    <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full font-bold uppercase">
                      {d.resource.category || d.resource.resourceType}
                    </span>
                  </div>
                </div>

                <div className="space-y-2.5 pt-3 border-t border-border/50">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Quantity</span>
                    <span className="font-bold">
                      {d.quantity ? `${d.quantity} ${d.unit || ""}` : "1 Unit"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" /> Pickup Location
                    </span>
                    <span className="font-medium text-xs text-right">
                      {d.location || "Cooperative Depot"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" /> Allocated On
                    </span>
                    <span className="text-xs">
                      {new Date(d.distributedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {d.notes && (
                  <div className="mt-4 p-3 bg-muted/30 rounded-lg text-[11px] text-muted-foreground italic">
                    "{d.notes}"
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {(!distributions || distributions.length === 0) && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-center bg-muted/10 rounded-2xl border-2 border-dashed">
            <Package className="h-12 w-12 text-muted-foreground/20 mb-4" />
            <h3 className="font-bold text-lg">No Resources Yet</h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              When the cooperative allocates fertilizers, seeds, or tools to you, they will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
