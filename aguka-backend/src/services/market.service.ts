import { auditService } from "./audit.service.js";
import { prisma } from "../prisma.js";
import { logger } from "../utils/logger.js";
import { notificationRuleService } from "./notification-rule.service.js";

interface MarketPrice {
  id: string;
  cropId: string;
  cropName: string;
  crop: { nameEn: string };
  marketId: string;
  marketName: string;
  district: string;
  priceRwfPerKg: number;
  unit: string;
  currency: string;
  recordedAt: Date;
  trend: "up" | "down" | "stable";
  trendPercentage: number;
}

interface PriceHistory {
  date: string;
  price: number;
  volume: number;
  market: string;
}

interface MarketInsight {
  cropId: string;
  cropName: string;
  bestMarket: string;
  bestPrice: number;
  averagePrice: number;
  priceTrend: "rising" | "falling" | "stable";
  recommendation: string;
  nextHarvestImpact: string;
}

const PRICE_STALE_MS = 24 * 60 * 60 * 1000; // 24 hours

const BASE_PRICES: Record<string, { min: number; max: number; avg: number }> = {
  maize: { min: 300, max: 400, avg: 350 },
  potato: { min: 250, max: 350, avg: 300 },
  beans: { min: 480, max: 560, avg: 520 },
  rice: { min: 800, max: 950, avg: 875 },
  coffee: { min: 250, max: 400, avg: 320 },
  wheat: { min: 300, max: 450, avg: 375 },
  tea: { min: 200, max: 300, avg: 250 },
  cassava: { min: 150, max: 250, avg: 200 },
  banana: { min: 150, max: 300, avg: 220 },
  sorghum: { min: 300, max: 400, avg: 350 },
};
const DEFAULT_PRICE_RANGE = { min: 200, max: 800, avg: 500 };

// Kigali's three urban districts — used as a proxy for "close to the sample
// markets" since all seeded markets are Kigali-based.
const KIGALI_DISTRICTS = new Set(["Gasabo", "Kicukiro", "Nyarugenge", "Kigali"]);

// Rwanda's 30 districts grouped under their real province, so a farmer's
// district maps to the province whose markets are shown to them by default.
const DISTRICT_TO_PROVINCE: Record<string, string> = {
  Gasabo: "Kigali City",
  Kicukiro: "Kigali City",
  Nyarugenge: "Kigali City",
  Musanze: "Northern Province",
  Gakenke: "Northern Province",
  Burera: "Northern Province",
  Gicumbi: "Northern Province",
  Rulindo: "Northern Province",
  Rubavu: "Western Province",
  Nyabihu: "Western Province",
  Rutsiro: "Western Province",
  Ngororero: "Western Province",
  Karongi: "Western Province",
  Rusizi: "Western Province",
  Nyamasheke: "Western Province",
  Huye: "Southern Province",
  Nyamagabe: "Southern Province",
  Nyaruguru: "Southern Province",
  Muhanga: "Southern Province",
  Kamonyi: "Southern Province",
  Gisagara: "Southern Province",
  Nyanza: "Southern Province",
  Ruhango: "Southern Province",
  Kayonza: "Eastern Province",
  Bugesera: "Eastern Province",
  Gatsibo: "Eastern Province",
  Kirehe: "Eastern Province",
  Ngoma: "Eastern Province",
  Nyagatare: "Eastern Province",
  Rwamagana: "Eastern Province",
};

interface MarketDefinition {
  marketId: string;
  marketName: string;
  district: string;
  province: string;
}

const MARKETS: MarketDefinition[] = [
  { marketId: "market_0", marketName: "Kigali Central Market", district: "Nyarugenge", province: "Kigali City" },
  { marketId: "market_1", marketName: "Nyabugogo Market", district: "Nyarugenge", province: "Kigali City" },
  { marketId: "market_2", marketName: "Kimironko Market", district: "Gasabo", province: "Kigali City" },
  { marketId: "market_3", marketName: "Remera Market", district: "Gasabo", province: "Kigali City" },
  { marketId: "market_4", marketName: "Kicukiro Market", district: "Kicukiro", province: "Kigali City" },
  { marketId: "market_5", marketName: "Musanze Market", district: "Musanze", province: "Northern Province" },
  { marketId: "market_6", marketName: "Byumba Market", district: "Gicumbi", province: "Northern Province" },
  { marketId: "market_7", marketName: "Gisenyi Market", district: "Rubavu", province: "Western Province" },
  { marketId: "market_8", marketName: "Karongi Market", district: "Karongi", province: "Western Province" },
  { marketId: "market_9", marketName: "Huye Market", district: "Huye", province: "Southern Province" },
  { marketId: "market_10", marketName: "Muhanga Market", district: "Muhanga", province: "Southern Province" },
  { marketId: "market_11", marketName: "Nyagatare Market", district: "Nyagatare", province: "Eastern Province" },
  { marketId: "market_12", marketName: "Rwamagana Market", district: "Rwamagana", province: "Eastern Province" },
];

function provinceForDistrict(district: string | undefined | null): string {
  if (!district) return "Kigali City";
  return DISTRICT_TO_PROVINCE[district] || "Kigali City";
}

export class MarketService {
  async getCurrentPrices(
    userId: string,
    filters: { crop?: string; market?: string },
  ): Promise<MarketPrice[]> {
    try {
      // Get farmer's location for relevant markets
      const farmer = await prisma.farmerProfile.findUnique({
        where: { userId },
        include: { cooperative: true },
      });
      const district = farmer?.district || "Kigali";
      const province = provinceForDistrict(farmer?.district);

      await this.ensureFreshPrices();

      const where: Record<string, unknown> = {};
      if (filters.crop) where.cropId = filters.crop;
      if (filters.market) {
        where.marketName = { contains: filters.market, mode: "insensitive" };
      } else {
        // No explicit market search — default to markets in the farmer's own
        // province so prices reflect where they actually sell, not a fixed
        // Kigali-only list.
        const localMarketIds = MARKETS.filter((m) => m.province === province).map(
          (m) => m.marketId,
        );
        where.marketId = { in: localMarketIds };
      }

      const rows = await prisma.marketPrice.findMany({
        where,
        include: { crop: true },
        orderBy: { recordedAt: "desc" },
      });

      return rows.map((row) => ({
        id: row.id,
        cropId: row.cropId,
        cropName: row.crop.nameEn,
        crop: { nameEn: row.crop.nameEn },
        marketId: row.marketId,
        marketName: row.marketName,
        district: row.district || district,
        priceRwfPerKg: Number(row.priceRwfPerKg),
        unit: "kg",
        currency: row.currency,
        recordedAt: row.recordedAt,
        trend: row.trend as "up" | "down" | "stable",
        trendPercentage: Number(row.trendPercentage),
      }));
    } catch (error) {
      logger.error("Error fetching current prices:", error);
      throw error;
    }
  }

  /**
   * Regenerate simulated market prices for every active crop/market pair and
   * persist them, so the prices farmers see and the prices price-alerts are
   * evaluated against are always the same rows (single source of truth).
   */
  async regenerateSimulatedPrices(): Promise<number> {
    const crops = await prisma.crop.findMany({
      where: { isActive: true, deletedAt: null },
    });
    const now = new Date();
    let count = 0;

    for (const crop of crops) {
      const priceRange = BASE_PRICES[crop.id] ?? DEFAULT_PRICE_RANGE;

      for (const market of MARKETS) {
        const variation = (Math.random() - 0.5) * 0.2; // +/-10%
        const priceRwfPerKg = Math.round(priceRange.avg * (1 + variation));
        const trend = (["up", "down", "stable"] as const)[
          Math.floor(Math.random() * 3)
        ];
        const trendPercentage = Math.round(Math.random() * 10 * 10) / 10;

        await prisma.marketPrice.upsert({
          where: { cropId_marketId: { cropId: crop.id, marketId: market.marketId } },
          update: {
            marketName: market.marketName,
            district: market.district,
            priceRwfPerKg,
            recordedAt: now,
            trend,
            trendPercentage,
          },
          create: {
            cropId: crop.id,
            marketId: market.marketId,
            marketName: market.marketName,
            district: market.district,
            priceRwfPerKg,
            currency: "RWF",
            recordedAt: now,
            trend,
            trendPercentage,
          },
        });
        count++;
      }
    }

    // Every price refresh is the trigger point for alert evaluation, whether
    // it came from the daily cron or a farmer simply opening the Prices tab
    // (see ensureFreshPrices) — this keeps alerts live without depending on
    // the separate marketPriceSyncEnabled cron toggle.
    await this.checkPriceAlerts();

    return count;
  }

  private async ensureFreshPrices(): Promise<void> {
    const cutoff = new Date(Date.now() - PRICE_STALE_MS);
    const freshCount = await prisma.marketPrice.count({
      where: { recordedAt: { gte: cutoff } },
    });
    if (freshCount > 0) return;

    await this.regenerateSimulatedPrices();
  }

  async getPriceHistory(
    userId: string,
    params: { crop?: string; market?: string; days: number },
  ): Promise<PriceHistory[]> {
    try {
      const farmer = await prisma.farmerProfile.findUnique({
        where: { userId },
      });

      if (!farmer) {
        return this.generatePriceHistory(
          params.crop,
          params.market,
          params.days,
        );
      }

      // Generate historical price data
      const history = this.generatePriceHistory(
        params.crop,
        params.market,
        params.days,
      );

      return history;
    } catch (error) {
      logger.error("Error fetching price history:", error);
      throw error;
    }
  }

  async getPriceAlerts(userId: string): Promise<any[]> {
    try {
      const alerts = await prisma.priceAlert.findMany({
        where: { userId, isActive: true },
        include: { crop: true },
        orderBy: { createdAt: "desc" },
      });

      return alerts.map((alert) => ({
        id: alert.id,
        cropId: alert.cropId,
        cropName: alert.crop?.nameEn || "Unknown",
        crop: { nameEn: alert.crop?.nameEn || "Unknown" },
        marketName: alert.marketId || "General Market",
        targetPrice: alert.targetPrice,
        currentPrice: alert.currentPrice,
        alertType: alert.alertType,
        isActive: alert.isActive,
        isTriggered: alert.isTriggered,
        smsEnabled: alert.smsEnabled,
        lastTriggered: alert.lastTriggered,
        createdAt: alert.createdAt,
      }));
    } catch (error) {
      logger.error("Error fetching price alerts:", error);
      throw error;
    }
  }

  async createPriceAlert(
    userId: string,
    data: {
      cropId: string;
      targetPrice: number;
      alertType: string;
      marketId?: string;
      smsEnabled?: boolean;
    },
  ): Promise<any> {
    try {
      const alert = await prisma.priceAlert.create({
        data: {
          userId,
          cropId: data.cropId,
          marketId: data.marketId,
          targetPrice: data.targetPrice,
          alertType: data.alertType,
          isActive: true,
          smsEnabled: data.smsEnabled ?? false,
        },
        include: { crop: true },
      });

      // Log audit
      await auditService.logAction({
        userId,
        action: "CREATE_PRICE_ALERT",
        module: "MARKET",
        resourceId: alert.id,
        details: `Alert created for ${alert.crop?.nameEn} at ${data.targetPrice} RWF`,
      });

      return {
        id: alert.id,
        cropId: alert.cropId,
        cropName: alert.crop?.nameEn,
        crop: { nameEn: alert.crop?.nameEn },
        marketName: alert.marketId || "General Market",
        targetPrice: alert.targetPrice,
        alertType: alert.alertType,
        isActive: alert.isActive,
        smsEnabled: alert.smsEnabled,
        lastTriggered: alert.lastTriggered,
      };
    } catch (error) {
      logger.error("Error creating price alert:", error);
      throw error;
    }
  }

  async deletePriceAlert(id: string, userId: string): Promise<void> {
    try {
      const alert = await prisma.priceAlert.findFirst({
        where: { id, userId },
      });

      if (!alert) {
        throw new Error("Price alert not found or access denied");
      }

      await prisma.priceAlert.delete({ where: { id } });

      await auditService.logAction({
        userId,
        action: "DELETE_PRICE_ALERT",
        module: "MARKET",
        resourceId: id,
      });
    } catch (error) {
      logger.error("Error deleting price alert:", error);
      throw error;
    }
  }

  /**
   * Check all active price alerts against current market prices
   */
  async checkPriceAlerts(): Promise<void> {
    try {
      const activeAlerts = await prisma.priceAlert.findMany({
        where: { isActive: true, isTriggered: false },
        include: { crop: true },
      });

      for (const alert of activeAlerts) {
        // Find latest price for this crop/market
        const marketPrice = await prisma.marketPrice.findFirst({
          where: {
            cropId: alert.cropId,
            marketId: alert.marketId || undefined,
          },
          orderBy: { recordedAt: "desc" },
        });

        if (!marketPrice) continue;

        const currentPrice = marketPrice.priceRwfPerKg;
        let isTriggered = false;

        if (alert.alertType === "above" && currentPrice >= alert.targetPrice) {
          isTriggered = true;
        } else if (
          alert.alertType === "below" &&
          currentPrice <= alert.targetPrice
        ) {
          isTriggered = true;
        }

        if (isTriggered) {
          // 1. Update alert status
          await prisma.priceAlert.update({
            where: { id: alert.id },
            data: {
              isTriggered: true,
              currentPrice: currentPrice,
              lastTriggered: new Date(),
            },
          });

          // 2. Trigger Notification
          await notificationRuleService.createNotification({
            userId: alert.userId,
            title: "Market Price Alert",
            message: `AGUKA: ${alert.crop?.nameEn} price has reached ${currentPrice} RWF in ${marketPrice.marketName}. This matches your target of ${alert.targetPrice} RWF.`,
            type: "market_alert",
            priority: "normal",
            metadata: {
              alertId: alert.id,
              cropId: alert.cropId,
              marketId: alert.marketId,
              currentPrice: currentPrice,
            },
            smsEnabled: alert.smsEnabled,
          });

          logger.info(`Price alert ${alert.id} triggered for user ${alert.userId}`);
        }
      }
    } catch (error) {
      logger.error("Error checking price alerts:", error);
    }
  }

  async getMarketInsights(userId: string): Promise<MarketInsight[]> {
    try {
      await this.ensureFreshPrices();

      const farmer = await prisma.farmerProfile.findUnique({
        where: { userId },
      });

      let crops: { id: string; nameEn: string }[] = [];
      if (farmer) {
        const farmerCrops = await prisma.farmerCrop.findMany({
          where: { farmerId: farmer.id },
          include: { crop: true },
          distinct: ["cropId"],
        });
        crops = farmerCrops.map((fc) => fc.crop);
      }

      if (crops.length === 0) {
        // No farmer profile or no registered crops yet — fall back to the
        // most common staple crops so the endpoint still returns something useful.
        crops = await prisma.crop.findMany({
          where: { isActive: true, deletedAt: null },
          orderBy: { nameEn: "asc" },
          take: 3,
        });
      }

      const insights: MarketInsight[] = [];
      for (const crop of crops) {
        const rows = await prisma.marketPrice.findMany({
          where: { cropId: crop.id },
        });
        if (rows.length === 0) continue;

        const prices = rows.map((r) => Number(r.priceRwfPerKg));
        const averagePrice = Math.round(
          prices.reduce((sum, p) => sum + p, 0) / prices.length,
        );
        const best = rows.reduce((a, b) =>
          Number(a.priceRwfPerKg) >= Number(b.priceRwfPerKg) ? a : b,
        );

        const upCount = rows.filter((r) => r.trend === "up").length;
        const downCount = rows.filter((r) => r.trend === "down").length;
        const priceTrend: MarketInsight["priceTrend"] =
          upCount > downCount ? "rising" : downCount > upCount ? "falling" : "stable";

        insights.push({
          cropId: crop.id,
          cropName: crop.nameEn,
          bestMarket: best.marketName,
          bestPrice: Number(best.priceRwfPerKg),
          averagePrice,
          priceTrend,
          recommendation:
            priceTrend === "rising"
              ? "Prices are trending up across markets — consider waiting if you can store your harvest."
              : priceTrend === "falling"
                ? "Prices are trending down — selling soon may get you a better return."
                : "Prices are steady across markets — sell whenever it suits your schedule.",
          nextHarvestImpact:
            priceTrend === "falling"
              ? "New supply entering the market may push prices down further."
              : "Prices are expected to hold steady in the near term.",
        });
      }

      return insights;
    } catch (error) {
      logger.error("Error generating market insights:", error);
      throw error;
    }
  }

  async getRecommendedMarkets(
    userId: string,
    params: { cropId: string; quantity?: number },
  ): Promise<any[]> {
    try {
      await this.ensureFreshPrices();

      const farmer = await prisma.farmerProfile.findUnique({
        where: { userId },
      });
      const isNearKigali = farmer ? KIGALI_DISTRICTS.has(farmer.district) : true;

      const rows = await prisma.marketPrice.findMany({
        where: { cropId: params.cropId },
        orderBy: { priceRwfPerKg: "desc" },
      });

      const transportCost = isNearKigali ? 2000 : 15000;
      const distance = isNearKigali ? "5-10 km" : "40-60 km";

      return rows.map((row) => ({
        marketId: row.marketId,
        marketName: row.marketName,
        distance,
        estimatedPrice: Number(row.priceRwfPerKg),
        transportCost,
        recommendation: isNearKigali
          ? "Good value — low transport cost from your district"
          : "Higher transport cost from your district — weigh it against the price gain",
      }));
    } catch (error) {
      logger.error("Error getting market recommendations:", error);
      throw error;
    }
  }

  private generatePriceHistory(
    crop?: string,
    market?: string,
    days: number = 30,
  ): PriceHistory[] {
    const history: PriceHistory[] = [];
    const basePrice = crop === "maize" ? 350 : crop === "beans" ? 520 : 400;

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      const variation = Math.sin(i / 5) * 0.1 + (Math.random() - 0.5) * 0.05;
      const price = basePrice * (1 + variation);
      const volume = Math.floor(Math.random() * 10000) + 1000;

      history.push({
        date: date.toISOString().split("T")[0],
        price: Math.round(price),
        volume,
        market: market || "Kigali Central Market",
      });
    }

    return history;
  }

}

export const marketService = new MarketService();
