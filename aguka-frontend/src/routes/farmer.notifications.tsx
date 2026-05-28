import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, CheckCheck, Trash2, Plus, Settings } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NotificationRules } from '@/components/notification-rules';
import { NotificationList } from '@/components/notification-list';
import { notificationsApi } from '@/api/notifications';

export const Route = createFileRoute('/farmer/notifications')({
  component: FarmerNotifications,
});

function FarmerNotifications() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    notificationsApi.getUnreadCount()
      .then(data => setUnreadCount(data.data?.count || 0))
      .catch(err => console.error('Failed to fetch unread count:', err));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">
            Manage your notifications and alert rules
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Badge variant="destructive">{unreadCount} unread</Badge>
          )}
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            Rules
          </Button>
        </div>
      </div>

      <Tabs defaultValue="notifications" className="space-y-4">
        <TabsList>
          <TabsTrigger value="notifications">
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="rules">
            <Settings className="mr-2 h-4 w-4" />
            Notification Rules
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Notifications</CardTitle>
                  <CardDescription>
                    Stay updated with system alerts and recommendations
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm">
                  <CheckCheck className="mr-2 h-4 w-4" />
                  Mark all read
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <NotificationList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Notification Rules</CardTitle>
                  <CardDescription>
                    Configure when and how you receive notifications
                  </CardDescription>
                </div>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Rule
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <NotificationRules />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
