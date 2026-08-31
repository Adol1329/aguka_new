import { prisma } from "../prisma.js";
import { logger } from "../utils/logger.js";
import { weatherService } from "../services/weather.service.js";
import { marketService } from "../services/market.service.js";

export async function syncWeather(): Promise<void> {
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: "realTimeWeatherSyncEnabled" },
    });
    if (setting?.value !== "true") return;

    const farmers = await prisma.farmerProfile.findMany({
      where: { deletedAt: null },
      select: { id: true, userId: true, district: true },
    });

    let synced = 0;
    for (const farmer of farmers) {
      try {
        const weather = await weatherService.getCurrentWeather(farmer.userId);
        await weatherService.saveWeatherReading(farmer.userId, weather);
        synced++;
      } catch {
        continue;
      }
    }
    logger.info(`Weather sync: ${synced}/${farmers.length} farmers updated`);
  } catch (err) {
    logger.error("Weather sync failed:", err);
  }
}

export async function syncMarketPrices(): Promise<void> {
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: "marketPriceSyncEnabled" },
    });
    if (setting?.value !== "true") return;

    const count = await marketService.regenerateSimulatedPrices();

    logger.info(`Market sync: ${count} prices saved`);
  } catch (err) {
    logger.error("Market price sync failed:", err);
  }
}
