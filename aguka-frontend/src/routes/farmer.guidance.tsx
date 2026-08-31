import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard-ui";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  BookOpen,
  Leaf,
  Dog,
  ChevronRight,
  Sprout,
  Milk,
  Bug,
  Droplets,
  Loader2,
  AlertCircle,
  Thermometer,
  FlaskConical,
} from "lucide-react";
import { useState, useEffect, useMemo, useRef } from "react";
import { useGuides, useGuide, useGuideFilters } from "@/hooks/use-guides";
import type { Guide } from "@/api/guides";
import { useFarmGuidance } from "@/hooks/use-farm-guidance";
import { useMyLivestockGuidance } from "@/hooks/use-livestock";
import type { CropGuidance } from "@/api/farmers";
import type { LivestockAnimalGuidance } from "@/api/livestock";
import { useI18n } from "@/i18n";

export const Route = createFileRoute("/farmer/guidance")({
  component: GuidancePage,
});

const categoryIcons: Record<string, typeof Sprout> = {
  Planting: Sprout,
  Water: Droplets,
  Protection: Bug,
  Harvest: Leaf,
  Feeding: Milk,
  Health: Bug,
  General: BookOpen,
};

const defaultIcon = BookOpen;

const livestockTitleTags: Array<{ match: RegExp; tag: string }> = [
  { match: /pig/i, tag: "Pigs" },
  { match: /poultry|chicken/i, tag: "Poultry" },
  { match: /dairy|cow/i, tag: "Dairy" },
];

function getLivestockTag(title: string): string | null {
  return livestockTitleTags.find(({ match }) => match.test(title))?.tag ?? null;
}

function GuideCard({ guide, onClick }: { guide: Guide; onClick: () => void }) {
  const Icon =
    guide.icon && categoryIcons[guide.icon]
      ? categoryIcons[guide.icon]
      : guide.category && categoryIcons[guide.category]
        ? categoryIcons[guide.category]
        : defaultIcon;
  const subjectTag = guide.crop || getLivestockTag(guide.title);

  return (
    <Card
      className="group hover:shadow-md transition-all cursor-pointer border-border/50"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex items-center gap-2">
            {subjectTag && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted border border-border px-2 py-1 rounded">
                {subjectTag}
              </span>
            )}
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 px-2 py-1 rounded">
              {guide.category}
            </span>
          </div>
        </div>
        <CardTitle className="mt-4 text-base">{guide.title}</CardTitle>
        <CardDescription className="line-clamp-2">{guide.summary}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <BookOpen className="h-3 w-3" />
            {guide.readingTime} min read
          </div>
          <div className="flex items-center gap-1 text-primary font-medium">
            Read Guide
            <ChevronRight className="h-4 w-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function GuideDetailDialog({
  guideId,
  open,
  onOpenChange,
}: {
  guideId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: guide, isLoading } = useGuide(guideId || "");
  const contentRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentSection, setCurrentSection] = useState(1);

  const sectionCount = useMemo(() => {
    if (!guide) return 0;
    return guide.content.split("\n").filter((line) => line.startsWith("## ")).length;
  }, [guide]);

  useEffect(() => {
    if (!open) {
      setScrollProgress(0);
      setCurrentSection(1);
    }
  }, [open]);

  useEffect(() => {
    if (!open || !guide) return;
    const container = contentRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const maxScroll = scrollHeight - clientHeight;
      setScrollProgress(maxScroll > 0 ? Math.min(100, (scrollTop / maxScroll) * 100) : 0);

      if (sectionCount > 0) {
        const headings = container.querySelectorAll<HTMLElement>("[data-guide-section]");
        const threshold = container.getBoundingClientRect().top + container.clientHeight * 0.3;
        let active = 1;
        headings.forEach((heading) => {
          if (heading.getBoundingClientRect().top <= threshold) {
            active = Number(heading.dataset.guideSection);
          }
        });
        setCurrentSection(active);
      }
    };

    handleScroll();
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [open, guide, sectionCount]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent ref={contentRef} className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <div
          className="absolute top-0 left-0 right-0 h-[3px] bg-primary"
          style={{ width: `${scrollProgress}%`, transition: "width 0.1s ease" }}
        />
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : guide ? (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                {guide.crop && <span className="font-medium text-primary">{guide.crop}</span>}
                {guide.crop && <span>/</span>}
                <span>{guide.category}</span>
              </div>
              <DialogTitle className="text-xl">{guide.title}</DialogTitle>
              <DialogDescription className="text-sm">{guide.summary}</DialogDescription>
            </DialogHeader>

            {sectionCount > 0 && (
              <p className="text-xs text-muted-foreground">
                Section {currentSection} of {sectionCount}
              </p>
            )}

            {(guide.waterRequirement ||
              guide.growthPeriod ||
              guide.optimalTemp ||
              guide.soilType) && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
                {guide.growthPeriod && (
                  <div className="rounded-lg bg-muted p-3 text-center">
                    <p className="text-xs text-muted-foreground">Growth Period</p>
                    <p className="text-sm font-semibold mt-1">{guide.growthPeriod}</p>
                  </div>
                )}
                {guide.waterRequirement && (
                  <div className="rounded-lg bg-muted p-3 text-center">
                    <p className="text-xs text-muted-foreground">Water Requirement</p>
                    <p className="text-sm font-semibold mt-1">{guide.waterRequirement}</p>
                  </div>
                )}
                {guide.optimalTemp && (
                  <div className="rounded-lg bg-muted p-3 text-center">
                    <p className="text-xs text-muted-foreground">Optimal Temp</p>
                    <p className="text-sm font-semibold mt-1">{guide.optimalTemp}</p>
                  </div>
                )}
                {guide.soilType && (
                  <div className="rounded-lg bg-muted p-3 text-center">
                    <p className="text-xs text-muted-foreground">Soil Type</p>
                    <p className="text-sm font-semibold mt-1">{guide.soilType}</p>
                  </div>
                )}
              </div>
            )}

            <div className="prose prose-sm max-w-none mt-2">
              {(() => {
                let sectionIndex = 0;
                return guide.content.split("\n").map((line, i) => {
                  if (line.startsWith("## ")) {
                    sectionIndex += 1;
                    return (
                      <h2
                        key={i}
                        data-guide-section={sectionIndex}
                        className="text-lg font-semibold mt-6 mb-2"
                      >
                        {line.slice(3)}
                      </h2>
                    );
                  }
                  if (line.startsWith("### ")) {
                    return (
                      <h3 key={i} className="text-base font-semibold mt-4 mb-1">
                        {line.slice(4)}
                      </h3>
                    );
                  }
                  if (line.startsWith("- **")) {
                    const match = line.match(/- \*\*(.+?)\*\*(:?)\s*(.*)/);
                    if (match) {
                      return (
                        <p key={i} className="ml-4 mb-1">
                          <strong>{match[1]}</strong>
                          {match[2]}
                          {match[3] && ` — ${match[3]}`}
                        </p>
                      );
                    }
                  }
                  if (line.startsWith("- ")) {
                    return (
                      <li key={i} className="ml-4 mb-1 list-disc">
                        {line.slice(2)}
                      </li>
                    );
                  }
                  if (line.trim() === "") {
                    return <div key={i} className="h-2" />;
                  }
                  return (
                    <p key={i} className="mb-1">
                      {line}
                    </p>
                  );
                });
              })()}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center py-12 text-muted-foreground">
            <AlertCircle className="h-8 w-8 mb-2" />
            <p>Guide not found</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function CropGuidanceCard({ guidance }: { guidance: CropGuidance }) {
  const { t, lang } = useI18n();
  const { crop } = guidance;
  const cropName =
    (lang === "rw" ? crop.nameRw : lang === "fr" ? crop.nameFr : null) || crop.nameEn;
  const phRange =
    guidance.optimalPhMin && guidance.optimalPhMax
      ? `${Number(guidance.optimalPhMin).toFixed(1)} – ${Number(guidance.optimalPhMax).toFixed(1)}`
      : null;
  const tempRange =
    guidance.optimalTempMinCelsius && guidance.optimalTempMaxCelsius
      ? `${Number(guidance.optimalTempMinCelsius).toFixed(0)}–${Number(guidance.optimalTempMaxCelsius).toFixed(0)}°C`
      : null;

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Sprout className="h-6 w-6" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-1 rounded">
            {crop.category}
          </span>
        </div>
        <CardTitle className="mt-4 text-base">{cropName}</CardTitle>
        <CardDescription>{t("guidance.crop.subtitle")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {guidance.waterRequirementMm && (
            <div className="flex items-start gap-2">
              <Droplets className="h-4 w-4 text-primary mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">{t("guidance.water_need")}</p>
                <p className="font-medium">{Number(guidance.waterRequirementMm)} mm</p>
              </div>
            </div>
          )}
          {tempRange && (
            <div className="flex items-start gap-2">
              <Thermometer className="h-4 w-4 text-primary mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">{t("guidance.optimal_temp")}</p>
                <p className="font-medium">{tempRange}</p>
              </div>
            </div>
          )}
          {phRange && (
            <div className="flex items-start gap-2">
              <FlaskConical className="h-4 w-4 text-primary mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">{t("guidance.optimal_ph")}</p>
                <p className="font-medium">{phRange}</p>
              </div>
            </div>
          )}
          {guidance.growingPeriodDays && (
            <div className="flex items-start gap-2">
              <Leaf className="h-4 w-4 text-primary mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">{t("guidance.growing_period")}</p>
                <p className="font-medium">{guidance.growingPeriodDays} days</p>
              </div>
            </div>
          )}
        </div>
        {(guidance.nitrogenRequirementKgha ||
          guidance.phosphorusRequirementKgha ||
          guidance.potassiumRequirementKgha) && (
          <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border/50">
            {t("guidance.npk_need")}:{" "}
            {guidance.nitrogenRequirementKgha ? Number(guidance.nitrogenRequirementKgha) : "—"}-
            {guidance.phosphorusRequirementKgha ? Number(guidance.phosphorusRequirementKgha) : "—"}-
            {guidance.potassiumRequirementKgha ? Number(guidance.potassiumRequirementKgha) : "—"}{" "}
            kg/ha
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function LivestockGuidanceCard({ animal }: { animal: LivestockAnimalGuidance }) {
  const { t } = useI18n();
  const isDueSoon =
    !!animal.nextVaccinationDue && new Date(animal.nextVaccinationDue) <= new Date();

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Dog className="h-6 w-6" />
          </div>
          <Badge
            className={
              animal.healthStatus === "healthy"
                ? "bg-success text-success-foreground"
                : "bg-warning text-warning-foreground"
            }
          >
            {animal.healthStatus}
          </Badge>
        </div>
        <CardTitle className="mt-4 text-base capitalize">
          {animal.animalType}
          {animal.breed ? ` · ${animal.breed}` : ""}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p>
          <span className="font-medium">{t("guidance.nutrition")}:</span> {animal.nutrition}
        </p>
        <p>
          <span className="font-medium">{t("guidance.housing")}:</span> {animal.housing}
        </p>
        {isDueSoon && (
          <p className="flex items-center gap-1.5 text-warning font-medium">
            <AlertCircle className="h-3.5 w-3.5" />
            {t("guidance.vaccination_due")}
          </p>
        )}
        {animal.recommendations.length > 0 && (
          <ul className="pt-2 border-t border-border/50 space-y-1">
            {animal.recommendations.map((rec, i) => (
              <li key={i} className="flex gap-1.5 text-muted-foreground">
                <span>•</span>
                {rec}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function YourFarmSection() {
  const { t } = useI18n();
  const { data: farmGuidance, isLoading: farmLoading } = useFarmGuidance();
  const { data: livestockGuidance, isLoading: livestockLoading } = useMyLivestockGuidance();

  const crops = farmGuidance?.crops || [];
  const animals = livestockGuidance?.specific || [];

  if (farmLoading || livestockLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (crops.length === 0 && animals.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">{t("guidance.yourfarm.title")}</h2>
        <p className="text-sm text-muted-foreground">{t("guidance.yourfarm.subtitle")}</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {crops.map(({ guidance }) => (
          <CropGuidanceCard key={guidance.farmerCrop.id} guidance={guidance} />
        ))}
        {animals.map((animal) => (
          <LivestockGuidanceCard key={animal.id} animal={animal} />
        ))}
      </div>
    </div>
  );
}

function GuidancePage() {
  const { t } = useI18n();
  const [cropFilter, setCropFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedGuideId, setSelectedGuideId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const params: { crop?: string; category?: string } = {};
  if (cropFilter !== "all") params.crop = cropFilter;
  if (categoryFilter !== "all") params.category = categoryFilter;

  const { data: guides, isLoading, error } = useGuides(params);
  const { data: filters, isLoading: filtersLoading } = useGuideFilters();

  const openGuide = (id: string) => {
    setSelectedGuideId(id);
    setDetailOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Farming Guidance"
        subtitle="Expert advice and best practices for your crops and livestock."
      />

      <YourFarmSection />

      <div>
        <h2 className="text-lg font-semibold">{t("guidance.articles.title")}</h2>
        <p className="text-sm text-muted-foreground">{t("guidance.articles.subtitle")}</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="w-48">
          {filtersLoading ? (
            <div className="h-10 rounded-md bg-muted animate-pulse" />
          ) : (
            <Select value={cropFilter} onValueChange={setCropFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Crops" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Crops</SelectItem>
                {(filters?.crops || []).map((crop) => (
                  <SelectItem key={crop} value={crop}>
                    {crop}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <div className="w-48">
          {filtersLoading ? (
            <div className="h-10 rounded-md bg-muted animate-pulse" />
          ) : (
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {(filters?.categories || []).map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        {(cropFilter !== "all" || categoryFilter !== "all") && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setCropFilter("all");
              setCategoryFilter("all");
            }}
          >
            Clear Filters
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center py-16 text-muted-foreground">
          <AlertCircle className="h-10 w-10 mb-4 text-destructive" />
          <p className="font-semibold">Failed to load guides</p>
          <p className="text-sm">Please try again later.</p>
        </div>
      ) : guides && guides.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {guides.map((guide) => (
            <GuideCard key={guide.id} guide={guide} onClick={() => openGuide(guide.id)} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center py-16 text-muted-foreground">
          <BookOpen className="h-10 w-10 mb-4 opacity-40" />
          <p className="font-semibold">No guides found</p>
          <p className="text-sm">
            {cropFilter !== "all" || categoryFilter !== "all"
              ? "Try adjusting the filters."
              : "Check back later for new guides."}
          </p>
        </div>
      )}

      <GuideDetailDialog guideId={selectedGuideId} open={detailOpen} onOpenChange={setDetailOpen} />
    </div>
  );
}
