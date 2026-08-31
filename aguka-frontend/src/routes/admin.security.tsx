import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard-ui";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { usePasswordPolicy, useUpdatePasswordPolicy } from "@/hooks/use-data";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2, Shield, Save } from "lucide-react";

export const Route = createFileRoute("/admin/security")({
  component: SecurityPage,
});

function SecurityPage() {
  const { data: policy, isLoading } = usePasswordPolicy();
  const updatePolicy = useUpdatePasswordPolicy();

  const [minLength, setMinLength] = useState(8);
  const [requireUppercase, setRequireUppercase] = useState(true);
  const [requireLowercase, setRequireLowercase] = useState(true);
  const [requireNumbers, setRequireNumbers] = useState(true);
  const [requireSpecial, setRequireSpecial] = useState(true);
  const [expiryDays, setExpiryDays] = useState(0);
  const [preventReuse, setPreventReuse] = useState(0);

  useEffect(() => {
    if (policy) {
      setMinLength(policy.minLength ?? 8);
      setRequireUppercase(policy.requireUppercase ?? true);
      setRequireLowercase(policy.requireLowercase ?? true);
      setRequireNumbers(policy.requireNumbers ?? true);
      setRequireSpecial(policy.requireSpecial ?? true);
      setExpiryDays(policy.expiryDays ?? 0);
      setPreventReuse(policy.preventReuse ?? 0);
    }
  }, [policy]);

  const handleSave = () => {
    updatePolicy.mutate(
      {
        minLength,
        requireUppercase,
        requireLowercase,
        requireNumbers,
        requireSpecial,
        expiryDays,
        preventReuse,
      },
      {
        onSuccess: () => toast.success("Password policy updated"),
        onError: (err: any) => toast.error(err.message),
      },
    );
  };

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
        title="Security Policies"
        subtitle="Configure password policy, session limits, and authentication rules."
      />

      {/* Password Policy */}
      <Card className="p-6 space-y-6 border-border/50">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Password Policy
          </h3>
          <Button
            onClick={handleSave}
            disabled={updatePolicy.isPending}
            className="bg-primary shadow-lg shadow-primary/20"
          >
            {updatePolicy.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Policy
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Min Length */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="font-semibold">Minimum Length</Label>
              <span className="text-2xl font-black tabular-nums text-primary">{minLength}</span>
            </div>
            <Slider
              value={[minLength]}
              onValueChange={([v]) => setMinLength(v)}
              min={8}
              max={32}
              step={1}
            />
            <p className="text-xs text-muted-foreground">Minimum characters required (8–32)</p>
          </div>

          {/* Expiry Days */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="font-semibold">Password Expiry</Label>
              <span className="text-2xl font-black tabular-nums text-primary">
                {expiryDays > 0 ? `${expiryDays}d` : "Never"}
              </span>
            </div>
            <Slider
              value={[expiryDays]}
              onValueChange={([v]) => setExpiryDays(v)}
              min={0}
              max={365}
              step={1}
            />
            <p className="text-xs text-muted-foreground">
              Days until forced password change (0 = never expires)
            </p>
          </div>

          {/* Prevent Reuse */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="font-semibold">Password Reuse Prevention</Label>
              <span className="text-2xl font-black tabular-nums text-primary">
                {preventReuse > 0 ? `${preventReuse}` : "Off"}
              </span>
            </div>
            <Slider
              value={[preventReuse]}
              onValueChange={([v]) => setPreventReuse(v)}
              min={0}
              max={10}
              step={1}
            />
            <p className="text-xs text-muted-foreground">
              Number of previous passwords remembered (0 = disabled)
            </p>
          </div>
        </div>

        {/* Requirement Toggles */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              key: "requireUppercase",
              label: "Uppercase (A–Z)",
              desc: "Require at least one uppercase letter",
              val: requireUppercase,
              set: setRequireUppercase,
            },
            {
              key: "requireLowercase",
              label: "Lowercase (a–z)",
              desc: "Require at least one lowercase letter",
              val: requireLowercase,
              set: setRequireLowercase,
            },
            {
              key: "requireNumbers",
              label: "Numbers (0–9)",
              desc: "Require at least one digit",
              val: requireNumbers,
              set: setRequireNumbers,
            },
            {
              key: "requireSpecial",
              label: "Special (!@#$%&*)",
              desc: "Require at least one special character",
              val: requireSpecial,
              set: setRequireSpecial,
            },
          ].map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/30 transition-colors"
            >
              <div>
                <div className="text-sm font-semibold">{item.label}</div>
                <div className="text-[10px] text-muted-foreground">{item.desc}</div>
              </div>
              <Switch checked={item.val} onCheckedChange={item.set} />
            </div>
          ))}
        </div>

        {/* Preview */}
        <div className="rounded-lg bg-muted/30 border p-4">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
            Policy Preview
          </div>
          <div className="text-sm text-foreground font-mono">
            {minLength}+ chars{requireUppercase ? ", A–Z" : ""}
            {requireLowercase ? ", a–z" : ""}
            {requireNumbers ? ", 0–9" : ""}
            {requireSpecial ? ", !@#$%&*" : ""}
            {expiryDays > 0 ? ` | Expires in ${expiryDays}d` : " | No expiry"}
            {preventReuse > 0 ? ` | No reuse of last ${preventReuse}` : ""}
          </div>
        </div>
      </Card>
    </div>
  );
}
