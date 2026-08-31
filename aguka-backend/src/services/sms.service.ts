import axios from "axios";
import { config } from "../config/index.js";
import { logger } from "../utils/logger.js";

interface AfricasTalkingRecipient {
  statusCode: number;
  number: string;
  status: string;
  cost?: string;
  messageId?: string;
}

class SmsService {
  private initialized = false;
  private apiKey: string | undefined;
  private username: string | undefined;
  private shortcode: string | undefined;
  private baseUrl = "https://api.africastalking.com/version1/messaging";

  constructor() {
    this.initialize();
  }

  private initialize() {
    if (config.africaTalking.apiKey && config.africaTalking.username) {
      this.apiKey = config.africaTalking.apiKey;
      this.username = config.africaTalking.username;
      this.shortcode = config.africaTalking.shortcode;
      // Africa's Talking routes the "sandbox" username to a separate
      // subdomain — messages sent there never reach real phones, only their
      // test simulator, but let you build/test against the real API shape.
      this.baseUrl =
        this.username === "sandbox"
          ? "https://api.sandbox.africastalking.com/version1/messaging"
          : "https://api.africastalking.com/version1/messaging";
      this.initialized = true;
      logger.info(
        `✅ Africa's Talking SMS service initialized (${this.username === "sandbox" ? "sandbox" : "live"})`,
      );
    } else {
      logger.warn("⚠️ Africa's Talking not configured - SMS/USSD disabled");
    }
  }

  isConfigured(): boolean {
    return this.initialized;
  }

  isSandbox(): boolean {
    return this.username === "sandbox";
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
        this.baseUrl,
        new URLSearchParams({
          username: this.username!,
          from: this.shortcode || "",
          to,
          message,
        }),
        {
          // Axios's default adapter selection picks the fetch/undici path in
          // this environment, which fails TLS negotiation against AT's API
          // ("wrong version number") — the classic http adapter works fine.
          adapter: "http",
          headers: {
            apiKey: this.apiKey!,
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
          },
        },
      );

      const data = response.data as {
        SMSMessageData?: { Message?: string; Recipients?: AfricasTalkingRecipient[] };
      };
      const recipient = data.SMSMessageData?.Recipients?.[0];
      // statusCode 100-102 = Processed/Sent/Queued (success); 4xx/5xx = rejected.
      if (recipient && recipient.statusCode < 400) {
        return { success: true, messageId: recipient.messageId };
      }
      return {
        success: false,
        error: recipient?.status || data.SMSMessageData?.Message || "Failed to send SMS",
      };
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
    results: Array<{ phone: string; success: boolean; messageId?: string; error?: string }>;
  }> {
    if (!this.initialized) {
      return {
        success: false,
        sent: 0,
        failed: recipients.length,
        error: "SMS service not configured",
        results: recipients.map((r) => ({
          phone: r.phone,
          success: false,
          error: "SMS service not configured",
        })),
      };
    }

    let sent = 0;
    let failed = 0;
    const results: Array<{ phone: string; success: boolean; messageId?: string; error?: string }> = [];

    for (const recipient of recipients) {
      const result = await this.sendSms(recipient.phone, recipient.message);
      if (result.success) {
        sent++;
      } else {
        failed++;
      }
      results.push({ phone: recipient.phone, ...result });
    }

    return { success: true, sent, failed, results };
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
