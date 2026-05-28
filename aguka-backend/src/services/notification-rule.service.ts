import { prisma } from "../prisma.js";
import { logger } from "../utils/logger.js";
import { NotificationRule } from "@prisma/client";

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
      type: "system_alert" | "farming_recommendation" | "report_availability";
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
    } catch (error) {
      logger.error("Failed to mark notifications as read:", error);
      throw error;
    }
  }

  async markAllAsRead(userId: string): Promise<void> {
    try {
      await prisma.notification.updateMany({
        where: {
          userId,
          status: "pending",
        },
        data: { status: "read" },
      });
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
   * Create a notification (called by other services)
   */
  async createNotification(data: {
    userId: string;
    title: string;
    message: string;
    type?: string;
    channel?: string;
  }): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: data.userId },
      });

      if (!user) return;

      // Check user's notification rules
      const rules = await prisma.notificationRule.findMany({
        where: {
          userId: data.userId,
          enabled: true,
          type: data.type || "system_alert",
        },
      });

      // If no rules exist or rules allow app notifications
      const shouldNotify =
        rules.length === 0 || rules.some((r) => r.channels.includes("app"));

      if (shouldNotify) {
        await prisma.notification.create({
          data: {
            userId: data.userId,
            title: data.title,
            message: data.message,
            channel: data.channel || "app",
          },
        });
      }

      // Send push notification if enabled
      if (rules.some((r) => r.channels.includes("push"))) {
        // This would call the push notification service
        logger.info(`Push notification queued for user ${data.userId}`);
      }
    } catch (error) {
      logger.error("Failed to create notification:", error);
    }
  }
}

export const notificationRuleService = new NotificationRuleService();
