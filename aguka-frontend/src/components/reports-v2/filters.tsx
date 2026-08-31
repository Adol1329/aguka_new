import { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, FileSpreadsheet, FileText, RefreshCw, X, Filter } from "lucide-react";
import { reportsV2Api, type ReportFilters as Filters, type ReportFormat } from "@/api/reports-v2";
import { toast } from "sonner";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { useUsers, useCooperativeMembers, useFarmers, useCooperatives } from "@/hooks/use-data";
import { useSeasons } from "@/hooks/use-seasons";

export interface FilterOption {
  value: string;
  label: string;
}

export interface ReportFiltersBarProps {
  role: "farmer" | "officer" | "cooperative" | "admin" | "super_admin";
  reportType: string;
  showFarmer?: boolean;
  showDistrict?: boolean;
  showCooperative?: boolean;
  showCrop?: boolean;
  showSeason?: boolean;
  initial?: Filters;
  onChange?: (filters: Filters) => void;
}

const RWANDA_DISTRICTS = [
  "Gasabo",
  "Kicukiro",
  "Nyarugenge",
  "Burera",
  "Gakenke",
  "Gicumbi",
  "Musanze",
  "Rulindo",
  "Bugesera",
  "Gatsibo",
  "Kayonza",
  "Kirehe",
  "Ngoma",
  "Nyagatare",
  "Rwamagana",
  "Gisagara",
  "Huye",
  "Kamonyi",
  "Muhanga",
  "Nyamagabe",
  "Nyanza",
  "Nyaruguru",
  "Ruhango",
  "Karongi",
  "Ngororero",
  "Nyabihu",
  "Nyamasheke",
  "Rubavu",
  "Rusizi",
  "Rutsiro",
].sort();

export function ReportFiltersBar({
  role,
  reportType,
  showFarmer = true,
  showDistrict = true,
  showCooperative = true,
  showCrop = true,
  showSeason = true,
  initial = {},
  onChange,
}: ReportFiltersBarProps) {
  const [filters, setFilters] = useState<Filters>(initial);
  const [open, setOpen] = useState(false);

  const update = (patch: Partial<Filters>) => {
    const next = { ...filters, ...patch };
    setFilters(next);
    onChange?.(next);
  };

  const reset = () => {
    setFilters({});
    onChange?.({});
  };

  const isFiltered = useMemo(
    () => Object.values(filters).some((v) => v !== undefined && v !== ""),
    [filters],
  );

  // Cooperative filter options query: dependent on district selection
  const selectedDistrict = filters.district;
  const { data: coopsData, isLoading: loadingCoops } = useCooperatives(
    { district: selectedDistrict },
    { enabled: !!selectedDistrict },
  );

  const coopOptions = useMemo(() => {
    if (!selectedDistrict) return [];
    const coops = coopsData || [];
    return [
      { value: "", label: "All Cooperatives" },
      ...coops.map((c: any) => ({
        value: c.id,
        label: c.name || `Cooperative (${c.id.slice(0, 8)})`,
      })),
    ];
  }, [coopsData, selectedDistrict]);

  // Cascading logic for Farmer options: dependent on cooperative selection
  const selectedCoopId = filters.cooperativeId;
  const { data: farmersData, isLoading: loadingFarmers } = useFarmers(
    { cooperativeId: selectedCoopId, limit: 500 },
    { enabled: !!selectedCoopId },
  );

  const farmerOptions = useMemo(() => {
    if (!selectedCoopId) return [];
    const farmers = farmersData?.data || [];
    return [
      { value: "", label: "All Farmers" },
      ...farmers.map((f: any) => ({
        value: f.id,
        label: `${f.fullName || "Unnamed Farmer"} (${f.user?.phone || "No Phone"})`,
      })),
    ];
  }, [selectedCoopId, farmersData]);

  const { data: dynamicSeasons, isLoading: loadingSeasons } = useSeasons();

  const districtOptions = useMemo(() => {
    return [
      { value: "", label: "All Districts" },
      ...RWANDA_DISTRICTS.map((d) => ({ value: d, label: d })),
    ];
  }, []);

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant={open ? "default" : "outline"}
            size="sm"
            onClick={() => setOpen((v) => !v)}
          >
            <Filter className="mr-2 h-4 w-4" />
            {open ? "Hide Filters" : "Show Filters"}
          </Button>
          {isFiltered && (
            <Button variant="ghost" size="sm" onClick={reset}>
              <X className="mr-2 h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
        <ExportMenu role={role} reportType={reportType} filters={filters} />
      </div>

      {open && (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1">
            <Label htmlFor="startDate" className="text-xs">
              Start Date
            </Label>
            <Input
              id="startDate"
              type="date"
              value={filters.startDate ?? ""}
              onChange={(e) => update({ startDate: e.target.value || undefined })}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="endDate" className="text-xs">
              End Date
            </Label>
            <Input
              id="endDate"
              type="date"
              value={filters.endDate ?? ""}
              onChange={(e) => update({ endDate: e.target.value || undefined })}
            />
          </div>
          {showSeason && (
            <div className="space-y-1">
              <Label className="text-xs">Season</Label>
              <Select
                value={filters.seasonId ?? ""}
                onValueChange={(v) => update({ seasonId: v || undefined })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingSeasons ? "Loading..." : "All seasons"} />
                </SelectTrigger>
                <SelectContent>
                  {dynamicSeasons?.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} ({s.period})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {showDistrict && (
            <div className="space-y-1 flex flex-col justify-end">
              <Label className="text-xs mb-1">District</Label>
              <SearchableSelect
                options={districtOptions}
                value={filters.district ?? ""}
                onChange={(v) =>
                  update({
                    district: v || undefined,
                    cooperativeId: undefined,
                    farmerId: undefined,
                  })
                }
                placeholder="Select District"
                searchPlaceholder="Search districts..."
              />
            </div>
          )}
          {showCooperative && (
            <div className="space-y-1 flex flex-col justify-end">
              <Label className="text-xs mb-1">Cooperative</Label>
              <SearchableSelect
                options={coopOptions}
                value={filters.cooperativeId ?? ""}
                onChange={(v) => update({ cooperativeId: v || undefined, farmerId: undefined })}
                placeholder={selectedDistrict ? "Select Cooperative" : "Select District First"}
                searchPlaceholder="Search cooperatives..."
                isLoading={loadingCoops}
                disabled={!selectedDistrict}
              />
            </div>
          )}
          {showFarmer && (
            <div className="space-y-1 flex flex-col justify-end">
              <Label className="text-xs mb-1">Farmer</Label>
              <SearchableSelect
                options={farmerOptions}
                value={filters.farmerId ?? ""}
                onChange={(v) => update({ farmerId: v || undefined })}
                placeholder={selectedCoopId ? "Select Farmer" : "Select Cooperative First"}
                searchPlaceholder="Search farmers..."
                isLoading={loadingFarmers}
                disabled={!selectedCoopId}
              />
            </div>
          )}
          {showCrop && (
            <div className="space-y-1">
              <Label htmlFor="cropType" className="text-xs">
                Crop Type
              </Label>
              <Input
                id="cropType"
                placeholder="e.g. Maize"
                value={filters.cropType ?? ""}
                onChange={(e) => update({ cropType: e.target.value || undefined })}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ExportMenu({
  role,
  reportType,
  filters,
}: {
  role: string;
  reportType: string;
  filters: Filters;
}) {
  const [busy, setBusy] = useState<ReportFormat | null>(null);
  const trigger = async (format: Exclude<ReportFormat, "json">) => {
    setBusy(format);
    try {
      await reportsV2Api.download(role, reportType, format, filters);
      toast.success(`${format.toUpperCase()} download started`);
    } catch (err) {
      toast.error(`Download failed: ${(err as Error).message}`);
    } finally {
      setBusy(null);
    }
  };
  return (
    <div className="flex flex-wrap gap-2">
      <Button size="sm" variant="outline" disabled={busy !== null} onClick={() => trigger("pdf")}>
        {busy === "pdf" ? (
          <>
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            Generating PDF...
          </>
        ) : (
          <>
            <Download className="mr-2 h-4 w-4" />
            PDF
          </>
        )}
      </Button>
      <Button size="sm" variant="outline" disabled={busy !== null} onClick={() => trigger("xlsx")}>
        {busy === "xlsx" ? (
          <>
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            Generating Excel...
          </>
        ) : (
          <>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Excel
          </>
        )}
      </Button>
      <Button size="sm" variant="outline" disabled={busy !== null} onClick={() => trigger("csv")}>
        {busy === "csv" ? (
          <>
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            Generating CSV...
          </>
        ) : (
          <>
            <FileText className="mr-2 h-4 w-4" />
            CSV
          </>
        )}
      </Button>
    </div>
  );
}
