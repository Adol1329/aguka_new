import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard-ui";
import { Card, CardContent } from "@/components/ui/card";
import { useFarmers, useVerifyFarmer, useBulkVerifyFarmers } from "@/hooks/use-data";
import {
  Sprout, MapPin, Loader2, CheckCircle2, ShieldCheck, AlertCircle,
  Eye, Search, Filter, AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { BASE_URL } from "@/api/client";

export const Route = createFileRoute("/admin/farms")({
  component: AdminFarms,
});

const CROP_OPTIONS = ["All Crops", "Beans", "Maize", "Banana", "Wheat", "Cassava", "Sweet Potato", "Sorghum"];
const DISTRICT_OPTIONS = ["All Districts", "Kigali", "Rulindo", "Ruhango", "Musanze", "Huye", "Nyagatare", "Rubavu", "Kayonza"];

function FarmCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border bg-card p-4 flex items-center gap-4">
      <div className="h-12 w-12 rounded-xl bg-muted shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-40 bg-muted rounded" />
        <div className="h-3 w-24 bg-muted rounded" />
      </div>
      <div className="h-8 w-24 bg-muted rounded" />
      <div className="h-8 w-20 bg-muted rounded" />
    </div>
  );
}

/** A farm/farmer is considered verified when their verification status is 'verified'. */
function isVerified(f: any): boolean {
  return f.verificationStatus === "verified";
}

function AdminFarms() {
  const { data: farmers, isLoading } = useFarmers({ limit: 200 });
  const verifyFarmer = useVerifyFarmer();
  const bulkVerifyFarmers = useBulkVerifyFarmers();

  const [searchTerm, setSearchTerm] = useState("");
  const [cropFilter, setCropFilter] = useState("All Crops");
  const [districtFilter, setDistrictFilter] = useState("All Districts");
  const [unverifiedOnly, setUnverifiedOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [selectedFarmer, setSelectedFarmer] = useState<any>(null);
  const [selectedFarmerIds, setSelectedFarmerIds] = useState<string[]>([]);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const [bulkProgress, setBulkProgress] = useState<{ done: number; total: number } | null>(null);

  const farmerList = farmers?.data || [];

  const filteredFarmers = useMemo(() => {
    return farmerList.filter((f: any) => {
      const matchSearch =
        searchTerm === "" ||
        f.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.district?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.farmName?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchCrop =
        cropFilter === "All Crops" ||
        f.crops?.some((c: any) =>
          c.crop?.nameEn?.toLowerCase().includes(cropFilter.toLowerCase())
        );

      const matchDistrict =
        districtFilter === "All Districts" ||
        f.district?.toLowerCase().includes(districtFilter.toLowerCase());

      const verified = isVerified(f);
      const matchVerified = !unverifiedOnly || !verified;

      return matchSearch && matchCrop && matchDistrict && matchVerified;
    });
  }, [farmerList, searchTerm, cropFilter, districtFilter, unverifiedOnly]);

  const unverifiedFarmers = farmerList.filter((f: any) => !isVerified(f));

  const totalPages = Math.max(1, Math.ceil(filteredFarmers.length / itemsPerPage));
  const currentFarmers = filteredFarmers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  /** Verify a single farmer */
  const handleVerify = (farmerId: string, farmerName?: string) => {
    if (!farmerId) {
      toast.error("Cannot verify: missing farmer ID.");
      return;
    }
    verifyFarmer.mutate(
      farmerId,
      {
        onSuccess: () =>
          toast.success(`${farmerName ? `"${farmerName}"` : "Farm"} verified successfully ✓`),
        onError: (err: any) =>
          toast.error(err?.message || "Failed to verify farm"),
      }
    );
  };

  /** Bulk-verify selected farmers */
  const handleBulkVerify = async () => {
    setShowBulkConfirm(false);
    const targets = unverifiedFarmers.filter((f: any) => f.id);
    if (targets.length === 0) {
      toast.info("No unverified farmers to process.");
      return;
    }

    const farmerIds = targets.map(f => f.id);
    setBulkProgress({ done: 0, total: farmerIds.length });
    
    try {
      await bulkVerifyFarmers.mutateAsync(farmerIds);
      setBulkProgress(null);
      toast.success(`All ${farmerIds.length} farmers verified successfully ✓`);
    } catch (err: any) {
      setBulkProgress(null);
      toast.error(err?.message || "Failed to verify farms");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="flex gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-10 w-32 bg-muted animate-pulse rounded" />
          ))}
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <FarmCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  const isBulkRunning = bulkProgress !== null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Network Farm Data"
          subtitle="Review and validate farm information to maintain data integrity."
        />
        <div className="flex items-center gap-2">
          {/* Unverified Only toggle */}
          <Button
            variant={unverifiedOnly ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setUnverifiedOnly((v) => !v);
              setCurrentPage(1);
            }}
            className={
              unverifiedOnly
                ? "bg-warning text-warning-foreground hover:bg-warning/90"
                : ""
            }
          >
            <Filter className="h-4 w-4 mr-2" />
            {unverifiedOnly ? `Showing: Unverified (${unverifiedFarmers.length})` : "Unverified Only"}
          </Button>

          {/* Bulk Verify */}
          <Button
            size="sm"
            variant="outline"
            className="border-success/40 text-success hover:bg-success/10 hover:text-success font-semibold"
            disabled={isBulkRunning || unverifiedFarmers.length === 0}
            onClick={() => setShowBulkConfirm(true)}
          >
            {isBulkRunning ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {bulkProgress!.done}/{bulkProgress!.total}
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Bulk Verify {unverifiedFarmers.length > 0 ? `(${unverifiedFarmers.length})` : ""}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search farms, districts or owners..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <select
          className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          value={cropFilter}
          onChange={(e) => {
            setCropFilter(e.target.value);
            setCurrentPage(1);
          }}
        >
          {CROP_OPTIONS.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>

        <select
          className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          value={districtFilter}
          onChange={(e) => {
            setDistrictFilter(e.target.value);
            setCurrentPage(1);
          }}
        >
          {DISTRICT_OPTIONS.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>

        <span className="text-xs text-muted-foreground ml-auto">
          {filteredFarmers.length} farms
        </span>
      </div>

      {/* Farm Cards */}
      <div className="flex flex-col gap-3">
        {currentFarmers.map((f: any) => {
          const verified = isVerified(f);
          const isPending =
            verifyFarmer.isPending &&
            verifyFarmer.variables === f.id;

          return (
            <Card
              key={f.id}
              className="overflow-hidden hover:shadow-md transition-shadow group border-border/50"
            >
              <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Avatar + Name */}
                <div className="flex items-center gap-4 min-w-[250px] flex-1">
                  {f.avatarUrl ? (
                    <img
                      src={
                        f.avatarUrl.startsWith("http")
                          ? f.avatarUrl
                          : `${BASE_URL}${f.avatarUrl}`
                      }
                      alt={f.fullName}
                      className="h-12 w-12 shrink-0 rounded-xl object-cover border border-border/50"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  ) : null}
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-success/10 text-success group-hover:bg-success group-hover:text-success-foreground transition-colors"
                    style={{ display: f.avatarUrl ? "none" : "flex" }}
                  >
                    <Sprout className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="font-bold text-base leading-tight flex items-center gap-2">
                      {f.fullName}
                      <Badge
                        variant={verified ? "outline" : "destructive"}
                        className={
                          verified
                            ? "border-success/30 text-success text-[10px] h-5 px-2"
                            : "text-[10px] h-5 px-2"
                        }
                      >
                        {verified ? "Verified" : "Needs Review"}
                      </Badge>
                    </div>
                    {f.farmName && (
                      <div className="text-xs font-semibold text-primary/80 mt-0.5">
                        {f.farmName}
                      </div>
                    )}
                    {f.farmSizeHectares && (
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        {f.farmSizeHectares} Ha
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {f.district} · {f.sector}
                    </div>
                  </div>
                </div>

                {/* Crops */}
                <div className="flex flex-col gap-1 min-w-[200px]">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                    Registered Crops
                  </span>
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {f.crops?.length > 0 ? (
                      f.crops.slice(0, 3).map((c: any) => (
                        <Badge
                          key={c.id}
                          variant="secondary"
                          className="text-[10px] px-1.5 py-0.5"
                        >
                          {c.crop?.nameEn || c.cropName || "—"}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground italic">None</span>
                    )}
                    {f.crops?.length > 3 && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0.5">
                        +{f.crops.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Status */}
                <div className="flex flex-col gap-1 min-w-[150px]">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                    Status
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`inline-block h-2 w-2 rounded-full ${
                        verified
                          ? "bg-success"
                          : f.verificationStatus === "rejected"
                            ? "bg-destructive"
                            : "bg-warning animate-pulse"
                      }`} />
                    <span
                      className={`text-xs font-bold ${verified ? "text-success" : f.verificationStatus === "rejected" ? "text-destructive" : "text-warning"}`}>
                      {verified ? "Verified" : f.verificationStatus === "rejected" ? "Rejected" : "Pending Validation"}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 px-4 text-xs font-semibold flex-1 md:flex-none"
                    onClick={() => setSelectedFarmer(f)}
                  >
                    <Eye className="mr-2 h-3.5 w-3.5" />
                    Details
                  </Button>
                  <Button
                    size="sm"
                    className={`h-9 px-4 text-xs font-semibold flex-1 md:flex-none transition-all ${verified ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50" : "bg-primary text-white hover:bg-primary/90"}`}
                    disabled={verified || f.verificationStatus === "rejected" || isPending || isBulkRunning}
                    onClick={() => !verified && f.verificationStatus !== "rejected" && handleVerify(f.id, f.fullName)}
                    title={verified ? "Already verified — no action needed" : f.verificationStatus === "rejected" ? "Cannot verify rejected farm" : "Verify this farm's data"}
                  >
                    {isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
                    ) : (
                      <ShieldCheck className="h-3.5 w-3.5 mr-2" />
                    )}
                    {verified ? "Verified ✓" : "Verify Data"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filteredFarmers.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-center bg-muted/10 rounded-2xl border-2 border-dashed">
            <AlertCircle className="h-12 w-12 text-muted-foreground/20 mb-4" />
            <h3 className="font-bold text-lg">No farm records found</h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              Your search or filters did not match any farm records in the system.
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <div className="text-sm text-muted-foreground mx-4">
            Page {currentPage} of {totalPages} · {filteredFarmers.length} farms
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Bulk Verify Confirmation Dialog */}
      <AlertDialog open={showBulkConfirm} onOpenChange={setShowBulkConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Bulk Verify {unverifiedFarmers.length} Farmers
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will mark all <strong>{unverifiedFarmers.length}</strong> pending farmers as{" "}
              <strong>Active & Validated</strong> in the system. Their accounts will be fully
              activated immediately. This action cannot be undone in bulk — you would need to
              deactivate accounts individually.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-success text-success-foreground hover:bg-success/90"
              onClick={handleBulkVerify}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Yes, Verify All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Farmer Details Dialog */}
      <Dialog
        open={!!selectedFarmer}
        onOpenChange={(open) => !open && setSelectedFarmer(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl font-display">
              <Sprout className="h-6 w-6 text-success" />
              Farmer Profile Details
            </DialogTitle>
            <DialogDescription>
              Detailed registration and operational data for {selectedFarmer?.fullName}.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-6 py-4">
              <section>
                <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">
                  Basic Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <DetailItem label="Full Name" value={selectedFarmer?.fullName} />
                  <DetailItem label="Farm Name" value={selectedFarmer?.farmName || "—"} />
                  <DetailItem
                    label="Administrative Area"
                    value={`${selectedFarmer?.district || "—"}, ${selectedFarmer?.sector || "—"}`}
                  />
                  <DetailItem
                    label="Farm Size"
                    value={
                      selectedFarmer?.farmSizeHectares
                        ? `${selectedFarmer.farmSizeHectares} Hectares`
                        : "—"
                    }
                  />
                  <DetailItem
                    label="Emergency Contact"
                    value={selectedFarmer?.emergencyContact || "None provided"}
                  />
                  <DetailItem
                    label="Family Members"
                    value={selectedFarmer?.familyMembers || "0"}
                  />
                </div>
              </section>
              <Separator />
              <section>
                <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">
                  Technical Specifications
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <DetailItem
                    label="GPS Coordinates"
                    value={
                      selectedFarmer?.gpsLatitude
                        ? `${selectedFarmer.gpsLatitude}, ${selectedFarmer.gpsLongitude}`
                        : "Not recorded"
                    }
                  />
                  <DetailItem label="Soil Type" value={selectedFarmer?.soilType || "Unknown"} />
                  <DetailItem
                    label="Water Source"
                    value={selectedFarmer?.waterSource || "Not specified"}
                  />
                  <DetailItem
                    label="Irrigation Type"
                    value={selectedFarmer?.irrigationType || "None"}
                  />
                </div>
              </section>
              <Separator />
              <section>
                <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">
                  Crops &amp; Production
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedFarmer?.crops?.length > 0 ? (
                    selectedFarmer.crops.map((c: any) => (
                      <Badge key={c.id} variant="secondary" className="px-3 py-1">
                        {c.crop?.nameEn || c.cropName || "—"} ({c.status})
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground italic">
                      No crops registered.
                    </span>
                  )}
                </div>
              </section>
              <Separator />
              <section>
                <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">
                  Account Status
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <DetailItem
                    label="User Status"
                    value={selectedFarmer?.user?.status || selectedFarmer?.status || "Unknown"}
                  />
                  <DetailItem label="Phone" value={selectedFarmer?.user?.phone || "—"} />
                  <DetailItem label="Email" value={selectedFarmer?.user?.email || "—"} />
                </div>
              </section>
            </div>
          </ScrollArea>
          <DialogFooter className="flex gap-2 sm:justify-between items-center border-t pt-4 mt-2">
            <div className="text-[10px] text-muted-foreground">
              Last updated:{" "}
              {selectedFarmer?.updatedAt
                ? new Date(selectedFarmer.updatedAt).toLocaleString()
                : "Never"}
            </div>
            <div className="flex gap-2">
              {selectedFarmer && !isVerified(selectedFarmer) && selectedFarmer.verificationStatus !== "rejected" && (
                <Button
                  className="bg-primary text-white hover:bg-primary/90"
                  disabled={verifyFarmer.isPending}
                  onClick={() => {
                    handleVerify(selectedFarmer.id, selectedFarmer.fullName);
                    setSelectedFarmer(null);
                  }}
                >
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Verify Now
                </Button>
              )}
              <Button variant="outline" onClick={() => setSelectedFarmer(null)}>
                Close Details
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <div className="text-[10px] text-muted-foreground font-bold uppercase">{label}</div>
      <div className="text-sm font-medium">{value || "—"}</div>
    </div>
  );
}
