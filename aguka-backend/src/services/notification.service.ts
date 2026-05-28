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
   */
  async sendToUser(
    userId: string,
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<any> {
    const devices = await prisma.device.findMany({
      where: { userId },
    });

    if (devices.length === 0) return;

    const tokens = devices.map((d) => d.fcmToken);

    try {
      const message = {
        notification: { title, body },
        data: data || {},
        tokens: tokens,
      };

      const response = await firebaseAdmin
        .messaging()
        .sendEachForMulticast(message);

      // Cleanup invalid tokens
      if (response.failureCount > 0) {
        const invalidTokens: string[] = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            const errorCode = resp.error?.code;
            if (
              errorCode === "messaging/invalid-registration-token" ||
              errorCode === "messaging/registration-token-not-registered"
            ) {
              invalidTokens.push(tokens[idx]);
            }
          }
        });

        if (invalidTokens.length > 0) {
          await prisma.device.deleteMany({
            where: { fcmToken: { in: invalidTokens } },
          });
        }
      }

      return response;
    } catch (error) {
      logger.error("FCM Error:", error);
      return null;
    }
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
