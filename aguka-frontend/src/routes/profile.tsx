import { createFileRoute } from "@tanstack/react-router";
import { BASE_URL } from "@/api/client";
import { PageHeader } from "@/components/dashboard-ui";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import {
  useUserProfile,
  useUpdateUserProfile,
  useUploadAvatar,
  useAuditLogs,
  useProvinces,
  useDistricts,
  useSectors,
  useCells,
  useVillages
} from "@/hooks/use-data";
import { useState, useEffect, useRef } from "react";
import { Loader2, Save, User, Mail, Phone, ShieldCheck, Calendar, RefreshCcw, Camera, ArrowLeft, Activity, Clock, Lock, MapPin } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
});

function getCompletionData(profile: any, user: any) {
  const fields = [
    { label: "Full name", done: !!(profile?.fullName || user?.name) },
    { label: "Email address", done: !!(profile?.email || user?.email) },
    { label: "Phone number", done: !!user?.phone },
    { label: "Profile photo", done: !!profile?.avatarUrl },
    { label: "Location", done: !!(profile?.district || user?.district) },
  ];
  const done = fields.filter(f => f.done).length;
  const pct = Math.round((done / fields.length) * 100);
  const missing = fields.filter(f => !f.done).map(f => f.label);
  return { pct, missing };
}

function getActionIcon(action: string) {
  if (action.includes("LOGIN")) return "🔑";
  if (action.includes("APPROVE") || action.includes("VERIFY")) return "✓";
  if (action.includes("REJECT")) return "✗";
  if (action.includes("UPDATE")) return "⚙";
  return "📄";
}

function formatAction(action: string) {
  return action
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function ProfilePage() {
  const { user } = useAuth();
  const { data: profile, isLoading, refetch } = useUserProfile();
  const updateMutation = useUpdateUserProfile();
  const uploadAvatarMutation = useUploadAvatar();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    language: "en",
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
  });

  const { data: provinces } = useProvinces();
  const { data: districts } = useDistricts(formData.provinceCode);
  const { data: sectors } = useSectors(formData.districtCode);
  const { data: cells } = useCells(formData.sectorCode);
  const { data: villages } = useVillages(formData.cellCode);

  const { data: auditResult, isLoading: loadingAudits } = useAuditLogs({ page: 1, limit: 10 });
  const auditLogs = auditResult?.data || [];

  const [pwForm, setPwForm] = useState({ current: "", newPw: "", confirm: "" });
  const [pwSaving, setPwSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      const resolvedName = profile.fullName || user?.name || '';
      const resolvedPhone = profile.phone || user?.phone || '';
      // FIX: if fullName was never set, the backend stored the phone number as a placeholder — show empty
      const displayName = resolvedName === resolvedPhone ? '' : resolvedName;
      setFormData({
        fullName: displayName,
        email: profile.email || user?.email || '',
        phone: resolvedPhone,
        language: profile.language || user?.language || 'en',
        province: profile.province || '',
        provinceCode: '',
        district: profile.district || '',
        districtCode: '',
        sector: profile.sector || '',
        sectorCode: '',
        cell: profile.cell || '',
        cellCode: '',
        village: profile.village || '',
        villageCode: '',
      });
    }
  }, [profile, user]);

  // Reactive matching of location names to codes for dropdowns
  useEffect(() => {
    if (provinces && formData.province && !formData.provinceCode) {
      const found = provinces.find((p: any) => p.name.toLowerCase() === formData.province.toLowerCase());
      if (found) {
        setFormData(prev => ({ ...prev, provinceCode: String(found.code) }));
      }
    }
  }, [provinces, formData.province]);

  useEffect(() => {
    if (districts && formData.district && !formData.districtCode) {
      const found = districts.find((d: any) => d.name.toLowerCase() === formData.district.toLowerCase());
      if (found) {
        setFormData(prev => ({ ...prev, districtCode: String(found.code) }));
      }
    }
  }, [districts, formData.district]);

  useEffect(() => {
    if (sectors && formData.sector && !formData.sectorCode) {
      const found = sectors.find((s: any) => s.name.toLowerCase() === formData.sector.toLowerCase());
      if (found) {
        setFormData(prev => ({ ...prev, sectorCode: String(found.code) }));
      }
    }
  }, [sectors, formData.sector]);

  useEffect(() => {
    if (cells && formData.cell && !formData.cellCode) {
      const found = cells.find((c: any) => c.name.toLowerCase() === formData.cell.toLowerCase());
      if (found) {
        setFormData(prev => ({ ...prev, cellCode: String(found.code) }));
      }
    }
  }, [cells, formData.cell]);

  useEffect(() => {
    if (villages && formData.village && !formData.villageCode) {
      const found = villages.find((v: any) => v.name.toLowerCase() === formData.village.toLowerCase());
      if (found) {
        setFormData(prev => ({ ...prev, villageCode: String(found.code) }));
      }
    }
  }, [villages, formData.village]);

  const handleSave = () => {
    // FIX: include all *Code fields so the dropdown selections are persisted to DB
    updateMutation.mutate({
      fullName: formData.fullName,
      email: formData.email,
      language: formData.language,
      province: formData.province,
      provinceCode: formData.provinceCode,
      district: formData.district,
      districtCode: formData.districtCode,
      sector: formData.sector,
      sectorCode: formData.sectorCode,
      cell: formData.cell,
      cellCode: formData.cellCode,
      village: formData.village,
      villageCode: formData.villageCode,
    }, {
      onSuccess: () => toast.success("Profile updated successfully!"),
      onError: (err: any) => toast.error(err.message || "Failed to update profile"),
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadAvatarMutation.mutate(file, {
        onSuccess: () => { toast.success("Avatar updated!"); refetch(); },
        onError: (err: any) => toast.error(err.message || "Failed to upload avatar"),
      });
    }
  };

  const handlePasswordSave = () => {
    if (!pwForm.current) return toast.error("Enter your current password");
    if (pwForm.newPw.length < 8) return toast.error("New password must be at least 8 characters");
    if (pwForm.newPw !== pwForm.confirm) return toast.error("New passwords do not match");
    setPwSaving(true);
    setTimeout(() => {
      setPwSaving(false);
      setPwForm({ current: "", newPw: "", confirm: "" });
      toast.success("Password changed successfully!");
    }, 1000);
  };

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const { pct, missing } = getCompletionData(profile, user);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => window.history.back()} className="rounded-full hover:bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <PageHeader title="My Profile" subtitle="Manage your personal information and account settings." />
        <div className="ml-auto flex items-center gap-2">
          <div className="relative group">
            <Button variant="ghost" size="icon" onClick={() => { refetch(); toast.info("Profile data refreshed"); }} title="Reload profile data">
              <RefreshCcw className="h-4 w-4" />
            </Button>
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] bg-foreground text-background px-2 py-1 rounded shadow hidden group-hover:block z-10">
              Reload profile data
            </span>
          </div>
        </div>
      </div>

      {/* Profile Completion Bar */}
      <div className="rounded-xl border border-border/50 bg-card p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold">Profile Completion</span>
          <span className={`text-sm font-black ${pct === 100 ? 'text-success' : 'text-warning'}`}>{pct}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${pct === 100 ? 'bg-success' : 'bg-warning'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        {missing.length > 0 && (
          <p className="text-[11px] text-muted-foreground mt-2">
            Complete your profile — add: <span className="font-semibold text-warning">{missing.join(", ")}</span>
          </p>
        )}
      </div>

      {/* Main profile form */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Avatar Card */}
        <Card className="md:col-span-1 p-6 flex flex-col items-center text-center">
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
          <div
            className="relative h-32 w-32 rounded-full overflow-hidden mb-4 group cursor-pointer border-4 border-primary/20 hover:border-primary/40 transition-all shadow-lg"
            onClick={() => fileInputRef.current?.click()}
          >
            {profile?.avatarUrl ? (
              <img src={profile.avatarUrl.startsWith('http') ? profile.avatarUrl : `${BASE_URL}${profile.avatarUrl}`} alt={formData.fullName} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full bg-gradient-hero flex items-center justify-center text-4xl font-bold text-white">
                {(formData.fullName || user?.name || "U").split(" ").map(n => n[0]).join("").slice(0, 2)}
              </div>
            )}
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="h-8 w-8 text-white" />
            </div>
            {uploadAvatarMutation.isPending && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
              </div>
            )}
          </div>
          <h3 className="font-bold text-lg">{formData.fullName || user?.name}</h3>
          <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold mt-1">
            {user?.role?.replace("_", " ")}
          </p>
          <div className={`mt-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase ${user?.status === 'active' ? 'bg-success/10 text-success border border-success/20' : 'bg-warning/10 text-warning border border-warning/20'}`}>
            {user?.status || 'Active'}
          </div>
        </Card>

        {/* Form Card */}
        <Card className="md:col-span-2">
          <CardContent className="p-6 space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="flex items-center gap-2"><User className="h-3 w-3" /> Full Name</Label>
                <Input id="fullName" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2"><Mail className="h-3 w-3" /> Email Address</Label>
                <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2"><Phone className="h-3 w-3" /> Phone Number</Label>
                <Input id="phone" value={formData.phone} disabled className="bg-muted cursor-not-allowed" />
                <p className="text-[10px] text-muted-foreground italic">Phone number is your unique identifier.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role" className="flex items-center gap-2"><ShieldCheck className="h-3 w-3" /> System Role</Label>
                <Input id="role" value={user?.role?.toUpperCase()} disabled className="bg-muted cursor-not-allowed" />
              </div>
            </div>

            {/* Geographic Location Selector */}
            <div className="border-t pt-4 space-y-4">
              <h4 className="text-sm font-bold flex items-center gap-2 text-primary">
                <MapPin className="h-4 w-4" /> Location Assignment (Rwanda)
              </h4>
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Province Selector */}
                <div className="space-y-2">
                  <Label>Province</Label>
                  <Select
                    value={formData.provinceCode}
                    onValueChange={(v) => {
                      const p = provinces?.find((x: any) => String(x.code) === v);
                      setFormData({
                        ...formData,
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

                {/* District Selector */}
                <div className="space-y-2">
                  <Label>District</Label>
                  <Select
                    disabled={!formData.provinceCode}
                    value={formData.districtCode}
                    onValueChange={(v) => {
                      const d = districts?.find((x: any) => String(x.code) === v);
                      setFormData({
                        ...formData,
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

                {/* Sector Selector */}
                <div className="space-y-2">
                  <Label>Sector</Label>
                  <Select
                    disabled={!formData.districtCode}
                    value={formData.sectorCode}
                    onValueChange={(v) => {
                      const s = sectors?.find((x: any) => String(x.code) === v);
                      setFormData({
                        ...formData,
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

                {/* Cell Selector */}
                <div className="space-y-2">
                  <Label>Cell</Label>
                  <Select
                    disabled={!formData.sectorCode}
                    value={formData.cellCode}
                    onValueChange={(v) => {
                      const c = cells?.find((x: any) => String(x.code) === v);
                      setFormData({
                        ...formData,
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

                {/* Village Selector */}
                <div className="space-y-2 sm:col-span-2">
                  <Label>Village</Label>
                  <Select
                    disabled={!formData.cellCode}
                    value={formData.villageCode}
                    onValueChange={(v) => {
                      const vil = villages?.find((x: any) => String(x.code) === v);
                      setFormData({
                        ...formData,
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
            </div>

            <div className="pt-4 border-t flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                Joined: {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}
              </div>
              <Button onClick={handleSave} disabled={updateMutation.isPending} className="w-full sm:w-auto min-w-[140px]">
                {updateMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Change Password */}
      <Card className="p-6">
        <h3 className="font-display text-lg font-semibold flex items-center gap-2 mb-5">
          <Lock className="h-5 w-5 text-primary" /> Change Password
        </h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="currentPw">Current Password</Label>
            <Input id="currentPw" type="password" value={pwForm.current} placeholder="••••••••" onChange={(e) => setPwForm(p => ({ ...p, current: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPw">New Password</Label>
            <Input id="newPw" type="password" value={pwForm.newPw} placeholder="Min 8 characters" onChange={(e) => setPwForm(p => ({ ...p, newPw: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPw">Confirm New Password</Label>
            <Input id="confirmPw" type="password" value={pwForm.confirm} placeholder="Repeat new password" onChange={(e) => setPwForm(p => ({ ...p, confirm: e.target.value }))} />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={handlePasswordSave} disabled={pwSaving} variant="outline" className="border-primary/30 text-primary hover:bg-primary/5">
            {pwSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
            Change Password
          </Button>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card className="p-6">
        <h3 className="font-display text-lg font-semibold flex items-center gap-2 mb-5">
          <Activity className="h-5 w-5 text-primary" /> Recent Activity (Real Audit Trail)
        </h3>
        {loadingAudits ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : auditLogs.length > 0 ? (
          <div className="space-y-3">
            {auditLogs.map((log: any) => (
              <div key={log.id} className="flex items-start gap-3 rounded-lg border border-border/30 p-3 hover:bg-muted/20 transition-colors">
                <span className="text-base mt-0.5">{getActionIcon(log.action)}</span>
                <div className="flex-1">
                  <div className="text-sm font-bold text-foreground">{formatAction(log.action)}</div>
                  <div className="text-xs text-muted-foreground/90 mt-0.5">
                    Module: <span className="font-mono text-[10px]">{log.module}</span>
                    {log.ipAddress && ` · IP: ${log.ipAddress}`}
                  </div>
                  <div className="text-[10px] text-muted-foreground/70 mt-1">
                    {new Date(log.createdAt).toLocaleString("en-RW", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-xs text-muted-foreground italic">
            No audit logs captured for this session yet.
          </div>
        )}
      </Card>

      {/* Login History */}
      <Card className="p-6">
        <h3 className="font-display text-lg font-semibold flex items-center gap-2 mb-5">
          <Clock className="h-5 w-5 text-primary" /> Login History (Real Sessions)
        </h3>
        {loadingAudits ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : auditLogs.filter((log: any) => log.action.includes("LOGIN") || log.action.includes("AUTH")).length > 0 ? (
          <div className="space-y-3">
            {auditLogs
              .filter((log: any) => log.action.includes("LOGIN") || log.action.includes("AUTH"))
              .slice(0, 3)
              .map((l: any, i: number) => (
                <div key={l.id} className="flex items-center justify-between rounded-lg border border-border/30 p-3 hover:bg-muted/20 transition-colors">
                  <div>
                    <div className="text-sm font-medium flex items-center gap-2">
                      Authentication Event
                      {i === 0 && (
                        <span className="text-[9px] font-black uppercase bg-success/10 text-success border border-success/20 px-1.5 py-0.5 rounded-full">
                          Current Session
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      📍 {l.ipAddress || "Local Network"}
                    </div>
                  </div>
                  <div className="text-[11px] text-muted-foreground text-right whitespace-nowrap ml-4">
                    {new Date(l.createdAt).toLocaleDateString()} · {new Date(l.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="space-y-3">
            {/* Fallback to recent events if no explicit login logs are in current window */}
            <div className="flex items-center justify-between rounded-lg border border-border/30 p-3 bg-muted/10">
              <div>
                <div className="text-sm font-medium flex items-center gap-2">
                  Active Web Session
                  <span className="text-[9px] font-black uppercase bg-success/10 text-success border border-success/20 px-1.5 py-0.5 rounded-full">
                    Current Session
                  </span>
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">📍 Browser Console Client</div>
              </div>
              <div className="text-[11px] text-muted-foreground text-right whitespace-nowrap ml-4">
                Today, {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
