import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard-ui";
import { Card, CardContent } from "@/components/ui/card";
import { useAssignedFarmers, useFarmers } from "@/hooks/use-data";
import {
  ChevronRight,
  Droplets,
  Loader2,
  MapPin,
  Search,
  Sprout,
  Thermometer,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";
import { BASE_URL } from "@/api/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/officer/farms")({
  component: OfficerFarms,
});

type SoilReading = {
  moisturePercent?: number | string | null;
  soilTemperatureCelsius?: number | string | null;
  temperatureCelsius?: number | string | null;
  readingAt?: string;
};

type OfficerFarmer = {
  id: string;
  userId?: string;
  fullName?: string | null;
  avatarUrl?: string | null;
  farmName?: string | null;
  district?: string | null;
  sector?: string | null;
  yieldScore?: number | null;
  user?: { phone?: string | null };
  latestSoilReading?: SoilReading | null;
  sensors?: Array<{ soilReadings?: SoilReading[] }>;
  crops?: Array<{ crop?: { nameEn?: string | null } }>;
  farmerCrops?: Array<{ crop?: { nameEn?: string | null } }>;
};

function OfficerFarms() {
  const { data: assignedFarmers, isLoading: assignedLoading } = useAssignedFarmers({
    page: 1,
    limit: 100,
  });
  const shouldUseFallback = !assignedLoading && (assignedFarmers?.data?.length || 0) === 0;
  const { data: allFarmers, isLoading: allFarmersLoading } = useFarmers(
    { page: 1, limit: 100 },
    { enabled: shouldUseFallback },
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [districtFilter, setDistrictFilter] = useState("all");
  const [cropFilter, setCropFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");
  const [sortBy, setSortBy] = useState("score-desc");
  const [page, setPage] = useState(1);
  const pageSize = 9;

  const sourceFarmers = shouldUseFallback ? allFarmers : assignedFarmers;
  const isLoading = assignedLoading || (shouldUseFallback && allFarmersLoading);
  const farmerList = useMemo(
    () => (sourceFarmers?.data || []) as OfficerFarmer[],
    [sourceFarmers?.data],
  );
  const getLatestReading = (f: OfficerFarmer) =>
    f.latestSoilReading || f.sensors?.flatMap((sensor) => sensor.soilReadings || [])?.[0] || null;
  const getCropName = (f: OfficerFarmer) =>
    f.crops?.[0]?.crop?.nameEn || f.farmerCrops?.[0]?.crop?.nameEn || null;
  const getScore = (f: OfficerFarmer) => {
    if (typeof f.yieldScore === "number") return f.yieldScore;
    const reading = getLatestReading(f);
    const moisture = Number(reading?.moisturePercent);
    const temp = Number(reading?.soilTemperatureCelsius || reading?.temperatureCelsius);
    if (!Number.isFinite(moisture) && !Number.isFinite(temp)) return null;
    const moistureScore = Number.isFinite(moisture)
      ? Math.max(0, 100 - Math.abs(moisture - 55) * 2)
      : 70;
    const tempScore = Number.isFinite(temp) ? Math.max(0, 100 - Math.abs(temp - 24) * 4) : 70;
    return Math.round(moistureScore * 0.7 + tempScore * 0.3);
  };
  const getRisk = (score: number | null) => {
    if (score === null) return "unknown";
    if (score < 50) return "high";
    if (score < 75) return "watch";
    return "good";
  };
  const scoreClasses = (risk: string) => {
    if (risk === "good") return "bg-emerald-100 text-emerald-700 border-emerald-200";
    if (risk === "watch") return "bg-amber-100 text-amber-700 border-amber-200";
    if (risk === "high") return "bg-red-100 text-red-700 border-red-200";
    return "bg-slate-100 text-slate-600 border-slate-200";
  };

  const districts = Array.from(new Set(farmerList.map((f) => f.district).filter(Boolean))).sort();
  const crops = Array.from(new Set(farmerList.map(getCropName).filter(Boolean))).sort();
  const q = searchTerm.trim().toLowerCase();
  const hasActiveFilters =
    !!q || districtFilter !== "all" || cropFilter !== "all" || riskFilter !== "all";
  const filteredFarmers = farmerList
    .filter((f) => {
      const name = String(f.fullName || "").toLowerCase();
      const farmName = String(f.farmName || "").toLowerCase();
      const phone = String(f.user?.phone || "").toLowerCase();
      const district = String(f.district || "").toLowerCase();
      const sector = String(f.sector || "").toLowerCase();
      const crop = getCropName(f);
      const cropText = String(crop || "").toLowerCase();
      const risk = getRisk(getScore(f));
      const riskText = risk === "watch" ? "watch medium warning" : risk;
      const matchesSearch =
        !q ||
        name.includes(q) ||
        farmName.includes(q) ||
        phone.includes(q) ||
        district.includes(q) ||
        sector.includes(q) ||
        cropText.includes(q) ||
        riskText.includes(q);
      return (
        matchesSearch &&
        (districtFilter === "all" || f.district === districtFilter) &&
        (cropFilter === "all" || crop === cropFilter) &&
        (riskFilter === "all" || risk === riskFilter)
      );
    })
    .sort((a, b) => {
      if (sortBy === "name")
        return String(a.fullName || "").localeCompare(String(b.fullName || ""));
      if (sortBy === "district")
        return String(a.district || "").localeCompare(String(b.district || ""));
      const aScore = getScore(a) ?? -1;
      const bScore = getScore(b) ?? -1;
      return sortBy === "score-asc" ? aScore - bScore : bScore - aScore;
    });
  const totalPages = Math.max(1, Math.ceil(filteredFarmers.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedFarmers = filteredFarmers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Assigned Farms"
          subtitle="Monitor soil, weather and crop data per farm."
        />
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search farmers, phones or districts..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {shouldUseFallback && farmerList.length > 0 && (
        <Card className="border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          No officer assignments were found, so all farms are shown for review.
        </Card>
      )}

      <div className="grid gap-3 md:grid-cols-4">
        <Select
          value={sortBy}
          onValueChange={(value) => {
            setSortBy(value);
            setPage(1);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sort farms" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="score-desc">Score: high to low</SelectItem>
            <SelectItem value="score-asc">Score: low to high</SelectItem>
            <SelectItem value="district">District</SelectItem>
            <SelectItem value="name">Farmer name</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={districtFilter}
          onValueChange={(value) => {
            setDistrictFilter(value);
            setPage(1);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="District" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All districts</SelectItem>
            {districts.map((district) => (
              <SelectItem key={district} value={district}>
                {district}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={cropFilter}
          onValueChange={(value) => {
            setCropFilter(value);
            setPage(1);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Crop" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All crops</SelectItem>
            {crops.map((crop) => (
              <SelectItem key={crop} value={crop}>
                {crop}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={riskFilter}
          onValueChange={(value) => {
            setRiskFilter(value);
            setPage(1);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Risk" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All risk levels</SelectItem>
            <SelectItem value="high">High risk</SelectItem>
            <SelectItem value="watch">Watch</SelectItem>
            <SelectItem value="good">Good</SelectItem>
            <SelectItem value="unknown">No readings</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters && (
        <div className="flex items-center justify-between rounded-lg border bg-muted/20 px-4 py-3">
          <div className="text-sm text-muted-foreground">
            {filteredFarmers.length} of {farmerList.length} farms match the current search and
            filters.
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchTerm("");
              setDistrictFilter("all");
              setCropFilter("all");
              setRiskFilter("all");
              setSortBy("score-desc");
              setPage(1);
            }}
          >
            Reset filters
          </Button>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {paginatedFarmers.map((f) => {
          const reading = getLatestReading(f);
          const score = getScore(f);
          const risk = getRisk(score);
          const crop = getCropName(f);
          const hasName = f.fullName && f.fullName !== "Unnamed User";
          const displayName = hasName ? f.fullName : "Profile name missing";
          return (
            <Card
              key={f.id}
              className="group overflow-hidden border-border/50 transition-all hover:shadow-md"
            >
              <CardContent className="p-0">
                <div className="border-b border-border/50 p-5">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      {f.avatarUrl ? (
                        <img
                          src={
                            f.avatarUrl.startsWith("http")
                              ? f.avatarUrl
                              : `${BASE_URL}${f.avatarUrl}`
                          }
                          alt={displayName}
                          className="h-12 w-12 shrink-0 rounded-xl border border-border/50 object-cover transition-all group-hover:border-primary/30"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                            const sibling = (e.target as HTMLElement).nextElementSibling;
                            if (sibling) (sibling as HTMLElement).style.display = "flex";
                          }}
                        />
                      ) : null}
                      <div
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground"
                        style={{ display: f.avatarUrl ? "none" : "flex" }}
                      >
                        <Sprout className="h-6 w-6" />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-lg font-bold">{displayName}</div>
                        {!hasName && (
                          <div className="text-xs font-medium text-amber-600">
                            {f.user?.phone || f.userId}
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {f.district} · {f.sector}
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className={scoreClasses(risk)}>
                      {score === null ? "No score" : `Score: ${score}`}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <div className="rounded-md bg-info/10 p-1.5 text-info">
                        <Droplets className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-[10px] font-bold uppercase text-muted-foreground">
                          Soil Moisture
                        </div>
                        <div className="text-sm font-semibold">
                          {reading?.moisturePercent != null
                            ? `${Number(reading.moisturePercent).toFixed(0)}%`
                            : "No reading"}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="rounded-md bg-warning/10 p-1.5 text-warning">
                        <Thermometer className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-[10px] font-bold uppercase text-muted-foreground">
                          Soil Temp
                        </div>
                        <div className="text-sm font-semibold">
                          {reading?.soilTemperatureCelsius != null ||
                          reading?.temperatureCelsius != null
                            ? `${Number(reading.soilTemperatureCelsius || reading.temperatureCelsius).toFixed(1)}°C`
                            : "No reading"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-muted/20 p-4">
                  <div className="flex items-center gap-1 text-[10px] font-bold uppercase text-muted-foreground">
                    <TrendingUp className="h-3 w-3" />
                    Crop: {crop || "Not recorded"}
                  </div>
                  <Button size="sm" className="h-8 text-xs font-semibold group/btn" asChild>
                    <Link to="/reports" search={{ farmerId: f.id }}>
                      Analyze Data
                      <ChevronRight className="ml-1 h-3 w-3 transition-transform group-hover/btn:translate-x-1" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filteredFarmers.length === 0 && (
          <Card className="col-span-full flex flex-col items-center justify-center border-dashed py-20 text-center">
            <Search className="mb-4 h-12 w-12 text-muted-foreground opacity-20" />
            <h3 className="text-lg font-semibold">No farmers found</h3>
            <p className="text-sm text-muted-foreground">
              Try adjusting your filters or reset the current search.
            </p>
            {hasActiveFilters && (
              <Button
                className="mt-4"
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setDistrictFilter("all");
                  setCropFilter("all");
                  setRiskFilter("all");
                  setPage(1);
                }}
              >
                Reset filters
              </Button>
            )}
          </Card>
        )}
      </div>

      {filteredFarmers.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * pageSize + 1}-
            {Math.min(currentPage * pageSize, filteredFarmers.length)} of {filteredFarmers.length}{" "}
            assigned farms
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
