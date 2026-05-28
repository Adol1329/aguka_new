import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, Edit } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  useNotificationRules,
  useCreateNotificationRule,
  useUpdateNotificationRule,
  useDeleteNotificationRule,
} from '@/hooks/use-data';

interface NotificationRule {
  id: string;
  name: string;
  description?: string;
  type: 'system_alert' | 'farming_recommendation' | 'report_availability';
  enabled: boolean;
  channels: string[];
  conditions?: Record<string, any>;
  createdAt: string;
}

export function NotificationRules() {
  const { data: rulesData, isLoading: loading } = useNotificationRules();
  const rules = (rulesData as NotificationRule[]) || [];
  
  const createRule = useCreateNotificationRule();
  const updateRule = useUpdateNotificationRule();
  const deleteRule = useDeleteNotificationRule();

  const [editingRule, setEditingRule] = useState<NotificationRule | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'system_alert' as NotificationRule['type'],
    channels: [] as string[],
    conditions: '',
  });

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formData.name) {
      alert('Please provide a rule name');
      return;
    }

    try {
      const body = {
        ...formData,
        channels: formData.channels,
        conditions: formData.conditions ? JSON.parse(formData.conditions) : undefined,
      };

      if (editingRule) {
        await updateRule.mutateAsync({ id: editingRule.id, data: body });
      } else {
        await createRule.mutateAsync(body);
      }

      setEditingRule(null);
      setFormData({ name: '', description: '', type: 'system_alert', channels: [], conditions: '' });
    } catch (err) {
      console.error('Failed to save rule:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this rule?')) return;
    try {
      await deleteRule.mutateAsync(id);
    } catch (err) {
      console.error('Failed to delete rule:', err);
    }
  };

  const toggleEnabled = async (rule: NotificationRule) => {
    try {
      await updateRule.mutateAsync({ id: rule.id, data: { enabled: !rule.enabled } });
    } catch (err) {
      console.error('Failed to toggle rule:', err);
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'system_alert': return 'System Alert';
      case 'farming_recommendation': return 'Farming Tip';
      case 'report_availability': return 'Report';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-3 w-[150px]" />
              </div>
              <Skeleton className="h-6 w-12" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Dialog>
        <DialogTrigger asChild>
          <Button className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Add Rule
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRule ? 'Edit' : 'Create'} Notification Rule</DialogTitle>
            <DialogDescription>
              Configure when and how you receive notifications
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Rule Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Low soil moisture alerts"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Notification Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: any) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="system_alert">System Alerts</SelectItem>
                  <SelectItem value="farming_recommendation">Farming Recommendations</SelectItem>
                  <SelectItem value="report_availability">Report Availability</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Notification Channels</Label>
              <div className="flex gap-4">
                {['app', 'sms', 'push', 'email'].map(channel => (
                  <div key={channel} className="flex items-center space-x-2">
                    <Checkbox
                      id={channel}
                      checked={formData.channels.includes(channel)}
                      onCheckedChange={(checked) => {
                        setFormData({
                          ...formData,
                          channels: checked
                            ? [...formData.channels, channel]
                            : formData.channels.filter(c => c !== channel),
                        });
                      }}
                    />
                    <Label htmlFor={channel} className="capitalize">{channel}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="conditions">Conditions (JSON, optional)</Label>
              <Input
                id="conditions"
                value={formData.conditions}
                onChange={e => setFormData({ ...formData, conditions: e.target.value })}
                placeholder='{"soilMoisture": {"lt": 30}}'
              />
            </div>

            <Button type="submit" className="w-full">
              {editingRule ? 'Update' : 'Create'} Rule
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {rules.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No notification rules configured</p>
          <p className="text-sm">Create a rule to get started</p>
        </div>
      ) : (
        rules.map(rule => (
          <Card key={rule.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{rule.name}</p>
                  <Badge variant={rule.enabled ? 'default' : 'secondary'}>
                    {rule.enabled ? 'Active' : 'Inactive'}
                  </Badge>
                  <Badge variant="outline">{getTypeLabel(rule.type)}</Badge>
                </div>
                {rule.description && (
                  <p className="text-sm text-muted-foreground">{rule.description}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Channels: {rule.channels.join(', ')}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={rule.enabled}
                  onCheckedChange={() => toggleEnabled(rule)}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingRule(rule);
                    setFormData({
                      name: rule.name,
                      description: rule.description || '',
                      type: rule.type,
                      channels: rule.channels,
                      conditions: rule.conditions ? JSON.stringify(rule.conditions) : '',
                    });
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(rule.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
