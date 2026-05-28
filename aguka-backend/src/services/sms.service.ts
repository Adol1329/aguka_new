import axios from "axios";
import { config } from "../config/index.js";
import { logger } from "../utils/logger.js";

class SmsService {
  private initialized = false;
  private apiKey: string | undefined;
  private username: string | undefined;
  private shortcode: string | undefined;

  constructor() {
    this.initialize();
  }

  private initialize() {
    if (config.africaTalking.apiKey && config.africaTalking.username) {
      this.apiKey = config.africaTalking.apiKey;
      this.username = config.africaTalking.username;
      this.shortcode = config.africaTalking.shortcode;
      this.initialized = true;
      logger.info("✅ Africa's Talking SMS service initialized");
    } else {
      logger.warn("⚠️ Africa's Talking not configured - SMS/USSD disabled");
    }
  }

  isConfigured(): boolean {
    return this.initialized;
  }

  async sendSms(
    to: string,
    message: string,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.initialized) {
      return { success: false, error: "SMS service not configured" };
    }

    try {
      const response = await axios.post(
        "https://api.africastalking.com/restml/send/center",
        new URLSearchParams({
          username: this.username!,
          from: this.shortcode || "",
          to,
          message,
        }),
        {
          headers: {
            ApiKey: this.apiKey!,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        },
      );

      const data = response.data as { SMSMessageData?: { Message?: string } };
      if (data.SMSMessageData?.Message) {
        const parts = (data.SMSMessageData.Message as string).split(" ");
        const id = parts[parts.length - 1];
        return { success: true, messageId: id };
      }
      return { success: false, error: "Failed to send SMS" };
    } catch (error: any) {
      logger.error("SMS send error:", error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error || error.message,
      };
    }
  }

  async sendBulkSms(
    recipients: Array<{ phone: string; message: string }>,
  ): Promise<{
    success: boolean;
    sent: number;
    failed: number;
    error?: string;
  }> {
    if (!this.initialized) {
      return {
        success: false,
        sent: 0,
        failed: recipients.length,
        error: "SMS service not configured",
      };
    }

    let sent = 0;
    let failed = 0;

    for (const recipient of recipients) {
      const result = await this.sendSms(recipient.phone, recipient.message);
      if (result.success) {
        sent++;
      } else {
        failed++;
      }
    }

    return { success: true, sent, failed };
  }

  parseUssdSession(session: {
    phoneNumber: string;
    text: string;
    sessionId: string;
    serviceCode: string;
  }): {
    farmerPhone: string;
    text: string;
    sessionId: string;
    serviceCode: string;
  } {
    return {
      farmerPhone: session.phoneNumber,
      text: session.text || "",
      sessionId: session.sessionId,
      serviceCode: session.serviceCode,
    };
  }

  buildUssdResponse(menuItems: string[], freeText = false): string {
    let response = "CON ";
    if (freeText) {
      return response + "Enter value:";
    }
    response += menuItems
      .map((item, index) => `${index + 1}. ${item}`)
      .join("\n");
    return response;
  }

  endUssdSession(message: string): string {
    return `END ${message}`;
  }
}

export const smsService = new SmsService();
