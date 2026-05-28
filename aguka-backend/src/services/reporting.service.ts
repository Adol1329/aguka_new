import { logger } from "../utils/logger.js";
import { prisma } from "../prisma.js";

interface DailyReport {
  farmId: string;
  farmName: string;
  date: string;
  avgMoisture: number;
  avgTemperature: number;
  totalWaterUsage: number;
  irrigationCycles: number;
  alertsCount: number;
  recommendations: string[];
  status: "optimal" | "warning" | "critical";
}

interface WeeklyReport {
  farmId: string;
  farmName: string;
  weekStart: string;
  weekEnd: string;
  avgMoisture: number;
  avgTemperature: number;
  totalWaterUsage: number;
  irrigationEfficiency: number;
  yieldPrediction: number;
  totalAlerts: number;
  recommendations: string[];
  trends: {
    moisture: "improving" | "stable" | "declining";
    temperature: "normal" | "high" | "low";
    waterUsage: "increasing" | "stable" | "decreasing";
  };
}

interface RecommendationEngine {
  generateRecommendations(data: any): string[];
}

export class ReportingService implements RecommendationEngine {
  async generateDailyReport(farmId: string, date?: Date): Promise<DailyReport> {
    try {
      const reportDate = date || new Date();
      const dateStart = new Date(
        reportDate.getFullYear(),
        reportDate.getMonth(),
        reportDate.getDate(),
      );
      const dateEnd = new Date(dateStart.getTime() + 24 * 60 * 60 * 1000);

      // Get farm information
      const farmer = await prisma.farmerProfile.findFirst({
        where: { userId: farmId },
        include: {
          irrigationZones: true,
        },
      });

      if (!farmer) {
        throw new Error("Farm not found");
      }

      // Get sensor readings for the day
      const soilReadings = await prisma.soilReading.findMany({
        where: {
          farmerId: farmer.id,
          readingAt: { gte: dateStart, lte: dateEnd },
        },
      });

      // Get irrigation logs for the day
      const irrigationLogs = await prisma.irrigationLog.findMany({
        where: {
          zone: {
            farmerId: farmer.id,
          },
          executedAt: { gte: dateStart, lte: dateEnd },
        },
      });

      // Get alerts for the day
      const alerts = await prisma.alert.findMany({
        where: {
          farmerId: farmer.id,
          createdAt: { gte: dateStart, lte: dateEnd },
        },
      });

      // Calculate metrics
      const avgMoisture =
        soilReadings.length > 0
          ? soilReadings.reduce(
              (sum, r) => sum + Number(r.moisturePercent || 0),
              0,
            ) / soilReadings.length
          : 0;

      const avgTemperature =
        soilReadings.length > 0
          ? soilReadings.reduce(
              (sum, r) => sum + Number(r.temperatureCelsius || 0),
              0,
            ) / soilReadings.length
          : 0;

      const irrigationCycles = irrigationLogs.filter(
        (log) => log.action === "START",
      ).length;
      const totalWaterUsage = irrigationCycles * 1000; // Assume 1000L per cycle

      const recommendations = this.generateRecommendations({
        avgMoisture,
        avgTemperature,
        irrigationCycles,
        alertsCount: alerts.length,
        soilReadings,
      });

      // Determine status
      let status: "optimal" | "warning" | "critical";
      if (avgMoisture < 25 || avgTemperature > 35 || alerts.length > 5) {
        status = "critical";
      } else if (avgMoisture < 35 || avgTemperature > 30 || alerts.length > 2) {
        status = "warning";
      } else {
        status = "optimal";
      }

      return {
        farmId,
        farmName: farmer.farmName || `Farm ${farmId}`,
        date: reportDate.toISOString().split("T")[0],
        avgMoisture,
        avgTemperature,
        totalWaterUsage,
        irrigationCycles,
        alertsCount: alerts.length,
        recommendations,
        status,
      };
    } catch (error) {
      logger.error("Error generating daily report:", error);
      throw error;
    }
  }

  async generateWeeklyReport(
    farmId: string,
    weekStart?: Date,
  ): Promise<WeeklyReport> {
    try {
      const weekStartDate = weekStart || this.getWeekStart(new Date());
      const weekEndDate = new Date(
        weekStartDate.getTime() + 7 * 24 * 60 * 60 * 1000,
      );

      // Get farm information
      const farmer = await prisma.farmerProfile.findFirst({
        where: { userId: farmId },
        include: {
          irrigationZones: true,
        },
      });

      if (!farmer) {
        throw new Error("Farm not found");
      }

      // Get data for the week
      const soilReadings = await prisma.soilReading.findMany({
        where: {
          farmerId: farmer.id,
          readingAt: { gte: weekStartDate, lte: weekEndDate },
        },
      });

      const irrigationLogs = await prisma.irrigationLog.findMany({
        where: {
          zone: {
            farmerId: farmer.id,
          },
          executedAt: { gte: weekStartDate, lte: weekEndDate },
        },
      });

      const alerts = await prisma.alert.findMany({
        where: {
          farmerId: farmer.id,
          createdAt: { gte: weekStartDate, lte: weekEndDate },
        },
      });

      // Calculate weekly metrics
      const avgMoisture =
        soilReadings.length > 0
          ? soilReadings.reduce(
              (sum, r) => sum + Number(r.moisturePercent || 0),
              0,
            ) / soilReadings.length
          : 0;

      const avgTemperature =
        soilReadings.length > 0
          ? soilReadings.reduce(
              (sum, r) => sum + Number(r.temperatureCelsius || 0),
              0,
            ) / soilReadings.length
          : 0;

      const irrigationCycles = irrigationLogs.filter(
        (log) => log.action === "START",
      ).length;
      const totalWaterUsage = irrigationCycles * 1000;
      const irrigationEfficiency = this.calculateIrrigationEfficiency(
        irrigationLogs,
        soilReadings,
      );

      // Analyze trends
      const trends = this.analyzeTrends(soilReadings, irrigationLogs);

      // Generate recommendations
      const recommendations = this.generateWeeklyRecommendations({
        avgMoisture,
        avgTemperature,
        irrigationEfficiency,
        trends,
        alertsCount: alerts.length,
      });

      return {
        farmId,
        farmName: farmer.farmName || `Farm ${farmId}`,
        weekStart: weekStartDate.toISOString().split("T")[0],
        weekEnd: weekEndDate.toISOString().split("T")[0],
        avgMoisture,
        avgTemperature,
        totalWaterUsage,
        irrigationEfficiency,
        yieldPrediction: this.predictYield(
          avgMoisture,
          avgTemperature,
          irrigationEfficiency,
        ),
        totalAlerts: alerts.length,
        recommendations,
        trends,
      };
    } catch (error) {
      logger.error("Error generating weekly report:", error);
      throw error;
    }
  }

  async generateFarmSummaryReport(
    farmId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<any> {
    try {
      const farmer = await prisma.farmerProfile.findFirst({
        where: { userId: farmId },
        include: {
          irrigationZones: true,
        },
      });

      if (!farmer) {
        throw new Error("Farm not found");
      }

      // Get comprehensive data for the period
      const [soilReadings, irrigationLogs, alerts] = await Promise.all([
        prisma.soilReading.findMany({
          where: {
            farmerId: farmer.id,
            readingAt: { gte: startDate, lte: endDate },
          },
        }),
        prisma.irrigationLog.findMany({
          where: {
            zone: {
              farmerId: farmer.id,
            },
            executedAt: { gte: startDate, lte: endDate },
          },
        }),
        prisma.alert.findMany({
          where: {
            farmerId: farmer.id,
            createdAt: { gte: startDate, lte: endDate },
          },
        }),
      ]);

      // Calculate summary metrics
      const summary = {
        period: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          days: Math.ceil(
            (endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000),
          ),
        },
        farm: {
          id: farmId,
          name: farmer.farmName || `Farm ${farmId}`,
          totalZones: farmer.irrigationZones.length,
          activeZones: farmer.irrigationZones.filter((z) => z.isActive).length,
        },
        performance: {
          avgMoisture: this.calculateAverage(soilReadings, "moisturePercent"),
          avgTemperature: this.calculateAverage(
            soilReadings,
            "temperatureCelsius",
          ),
          avgPh: this.calculateAverage(soilReadings, "phLevel"),
          avgNitrogen: this.calculateAverage(soilReadings, "nitrogenPpm"),
          avgPhosphorus: this.calculateAverage(soilReadings, "phosphorusPpm"),
          avgPotassium: this.calculateAverage(soilReadings, "potassiumPpm"),
        },
        irrigation: {
          totalCycles: irrigationLogs.filter((log) => log.action === "START")
            .length,
          totalWaterUsage:
            irrigationLogs.filter((log) => log.action === "START").length *
            1000,
          efficiency: this.calculateIrrigationEfficiency(
            irrigationLogs,
            soilReadings,
          ),
          uptime: this.calculateIrrigationUptime(irrigationLogs),
        },
        alerts: {
          total: alerts.length,
          byType: this.groupAlertsByType(alerts),
          severity: this.analyzeAlertSeverity(alerts),
        },
        recommendations: this.generatePeriodRecommendations(
          soilReadings,
          irrigationLogs,
          alerts,
        ),
      };

      return summary;
    } catch (error) {
      logger.error("Error generating farm summary report:", error);
      throw error;
    }
  }

  generateRecommendations(data: any): string[] {
    const recommendations: string[] = [];
    const {
      avgMoisture,
      avgTemperature,
      irrigationCycles,
      alertsCount,
      soilReadings,
    } = data;

    // Moisture-based recommendations
    if (avgMoisture < 25) {
      recommendations.push(
        "🚨 CRITICAL: Soil moisture is critically low. Increase irrigation frequency immediately.",
      );
      recommendations.push(
        "💡 Consider installing moisture sensors in additional zones for better coverage.",
      );
    } else if (avgMoisture < 35) {
      recommendations.push(
        "⚠️ Soil moisture is below optimal. Adjust irrigation schedule.",
      );
    } else if (avgMoisture > 75) {
      recommendations.push(
        "💧 Soil moisture is high. Reduce irrigation to prevent root rot.",
      );
    }

    // Temperature-based recommendations
    if (avgTemperature > 32) {
      recommendations.push(
        "🌡️ High temperatures detected. Consider irrigation during cooler hours (early morning/evening).",
      );
    } else if (avgTemperature < 15) {
      recommendations.push(
        "❄️ Low temperatures may affect irrigation efficiency. Monitor for water stress.",
      );
    }

    // Irrigation-based recommendations
    if (irrigationCycles > 8) {
      recommendations.push(
        "💰 High irrigation frequency detected. Check for leaks or system inefficiency.",
      );
    } else if (irrigationCycles === 0 && avgMoisture < 40) {
      recommendations.push(
        "🤖 No irrigation detected despite low moisture. Check irrigation system automation.",
      );
    }

    // Alert-based recommendations
    if (alertsCount > 5) {
      recommendations.push(
        "🚨 High number of alerts this period. Review system settings and sensor calibration.",
      );
    }

    // Data quality recommendations
    if (soilReadings && soilReadings.length < 10) {
      recommendations.push(
        "📊 Limited sensor data detected. Check sensor connectivity and data transmission.",
      );
    }

    // General best practices
    recommendations.push(
      "🌱️ Consider crop rotation to improve soil health and water efficiency.",
    );
    recommendations.push(
      "💧 Implement rainwater harvesting to reduce dependency on irrigation.",
    );

    return recommendations;
  }

  generateWeeklyRecommendations(data: any): string[] {
    const recommendations: string[] = [];
    const { irrigationEfficiency, trends, alertsCount } = data;

    // Trend-based recommendations
    if (trends.moisture === "declining") {
      recommendations.push(
        "📉 Soil moisture trend is declining. Investigate water source or irrigation issues.",
      );
    } else if (trends.moisture === "improving") {
      recommendations.push(
        "📈 Soil moisture trend is improving. Current irrigation strategy is effective.",
      );
    }

    if (trends.waterUsage === "increasing") {
      recommendations.push(
        "💰 Water usage is increasing. Review irrigation schedules and check for leaks.",
      );
    }

    if (trends.temperature === "high") {
      recommendations.push(
        "🌡️ Consistently high temperatures. Consider drought-resistant crop varieties.",
      );
    }

    // Efficiency-based recommendations
    if (irrigationEfficiency < 70) {
      recommendations.push(
        "⚙️ Irrigation efficiency is below optimal. Check system maintenance and calibration.",
      );
    } else if (irrigationEfficiency > 90) {
      recommendations.push(
        "👍 Excellent irrigation efficiency! Current settings are well optimized.",
      );
    }

    // Alert-based recommendations
    if (alertsCount > 10) {
      recommendations.push(
        "🚨 High alert frequency this week. Schedule system maintenance and sensor calibration.",
      );
    }

    return recommendations;
  }

  generatePeriodRecommendations(
    soilReadings: any[],
    irrigationLogs: any[],
    alerts: any[],
  ): string[] {
    const recommendations: string[] = [];

    // Analyze the entire period
    const avgMoisture = this.calculateAverage(soilReadings, "moisturePercent");
    const irrigationEfficiency = this.calculateIrrigationEfficiency(
      irrigationLogs,
      soilReadings,
    );

    // Performance recommendations
    if (avgMoisture < 30) {
      recommendations.push(
        "🚨 Persistent low moisture detected. Review irrigation system capacity and scheduling.",
      );
    }

    if (irrigationEfficiency < 75) {
      recommendations.push(
        "⚙️ Irrigation efficiency needs improvement. Consider system upgrades or maintenance.",
      );
    }

    if (alerts.length > soilReadings.length * 0.1) {
      recommendations.push(
        "📊 High alert-to-data ratio. Check sensor accuracy and calibration.",
      );
    }

    return recommendations;
  }

  private analyzeTrends(soilReadings: any[], irrigationLogs: any[]): any {
    if (soilReadings.length < 2) {
      return {
        moisture: "stable",
        temperature: "normal",
        waterUsage: "stable",
      };
    }

    const firstHalf = soilReadings.slice(
      0,
      Math.floor(soilReadings.length / 2),
    );
    const secondHalf = soilReadings.slice(Math.floor(soilReadings.length / 2));

    const firstHalfMoisture = this.calculateAverage(
      firstHalf,
      "moisturePercent",
    );
    const secondHalfMoisture = this.calculateAverage(
      secondHalf,
      "moisturePercent",
    );

    const moistureTrend =
      secondHalfMoisture > firstHalfMoisture + 5
        ? "improving"
        : secondHalfMoisture < firstHalfMoisture - 5
          ? "declining"
          : "stable";

    const avgTemp = this.calculateAverage(soilReadings, "temperatureCelsius");
    const tempTrend = avgTemp > 30 ? "high" : avgTemp < 18 ? "low" : "normal";

    const firstHalfIrrigation = irrigationLogs.slice(
      0,
      Math.floor(irrigationLogs.length / 2),
    );
    const secondHalfIrrigation = irrigationLogs.slice(
      Math.floor(irrigationLogs.length / 2),
    );

    const waterUsageTrend =
      secondHalfIrrigation.length > firstHalfIrrigation.length
        ? "increasing"
        : secondHalfIrrigation.length < firstHalfIrrigation.length
          ? "decreasing"
          : "stable";

    return {
      moisture: moistureTrend,
      temperature: tempTrend,
      waterUsage: waterUsageTrend,
    };
  }

  private calculateAverage(data: any[], field: string): number {
    if (data.length === 0) return 0;
    return (
      data.reduce((sum, item) => sum + (item[field] || 0), 0) / data.length
    );
  }

  private calculateIrrigationEfficiency(
    irrigationLogs: any[],
    soilReadings: any[],
  ): number {
    if (irrigationLogs.length === 0 || soilReadings.length === 0) return 0;

    // Simple efficiency calculation based on moisture improvement after irrigation
    const efficiencyScores = irrigationLogs
      .filter((log) => log.action === "START")
      .map((log) => {
        const nextReading = soilReadings.find(
          (r) => new Date(r.readingAt) > new Date(log.executedAt),
        );

        if (nextReading) {
          const moistureImprovement = Math.max(
            0,
            nextReading.moisturePercent - 30,
          );
          return Math.min(100, moistureImprovement * 2); // Simple efficiency score
        }
        return 50; // Default efficiency
      })
      .filter((score) => score > 0);

    return efficiencyScores.length > 0
      ? efficiencyScores.reduce((sum, score) => sum + score, 0) /
          efficiencyScores.length
      : 75; // Default efficiency
  }

  private calculateIrrigationUptime(irrigationLogs: any[]): number {
    const startLogs = irrigationLogs.filter((log) => log.action === "START");
    const stopLogs = irrigationLogs.filter((log) => log.action === "STOP");

    if (startLogs.length === 0) return 0;

    let totalUptime = 0;
    startLogs.forEach((startLog) => {
      const correspondingStop = stopLogs.find(
        (stopLog) =>
          new Date(stopLog.executedAt) > new Date(startLog.executedAt),
      );

      if (correspondingStop) {
        totalUptime +=
          new Date(correspondingStop.executedAt).getTime() -
          new Date(startLog.executedAt).getTime();
      }
    });

    return totalUptime / (1000 * 60); // Convert to minutes
  }

  private groupAlertsByType(alerts: any[]): Record<string, number> {
    return alerts.reduce((groups, alert) => {
      groups[alert.type] = (groups[alert.type] || 0) + 1;
      return groups;
    }, {});
  }

  private analyzeAlertSeverity(alerts: any[]): {
    low: number;
    medium: number;
    high: number;
    critical: number;
  } {
    const severity = { low: 0, medium: 0, high: 0, critical: 0 };

    alerts.forEach((alert) => {
      const severityLevel = alert.severity?.toLowerCase() || "low";
      if (severityLevel in severity) {
        (severity as any)[severityLevel]++;
      }
    });

    return severity;
  }

  private predictYield(
    avgMoisture: number,
    avgTemperature: number,
    irrigationEfficiency: number,
  ): number {
    // Simple yield prediction based on conditions
    const moistureScore = Math.max(0, Math.min(1, (avgMoisture - 25) / 40)); // 25-65% optimal
    const tempScore = Math.max(
      0,
      Math.min(1, 1 - Math.abs(avgTemperature - 25) / 15),
    ); // 25°C optimal
    const efficiencyScore = irrigationEfficiency / 100;

    const baseYield = 3.0; // Base 3 tons/ha
    return (
      baseYield *
      (0.7 + moistureScore * 0.2 + tempScore * 0.1) *
      (0.8 + efficiencyScore * 0.2)
    );
  }

  private getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }
}

export const reportingService = new ReportingService();
