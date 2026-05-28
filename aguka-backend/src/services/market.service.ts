import { auditService } from "./audit.service.js";
import { prisma } from "../prisma.js";
import { logger } from "../utils/logger.js";

interface MarketPrice {
  cropId: string;
  cropName: string;
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

      if (!farmer) {
        return await this.getStoredOrSimulatedPrices("Kigali", filters);
      }

      // Try to fetch from Rwanda Agricultural Market API
      const isExternalApiEnabled = false;
      if (isExternalApiEnabled) {
        try {
          const apiPrices = await this.fetchFromRwandaAPI(
            farmer!.district,
            filters,
          );
          await this.saveMarketPrices(apiPrices);
          return apiPrices;
        } catch (apiError) {
          logger.error("Failed to fetch from Rwanda API:", apiError);
        }
      }

      // Fallback to database or simulated data
      return await this.getStoredOrSimulatedPrices(farmer.district, filters);
    } catch (error) {
      logger.error("Error fetching current prices:", error);
      throw error;
    }
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
        cropName: alert.crop?.nameEn || "Unknown",
        marketName: alert.marketId || "General Market",
        targetPrice: alert.targetPrice,
        currentPrice: alert.currentPrice,
        alertType: alert.alertType,
        isTriggered: alert.isTriggered,
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
        cropName: alert.crop?.nameEn,
        marketName: alert.marketId || "General Market",
        targetPrice: alert.targetPrice,
        alertType: alert.alertType,
        isActive: alert.isActive,
      };
    } catch (error) {
      logger.error("Error creating price alert:", error);
      throw error;
    }
  }

  async getMarketInsights(userId: string): Promise<MarketInsight[]> {
    try {
      const farmer = await prisma.farmerProfile.findUnique({
        where: { userId },
      });

      if (!farmer) {
        return this.generateMarketInsights("Kigali");
      }

      // Generate insights based on market data
      const insights = this.generateMarketInsights(farmer.district);

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
      const farmer = await prisma.farmerProfile.findUnique({
        where: { userId },
      });

      if (!farmer) {
        return this.generateMarketRecommendations(
          { location: "Kigali" },
          params.cropId,
        );
      }

      // Get market recommendations based on location and crop
      const recommendations = this.generateMarketRecommendations(
        farmer,
        params.cropId,
      );

      return recommendations;
    } catch (error) {
      logger.error("Error getting market recommendations:", error);
      throw error;
    }
  }

  private async fetchFromRwandaAPI(
    _district: string,
    _filters: { crop?: string; market?: string },
  ): Promise<MarketPrice[]> {
    // This would integrate with Rwanda's National Agricultural Export Development Board (NAEB) API
    // or Ministry of Agriculture and Animal Resources (MINAGRI) market data

    const apiPrices: MarketPrice[] = [
      {
        cropId: "maize",
        cropName: "Maize",
        marketId: "kigali",
        marketName: "Nyabugogo Market",
        district: "Kigali City",
        priceRwfPerKg: 2500,
        unit: "kg",
        currency: "RWF",
        recordedAt: new Date(),
        trend: "up",
        trendPercentage: 5.2,
      },
      {
        cropId: "beans",
        cropName: "Beans",
        marketId: "kigali",
        marketName: "Kigali Central Market",
        district: "Kigali City",
        priceRwfPerKg: 520,
        unit: "kg",
        currency: "RWF",
        recordedAt: new Date(),
        trend: "stable",
        trendPercentage: 0.8,
      },
      // Add more crops and markets
    ];

    return apiPrices;
  }

  private async getStoredOrSimulatedPrices(
    _district: string,
    filters: { crop?: string; market?: string },
  ): Promise<MarketPrice[]> {
    // Simulated market data for Rwanda
    const basePrices = {
      maize: { min: 300, max: 400, avg: 350 },
      beans: { min: 480, max: 560, avg: 520 },
      rice: { min: 800, max: 950, avg: 875 },
      potatoes: { min: 250, max: 350, avg: 300 },
      tomatoes: { min: 400, max: 600, avg: 500 },
      onions: { min: 350, max: 450, avg: 400 },
      cabbage: { min: 200, max: 300, avg: 250 },
      carrots: { min: 450, max: 550, avg: 500 },
    };

    const markets = [
      "Kigali Central Market",
      "Nyabugogo Market",
      "Kimironko Market",
      "Remera Market",
      "Kicukiro Market",
    ];

    const prices: MarketPrice[] = [];

    Object.entries(basePrices).forEach(([cropId, priceData]) => {
      if (filters.crop && cropId !== filters.crop) return;

      markets.forEach((marketName, index) => {
        if (
          filters.market &&
          !marketName.toLowerCase().includes(filters.market.toLowerCase())
        )
          return;

        const variation = (Math.random() - 0.5) * 0.2; // ±10% variation
        const price = priceData.avg * (1 + variation);
        const trend =
          Math.random() > 0.5 ? "up" : Math.random() > 0.5 ? "down" : "stable";
        const trendPercentage = Math.abs(Math.random() * 10);

        prices.push({
          cropId,
          cropName: cropId.charAt(0).toUpperCase() + cropId.slice(1),
          marketId: `market_${index}`,
          marketName,
          district: "General",
          priceRwfPerKg: Math.round(price),
          unit: "kg",
          currency: "RWF",
          recordedAt: new Date(),
          trend: trend as "up" | "down" | "stable",
          trendPercentage: Math.round(trendPercentage * 10) / 10,
        });
      });
    });

    return prices;
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

  private generateMarketInsights(_district: string): MarketInsight[] {
    return [
      {
        cropId: "maize",
        cropName: "Maize",
        bestMarket: "Kigali Central Market",
        bestPrice: 380,
        averagePrice: 350,
        priceTrend: "rising",
        recommendation: "Consider selling in 2-3 weeks for better prices",
        nextHarvestImpact: "Prices may decrease as new harvest enters market",
      },
      {
        cropId: "beans",
        cropName: "Beans",
        bestMarket: "Nyabugogo Market",
        bestPrice: 540,
        averagePrice: 520,
        priceTrend: "stable",
        recommendation: "Current prices are good, consider selling now",
        nextHarvestImpact: "Prices expected to remain stable",
      },
    ];
  }

  private generateMarketRecommendations(farmer: any, cropId: string): any[] {
    const markets = [
      {
        marketId: "kigali_central",
        marketName: "Kigali Central Market",
        distance: farmer.location.includes("Kigali") ? "5 km" : "50 km",
        estimatedPrice: cropId === "maize" ? 380 : 540,
        transportCost: farmer.location.includes("Kigali") ? 2000 : 15000,
        recommendation: "Best prices, higher transport cost",
      },
      {
        marketId: "local_market",
        marketName: "Local District Market",
        distance: "10 km",
        estimatedPrice: cropId === "maize" ? 320 : 480,
        transportCost: 5000,
        recommendation: "Lower prices, lower transport cost",
      },
    ];

    return markets;
  }

  private async saveMarketPrices(prices: MarketPrice[]): Promise<void> {
    // Save prices to database for historical tracking
    try {
      for (const price of prices) {
        await prisma.marketPrice.upsert({
          where: {
            cropId_marketId: {
              cropId: price.cropId,
              marketId: price.marketId,
            },
          },
          update: {
            priceRwfPerKg: price.priceRwfPerKg,
            recordedAt: price.recordedAt,
            trend: price.trend,
            trendPercentage: price.trendPercentage,
          },
          create: {
            cropId: price.cropId,
            marketId: price.marketId,
            marketName: price.marketName,
            district: "General",
            priceRwfPerKg: price.priceRwfPerKg,
            currency: price.currency,
            recordedAt: price.recordedAt,
            trend: price.trend,
            trendPercentage: price.trendPercentage,
          },
        });
      }
    } catch (error) {
      logger.error("Error saving market prices:", error);
    }
  }
}

export const marketService = new MarketService();
