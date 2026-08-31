import { prisma } from "../prisma.js";
import { logger } from "../utils/logger.js";

export async function systemHealthHeartbeat(): Promise<void> {
  try {
    const cpuUsage = process.cpuUsage();
    const uptimeSeconds = process.uptime();

    const services = [
      {
        serviceName: "api",
        status: "healthy",
        uptimePercent: Math.min(100, Math.round((uptimeSeconds / 86400) * 100)),
        responseTimeMs: Math.round(cpuUsage.user / 1000),
      },
      {
        serviceName: "database",
        status: "connected",
        uptimePercent: 100,
        responseTimeMs: 0,
      },
      {
        serviceName: "sensors",
        status: "healthy",
        uptimePercent: 0,
        responseTimeMs: 0,
      },
    ];

    const sensorCount = await prisma.sensor.count();
    const activeSensors = await prisma.sensor.count({
      where: { isActive: true },
    });
    const activeSensorPct =
      sensorCount > 0 ? Math.round((activeSensors / sensorCount) * 100) : 0;

    services[2].uptimePercent = activeSensorPct;
    services[2].responseTimeMs = 0;

    for (const svc of services) {
      await prisma.systemHealth.upsert({
        where: { serviceName: svc.serviceName },
        create: svc,
        update: {
          status: svc.status,
          uptimePercent: svc.uptimePercent,
          responseTimeMs: svc.responseTimeMs,
          errorCount: 0,
          lastCheckAt: new Date(),
        },
      });
    }
  } catch (err) {
    logger.error("System health heartbeat failed:", err);
  }
}
