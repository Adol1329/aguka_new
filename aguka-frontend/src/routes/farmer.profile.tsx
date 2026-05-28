import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard-ui";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useFarmerProfile, useFarmerCrops } from "@/hooks/use-data";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { farmersApi, type UserProfile } from "@/api";
import { useState, useEffect } from "react";
import { Loader2, UserPlus, Save } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/farmer/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: profile, isLoading: isProfileLoading } = useFarmerProfile();
  const { data: crops, isLoading: isCropsLoading } = useFarmerCrops();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    location: '',
    farmSizeHectares: '',
    familyMembers: '0',
    primaryCrops: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || user?.name || '',
        phone: user?.phone || '',
        location: profile.sector || profile.district || '',
        farmSizeHectares: profile.farmSizeHectares?.toString() || '0',
        familyMembers: profile.familyMembers?.toString() || '0',
        primaryCrops: Array.isArray(crops) ? crops.map((c: any) => c.crop?.nameEn || '').filter(Boolean).join(', ') : '',
      });
    }
  }, [profile, crops, user]);

  const updateMutation = useMutation({
    mutationFn: (data: Partial<UserProfile>) => farmersApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farmer-profile"] });
      toast.success("Profile updated successfully!");
    },
    onError: () => {
      toast.error("Failed to update profile");
    }
  });

  const isLoading = isProfileLoading || isCropsLoading;

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    const updateData: any = {
      fullName: formData.fullName,
      farmSizeHectares: parseFloat(formData.farmSizeHectares) || 0,
      familyMembers: parseInt(formData.familyMembers) || 0,
      sector: formData.location,
    };
    updateMutation.mutate(updateData);
  };

  const addHelper = () => {
    setFormData(prev => ({ ...prev, familyMembers: (parseInt(prev.familyMembers) + 1).toString() }));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Farm Profile"
        subtitle="Manage your farm details, crops and family helpers."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="font-display text-lg font-semibold mb-4">Personal & Farm Details</h3>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone (Account ID)</Label>
              <Input
                id="phone"
                value={formData.phone}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location (Sector)</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="farmSize">Farm size (hectares)</Label>
              <Input
                id="farmSize"
                value={formData.farmSizeHectares}
                onChange={(e) => handleChange('farmSizeHectares', e.target.value)}
                type="number"
                step="0.1"
              />
            </div>
          </div>
          <Button
            className="mt-6 bg-gradient-hero w-full"
            onClick={handleSave}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save profile changes
          </Button>
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-display text-lg font-semibold mb-2">Crops Grown</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Your registered crops. To add more, visit the crops management section.
            </p>
            <div className="flex flex-wrap gap-2">
              {Array.isArray(crops) && crops.length > 0 ? (
                crops.map((c: any) => (
                  <div key={c.id} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary border border-primary/20">
                    {c.crop?.nameEn}
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground italic">No crops registered</div>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-semibold">Family Helpers</h3>
              <div className="text-2xl font-bold text-primary">{formData.familyMembers}</div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Record the number of family members or workers who help on your farm.
            </p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1" 
                onClick={() => setFormData(prev => ({ ...prev, familyMembers: Math.max(0, parseInt(prev.familyMembers) - 1).toString() }))}
              >
                -
              </Button>
              <Button 
                variant="outline" 
                className="flex-1" 
                onClick={addHelper}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Add Helper
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
