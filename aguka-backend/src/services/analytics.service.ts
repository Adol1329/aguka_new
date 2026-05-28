import { logger } from "../utils/logger.js";
import { prisma } from "../prisma.js";

interface DashboardMetrics {
  totalFarms: number;
  activeFarms: number;
  totalIrrigationZones: number;
  irrigatingZones: number;
  averageMoisture: number;
  averageTemperature: number;
  waterUsage: number;
  alertsCount: number;
  cropYield: number;
}

interface FarmPerformance {
  farmId: string;
  farmName: string;
  moistureLevel: number;
  temperature: number;
  irrigationEfficiency: number;
  yieldPrediction: number;
  lastUpdated: string;
}

interface AlertTrend {
  date: string;
  lowMoisture: number;
  highTemperature: number;
  irrigationFailure: number;
  systemAlerts: number;
}

interface WaterUsageData {
  date: string;
  usage: number;
  cost: number;
  efficiency: number;
}

export class AnalyticsService {
  async getDashboardMetrics(
    timeRange: "7d" | "30d" | "90d" = "7d",
  ): Promise<DashboardMetrics> {
    try {
      const startDate = this.getStartDate(timeRange);

      // Get farm counts
      const [totalFarms, activeFarms] = await Promise.all([
        prisma.farmerProfile.count(),
        prisma.farmerProfile.count({
          where: {
            user: {
              isActive: true,
            },
          },
        }),
      ]);

      // Get irrigation zone counts
      const [totalZones, irrigatingZones] = await Promise.all([
        prisma.irrigationZone.count({
          where: { isActive: true },
        }),
        prisma.irrigationZone.count({
          where: {
            isActive: true,
            status: "irrigating",
          },
        }),
      ]);

      // Get average sensor readings
      const avgReadings = await prisma.soilReading.aggregate({
        where: {
          readingAt: { gte: startDate },
        },
        _avg: {
          moisturePercent: true,
          temperatureCelsius: true,
        },
      });

      // Get water usage (simulated)
      const waterUsage = await this.calculateWaterUsage(startDate);

      // Get alerts count
      const alertsCount = await prisma.alert.count({
        where: {
          createdAt: { gte: startDate },
        },
      });

      // Get crop yield (simulated)
      const cropYield = await this.calculateCropYield(startDate);

      return {
        totalFarms,
        activeFarms,
        totalIrrigationZones: totalZones,
        irrigatingZones,
        averageMoisture: Number(avgReadings._avg.moisturePercent || 0),
        averageTemperature: Number(avgReadings._avg.temperatureCelsius || 0),
        waterUsage,
        alertsCount,
        cropYield,
      };
    } catch (error) {
      logger.error("Error getting dashboard metrics:", error);
      throw error;
    }
  }

  async getFarmPerformance(
    timeRange: "7d" | "30d" | "90d" = "7d",
  ): Promise<FarmPerformance[]> {
    try {
      const startDate = this.getStartDate(timeRange);

      const farmers = await prisma.farmerProfile.findMany({
        where: {
          user: {
            isActive: true,
          },
        },
        include: {
          irrigationZones: true,
          soilReadings: {
            where: {
              readingAt: { gte: startDate },
            },
            orderBy: { readingAt: "desc" },
            take: 1,
          },
        },
      });

      return farmers.map((farmer) => {
        const latestReading = farmer.soilReadings[0];
        const moistureLevel = Number(latestReading?.moisturePercent || 50);
        const temperature = Number(latestReading?.temperatureCelsius || 25);

        // Calculate irrigation efficiency (simulated)
        const irrigationEfficiency = this.calculateIrrigationEfficiency(
          farmer.id,
          startDate,
        );

        // Predict yield (simulated)
        const yieldPrediction = this.predictYield(
          farmer.id,
          moistureLevel,
          temperature,
        );

        return {
          farmId: farmer.id,
          farmName: farmer.farmName || `Farm ${farmer.id}`,
          moistureLevel,
          temperature,
          irrigationEfficiency,
          yieldPrediction,
          lastUpdated:
            latestReading?.readingAt?.toISOString() || new Date().toISOString(),
        };
      });
    } catch (error) {
      logger.error("Error getting farm performance:", error);
      throw error;
    }
  }

  async getAlertTrends(
    timeRange: "7d" | "30d" | "90d" = "7d",
  ): Promise<AlertTrend[]> {
    try {
      const startDate = this.getStartDate(timeRange);
      const days = this.getDaysInRange(startDate);

      const trends: AlertTrend[] = [];

      for (const day of days) {
        const dayStart = new Date(day);
        const dayEnd = new Date(day.getTime() + 24 * 60 * 60 * 1000);

        const [lowMoisture, highTemperature, irrigationFailure, systemAlerts] =
          await Promise.all([
            this.getLowMoistureAlerts(dayStart, dayEnd),
            this.getHighTemperatureAlerts(dayStart, dayEnd),
            this.getIrrigationFailureAlerts(dayStart, dayEnd),
            this.getSystemAlerts(dayStart, dayEnd),
          ]);

        trends.push({
          date: dayStart.toISOString().split("T")[0],
          lowMoisture,
          highTemperature,
          irrigationFailure,
          systemAlerts,
        });
      }

      return trends;
    } catch (error) {
      logger.error("Error getting alert trends:", error);
      throw error;
    }
  }

  async getWaterUsage(
    timeRange: "7d" | "30d" | "90d" = "7d",
  ): Promise<WaterUsageData[]> {
    try {
      const startDate = this.getStartDate(timeRange);
      const days = this.getDaysInRange(startDate);

      const usageData: WaterUsageData[] = [];

      for (const day of days) {
        const usage = await this.calculateDailyWaterUsage(day);
        const cost = usage * 0.05; // RWF 0.05 per liter
        const efficiency = 85 + Math.random() * 10; // 85-95% efficiency

        usageData.push({
          date: day.toISOString().split("T")[0],
          usage,
          cost,
          efficiency,
        });
      }

      return usageData;
    } catch (error) {
      logger.error("Error getting water usage:", error);
      throw error;
    }
  }

  async getSystemHealth(): Promise<{
    overall: "healthy" | "warning" | "critical";
    components: {
      sensors: "healthy" | "warning" | "critical";
      irrigation: "healthy" | "warning" | "critical";
      database: "healthy" | "warning" | "critical";
      websocket: "healthy" | "warning" | "critical";
    };
    uptime: number;
    lastUpdate: Date;
  }> {
    try {
      // Check sensor health (simulated)
      const recentReadings = await prisma.soilReading.count({
        where: {
          readingAt: {
            gte: new Date(Date.now() - 5 * 60 * 1000), // Last 5 minutes
          },
        },
      });

      const sensorHealth = recentReadings > 0 ? "healthy" : "warning";

      // Check irrigation health (simulated)
      const activeIrrigation = await prisma.irrigationZone.count({
        where: { status: "irrigating" },
      });

      const irrigationHealth = activeIrrigation >= 0 ? "healthy" : "healthy";

      // Database health (simplified)
      const databaseHealth = "healthy";

      // WebSocket health (would check actual connections)
      const websocketHealth = "healthy";

      // Overall health
      const healthScores = [
        sensorHealth,
        irrigationHealth,
        databaseHealth,
        websocketHealth,
      ];
      const criticalCount = healthScores.filter((h) => h === "critical").length;
      const warningCount = healthScores.filter((h) => h === "warning").length;

      let overall: "healthy" | "warning" | "critical";
      if (criticalCount > 0) overall = "critical";
      else if (warningCount > 0) overall = "warning";
      else overall = "healthy";

      return {
        overall,
        components: {
          sensors: sensorHealth,
          irrigation: irrigationHealth,
          database: databaseHealth,
          websocket: websocketHealth,
        },
        uptime: process.uptime(),
        lastUpdate: new Date(),
      };
    } catch (error) {
      logger.error("Error getting system health:", error);
      throw error;
    }
  }

  private getStartDate(timeRange: "7d" | "30d" | "90d"): Date {
    const now = new Date();
    switch (timeRange) {
      case "7d":
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case "30d":
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case "90d":
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
  }

  private getDaysInRange(startDate: Date): Date[] {
    const days: Date[] = [];
    const current = new Date(startDate);
    const now = new Date();

    while (current <= now) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days;
  }

  private async calculateWaterUsage(startDate: Date): Promise<number> {
    // Simulated water usage calculation
    const irrigationLogs = await prisma.irrigationLog.count({
      where: {
        executedAt: { gte: startDate },
        action: "START",
      },
    });

    // Assume average 1000L per irrigation session
    return irrigationLogs * 1000;
  }

  private async calculateCropYield(_startDate: Date): Promise<number> {
    // Simulated crop yield calculation
    const farms = await prisma.farmerProfile.count();
    const avgYieldPerHectare = 2.5 + Math.random() * 2; // 2.5-4.5 tons/ha

    return farms * avgYieldPerHectare * 2; // Assume 2ha per farm
  }

  private calculateIrrigationEfficiency(
    _farmId: string,
    _startDate: Date,
  ): number {
    // Simulated efficiency calculation
    return 75 + Math.random() * 20; // 75-95% efficiency
  }

  private predictYield(
    _farmId: string,
    moistureLevel: number,
    temperature: number,
  ): number {
    // Simple yield prediction based on conditions
    const moistureScore = moistureLevel >= 30 && moistureLevel <= 70 ? 1 : 0.8;
    const tempScore = temperature >= 15 && temperature <= 30 ? 1 : 0.9;

    const baseYield = 3.0; // Base 3 tons/ha
    return baseYield * moistureScore * tempScore * (0.9 + Math.random() * 0.2);
  }

  private async getLowMoistureAlerts(
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    return prisma.alert.count({
      where: {
        alertType: "soil",
        createdAt: { gte: startDate, lte: endDate },
      },
    });
  }

  private async getHighTemperatureAlerts(
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    return prisma.alert.count({
      where: {
        alertType: "weather",
        createdAt: { gte: startDate, lte: endDate },
      },
    });
  }

  private async getIrrigationFailureAlerts(
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    return prisma.alert.count({
      where: {
        alertType: "irrigation",
        createdAt: { gte: startDate, lte: endDate },
      },
    });
  }

  private async getSystemAlerts(
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    return prisma.alert.count({
      where: {
        alertType: "system",
        createdAt: { gte: startDate, lte: endDate },
      },
    });
  }

  private async calculateDailyWaterUsage(_date: Date): Promise<number> {
    // Simulated daily water usage based on weather and irrigation patterns
    const baseUsage = 500; // Base 500L per day
    const weatherFactor = 0.8 + Math.random() * 0.4; // Weather affects usage
    return Math.round(baseUsage * weatherFactor);
  }
}

export const analyticsService = new AnalyticsService();
