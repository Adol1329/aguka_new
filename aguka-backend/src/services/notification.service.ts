import { firebaseAdmin } from "../utils/firebase.js";
import { logger } from "../utils/logger.js";
import { prisma } from "../prisma.js";

export class NotificationService {
  /**
   * Register or update a device FCM token for a user
   */
  async registerDevice(userId: string, fcmToken: string, platform?: string) {
    return prisma.device.upsert({
      where: { fcmToken },
      update: {
        userId,
        platform,
        lastUsedAt: new Date(),
      },
      create: {
        userId,
        fcmToken,
        platform,
      },
    });
  }

  /**
   * Send push notification to a specific user (all their devices)
   * Sends per-token individually so one bad token doesn't kill all
   */
  async sendToUser(
    userId: string,
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<{ successCount: number; failureCount: number }> {
    const devices = await prisma.device.findMany({
      where: { userId },
    });

    if (devices.length === 0) return { successCount: 0, failureCount: 0 };

    let successCount = 0;
    let failureCount = 0;

    for (const device of devices) {
      try {
        const message = {
          notification: { title, body },
          data: data || {},
          token: device.fcmToken,
        };

        await firebaseAdmin.messaging().send(message);
        successCount++;
      } catch (error: any) {
        const errorCode = error?.code || error?.errorInfo?.code;
        if (
          errorCode === "messaging/invalid-registration-token" ||
          errorCode === "messaging/registration-token-not-registered"
        ) {
          await prisma.device.deleteMany({
            where: { fcmToken: device.fcmToken },
          });
          logger.warn(`Removed invalid FCM token for user ${userId}:`, errorCode);
        } else {
          logger.error(`FCM send error for user ${userId} token ${device.fcmToken}:`, error);
        }
        failureCount++;
      }
    }

    return { successCount, failureCount };
  }

  /**
   * Send broadcast notification to a topic (e.g., all farmers)
   */
  async sendToTopic(
    topic: string,
    title: string,
    body: string,
    data?: Record<string, string>,
  ) {
    try {
      const message = {
        notification: { title, body },
        data: data || {},
        topic,
      };

      return await firebaseAdmin.messaging().send(message);
    } catch (error) {
      logger.error("FCM Topic Error:", error);
      return null;
    }
  }
}

export const notificationService = new NotificationService();
