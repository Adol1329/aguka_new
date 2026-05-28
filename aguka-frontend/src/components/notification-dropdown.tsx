import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, Check, Info, AlertTriangle, AlertCircle, Inbox } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { notificationApi, Notification } from "@/api/notifications";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

export function NotificationDropdown() {
  const { t } = useI18n();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  const { data: notificationsRes, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationApi.getNotifications({ limit: 10 }),
    enabled: isOpen && !!user,
  });

  const { data: unreadRes } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => notificationApi.getUnreadCount(),
    refetchInterval: 30000, // Poll every 30 seconds
    enabled: !!user,
  });

  const markAsReadMutation = useMutation({
    mutationFn: (ids: string[]) => notificationApi.markAsRead(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    },
  });

  const notifications = notificationsRes?.data || [];
  const unreadCount = unreadRes?.data?.count || 0;

  const getIcon = (type: string) => {
    switch (type) {
      case "soil":
      case "weather":
        return <Info className="h-4 w-4 text-blue-500" />;
      case "irrigation":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case "system":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Bell className="h-4 w-4 text-primary" />;
    }
  };

  const handleMarkAllAsRead = () => {
    const unreadIds = notifications
      .filter((n: Notification) => n.status === "pending")
      .map((n: Notification) => n.id);
    if (unreadIds.length > 0) {
      markAsReadMutation.mutate(unreadIds);
    }
  };

  return (
    <DropdownMenu onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground animate-in zoom-in">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[380px] p-0 overflow-hidden bg-card/95 backdrop-blur-md border-border/50 shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-muted/30">
          <h3 className="font-semibold text-sm tracking-tight">{t("notifications.title")}</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-muted-foreground hover:text-primary transition-colors"
              onClick={handleMarkAllAsRead}
            >
              <Check className="mr-1 h-3 w-3" />
              {t("notifications.mark_all_read")}
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-60 text-center p-6">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <Inbox className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">{t("notifications.empty")}</p>
              <p className="text-xs text-muted-foreground mt-1">{t("notifications.empty_desc")}</p>
            </div>
          ) : (
            <div className="grid divide-y divide-border/30">
              {notifications.map((notification: Notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "flex gap-4 p-4 transition-colors hover:bg-muted/50 cursor-pointer group relative",
                    notification.status === "pending" && "bg-primary/5"
                  )}
                  onClick={() => {
                    if (notification.status === "pending") {
                      markAsReadMutation.mutate([notification.id]);
                    }
                  }}
                >
                  <div className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                    notification.status === "pending" ? "bg-primary/10 shadow-sm" : "bg-muted"
                  )}>
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex flex-1 flex-col gap-1 pr-4">
                    <div className="flex items-center justify-between">
                      <span className={cn(
                        "text-xs font-semibold leading-none",
                        notification.status === "pending" ? "text-primary" : "text-muted-foreground"
                      )}>
                        {notification.title}
                      </span>
                      <span className="text-[10px] text-muted-foreground tabular-nums">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      {notification.message}
                    </p>
                    {notification.status === "pending" && (
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        
        <div className="p-2 border-t border-border/50 bg-muted/10">
          <Button variant="ghost" size="sm" className="w-full text-xs hover:bg-primary/5 hover:text-primary transition-all font-medium" asChild>
            <a href="/farmer/notifications">{t("notifications.view_all")}</a>
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
