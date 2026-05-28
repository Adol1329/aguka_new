import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import handlebars from "handlebars";
import { logger } from "../utils/logger.js";

export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.MAIL_USER || process.env.SMTP_USER,
        pass: process.env.MAIL_PASSWORD || process.env.SMTP_PASSWORD,
      },
    });
  }

  private async renderTemplate(
    templateName: string,
    context: any,
  ): Promise<string> {
    try {
      const templatePath = path.join(
        process.cwd(),
        "src",
        "mail",
        "templates",
        `${templateName}.hbs`,
      );
      const source = await fs.promises.readFile(templatePath, "utf-8");
      const template = handlebars.compile(source);
      return template(context);
    } catch (error) {
      logger.error(`Error reading email template ${templateName}:`, error);
      throw error;
    }
  }

  // ── Called when officer/cooperative registers ──
  async sendRegistrationReceived(user: {
    email: string | null;
    fullName: string;
    role: string;
    phone: string;
  }) {
    if (!user.email) {
      logger.warn(`No email for user ${user.phone} — skipping`);
      return;
    }
    try {
      const roleLabels: Record<string, string> = {
        officer: "Extension Officer / Umujyanama w'Ubuhinzi",
        cooperative: "Cooperative Manager / Umuyobozi w'Amashiramwe",
        cooperative_manager: "Cooperative Manager / Umuyobozi w'Amashiramwe",
      };

      const html = await this.renderTemplate("registration-received", {
        fullName: user.fullName,
        role: roleLabels[user.role] ?? user.role,
        phone: user.phone,
        date: new Date().toLocaleDateString("en-RW"),
        supportEmail: "agukasmartfarmingkit@gmail.com",
      });

      await this.transporter.sendMail({
        from:
          process.env.MAIL_FROM ||
          `"Aguka Smart Farming" <${process.env.MAIL_USER || process.env.SMTP_USER}>`,
        to: user.email,
        subject: "Aguka — Account Under Review / Konti Irimo Gusuzumwa",
        html,
      });
      logger.info(`Registration email sent to ${user.email}`);
    } catch (error: any) {
      logger.error(`Failed to send registration email: ${error.message}`);
    }
  }

  // ── Called when admin approves account ──
  async sendAccountApproved(user: {
    email: string | null;
    fullName: string;
    phone: string;
  }) {
    if (!user.email) return;
    try {
      const html = await this.renderTemplate("account-approved", {
        fullName: user.fullName,
        phone: user.phone,
        supportEmail: "agukasmartfarmingkit@gmail.com",
      });

      await this.transporter.sendMail({
        from:
          process.env.MAIL_FROM ||
          `"Aguka Smart Farming" <${process.env.MAIL_USER || process.env.SMTP_USER}>`,
        to: user.email,
        subject: "Aguka — Account Approved! / Konti Yemejwe! ✅",
        html,
      });
      logger.info(`Approval email sent to ${user.email}`);
    } catch (error: any) {
      logger.error(`Failed to send approval email: ${error.message}`);
    }
  }

  // ── Called when admin rejects account ──
  async sendAccountRejected(user: {
    email: string | null;
    fullName: string;
    reason: string;
  }) {
    if (!user.email) return;
    try {
      const html = await this.renderTemplate("account-rejected", {
        fullName: user.fullName,
        reason: user.reason,
        supportEmail: "agukasmartfarmingkit@gmail.com",
      });

      await this.transporter.sendMail({
        from:
          process.env.MAIL_FROM ||
          `"Aguka Smart Farming" <${process.env.MAIL_USER || process.env.SMTP_USER}>`,
        to: user.email,
        subject: "Aguka — Account Not Approved / Konti Ntiyemejwe",
        html,
      });
      logger.info(`Rejection email sent to ${user.email}`);
    } catch (error: any) {
      logger.error(`Failed to send rejection email: ${error.message}`);
    }
  }
  // ── Called on self-service password reset (email OTP) ──
  async sendPasswordResetOtp(data: {
    email: string;
    otp: string;
    phone: string;
  }) {
    try {
      const html = `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
  <div style="background: white; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
    <div style="text-align: center; margin-bottom: 24px;">
      <h1 style="color: #16a34a; font-size: 24px; margin: 0;">🔐 Aguka</h1>
      <p style="color: #6b7280; font-size: 14px;">Smart Farming Kit</p>
    </div>
    <h2 style="color: #111827; font-size: 20px;">Password Reset Code / Kode yo kugufashe kuhinddura ijambo banga</h2>
    <p style="color: #374151; font-size: 15px;">Use the 6-digit code below to reset your password. Valid for <strong>10 minutes</strong>.</p>
    <div style="background: #f0fdf4; border: 2px dashed #16a34a; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
      <p style="font-size: 42px; font-weight: 900; letter-spacing: 12px; color: #15803d; margin: 0; font-family: monospace;">${data.otp}</p>
    </div>
    <p style="color: #6b7280; font-size: 13px;">If you did not request this reset, please ignore this email. Your account remains secure.</p>
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
    <p style="color: #9ca3af; font-size: 12px; text-align: center;">© 2026 Imbaraga Farmers Organization · Aguka Smart Farming Kit</p>
  </div>
</body>
</html>`;

      await this.transporter.sendMail({
        from:
          process.env.MAIL_FROM ||
          `"Aguka Smart Farming Kit" <${process.env.MAIL_USER || process.env.SMTP_USER}>`,
        to: data.email,
        subject: "Aguka - Password Reset Code",
        html,
      });
      logger.info(`Password reset OTP sent to ${data.email}`);
    } catch (error: any) {
      logger.error(`Failed to send password reset OTP email: ${error.message}`);
    }
  }

  // Called when an admin starts a secure password reset for a user
  async sendAdminPasswordResetOtp(data: {
    email: string;
    fullName: string;
    otp: string;
    phone: string;
  }) {
    try {
      const html = `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
  <div style="background: white; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
    <div style="text-align: center; margin-bottom: 24px;">
      <h1 style="color: #16a34a; font-size: 24px; margin: 0;">Aguka</h1>
      <p style="color: #6b7280; font-size: 14px;">Smart Farming Kit</p>
    </div>
    <h2 style="color: #111827; font-size: 20px;">Password reset required</h2>
    <p style="color: #374151; font-size: 15px;">Hello ${data.fullName}, an administrator started a password reset for your Aguka account (${data.phone}).</p>
    <p style="color: #374151; font-size: 15px;">Use this one-time code on the password reset page to create your own new password. This code is valid for <strong>10 minutes</strong>.</p>
    <div style="background: #f0fdf4; border: 2px dashed #16a34a; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
      <p style="font-size: 42px; font-weight: 900; letter-spacing: 12px; color: #15803d; margin: 0; font-family: monospace;">${data.otp}</p>
    </div>
    <p style="color: #6b7280; font-size: 13px;">If you did not expect this reset, contact your administrator before signing in.</p>
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
    <p style="color: #9ca3af; font-size: 12px; text-align: center;">2026 Imbaraga Farmers Organization - Aguka Smart Farming Kit</p>
  </div>
</body>
</html>`;

      await this.transporter.sendMail({
        from:
          process.env.MAIL_FROM ||
          `"Aguka Smart Farming Kit" <${process.env.MAIL_USER || process.env.SMTP_USER}>`,
        to: data.email,
        subject: "Aguka - Password Reset Code",
        html,
      });
      logger.info(`Admin password reset OTP sent to ${data.email}`);
    } catch (error: any) {
      logger.error(
        `Failed to send admin password reset OTP email: ${error.message}`,
      );
      throw error;
    }
  }
}

export const mailService = new MailService();
