import { prisma } from "../prisma.js";
import { logger } from "../utils/logger.js";
import {
  NotificationRule,
  DeliveryChannel,
  DeliveryStatus,
} from "@prisma/client";
import { notificationService } from "./notification.service.js";
import { smsService } from "./sms.service.js";

// We'll need a way to get the RealTimeSync instance.
// In a real app, this might be handled via dependency injection or a global emitter.
// For now, we'll assume there's a way to access the IO server.
let socketInstance: any = null;

export const setSocketInstance = (instance: any) => {
  socketInstance = instance;
};

export class NotificationRuleService {
  /**
   * Get all notification rules for a user
   */
  async getRules(userId: string): Promise<NotificationRule[]> {
    try {
      return await prisma.notificationRule.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
    } catch (error) {
      logger.error("Failed to get notification rules:", error);
      throw error;
    }
  }

  /**
   * Create a new notification rule
   */
  async createRule(
    userId: string,
    data: {
      name: string;
      description?: string;
      type: string;
      channels: string[];
      conditions?: Record<string, any>;
    },
  ): Promise<NotificationRule> {
    try {
      return await prisma.notificationRule.create({
        data: {
          userId,
          name: data.name,
          description: data.description,
          type: data.type,
          channels: data.channels,
          conditions: data.conditions || {},
        },
      });
    } catch (error) {
      logger.error("Failed to create notification rule:", error);
      throw error;
    }
  }

  /**
   * Update an existing notification rule
   */
  async updateRule(
    ruleId: string,
    userId: string,
    data: {
      name?: string;
      description?: string;
      enabled?: boolean;
      channels?: string[];
      conditions?: Record<string, any>;
    },
  ): Promise<NotificationRule> {
    try {
      const rule = await prisma.notificationRule.findFirst({
        where: { id: ruleId, userId },
      });

      if (!rule) {
        throw new Error("Notification rule not found");
      }

      return await prisma.notificationRule.update({
        where: { id: ruleId },
        data: {
          name: data.name,
          description: data.description,
          enabled: data.enabled,
          channels: data.channels,
          conditions: data.conditions,
        },
      });
    } catch (error) {
      logger.error("Failed to update notification rule:", error);
      throw error;
    }
  }

  /**
   * Delete a notification rule
   */
  async deleteRule(ruleId: string, userId: string): Promise<void> {
    try {
      const rule = await prisma.notificationRule.findFirst({
        where: { id: ruleId, userId },
      });

      if (!rule) {
        throw new Error("Notification rule not found");
      }

      await prisma.notificationRule.delete({
        where: { id: ruleId },
      });
    } catch (error) {
      logger.error("Failed to delete notification rule:", error);
      throw error;
    }
  }

  /**
   * Get user's notifications with pagination
   */
  async getNotifications(
    userId: string,
    params: {
      page?: number;
      limit?: number;
      isRead?: boolean;
      type?: string;
    },
  ) {
    try {
      const { page = 1, limit = 20, isRead } = params;
      const skip = (page - 1) * limit;

      const where: any = { userId };
      if (isRead !== undefined) where.status = isRead ? "read" : "pending";

      const [notifications, total] = await Promise.all([
        prisma.notification.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
          include: { deliveries: true },
        }),
        prisma.notification.count({ where }),
      ]);

      return {
        notifications,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error("Failed to get notifications:", error);
      throw error;
    }
  }

  /**
   * Mark notifications as read
   */
  async markAsRead(notificationIds: string[], userId: string): Promise<void> {
    try {
      await prisma.notification.updateMany({
        where: {
          id: { in: notificationIds },
          userId,
        },
        data: { status: "read" },
      });

      if (socketInstance) {
        socketInstance.to(`user_${userId}`).emit("notification:read", {
          notificationIds,
          userId,
        });
      }
    } catch (error) {
      logger.error("Failed to mark notifications as read:", error);
      throw error;
    }
  }

  async markAllAsRead(userId: string): Promise<void> {
    try {
      const result = await prisma.notification.updateMany({
        where: {
          userId,
          status: "pending",
        },
        data: { status: "read" },
      });

      if (socketInstance && result.count > 0) {
        socketInstance.to(`user_${userId}`).emit("notification:bulk-read", {
          userId,
          count: result.count,
        });
      }
    } catch (error) {
      logger.error("Failed to mark all notifications as read:", error);
      throw error;
    }
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      return await prisma.notification.count({
        where: { userId, status: "pending" },
      });
    } catch (error) {
      logger.error("Failed to get unread count:", error);
      throw error;
    }
  }

  /**
   * Central Notification Dispatcher
   */
  async createNotification(data: {
    userId: string;
    title: string;
    message: string;
    type?: string;
    priority?: string;
    metadata?: any;
    smsEnabled?: boolean;
  }): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: data.userId },
      });

      if (!user) return;

      // 1. Evaluate Notification Rules
      const rules = await prisma.notificationRule.findMany({
        where: {
          userId: data.userId,
          enabled: true,
          type: data.type || "system_alert",
        },
      });

      // Determine enabled channels
      const enabledChannels = new Set<string>(["IN_APP", "SOCKET"]); // Always enabled by default
      if (rules.length > 0) {
        rules.forEach((rule) => {
          rule.channels.forEach((channel) => {
            const mappedChannel = channel.toUpperCase();
            if (mappedChannel === "APP") enabledChannels.add("IN_APP");
            else if (mappedChannel === "PUSH") enabledChannels.add("FCM");
            else enabledChannels.add(mappedChannel);
          });
        });
      } else {
        // Fallback for new users without rules
        enabledChannels.add("FCM");
      }

      // Per-call opt-in (e.g. a price alert created with its own SMS toggle),
      // independent of the user's saved NotificationRule channels.
      if (data.smsEnabled) {
        enabledChannels.add("SMS");
      }

      // 2. Check Quiet Hours for non-urgent notifications
      const isUrgent = data.priority === "urgent" || data.priority === "high";
      if (!isUrgent && this.isWithinQuietHours(user)) {
        logger.info(`Notification for ${user.id} silenced by quiet hours`);
        enabledChannels.delete("FCM");
        enabledChannels.delete("SMS");
      }

      // 3. Save Notification Record
      const notification = await prisma.notification.create({
        data: {
          userId: data.userId,
          title: data.title,
          message: data.message,
          type: data.type || "system",
          priority: data.priority || "normal",
          metadata: data.metadata || {},
          channel: Array.from(enabledChannels).join(","),
        },
      });

      // 4. Create Delivery Tracking Records
      const deliveryData = Array.from(enabledChannels).map((channel) => ({
        notificationId: notification.id,
        channel: channel as DeliveryChannel,
        status: DeliveryStatus.PENDING,
      }));

      await prisma.notificationDelivery.createMany({
        data: deliveryData,
      });

      // 5. Dispatch to Channels
      const dispatchPromises = [];

      // IN_APP is implicitly "delivered" when saved to DB
      dispatchPromises.push(
        this.updateDeliveryStatus(notification.id, "IN_APP", "SENT"),
      );

      // Socket.IO Delivery
      if (enabledChannels.has("SOCKET")) {
        dispatchPromises.push(this.dispatchSocket(data.userId, notification));
      }

      // FCM Delivery
      if (enabledChannels.has("FCM")) {
        dispatchPromises.push(this.dispatchFCM(data.userId, notification));
      }

      // SMS Delivery
      if (enabledChannels.has("SMS")) {
        dispatchPromises.push(this.dispatchSMS(data.userId, notification));
      }

      await Promise.allSettled(dispatchPromises);
    } catch (error) {
      logger.error("Failed to dispatch notification:", error);
    }
  }

  private isWithinQuietHours(user: any): boolean {
    if (!user.quietHoursStart || !user.quietHoursEnd) return false;

    try {
      const now = new Date();
      // Simple time comparison - can be improved with luxon for timezone support
      const currentH = now.getHours();
      const currentM = now.getMinutes();
      const currentTime = currentH * 60 + currentM;

      const [startH, startM] = user.quietHoursStart.split(":").map(Number);
      const [endH, endM] = user.quietHoursEnd.split(":").map(Number);

      const startTime = startH * 60 + startM;
      const endTime = endH * 60 + endM;

      if (startTime > endTime) {
        // Overnights (e.g., 22:00 to 06:00)
        return currentTime >= startTime || currentTime <= endTime;
      } else {
        // Same day (e.g., 13:00 to 14:00)
        return currentTime >= startTime && currentTime <= endTime;
      }
    } catch (err) {
      logger.error("Quiet hours evaluation failed:", err);
      return false;
    }
  }

  private async dispatchSocket(userId: string, notification: any) {
    try {
      if (socketInstance) {
        socketInstance.to(`user_${userId}`).emit("notification:new", notification);
        await this.updateDeliveryStatus(notification.id, "SOCKET", "SENT");
      } else {
        await this.updateDeliveryStatus(
          notification.id,
          "SOCKET",
          "FAILED",
          "Socket instance not available",
        );
      }
    } catch (error: any) {
      await this.updateDeliveryStatus(
        notification.id,
        "SOCKET",
        "FAILED",
        error.message,
      );
    }
  }

  private async dispatchFCM(userId: string, notification: any) {
    try {
      const response = await notificationService.sendToUser(
        userId,
        notification.title,
        notification.message,
        {
          id: notification.id,
          type: notification.type,
          ...notification.metadata,
        },
      );

      if (response && response.successCount > 0) {
        await this.updateDeliveryStatus(notification.id, "FCM", "SENT");
      } else {
        await this.updateDeliveryStatus(
          notification.id,
          "FCM",
          "FAILED",
          "FCM failed to deliver to any device",
        );
      }
    } catch (error: any) {
      await this.updateDeliveryStatus(
        notification.id,
        "FCM",
        "FAILED",
        error.message,
      );
    }
  }

  private async dispatchSMS(userId: string, notification: any) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { phone: true },
      });

      if (!user?.phone) {
        await this.updateDeliveryStatus(
          notification.id,
          "SMS",
          "FAILED",
          "No phone number on file",
        );
        return;
      }

      if (!smsService.isConfigured()) {
        await this.updateDeliveryStatus(
          notification.id,
          "SMS",
          "FAILED",
          "SMS gateway not configured",
        );
        return;
      }

      const result = await smsService.sendSms(user.phone, notification.message);
      if (result.success) {
        await this.updateDeliveryStatus(notification.id, "SMS", "SENT");
      } else {
        await this.updateDeliveryStatus(
          notification.id,
          "SMS",
          "FAILED",
          result.error,
        );
      }
    } catch (error: any) {
      await this.updateDeliveryStatus(notification.id, "SMS", "FAILED", error.message);
    }
  }

  private async updateDeliveryStatus(
    notificationId: string,
    channel: string,
    status: DeliveryStatus,
    reason?: string,
  ) {
    try {
      await prisma.notificationDelivery.updateMany({
        where: {
          notificationId,
          channel: channel as DeliveryChannel,
        },
        data: {
          status,
          deliveredAt: status === "SENT" ? new Date() : null,
          failedAt: status === "FAILED" ? new Date() : null,
          failureReason: reason || null,
        },
      });
    } catch (error) {
      logger.error(`Failed to update delivery status for ${channel}:`, error);
    }
  }
}

export const notificationRuleService = new NotificationRuleService();
