import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import argon2 from "argon2";
import crypto from "crypto";
import { smsService } from "../services/sms.service.js";
import { prisma } from "../prisma.js";
import { soilService } from "../services/soil.service.js";
import { weatherService } from "../services/weather.service.js";
import { irrigationService } from "../services/irrigation.service.js";
import { marketService } from "../services/market.service.js";
import { getSmsTranslation } from "../utils/i18n-sms.js";
import { Language, RequestWithUser } from "../types/index.js";
import { logger } from "../utils/logger.js";
import { normalizePhone } from "../utils/phone.js";

const sendSmsSchema = z.object({
  phone: z.string(),
  message: z.string(),
});

const bulkSmsSchema = z.object({
  recipients: z.array(
    z.object({
      phone: z.string(),
      message: z.string(),
    }),
  ),
});

export const sendSms = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!smsService.isConfigured()) {
      return res
        .status(503)
        .json({ success: false, error: "SMS service not configured" });
    }

    const parsed = sendSmsSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ success: false, error: parsed.error.errors });
    }

    const result = await smsService.sendSms(
      parsed.data.phone,
      parsed.data.message,
    );
    return res.json({ success: result.success, data: result });
  } catch (error) {
    return next(error);
  }
};

export const sendBulkSms = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!smsService.isConfigured()) {
      return res
        .status(503)
        .json({ success: false, error: "SMS service not configured" });
    }

    const parsed = bulkSmsSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ success: false, error: parsed.error.errors });
    }

    const result = await smsService.sendBulkSms(parsed.data.recipients as any);
    return res.json({ success: result.success, data: result });
  } catch (error) {
    return next(error);
  }
};

export const ussdCallback = async (req: Request, res: Response) => {
  try {
    const session = smsService.parseUssdSession({
      phoneNumber: normalizePhone(req.body.phoneNumber || req.body.phone || ""),
      text: req.body.text || "",
      sessionId: req.body.sessionId || "",
      serviceCode: req.body.serviceCode || "",
    });

    // Identify User
    const user = await prisma.user.findUnique({
      where: { phone: session.farmerPhone },
      include: { farmerProfile: true },
    });

    if (!user) {
      return res
        .type("text/plain")
        .send("END Phone not registered. Visit your cooperative.");
    }

    const lang = user.language as Language;
    const name = user.farmerProfile?.fullName?.split(" ")[0] || "Farmer";
    const textParts = session.text.split("*").filter((t) => t !== "");
    let response = "";

    if (textParts.length === 0) {
      response = "CON " + getSmsTranslation("ussd.main.menu", lang, { name });
    } else {
      const selection = textParts[0];
      switch (selection) {
        case "1": {
          // Soil Status
          const soil = await soilService.getCurrentStatus(user.id);
          response =
            "END " +
            getSmsTranslation("ussd.soil.status", lang, {
              moisture: soil?.moisture || "--",
              status: soil?.status || "Fair",
            });
          break;
        }

        case "2": {
          // Weather Info
          const weather = await weatherService.getCurrentWeather(user.id);
          response =
            "END " +
            getSmsTranslation("ussd.weather.status", lang, {
              condition: weather.condition,
              temp: weather.temperatureCelsius,
              rain: weather.rainfallMm,
            });
          break;
        }

        case "3": {
          // Irrigation
          const irrigation = await irrigationService.getStatus(user.id);
          const statusText = irrigation.isActive
            ? lang === "kinyarwanda"
              ? "Birimo"
              : "Active"
            : lang === "kinyarwanda"
              ? "Bihagaze"
              : "Inactive";

          response =
            "END " +
            getSmsTranslation("ussd.irrigation.status", lang, {
              status: statusText,
              waterUsed: irrigation.waterUsedToday || 0,
            });
          break;
        }

        case "4": {
          // Market Prices
          const prices = await marketService.getCurrentPrices(user.id, {});
          const potatoes =
            prices.find((p) => p.cropId === "potatoes")?.priceRwfPerKg || "--";
          const maize =
            prices.find((p) => p.cropId === "maize")?.priceRwfPerKg || "--";
          const beans =
            prices.find((p) => p.cropId === "beans")?.priceRwfPerKg || "--";

          response =
            "END " +
            getSmsTranslation("ussd.market.prices", lang, {
              potatoes,
              maize,
              beans,
            });
          break;
        }

        case "5": // Contact Agent
          await smsService.sendSms(
            session.farmerPhone,
            getSmsTranslation("ussd.agent.contact", lang),
          );
          response = "END " + getSmsTranslation("ussd.agent.contact", lang);
          break;

        case "6": // Help
          response = "END " + getSmsTranslation("ussd.help", lang);
          break;

        case "7": {
          // Get login password — dialing USSD from your own SIM is itself
          // proof of phone possession, the same trust boundary as an SMS
          // OTP, so no separate verification step is needed. The original
          // temp password can't be recovered (only its hash is stored), so
          // this issues a fresh one instead and displays it directly in the
          // USSD response — no dependency on SMS delivery succeeding.
          const tempPassword = crypto.randomBytes(6).toString("hex");
          const passwordHash = await argon2.hash(tempPassword);
          await prisma.user.update({
            where: { id: user.id },
            data: { passwordHash, requiresPasswordChange: true },
          });
          response =
            "END " +
            getSmsTranslation("ussd.password.reset", lang, {
              password: tempPassword,
            });
          break;
        }

        default:
          response =
            "CON " + getSmsTranslation("ussd.main.menu", lang, { name });
          break;
      }
    }

    return res.type("text/plain").send(response);
  } catch (error) {
    logger.error("USSD callback error:", error);
    return res
      .type("text/plain")
      .send("END System error. Please try again later.");
  }
};

export const ussdEvents = async (req: Request, res: Response) => {
  try {
    const body = req.body || {};
    const durationRaw = body.durationInMillis ?? body.duration;

    await prisma.ussdSessionEvent.create({
      data: {
        sessionId: body.sessionId || "",
        phoneNumber: body.phoneNumber || body.phone || "",
        serviceCode: body.serviceCode || undefined,
        networkCode: body.networkCode || undefined,
        status: body.status || "Unknown",
        durationInMillis:
          durationRaw !== undefined ? parseInt(durationRaw, 10) : undefined,
        currencyCode: body.currencyCode || undefined,
        amount: body.amount !== undefined ? parseFloat(body.amount) : undefined,
        rawPayload: body,
      },
    });

    return res.status(200).send("OK");
  } catch (error) {
    logger.error("USSD events callback error:", error);
    // Africa's Talking doesn't retry on non-2xx, but the event is non-critical
    // to the live call, so we still ack it to avoid noisy provider-side retries.
    return res.status(200).send("OK");
  }
};

export const receiveInboundSms = async (req: Request, res: Response) => {
  try {
    const body = req.body || {};

    await prisma.smsInboundMessage.create({
      data: {
        providerId: body.id || undefined,
        linkId: body.linkId || undefined,
        fromPhone: normalizePhone(body.from || ""),
        toPhone: body.to || undefined,
        text: body.text || "",
        receivedAt: body.date ? new Date(body.date) : undefined,
        rawPayload: body,
      },
    });

    return res.status(200).send("OK");
  } catch (error) {
    logger.error("SMS inbound callback error:", error);
    // Africa's Talking retries hourly for up to 12h on non-200, but a
    // transient DB hiccup here shouldn't trigger that retry storm.
    return res.status(200).send("OK");
  }
};

export const getStatus = async (_req: Request, res: Response) => {
  return res.json({
    success: true,
    data: {
      service: "SMS/USSD Service",
      status: smsService.isConfigured() ? "operational" : "not_configured",
      features: {
        sms: smsService.isConfigured(),
        ussd: smsService.isConfigured(),
      },
    },
  });
};
