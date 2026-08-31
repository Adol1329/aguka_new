import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, FormEvent } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard-ui";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useMyCooperative, useUpdateCooperative } from "@/hooks/use-data";
import { locationApi, type LocationItem } from "@/api/location";
import { Building2, Loader2, MapPin, Phone, Mail, Users, Calendar, Save } from "lucide-react";

export const Route = createFileRoute("/cooperative/profile")({
  component: CooperativeProfilePage,
});

const selectClass =
  "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition disabled:opacity-50 disabled:cursor-not-allowed";

function CooperativeProfilePage() {
  const { data: cooperative, isLoading } = useMyCooperative();
  const updateCooperative = useUpdateCooperative();

  const [form, setForm] = useState({ name: "", contactPhone: "", description: "" });
  const [locationChange, setLocationChange] = useState({
    provinceCode: "",
    districtCode: "",
    district: "",
    sectorCode: "",
    sector: "",
  });
  const [provinces, setProvinces] = useState<LocationItem[]>([]);
  const [districts, setDistricts] = useState<LocationItem[]>([]);
  const [sectors, setSectors] = useState<LocationItem[]>([]);

  useEffect(() => {
    if (cooperative) {
      setForm({
        name: (cooperative as any).name || "",
        contactPhone: (cooperative as any).contactPhone || "",
        description: (cooperative as any).description || "",
      });
    }
  }, [cooperative]);

  useEffect(() => {
    locationApi.getProvinces().then((r) => setProvinces((r.data as any) || []));
  }, []);

  const handleProvinceChange = async (code: string) => {
    setLocationChange((f) => ({ ...f, provinceCode: code, districtCode: "", district: "", sectorCode: "", sector: "" }));
    setDistricts([]);
    setSectors([]);
    if (code) {
      const r = await locationApi.getDistricts(code);
      setDistricts((r.data as any) || []);
    }
  };

  const handleDistrictChange = async (code: string) => {
    const name = districts.find((d) => String(d.code) === code)?.name || "";
    setLocationChange((f) => ({ ...f, districtCode: code, district: name, sectorCode: "", sector: "" }));
    setSectors([]);
    if (code) {
      const r = await locationApi.getSectors(code);
      setSectors((r.data as any) || []);
    }
  };

  const handleSectorChange = (code: string) => {
    const name = sectors.find((s) => String(s.code) === code)?.name || "";
    setLocationChange((f) => ({ ...f, sectorCode: code, sector: name }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!cooperative) return;
    if (!form.name) {
      toast.error("Name is required.");
      return;
    }
    try {
      await updateCooperative.mutateAsync({
        id: (cooperative as any).id,
        data: {
          name: form.name,
          contactPhone: form.contactPhone || undefined,
          description: form.description || undefined,
          ...(locationChange.district && { district: locationChange.district }),
          ...(locationChange.sector && { sector: locationChange.sector }),
        },
      });
      toast.success("Cooperative profile updated ✓");
      setLocationChange({ provinceCode: "", districtCode: "", district: "", sectorCode: "", sector: "" });
    } catch (err: any) {
      toast.error(err?.message || "Failed to update cooperative profile.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!cooperative) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <Building2 className="h-16 w-16 text-muted-foreground/20" />
        <h2 className="text-2xl font-bold">No Cooperative Assigned</h2>
        <p className="text-muted-foreground max-w-md text-center">
          You are not currently linked to a cooperative. Contact the system administrator.
        </p>
      </div>
    );
  }

  const c = cooperative as any;

  return (
    <div className="space-y-6">
      <PageHeader title="Cooperative Profile" subtitle="View and manage your cooperative's information" />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-1 space-y-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Building2 className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-lg font-bold">{c.name}</h3>
            <Badge
              className={`mt-1 text-[10px] ${c.isActive ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-700"}`}
            >
              {c.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {c.sector}, {c.district}
            </div>
            {c.contactEmail && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                {c.contactEmail}
              </div>
            )}
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              {c.memberCount ?? 0} members
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Registered {new Date(c.createdAt).toLocaleDateString()}
            </div>
          </div>
          <div className="pt-2 border-t">
            <Label className="text-[10px] uppercase text-muted-foreground tracking-wider">
              Registration Number
            </Label>
            <p className="font-mono text-sm mt-1">{c.registrationNumber || "Not set"}</p>
          </div>
        </Card>

        <Card className="p-6 lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Cooperative Name *</Label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
            </div>
            <div className="space-y-1.5">
              <Label>Contact Phone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  value={form.contactPhone}
                  onChange={(e) => setForm((f) => ({ ...f, contactPhone: e.target.value }))}
                  placeholder="e.g. 0788123456"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Input
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Short description"
              />
            </div>

            <div className="space-y-3 rounded-lg border p-3">
              <Label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                Change Location
              </Label>
              <p className="text-xs text-muted-foreground">
                Currently: <span className="font-medium text-foreground">{c.sector}, {c.district}</span>. Only
                pick new values below if you want to change it.
              </p>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Province</Label>
                  <select
                    className={selectClass}
                    value={locationChange.provinceCode}
                    onChange={(e) => handleProvinceChange(e.target.value)}
                  >
                    <option value="">Select province</option>
                    {provinces.map((p) => (
                      <option key={p.code} value={p.code}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">District</Label>
                  <select
                    className={selectClass}
                    value={locationChange.districtCode}
                    onChange={(e) => handleDistrictChange(e.target.value)}
                    disabled={!districts.length}
                  >
                    <option value="">Select district</option>
                    {districts.map((d) => (
                      <option key={d.code} value={d.code}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Sector</Label>
                  <select
                    className={selectClass}
                    value={locationChange.sectorCode}
                    onChange={(e) => handleSectorChange(e.target.value)}
                    disabled={!sectors.length}
                  >
                    <option value="">Select sector</option>
                    {sectors.map((s) => (
                      <option key={s.code} value={s.code}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={updateCooperative.isPending}>
                {updateCooperative.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Changes
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
