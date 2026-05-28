import { useState } from "react";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Sprout, 
  MapPin, 
  Bell, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2,
  Droplets,
  CloudSun
} from "lucide-react";
import { useAuth, getStoredUser, ROLE_HOME } from "@/lib/auth";
import { apiClient } from "@/api/client";
import { toast } from "sonner";
import { 
  useSectors, 
  useCells,
  useVillages,
  useProvinces,
  useDistricts
} from "@/hooks/use-data";

export const Route = createFileRoute("/onboarding")({
  beforeLoad: () => {
    const user = getStoredUser();
    if (!user) {
      throw redirect({ to: "/auth", search: { mode: "signin" } });
    }
    if (user.role !== "farmer") {
      throw redirect({ to: ROLE_HOME[user.role] as any });
    }
    if (user.isOnboarded) {
      throw redirect({ to: "/farmer" });
    }
  },
  component: OnboardingPage,
});

type Step = 1 | 2 | 3 | 4;

function OnboardingPage() {
  const [step, setStep] = useState<Step>(1);
  const { user, token, signIn } = useAuth();
  const navigate = useNavigate();

  const [farmData, setFarmData] = useState({
    farmName: "",
    province: "",
    provinceCode: "",
    district: "",
    districtCode: "",
    sector: "",
    sectorCode: "",
    cell: "",
    cellCode: "",
    village: "",
    villageCode: "",
    farmSize: "",
    waterSource: "rainwater",
  });

  const { data: provinces } = useProvinces();
  const { data: districts } = useDistricts(farmData.provinceCode);
  const { data: sectors } = useSectors(farmData.districtCode);
  const { data: cells } = useCells(farmData.sectorCode);
  const { data: villages } = useVillages(farmData.cellCode);

  const [selectedCrops, setSelectedCrops] = useState<string[]>([]);
  const [alerts, setAlerts] = useState({
    soil: true,
    weather: true,
    market: false,
    sms: false,
  });

  const crops = [
    { id: "maize", name: "Maize" },
    { id: "beans", name: "Beans" },
    { id: "potato", name: "Irish Potato" },
    { id: "coffee", name: "Coffee" },
    { id: "rice", name: "Rice" },
    { id: "cassava", name: "Cassava" },
  ];

  const handleComplete = async () => {
    if (!farmData.farmName || !farmData.villageCode) {
      toast.error("Please complete all location fields.");
      return;
    }

    try {
      // 1. Save Farm Profile with strict types
      await apiClient.post("/farmers/profile", {
        ...farmData,
        fullName: user?.name || "",
        provinceCode: farmData.provinceCode,
        districtCode: farmData.districtCode,
        sectorCode: farmData.sectorCode,
        cellCode: farmData.cellCode,
        villageCode: farmData.villageCode,
        farmSizeHectares: parseFloat(farmData.farmSize) || 0,
      });

      for (const cropId of selectedCrops) {
        await apiClient.post("/farmers/crops", {
          cropId,
          status: "growing",
          plantedDate: new Date().toISOString(),
        });
      }

      await apiClient.patch("/users/me", { isOnboarded: true });

      // Update local auth state
      if (user) {
        signIn({ ...user, isOnboarded: true });
      }

      setStep(4);
      setTimeout(() => {
        navigate({ to: "/farmer" });
      }, 2000);
    } catch (error) {
      toast.error("Failed to save profile. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        <div className="mb-8 flex justify-between items-center px-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>
                {step > s ? <CheckCircle2 className="h-5 w-5" /> : s}
              </div>
              {s < 3 && <div className={`h-1 w-12 md:w-24 rounded-full ${step > s ? "bg-primary" : "bg-muted"}`} />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader>
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">Tell us about your farm</CardTitle>
              <CardDescription>This helps us calibrate soil moisture alerts and weather forecasts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="farmName">Farm Name</Label>
                <Input 
                  id="farmName" 
                  placeholder="e.g. Sunny Valley Farm" 
                  value={farmData.farmName}
                  onChange={(e) => setFarmData({ ...farmData, farmName: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Province</Label>
                <Select 
                  value={farmData.provinceCode}
                  onValueChange={(v) => {
                    const p = provinces?.find((x: any) => String(x.code) === v);
                    setFarmData({ 
                      ...farmData, 
                      province: p?.name || "", 
                      provinceCode: v,
                      district: "",
                      districtCode: "",
                      sector: "",
                      sectorCode: "",
                      cell: "",
                      cellCode: "",
                      village: "",
                      villageCode: ""
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Province" />
                  </SelectTrigger>
                  <SelectContent>
                    {provinces?.map((p: any) => (
                      <SelectItem key={p.code} value={String(p.code)}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>District</Label>
                  <Select 
                    disabled={!farmData.provinceCode}
                    value={farmData.districtCode}
                    onValueChange={(v) => {
                      const d = districts?.find((x: any) => String(x.code) === v);
                      setFarmData({ 
                        ...farmData, 
                        district: d?.name || "", 
                        districtCode: v,
                        sector: "",
                        sectorCode: "",
                        cell: "",
                        cellCode: "",
                        village: "",
                        villageCode: ""
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select District" />
                    </SelectTrigger>
                    <SelectContent>
                      {districts?.map((d: any) => (
                        <SelectItem key={d.code} value={String(d.code)}>{d.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Sector</Label>
                  <Select 
                    disabled={!farmData.districtCode}
                    value={farmData.sectorCode}
                    onValueChange={(v) => {
                      const s = sectors?.find((x: any) => String(x.code) === v);
                      setFarmData({ 
                        ...farmData, 
                        sector: s?.name || "", 
                        sectorCode: v,
                        cell: "",
                        cellCode: "",
                        village: "",
                        villageCode: ""
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Sector" />
                    </SelectTrigger>
                    <SelectContent>
                      {sectors?.map((s: any) => (
                        <SelectItem key={s.code} value={String(s.code)}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Cell</Label>
                  <Select 
                    disabled={!farmData.sectorCode}
                    value={farmData.cellCode}
                    onValueChange={(v) => {
                      const c = cells?.find((x: any) => String(x.code) === v);
                      setFarmData({ 
                        ...farmData, 
                        cell: c?.name || "", 
                        cellCode: v,
                        village: "",
                        villageCode: ""
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Cell" />
                    </SelectTrigger>
                    <SelectContent>
                      {cells?.map((c: any) => (
                        <SelectItem key={c.code} value={String(c.code)}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Village</Label>
                  <Select 
                    disabled={!farmData.cellCode}
                    value={farmData.villageCode}
                    onValueChange={(v) => {
                      const vil = villages?.find((x: any) => String(x.code) === v);
                      setFarmData({ 
                        ...farmData, 
                        village: vil?.name || "", 
                        villageCode: v 
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Village" />
                    </SelectTrigger>
                    <SelectContent>
                      {villages?.map((vil: any) => (
                        <SelectItem key={vil.code} value={String(vil.code)}>{vil.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="size">Farm Size (ha)</Label>
                  <Input 
                    id="size" 
                    type="number" 
                    placeholder="1.5" 
                    value={farmData.farmSize}
                    onChange={(e) => setFarmData({ ...farmData, farmSize: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Water Source</Label>
                  <Select 
                    defaultValue="rainwater"
                    onValueChange={(v) => setFarmData({ ...farmData, waterSource: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rainwater">Rainwater</SelectItem>
                      <SelectItem value="well">Borehole / Well</SelectItem>
                      <SelectItem value="river">River / Stream</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button className="w-full mt-4" onClick={() => setStep(2)}>
                Next Step <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="animate-in fade-in slide-in-from-right-4 duration-500">
            <CardHeader>
              <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center mb-4">
                <Sprout className="h-6 w-6 text-success" />
              </div>
              <CardTitle className="text-2xl">What are you growing?</CardTitle>
              <CardDescription>Select all crops currently in your field.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-3">
                {crops.map((crop) => (
                  <div 
                    key={crop.id}
                    onClick={() => {
                      if (selectedCrops.includes(crop.id)) {
                        setSelectedCrops(selectedCrops.filter(c => c !== crop.id));
                      } else {
                        setSelectedCrops([...selectedCrops, crop.id]);
                      }
                    }}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedCrops.includes(crop.id) 
                        ? "border-primary bg-primary/5 ring-1 ring-primary" 
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    <div className={`h-2 w-2 rounded-full ${selectedCrops.includes(crop.id) ? "bg-primary" : "bg-muted"}`} />
                    <span className="font-medium">{crop.name}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button className="flex-[2]" onClick={() => setStep(3)}>
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card className="animate-in fade-in slide-in-from-right-4 duration-500">
            <CardHeader>
              <div className="h-12 w-12 rounded-xl bg-warning/10 flex items-center justify-center mb-4">
                <Bell className="h-6 w-6 text-warning" />
              </div>
              <CardTitle className="text-2xl">Stay Informed</CardTitle>
              <CardDescription>Configure your alert preferences for critical farming events.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Droplets className="h-5 w-5 text-info" />
                    <div>
                      <div className="font-medium">Soil Moisture Alerts</div>
                      <div className="text-xs text-muted-foreground">Get notified when soil is dry</div>
                    </div>
                  </div>
                  <Checkbox 
                    checked={alerts.soil} 
                    onCheckedChange={(v) => setAlerts({ ...alerts, soil: !!v })} 
                  />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <CloudSun className="h-5 w-5 text-warning" />
                    <div>
                      <div className="font-medium">Weather Warnings</div>
                      <div className="text-xs text-muted-foreground">Severe rain or drought alerts</div>
                    </div>
                  </div>
                  <Checkbox 
                    checked={alerts.weather} 
                    onCheckedChange={(v) => setAlerts({ ...alerts, weather: !!v })} 
                  />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-2 px-1">
                    <Checkbox 
                      id="sms" 
                      checked={alerts.sms} 
                      onCheckedChange={(v) => setAlerts({ ...alerts, sms: !!v })} 
                    />
                    <Label htmlFor="sms" className="text-sm font-medium">Send critical alerts via SMS</Label>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button className="flex-[2] bg-gradient-hero" onClick={handleComplete}>
                  Complete Setup <CheckCircle2 className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 4 && (
          <Card className="animate-in zoom-in duration-500">
            <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="h-20 w-20 rounded-full bg-success/20 flex items-center justify-center animate-bounce">
                <CheckCircle2 className="h-10 w-10 text-success" />
              </div>
              <h2 className="text-2xl font-bold">You're all set!</h2>
              <p className="text-muted-foreground text-center">
                Welcome to Aguka. We're redirecting you to your dashboard...
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
