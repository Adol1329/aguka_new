import { logger } from "../utils/logger.js";
import { prisma } from "../prisma.js";

export class KpiService {
  /**
   * DASHBOARD KPIs: High-level system summary
   */
  async getSummary() {
    try {
      const [
        totalFarmers,
        activeFarms,
        totalSensors,
        sensorsOnline,
        alertsToday,
        criticalAlerts,
        totalIrrigation,
        systemHealthAvg,
        soilHealthAvg,
      ] = await Promise.all([
        prisma.user.count({ where: { role: "farmer" } }),
        prisma.farmerProfile.count(),
        prisma.sensor.count(),
        prisma.sensor.count({
          where: {
            lastReadingAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
          }, // Online in last 1 hr
        }),
        prisma.alert.count({
          where: {
            createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
          },
        }),
        prisma.alert.count({
          where: {
            severity: "critical",
            createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
          },
        }),
        prisma.irrigationLog.aggregate({
          _sum: { waterUsedLiters: true },
          where: {
            status: "completed",
            startTime: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
          },
        }),
        prisma.systemHealth.aggregate({
          _avg: { uptimePercent: true },
        }),
        prisma.soilReading.aggregate({
          _avg: { soilHealthScore: true },
          where: {
            readingAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          },
        }),
      ]);

      const waterUsedLitres = totalIrrigation._sum?.waterUsedLiters
        ? Number(totalIrrigation._sum.waterUsedLiters)
        : 0;
      // Baseline assumption for the day to calculate savings (e.g., 350L * activeFarms)
      const baselineWater = 350 * activeFarms;
      const waterSavedLitres = Math.max(0, baselineWater - waterUsedLitres);

      const systemUptime = systemHealthAvg._avg?.uptimePercent
        ? Number(systemHealthAvg._avg.uptimePercent)
        : 99.9;
      const avgFarmHealthScore = soilHealthAvg._avg?.soilHealthScore
        ? Math.round(Number(soilHealthAvg._avg.soilHealthScore))
        : 0;

      return {
        totalFarmers,
        activeFarms,
        sensorsOnline,
        sensorsOffline: totalSensors - sensorsOnline,
        alertsToday,
        criticalAlerts,
        systemUptime,
        waterSavedLitres,
        avgFarmHealthScore,
      };
    } catch (error) {
      logger.error("Error fetching KPI summary:", error);
      throw error;
    }
  }

  /**
   * SOIL & WEATHER: Farm specific telemetry
   */
  async getSoilKpi(farmId: string) {
    const latestReading = await prisma.soilReading.findFirst({
      where: { farmerId: farmId },
      orderBy: { readingAt: "desc" },
    });

    if (!latestReading) return null;

    // Calculate Optimal Planting Window Score
    const moisture = Number(latestReading.moisturePercent || 0);
    const tempC = Number(latestReading.soilTemperatureCelsius || 0);
    const n = Number(latestReading.nitrogenPpm || 0);
    const p = Number(latestReading.phosphorusPpm || 0);
    const k = Number(latestReading.potassiumPpm || 0);

    const moistureOk = moisture >= 25 && moisture <= 60 ? 1 : 0;
    const tempOk = tempC >= 15 && tempC <= 28 ? 1 : 0;
    const npkOk = n >= 20 && p >= 10 && k >= 15 ? 1 : 0;
    const noRainNext3Days = 1; // Assuming 1 for now without deep weather integration

    const plantingWindowScore =
      moistureOk * 30 + tempOk * 30 + noRainNext3Days * 20 + npkOk * 20;

    return {
      moisture,
      tempC,
      nitrogen: n,
      phosphorus: p,
      potassium: k,
      ph: Number(latestReading.phLevel || 0),
      healthScore: latestReading.soilHealthScore || 0,
      plantingWindowScore,
      recordedAt: latestReading.readingAt,
    };
  }

  /**
   * IRRIGATION: Usage and efficiency
   */
  async getIrrigationKpi(farmId: string) {
    const today = new Date(new Date().setHours(0, 0, 0, 0));

    const [logs, latestLog, activeZones] = await Promise.all([
      prisma.irrigationLog.findMany({
        where: {
          farmerId: farmId,
          startTime: { gte: today },
          status: "completed",
        },
      }),
      prisma.irrigationLog.findFirst({
        where: { farmerId: farmId },
        orderBy: { startTime: "desc" },
      }),
      prisma.irrigationZone.count({
        where: { farmerId: farmId, status: "irrigating" },
      }),
    ]);

    const waterUsedToday = logs.reduce(
      (acc, curr) => acc + Number(curr.waterUsedLiters || 0),
      0,
    );
    const baseline = 350;
    const waterSavedPct =
      waterUsedToday > 0 ? ((baseline - waterUsedToday) / baseline) * 100 : 0;

    // Total run minutes
    const totalRunMinutesToday = logs.reduce(
      (acc, curr) => acc + (curr.durationMinutes || 0),
      0,
    );

    return {
      waterUsedToday,
      waterSavedPct: Math.max(0, waterSavedPct),
      cycleEfficiency: 85, // We can improve this further with moisture delta logic
      pumpStatus: activeZones > 0 ? "active" : "idle",
      lastRunAt: latestLog?.startTime || null,
      totalRunMinutesToday,
    };
  }

  /**
   * ANALYTICS: Farm Health
   */
  async getFarmHealthScore(farmId: string) {
    const soilKpi = await this.getSoilKpi(farmId);

    const soilScore = (soilKpi?.healthScore || 0) * 0.4;
    const weatherScore = 100 * 0.3; // Assuming no extreme events
    const irrigScore = 82 * 0.2; // Using placeholder cycle efficiency
    const uptimeScore = 95 * 0.1; // Placeholder sensor uptime

    const total = soilScore + weatherScore + irrigScore + uptimeScore;

    let label = "Needs Attention";
    if (total >= 80) label = "Excellent";
    else if (total >= 60) label = "Good";
    else if (total < 40) label = "Critical";

    return {
      score: total,
      soilScore,
      weatherScore,
      irrigScore,
      uptimeScore,
      label,
    };
  }

  /**
   * SYSTEM: Sensor status array
   */
  async getSensorsStatus() {
    const sensors = await prisma.sensor.findMany({
      include: { farmer: true },
    });

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000);

    return sensors.map((sensor) => {
      const lastSeen = sensor.lastReadingAt || new Date(0);
      let status = "offline";
      if (lastSeen >= oneHourAgo) status = "online";
      else if (lastSeen >= sixHoursAgo) status = "degraded";

      return {
        farmId: sensor.farmerId,
        farmName:
          sensor.farmer?.farmName || sensor.farmer?.fullName || "Unknown",
        location: sensor.locationOnFarm || "Field 1",
        lastSeen: lastSeen.toISOString(),
        status,
      };
    });
  }
}

export const kpiService = new KpiService();
