import { alertService } from "./alert.service.js";
import { prisma } from "../prisma.js";

export class SensorService {
  /**
   * Get current status of all sensors/farms
   */
  async getSensorStatus() {
    const farms = await prisma.farmerProfile.findMany({
      include: {
        sensors: true,
        soilReadings: {
          orderBy: { readingAt: "desc" },
          take: 1,
        },
      },
    });

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000);

    return farms.map((farm) => {
      const lastReading = farm.soilReadings[0];
      const lastSeen = lastReading?.readingAt || new Date(0);

      let status: "online" | "degraded" | "offline" = "offline";
      if (lastSeen >= oneHourAgo) status = "online";
      else if (lastSeen >= sixHoursAgo) status = "degraded";

      return {
        farmId: farm.id,
        farmName: farm.farmName || farm.fullName,
        location: `${farm.district}, ${farm.sector}`,
        lastSeen: lastSeen.toISOString(),
        status,
        latestReading: lastReading
          ? {
              id: lastReading.id,
              farmId: farm.id,
              moisture: Number(lastReading.moisturePercent),
              tempC: Number(lastReading.soilTemperatureCelsius || 0),
              nitrogen: Number(lastReading.nitrogenPpm || 0),
              phosphorus: Number(lastReading.phosphorusPpm || 0),
              potassium: Number(lastReading.potassiumPpm || 0),
              ph: Number(lastReading.phLevel || 0),
              healthScore: lastReading.soilHealthScore || 0,
              source: "sensor",
              recordedAt: lastReading.readingAt.toISOString(),
            }
          : undefined,
      };
    });
  }

  /**
   * Get historical soil readings for a farm
   */
  async getSoilHistory(farmId: string, from?: string, to?: string) {
    return prisma.soilReading.findMany({
      where: {
        farmerId: farmId,
        readingAt: {
          gte: from ? new Date(from) : undefined,
          lte: to ? new Date(to) : undefined,
        },
      },
      orderBy: { readingAt: "asc" },
    });
  }

  /**
   * Ingest telemetry from IoT device
   */
  async ingestTelemetry(data: {
    serialNumber: string;
    moisturePercent: number;
    soilTempCelsius?: number;
    phLevel?: number;
    nitrogenPpm?: number;
    phosphorusPpm?: number;
    potassiumPpm?: number;
    batteryLevel?: number;
  }) {
    // 1. Find the sensor
    const sensor = await prisma.sensor.findUnique({
      where: { serialNumber: data.serialNumber },
    });

    if (!sensor) {
      throw new Error(`Sensor with serial ${data.serialNumber} not found`);
    }

    // 2. Create the reading
    const reading = await prisma.soilReading.create({
      data: {
        sensorId: sensor.id,
        farmerId: sensor.farmerId,
        moisturePercent: data.moisturePercent,
        soilTemperatureCelsius: data.soilTempCelsius,
        phLevel: data.phLevel,
        nitrogenPpm: data.nitrogenPpm,
        phosphorusPpm: data.phosphorusPpm,
        potassiumPpm: data.potassiumPpm,
        readingAt: new Date(),
      },
    });

    // 3. Update sensor status
    await prisma.sensor.update({
      where: { id: sensor.id },
      data: {
        lastReadingAt: new Date(),
        batteryLevel: data.batteryLevel,
      },
    });

    // 4. Trigger automated alerts if thresholds are breached
    if (data.moisturePercent < 20) {
      await alertService.sendAlert({
        farmerId: sensor.farmerId,
        alertType: "soil",
        severity: "critical",
        title: "Critical Soil Moisture",
        message: `Soil moisture has dropped to ${data.moisturePercent}%. Immediate irrigation is recommended.`,
        recommendation: "Activate irrigation system or manual watering.",
        translationKey: "alert.soil.moisture.critical",
        translationParams: { value: data.moisturePercent },
      });
    }

    return reading;
  }
}

export const sensorService = new SensorService();
