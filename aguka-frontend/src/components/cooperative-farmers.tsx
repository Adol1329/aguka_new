import { PageHeader } from "@/components/dashboard-ui";
import { Card } from "@/components/ui/card";
import { useFarmers, useUsers, useAddCooperativeMember } from "@/hooks/use-data";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, Users, Search, UserPlus, X, MapPin, Smartphone } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useTableSearch } from "@/hooks/use-table-search";
import { TableSearchBar } from "@/components/table-search-bar";
import { toast } from "sonner";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
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

export function CooperativeFarmersComponent() {
  const { user } = useAuth();
  const coopId = user?.cooperativeId;
  const [page, setPage] = useState(1);
  const { data: farmersData, isLoading } = useFarmers({ page, limit: 10 });
  const addMember = useAddCooperativeMember();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Use a query for users to find potential new members
  const { data: usersData, isLoading: isUsersLoading } = useUsers({ 
    search: searchTerm || undefined, 
    role: 'farmer', 
    limit: 5 
  } as any);

  if (!coopId) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <Users className="h-16 w-16 text-muted-foreground/20" />
        <h2 className="text-2xl font-bold">No Cooperative Assigned</h2>
        <p className="text-muted-foreground max-w-md text-center">
          Assignment to a cooperative is required to manage member farmers.
        </p>
      </div>
    );
  }

  const handleAddMember = async (farmerId: string) => {
    try {
      await addMember.mutateAsync({
        coopId,
        data: { userId: farmerId }
      });
      toast.success("Farmer added to cooperative successfully");
      setShowAddDialog(false);
    } catch (error) {
      toast.error("Failed to add farmer to cooperative");
    }
  };

  const farmers = Array.isArray(farmersData?.data) ? farmersData.data : [];
  const pagination = farmersData?.pagination;

  const { query, setQuery, filteredData: displayedFarmers, reset } = useTableSearch(
    farmers,
    ['fullName', 'sector', 'district', 'waterSource']
  );

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Farmers"
        subtitle="Manage farmers under your cooperative."
        action={
          <Button onClick={() => setShowAddDialog(true)} className="bg-gradient-hero">
            <Plus className="mr-2 h-4 w-4" />
            Add farmer
          </Button>
        }
      />
      <Card className="p-6">
        <div className="mb-6 max-w-md">
          <TableSearchBar
            value={query}
            onChange={setQuery}
            onClear={reset}
            placeholder="Search farmers..."
            resultsCount={displayedFarmers.length}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground font-black">
                <th className="pb-4">Name</th>
                <th className="pb-4">Location</th>
                <th className="pb-4">District</th>
                <th className="pb-4">Farm Size</th>
                <th className="pb-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {displayedFarmers.map((f: any) => (
                <tr key={f.id} className="border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="py-4">
                    <div className="font-bold">{f.fullName}</div>
                    <div className="text-[10px] text-muted-foreground font-mono">{f.phone || 'N/A'}</div>
                  </td>
                  <td className="py-4 text-muted-foreground">{f.sector}</td>
                  <td className="py-4 text-muted-foreground font-medium">{f.district}</td>
                  <td className="py-4 font-semibold">{f.farmSizeHectares} ha</td>
                  <td className="py-4">
                    <span className="inline-flex rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-black uppercase text-success">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
              {displayedFarmers.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-muted-foreground italic">
                    No farmers found in your cooperative records.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="mt-6 border-t pt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                  <PaginationItem key={p}>
                    <PaginationLink 
                      isActive={page === p}
                      onClick={() => setPage(p)}
                      className="cursor-pointer"
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                    className={page === pagination.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </Card>

      {/* Add Farmer Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Farmer to Cooperative</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by name or phone..." 
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {isUsersLoading ? (
                <div className="flex justify-center py-4"><Loader2 className="h-6 w-6 animate-spin" /></div>
              ) : (usersData?.data || []).map((u: any) => (
                <div key={u.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                  <div>
                    <div className="font-bold text-sm">{u.farmerProfile?.fullName || 'Unnamed Farmer'}</div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Smartphone className="h-3 w-3" /> {u.phone}
                      </span>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {u.farmerProfile?.district || 'No location'}
                      </span>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="h-8 text-xs font-bold" onClick={() => handleAddMember(u.id)}>
                    Add
                  </Button>
                </div>
              ))}
              {!isUsersLoading && (usersData?.data || []).length === 0 && searchTerm && (
                <div className="text-center py-4 text-xs text-muted-foreground italic">No farmers found matching your search.</div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowAddDialog(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
