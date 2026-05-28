import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Bell, CheckCheck, Trash2, AlertTriangle, Sprout, FileText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { notificationsApi } from '@/api/notifications';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export function NotificationList() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchNotifications = async (pageNum: number = 1) => {
    setLoading(true);
    try {
      const data = await notificationsApi.list({ page: pageNum, limit: 20 });
      if (data.success && data.data) {
        setNotifications(data.data as unknown as Notification[]);
        setTotalPages(data.meta?.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(page);
  }, [page]);

  const markAsRead = async (ids: string[]) => {
    try {
      await notificationsApi.markRead();
      fetchNotifications(page);
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'system_alert':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'farming_recommendation':
        return <Sprout className="h-5 w-5 text-green-500" />;
      case 'report_availability':
        return <FileText className="h-5 w-5 text-blue-500" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardContent className="flex items-start gap-4 p-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-3 w-[200px]" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Bell className="mb-4 h-12 w-12 text-muted-foreground" />
        <h3 className="text-lg font-semibold">No notifications</h3>
        <p className="text-sm text-muted-foreground">
          You're all caught up!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {notifications.map(notification => (
        <Card
          key={notification.id}
          className={notification.isRead ? 'opacity-60' : 'border-primary'}
        >
          <CardContent className="flex items-start gap-4 p-4">
            {getIcon(notification.type)}
            <div className="flex-1 space-y-1">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">{notification.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {notification.message}
                  </p>
                </div>
                {!notification.isRead && (
                  <Badge variant="default" className="ml-2">
                    New
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>
                  {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 text-xs"
                  onClick={() => markAsRead([notification.id])}
                >
                  <CheckCheck className="mr-1 h-3 w-3" />
                  Mark read
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {totalPages > 1 && (
        <div className="mt-6 border-t pt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              
              {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map((p) => (
                <PaginationItem key={p}>
                  <PaginationLink 
                    isActive={page === p}
                    onClick={() => setPage(p)}
                    className="cursor-pointer"
                  >
                    {p}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
